import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/ui/Modal';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Search, Eye, Printer, ChevronDown, Calendar, Filter, History, Undo2, AlertTriangle, Upload, Download, CheckCircle, XCircle } from 'lucide-react';
import type { Sale } from '../types';

type StatusFilter = 'ALL' | 'PENDING' | 'DISPATCHED' | 'DELIVERED' | 'RTO' | 'CUSTOMER_RETURN';
type DateFilter = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

const statusOptions: { value: Sale['dispatchStatus']; label: string; color: string; bg: string; dot: string }[] = [
  { value: 'PENDING', label: 'Pending', color: 'text-orange-700', bg: 'bg-orange-100', dot: 'bg-orange-500' },
  { value: 'DISPATCHED', label: 'Dispatched', color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  { value: 'RTO', label: 'RTO', color: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
  { value: 'DELIVERED', label: 'Delivered', color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  { value: 'CUSTOMER_RETURN', label: 'Customer Return', color: 'text-purple-700', bg: 'bg-purple-100', dot: 'bg-purple-500' },
];

const getStatusInfo = (val: string) => statusOptions.find(o => o.value === val) || { value: val, label: val, color: 'text-gray-700', bg: 'bg-gray-100', dot: 'bg-gray-500' };

// Status history entry
interface StatusHistoryEntry {
  id: string;
  saleId: string;
  fromStatus: string;
  toStatus: string;
  updatedBy: string;
  updatedAt: string;
  remark: string;
}

export default function Track() {
  const { items, sales, updateSale, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [modal, setModal] = useState<{ type: string; data?: unknown } | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);

  // Status history storage (in real app this would be in DB)
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);

  // Confirmation modal state
  const [confirmData, setConfirmData] = useState<{ saleId: string; from: string; to: string; invoiceNo: string } | null>(null);
  const [confirmRemark, setConfirmRemark] = useState('');

  // Bulk status upload
  const bulkFileRef = useRef<HTMLInputElement>(null);
  type BulkRow = { row: number; orderNo: string; status: string; matched: boolean; sale?: Sale; error?: string };
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [bulkDone, setBulkDone] = useState(false);
  const [bulkUpdated, setBulkUpdated] = useState(0);
  const [bulkFailed, setBulkFailed] = useState(0);

  const allowedLabels = ['Pending', 'Dispatched', 'RTO', 'Delivered', 'Customer Return'];
  const statusMap: Record<string, Sale['dispatchStatus']> = {
    'pending': 'PENDING', 'dispatched': 'DISPATCHED', 'rto': 'RTO',
    'delivered': 'DELIVERED', 'customer return': 'CUSTOMER_RETURN',
  };

  // Fuzzy suggestion for typos
  const suggestStatus = (input: string): string | null => {
    const lower = input.toLowerCase().trim();
    // Exact match
    if (statusMap[lower]) return null;
    // Simple similarity — find closest
    let best = ''; let bestScore = 0;
    for (const label of allowedLabels) {
      const ll = label.toLowerCase();
      let score = 0;
      for (let i = 0; i < Math.min(lower.length, ll.length); i++) {
        if (lower[i] === ll[i]) score++;
      }
      if (ll.includes(lower) || lower.includes(ll)) score += 5;
      if (score > bestScore) { bestScore = score; best = label; }
    }
    return bestScore > 2 ? best : null;
  };

  const downloadBulkTemplate = () => {
    const csv =
      `Order No.,Status\n` +
      `INV-2024-001,Delivered\n` +
      `INV-2024-002,Pending\n` +
      `INV-2024-003,RTO\n` +
      `INV-2024-004,Customer Return\n` +
      `INV-2024-005,Dispatched\n` +
      `\n` +
      `# ═══════════════════════════════════════\n` +
      `# ALLOWED STATUS VALUES (use exact spelling):\n` +
      `# ───────────────────────────────────────\n` +
      `# Pending\n` +
      `# Dispatched\n` +
      `# RTO\n` +
      `# Delivered\n` +
      `# Customer Return\n` +
      `# ═══════════════════════════════════════\n` +
      `# WARNING: Any other spelling will be REJECTED\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bulk_status_update_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadErrorReport = () => {
    const errors = bulkRows.filter(r => !r.matched);
    if (!errors.length) return;
    const csv = 'Row,Order No.,Entered Status,Error\n' + errors.map(r => `${r.row},"${r.orderNo}","${r.status}","${r.error}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'status_update_errors.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
      if (lines.length < 2) return;
      const rows: BulkRow[] = [];
      const seenOrders = new Set<string>();
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const orderNo = parts[0] || '';
        const statusRaw = parts[1] || '';
        if (!orderNo || !statusRaw) continue;

        // Duplicate check
        if (seenOrders.has(orderNo.toLowerCase())) {
          rows.push({ row: i + 1, orderNo, status: statusRaw, matched: false, error: 'Duplicate Order No. in file' });
          continue;
        }
        seenOrders.add(orderNo.toLowerCase());

        const sale = sales.find(s => s.invoiceNo.toLowerCase() === orderNo.toLowerCase());
        const mappedStatus = statusMap[statusRaw.toLowerCase()];
        let error = '';

        if (!sale) {
          error = 'Order not found in system';
        } else if (!mappedStatus) {
          const suggestion = suggestStatus(statusRaw);
          error = `Invalid status "${statusRaw}"` + (suggestion ? ` — Did you mean "${suggestion}"?` : ` — Allowed: ${allowedLabels.join(', ')}`);
        } else if (sale.dispatchStatus === mappedStatus) {
          error = `Already "${statusRaw}" — no change needed`;
        }

        rows.push({ row: i + 1, orderNo, status: statusRaw, matched: !error && !!sale, sale, error });
      }
      setBulkRows(rows);
      setBulkDone(false); setBulkUpdated(0); setBulkFailed(0);
      setModal({ type: 'bulkStatus' });
    };
    reader.readAsText(file);
    if (bulkFileRef.current) bulkFileRef.current.value = '';
  };

  const executeBulkStatus = () => {
    let updated = 0;
    let failed = 0;
    bulkRows.forEach(row => {
      if (!row.matched || !row.sale) { failed++; return; }
      const mapped = statusMap[row.status.toLowerCase()];
      if (!mapped) { failed++; return; }
      const entry: StatusHistoryEntry = {
        id: `sh-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        saleId: row.sale.id, fromStatus: row.sale.dispatchStatus, toStatus: mapped,
        updatedBy: currentUser.name, updatedAt: new Date().toISOString(),
        remark: 'Bulk status update via Excel',
      };
      setStatusHistory(prev => [entry, ...prev]);
      updateSale(row.sale!.id, { dispatchStatus: mapped });
      updated++;
    });
    setBulkUpdated(updated); setBulkFailed(failed + bulkRows.filter(r => !r.matched).length);
    setBulkDone(true);
  };

  // Date filtering
  const isInDateRange = (dateStr: string) => {
    if (dateFilter === 'ALL') return true;
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateFilter === 'TODAY') return d >= today;
    if (dateFilter === 'WEEK') { const w = new Date(today); w.setDate(w.getDate() - 7); return d >= w; }
    if (dateFilter === 'MONTH') { const m = new Date(today); m.setMonth(m.getMonth() - 1); return d >= m; }
    if (dateFilter === 'CUSTOM') {
      if (customFrom && d < new Date(customFrom)) return false;
      if (customTo && d > new Date(customTo + 'T23:59:59')) return false;
      return true;
    }
    return true;
  };

  const filtered = sales.filter(s => {
    const matchSearch = s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      (s.trackingId || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.remarks || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.platform || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || s.dispatchStatus === statusFilter;
    const matchDate = isInDateRange(s.date);
    return matchSearch && matchStatus && matchDate;
  });

  const counts = {
    ALL: sales.length,
    PENDING: sales.filter(s => s.dispatchStatus === 'PENDING').length,
    DISPATCHED: sales.filter(s => s.dispatchStatus === 'DISPATCHED').length,
    DELIVERED: sales.filter(s => s.dispatchStatus === 'DELIVERED').length,
    RTO: sales.filter(s => s.dispatchStatus === 'RTO').length,
    CUSTOMER_RETURN: sales.filter(s => s.dispatchStatus === 'CUSTOMER_RETURN').length,
  };

  // Open confirmation modal — works for ANY status to ANY status
  const requestStatusChange = (saleId: string, from: string, to: string, invoiceNo: string) => {
    setConfirmData({ saleId, from, to, invoiceNo });
    setConfirmRemark('');
    setStatusDropdownOpen(null);
  };

  // Confirm and execute status change
  const executeStatusChange = () => {
    if (!confirmData) return;
    const { saleId, from, to } = confirmData;

    // Save history entry
    const entry: StatusHistoryEntry = {
      id: `sh-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      saleId,
      fromStatus: from,
      toStatus: to,
      updatedBy: currentUser.name,
      updatedAt: new Date().toISOString(),
      remark: confirmRemark,
    };
    setStatusHistory(prev => [entry, ...prev]);

    // Update sale status
    updateSale(saleId, { dispatchStatus: to as Sale['dispatchStatus'] });

    setConfirmData(null);
    setConfirmRemark('');
  };

  // Undo last status change for a specific sale
  const undoLastChange = (saleId: string) => {
    const lastEntry = statusHistory.find(h => h.saleId === saleId);
    if (!lastEntry) return;
    // Request confirmation for undo
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;
    requestStatusChange(saleId, sale.dispatchStatus, lastEntry.fromStatus, sale.invoiceNo);
  };

  // Get history for a specific sale
  const getSaleHistory = (saleId: string) => statusHistory.filter(h => h.saleId === saleId);

  const viewSale = (modal?.type === 'viewTrack' ? modal?.data : undefined) as Sale | undefined;
  const historySaleId = (modal?.type === 'statusHistory' ? modal?.data : undefined) as string | undefined;
  const historyEntries = historySaleId ? getSaleHistory(historySaleId) : [];
  const historySale = historySaleId ? sales.find(s => s.id === historySaleId) : undefined;

  return (
    <div className="p-6 space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <button onClick={() => setStatusFilter('ALL')}
          className={`rounded-2xl p-4 border-2 text-left transition-all ${statusFilter === 'ALL' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-white hover:border-indigo-200'}`}>
          <p className="text-2xl font-black text-gray-900">{counts.ALL}</p>
          <p className="text-xs font-semibold text-gray-500 mt-1">All Orders</p>
        </button>
        {statusOptions.map(opt => (
          <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
            className={`rounded-2xl p-4 border-2 text-left transition-all ${statusFilter === opt.value ? `border-current ${opt.bg}` : 'border-gray-100 bg-white hover:border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2.5 h-2.5 rounded-full ${opt.dot}`} />
              <span className={`text-2xl font-black ${opt.color}`}>{counts[opt.value]}</span>
            </div>
            <p className={`text-xs font-semibold ${opt.color}`}>{opt.label}</p>
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-60 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
          <Search size={16} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search Order No, Tracking ID, Platform..."
            className="flex-1 text-sm outline-none bg-transparent" />
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-gray-400 mr-1" />
          {(['ALL', 'TODAY', 'WEEK', 'MONTH', 'CUSTOM'] as DateFilter[]).map(d => (
            <button key={d} onClick={() => setDateFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${dateFilter === d ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {d === 'ALL' ? 'All Time' : d === 'TODAY' ? 'Today' : d === 'WEEK' ? 'This Week' : d === 'MONTH' ? 'This Month' : 'Custom'}
            </button>
          ))}
        </div>
        {dateFilter === 'CUSTOM' && (
          <div className="flex items-center gap-2">
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none" />
            <span className="text-xs text-gray-400">to</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none" />
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-500 flex items-center gap-1"><Filter size={12} /> {filtered.length} orders</span>
          <button onClick={downloadBulkTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={13} /> Template
          </button>
          <input ref={bulkFileRef} type="file" accept=".csv,.txt" onChange={handleBulkFile} className="hidden" />
          <button onClick={() => bulkFileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
            <Upload size={13} /> Bulk Update
          </button>
        </div>
      </div>

      {/* Track Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Platform</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Courier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tracking ID</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => {
                const si = getStatusInfo(s.dispatchStatus);
                const isDropOpen = statusDropdownOpen === s.id;
                const courierMatch = (s.remarks || '').match(/Courier:\s*([^\|]+)/);
                const paymentMatch = (s.remarks || '').match(/Payment:\s*([^\|]+)/);
                const courier = courierMatch?.[1]?.trim() || '—';
                const payment = paymentMatch?.[1]?.trim() || '—';
                const platformColor =
                  s.platform === 'Amazon' ? 'bg-orange-100 text-orange-700' :
                  s.platform === 'Myntra' ? 'bg-pink-100 text-pink-700' :
                  s.platform === 'Flipkart' ? 'bg-blue-100 text-blue-700' :
                  s.platform === 'Ajio' ? 'bg-purple-100 text-purple-700' :
                  s.platform === 'Meesho' ? 'bg-rose-100 text-rose-700' :
                  s.platform === 'Shopify' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
                const hasHistory = getSaleHistory(s.id).length > 0;

                return (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3"><span className="text-sm font-mono font-bold text-indigo-700">{s.invoiceNo}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(s.date)}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-semibold ${platformColor}`}>{s.platform || '—'}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${payment === 'COD' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{payment}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{courier}</td>
                    <td className="px-4 py-3"><span className="text-xs font-mono text-gray-500">{s.trackingId || '—'}</span></td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(s.grandTotal)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold ${si.bg} ${si.color}`}>
                        <span className={`w-2 h-2 rounded-full ${si.dot}`} />
                        {si.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Flexible Status Dropdown — ANY to ANY */}
                        <div className="relative">
                          <button onClick={() => setStatusDropdownOpen(isDropOpen ? null : s.id)}
                            className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1 transition-colors">
                            Update <ChevronDown size={12} className={`transition-transform ${isDropOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isDropOpen && (
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-48 py-1 overflow-hidden">
                              <p className="px-3 py-1.5 text-xs text-gray-400 font-semibold uppercase">Change Status</p>
                              {statusOptions.filter(o => o.value !== s.dispatchStatus).map(o => (
                                <button key={o.value}
                                  onClick={() => requestStatusChange(s.id, s.dispatchStatus, o.value, s.invoiceNo)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left">
                                  <span className={`w-2.5 h-2.5 rounded-full ${o.dot}`} />
                                  <span className={`font-medium ${o.color}`}>{o.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Undo */}
                        {hasHistory && (
                          <button onClick={() => undoLastChange(s.id)} title="Undo last status change"
                            className="p-1.5 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600 transition-colors">
                            <Undo2 size={14} />
                          </button>
                        )}
                        {/* History */}
                        <button onClick={() => setModal({ type: 'statusHistory', data: s.id })} title="Status History"
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors">
                          <History size={14} />
                        </button>
                        <button onClick={() => setModal({ type: 'viewTrack', data: s })} title="View Invoice"
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors" title="Print Label">
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Search size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No orders found</p>
              <p className="text-xs mt-1">Try adjusting your filters or search</p>
            </div>
          )}
        </div>
      </div>

      {/* ──── STATUS CHANGE CONFIRMATION MODAL ──── */}
      <Modal isOpen={!!confirmData} onClose={() => setConfirmData(null)} title="Confirm Status Change" size="md">
        {confirmData && (() => {
          const fromInfo = getStatusInfo(confirmData.from);
          const toInfo = getStatusInfo(confirmData.to);
          // Detect backward change
          const fromIdx = statusOptions.findIndex(o => o.value === confirmData.from);
          const toIdx = statusOptions.findIndex(o => o.value === confirmData.to);
          const isBackward = toIdx < fromIdx;
          return (
            <div className="space-y-5">
              {/* Warning for backward changes */}
              {isBackward && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Backward Status Change</p>
                    <p className="text-xs text-amber-600 mt-0.5">You are reverting the status to a previous state. This will be recorded in the audit log.</p>
                  </div>
                </div>
              )}

              {/* Visual status change */}
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="text-center">
                  <span className={`inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-full font-bold ${fromInfo.bg} ${fromInfo.color}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${fromInfo.dot}`} />
                    {fromInfo.label}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">Current Status</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl text-gray-300">→</span>
                </div>
                <div className="text-center">
                  <span className={`inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-full font-bold ${toInfo.bg} ${toInfo.color} ring-2 ring-offset-2 ${toInfo.dot.replace('bg-', 'ring-')}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${toInfo.dot}`} />
                    {toInfo.label}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">New Status</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-sm text-gray-600">
                  Are you sure you want to change <strong className="text-gray-900">{confirmData.invoiceNo}</strong> order status
                  from <strong className={fromInfo.color}>{fromInfo.label}</strong> to <strong className={toInfo.color}>{toInfo.label}</strong>?
                </p>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reason / Remarks (optional)</label>
                <textarea value={confirmRemark} onChange={e => setConfirmRemark(e.target.value)}
                  rows={2}
                  placeholder="e.g. Customer requested redelivery, Wrong status updated by mistake..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" />
              </div>

              {/* Info */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-700 space-y-1">
                <p>📋 This change will be logged in status history</p>
                <p>👤 Updated by: <strong>{currentUser.name}</strong></p>
                <p>🕐 Time: <strong>{new Date().toLocaleString('en-IN')}</strong></p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button onClick={() => setConfirmData(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={executeStatusChange}
                  className={`px-5 py-2.5 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 ${isBackward ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {isBackward ? '⚠️ Confirm Revert' : '✅ Confirm Change'}
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ──── STATUS HISTORY MODAL ──── */}
      <Modal isOpen={modal?.type === 'statusHistory'} onClose={() => setModal(null)} title="Status Change History" size="lg">
        {historySale && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900 font-mono">{historySale.invoiceNo}</p>
                <p className="text-xs text-gray-500">{formatDate(historySale.date)} · {historySale.platform}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold ${getStatusInfo(historySale.dispatchStatus).bg} ${getStatusInfo(historySale.dispatchStatus).color}`}>
                <span className={`w-2 h-2 rounded-full ${getStatusInfo(historySale.dispatchStatus).dot}`} />
                Current: {getStatusInfo(historySale.dispatchStatus).label}
              </span>
            </div>

            {historyEntries.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <History size={36} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No status changes recorded</p>
                <p className="text-xs mt-1">Changes will appear here after first update</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

                <div className="space-y-4">
                  {historyEntries.map((entry, idx) => {
                    const fromInfo = getStatusInfo(entry.fromStatus);
                    const toInfo = getStatusInfo(entry.toStatus);
                    const fromIdx = statusOptions.findIndex(o => o.value === entry.fromStatus);
                    const toIdx = statusOptions.findIndex(o => o.value === entry.toStatus);
                    const isBackward = toIdx < fromIdx;
                    return (
                      <div key={entry.id} className="relative flex gap-4">
                        {/* Timeline dot */}
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isBackward ? 'bg-amber-100' : 'bg-indigo-100'}`}>
                          <span className="text-sm">{isBackward ? '↩️' : '→'}</span>
                        </div>
                        {/* Content */}
                        <div className={`flex-1 rounded-xl p-3 border ${idx === 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold ${fromInfo.bg} ${fromInfo.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${fromInfo.dot}`} />{fromInfo.label}
                            </span>
                            <span className="text-gray-400 text-xs">→</span>
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold ${toInfo.bg} ${toInfo.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${toInfo.dot}`} />{toInfo.label}
                            </span>
                            {isBackward && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">REVERTED</span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>👤 {entry.updatedBy}</span>
                            <span>🕐 {new Date(entry.updatedAt).toLocaleString('en-IN')}</span>
                          </div>
                          {entry.remark && (
                            <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg px-2 py-1.5 italic">💬 {entry.remark}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ──── VIEW INVOICE MODAL ──── */}
      <Modal isOpen={modal?.type === 'viewTrack'} onClose={() => setModal(null)} title="Invoice Details" size="xl">
        {viewSale && (() => {
          const saleHistory = getSaleHistory(viewSale.id);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  ['Order No.', viewSale.invoiceNo],
                  ['Date', formatDate(viewSale.date)],
                  ['Platform', viewSale.platform || '—'],
                  ['Tracking ID', viewSale.trackingId || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">{l}</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{v}</p>
                  </div>
                ))}
                {/* Status card with change button */}
                <div className={`rounded-xl p-3 ${getStatusInfo(viewSale.dispatchStatus).bg}`}>
                  <p className="text-xs opacity-70">Current Status</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-lg font-black ${getStatusInfo(viewSale.dispatchStatus).color}`}>{getStatusInfo(viewSale.dispatchStatus).label}</p>
                    <button onClick={() => setModal({ type: 'statusHistory', data: viewSale.id })}
                      className="p-1.5 rounded-lg hover:bg-white/50 text-current opacity-60 hover:opacity-100">
                      <History size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {viewSale.remarks && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Details</p>
                  <p className="text-sm text-gray-700 mt-0.5">{viewSale.remarks}</p>
                </div>
              )}

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs">
                      <th className="px-4 py-2.5 text-left font-semibold text-gray-500">Item</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-gray-500">SKU</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-gray-500">Qty</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-gray-500">Rate</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {viewSale.items.map(si => {
                      const item = items.find(i => i.id === si.itemId);
                      return (
                        <tr key={si.id}>
                          <td className="px-4 py-2.5 font-medium">{item?.name || '—'}</td>
                          <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{item?.sku || '—'}</td>
                          <td className="px-4 py-2.5 text-right font-bold">{si.quantity}</td>
                          <td className="px-4 py-2.5 text-right">{formatCurrency(si.rate)}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-green-700">{formatCurrency(si.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-start">
                {/* Quick Status Change — Full flexibility */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-semibold">Change Status:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {statusOptions.filter(o => o.value !== viewSale.dispatchStatus).map(o => (
                      <button key={o.value}
                        onClick={() => { setModal(null); setTimeout(() => requestStatusChange(viewSale.id, viewSale.dispatchStatus, o.value, viewSale.invoiceNo), 100); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${o.bg} ${o.color} hover:opacity-80 flex items-center gap-1.5 transition-all`}>
                        <span className={`w-2 h-2 rounded-full ${o.dot}`} />
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 w-56 ml-4 flex-shrink-0">
                  <div className="flex justify-between font-bold text-green-800">
                    <span>Total:</span>
                    <span>{formatCurrency(viewSale.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Recent History in View */}
              {saleHistory.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Recent Status Changes</p>
                  <div className="space-y-1.5">
                    {saleHistory.slice(0, 3).map(h => {
                      const from = getStatusInfo(h.fromStatus);
                      const to = getStatusInfo(h.toStatus);
                      return (
                        <div key={h.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${from.bg} ${from.color}`}>{from.label}</span>
                          <span className="text-gray-400">→</span>
                          <span className={`px-1.5 py-0.5 rounded font-bold ${to.bg} ${to.color}`}>{to.label}</span>
                          <span className="text-gray-400 ml-auto">{new Date(h.updatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* ──── BULK STATUS UPDATE MODAL ──── */}
      <Modal isOpen={modal?.type === 'bulkStatus'} onClose={() => setModal(null)} title="Bulk Status Update" size="xl">
        {!bulkDone ? (
          <div className="space-y-5">
            {/* Allowed Statuses Reference */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
              <p className="text-xs font-bold text-indigo-700 mb-2">Allowed Status Values (exact spelling required):</p>
              <div className="flex flex-wrap gap-1.5">
                {allowedLabels.map(s => {
                  const info = getStatusInfo(statusMap[s.toLowerCase()]);
                  return (
                    <span key={s} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold ${info.bg} ${info.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />{s}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-gray-900">{bulkRows.length}</p>
                <p className="text-xs text-gray-500 font-medium">Total Rows</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-green-600">{bulkRows.filter(r => r.matched).length}</p>
                <p className="text-xs text-green-600 font-medium">✅ Ready</p>
              </div>
              <div className={`rounded-xl p-3 text-center border ${bulkRows.some(r => !r.matched) ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-2xl font-black ${bulkRows.some(r => !r.matched) ? 'text-red-600' : 'text-gray-400'}`}>{bulkRows.filter(r => !r.matched).length}</p>
                <p className={`text-xs font-medium ${bulkRows.some(r => !r.matched) ? 'text-red-600' : 'text-gray-400'}`}>❌ Rejected</p>
              </div>
            </div>

            {/* Preview Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-3 py-2.5 text-center font-bold text-white w-10">Row</th>
                    <th className="px-3 py-2.5 text-center font-bold text-white w-14"></th>
                    <th className="px-3 py-2.5 text-left font-bold text-white">Order No.</th>
                    <th className="px-3 py-2.5 text-left font-bold text-white">Current Status</th>
                    <th className="px-3 py-2.5 text-left font-bold text-white">New Status</th>
                    <th className="px-3 py-2.5 text-left font-bold text-white">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkRows.map((row, idx) => {
                    const newInfo = getStatusInfo(statusMap[row.status.toLowerCase()] || '');
                    const currentInfo = row.sale ? getStatusInfo(row.sale.dispatchStatus) : null;
                    return (
                      <tr key={idx} className={row.matched ? 'bg-white hover:bg-green-50/30' : 'bg-red-50/70'}>
                        <td className="px-3 py-2.5 text-center text-gray-400 font-mono">{row.row}</td>
                        <td className="px-3 py-2.5 text-center">
                          {row.matched ? <CheckCircle size={15} className="text-green-600 mx-auto" /> : <XCircle size={15} className="text-red-500 mx-auto" />}
                        </td>
                        <td className="px-3 py-2.5 font-mono font-bold text-indigo-700">{row.orderNo}</td>
                        <td className="px-3 py-2.5">
                          {currentInfo ? (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold ${currentInfo.bg} ${currentInfo.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${currentInfo.dot}`} />{currentInfo.label}
                            </span>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          {row.matched && statusMap[row.status.toLowerCase()] ? (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold ${newInfo.bg} ${newInfo.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${newInfo.dot}`} />{newInfo.label}
                            </span>
                          ) : (
                            <span className="text-red-600 font-mono font-bold bg-red-100 px-2 py-0.5 rounded">{row.status || '(empty)'}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          {row.matched
                            ? <span className="text-green-600 font-semibold">✅ Ready</span>
                            : <span className="text-red-600 text-xs">{row.error}</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Invalid status warning detail */}
            {bulkRows.some(r => !r.matched && r.error?.includes('Invalid status')) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Invalid Status Spelling Detected</p>
                    <p className="text-xs text-amber-600 mt-1">The following rows have status values that don't match allowed ERP statuses:</p>
                    <div className="mt-2 space-y-1">
                      {bulkRows.filter(r => !r.matched && r.error?.includes('Invalid status')).map((r, i) => (
                        <div key={i} className="text-xs bg-amber-100 rounded-lg px-3 py-1.5">
                          <span className="text-amber-800">Row {r.row}:</span> <span className="font-mono font-bold text-red-700">"{r.status}"</span> <span className="text-amber-700">{r.error?.includes('Did you mean') ? r.error.split('—')[1] : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button onClick={() => setModal(null)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
                {bulkRows.some(r => !r.matched) && (
                  <button onClick={downloadErrorReport}
                    className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 flex items-center gap-1.5">
                    <Download size={14} /> Download Error Report
                  </button>
                )}
              </div>
              <button onClick={executeBulkStatus}
                disabled={!bulkRows.some(r => r.matched)}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <CheckCircle size={16} /> Update {bulkRows.filter(r => r.matched).length} Orders
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Bulk Update Complete!</h3>
              <div className="flex items-center justify-center gap-6 mt-3">
                <div>
                  <p className="text-3xl font-black text-green-600">{bulkUpdated}</p>
                  <p className="text-xs text-green-600 font-semibold">✅ Updated</p>
                </div>
                {bulkFailed > 0 && (
                  <div>
                    <p className="text-3xl font-black text-red-500">{bulkFailed}</p>
                    <p className="text-xs text-red-500 font-semibold">❌ Rejected</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mx-auto max-w-sm">
              <p className="text-sm text-green-800 font-medium">✅ All changes logged with user, time & remark</p>
            </div>
            <div className="flex justify-center gap-3">
              {bulkFailed > 0 && (
                <button onClick={downloadErrorReport}
                  className="px-5 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 flex items-center gap-2">
                  <Download size={14} /> Error Report
                </button>
              )}
              <button onClick={() => setModal(null)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm">
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

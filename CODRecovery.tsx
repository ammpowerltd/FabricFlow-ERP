import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Search, Edit2, Trash2, Download, Upload, CheckCircle, XCircle, Filter, Calendar } from 'lucide-react';
import type { Sale } from '../types';

type PayFilter = 'ALL' | 'PENDING' | 'PAID';

export default function CODRecovery() {
  const { sales, updateSale, deleteSale } = useStore();
  const [search, setSearch] = useState('');
  const [payFilter, setPayFilter] = useState<PayFilter>('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [editId, setEditId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // Bulk upload state
  const [bulkResult, setBulkResult] = useState<{ total: number; paid: number; failed: number; errors: string[] } | null>(null);

  // COD orders = sales with Payment: COD in remarks
  const codOrders = sales.filter(s => (s.remarks || '').toLowerCase().includes('payment: cod'));

  const filtered = codOrders.filter(s => {
    const matchSearch = s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      (s.trackingId || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.platform || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.remarks || '').toLowerCase().includes(search.toLowerCase());
    const isPaid = (s.remarks || '').includes('COD_PAID:true');
    const matchPay = payFilter === 'ALL' || (payFilter === 'PAID' && isPaid) || (payFilter === 'PENDING' && !isPaid);
    if (dateFilter === 'TODAY') { const t = new Date(); t.setHours(0,0,0,0); if (new Date(s.date) < t) return false; }
    if (dateFilter === 'WEEK') { const w = new Date(); w.setDate(w.getDate()-7); if (new Date(s.date) < w) return false; }
    if (dateFilter === 'MONTH') { const m = new Date(); m.setMonth(m.getMonth()-1); if (new Date(s.date) < m) return false; }
    return matchSearch && matchPay;
  });

  const isCODPaid = (s: Sale) => (s.remarks || '').includes('COD_PAID:true');
  const extract = (s: Sale, key: string) => {
    const m = (s.remarks || '').match(new RegExp(`${key}:\\s*([^\\|]+)`));
    return m?.[1]?.trim() || '—';
  };

  const totalCOD = codOrders.reduce((s, o) => s + o.grandTotal, 0);
  const paidOrders = codOrders.filter(o => isCODPaid(o));
  const pendingOrders = codOrders.filter(o => !isCODPaid(o));
  const paidAmount = paidOrders.reduce((s, o) => s + o.grandTotal, 0);
  const pendingAmount = pendingOrders.reduce((s, o) => s + o.grandTotal, 0);

  const markPaid = (id: string) => {
    const sale = sales.find(s => s.id === id);
    if (!sale) return;
    const newRemarks = (sale.remarks || '') + ' | COD_PAID:true | PaidDate:' + new Date().toISOString().split('T')[0];
    updateSale(id, { remarks: newRemarks });
  };

  const handleDelete = (s: Sale) => {
    if (!confirm(`Delete COD Recovery Entry?\n\nOrder No: ${s.invoiceNo}\nAmount: ${formatCurrency(s.grandTotal)}\n\nThis action cannot be undone.`)) return;
    deleteSale(s.id);
  };

  const startEdit = (s: Sale) => {
    setEditId(s.id);
    setEditFields({ courier: extract(s, 'Courier'), aggregator: extract(s, 'Aggregator'), awb: s.trackingId || '' });
  };

  const saveEdit = () => {
    if (!editId) return;
    const sale = sales.find(s => s.id === editId);
    if (!sale) return;
    let remarks = sale.remarks || '';
    if (editFields.courier) remarks = remarks.replace(/Courier:\s*[^\|]+/, `Courier: ${editFields.courier}`);
    if (editFields.aggregator) remarks = remarks.replace(/Aggregator:\s*[^\|]+/, `Aggregator: ${editFields.aggregator}`);
    updateSale(editId, { remarks, trackingId: editFields.awb || sale.trackingId });
    setEditId(null);
  };

  const markUnpaid = (id: string) => {
    const sale = sales.find(s => s.id === id);
    if (!sale) return;
    const newRemarks = (sale.remarks || '').replace(/\s*\|\s*COD_PAID:true[^|]*/g, '');
    updateSale(id, { remarks: newRemarks });
  };

  // Download template with Payment Status column
  const downloadTemplate = () => {
    const rows = codOrders.map(o => `${o.invoiceNo},${isCODPaid(o) ? 'Paid' : 'Pending'}`).join('\n');
    const csv = `Order No.,Payment Status\n${rows}\n\n# ALLOWED STATUS VALUES: Pending, Paid\n# Duplicate Order No. will be rejected\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'cod_payment_status_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadErrors = (errors: string[]) => {
    const csv = 'Row,Order No.,Error\n' + errors.map(e => { const m = e.match(/Row (\d+): "([^"]+)" — (.+)/); return m ? `${m[1]},"${m[2]}","${m[3]}"` : `,"","${e}"`; }).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'cod_update_errors.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // Upload with Payment Status column
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      let updated = 0; let failed = 0; const errors: string[] = [];
      const seen = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const orderNo = vals[headers.indexOf('order no.')] || vals[headers.indexOf('order no')] || vals[0] || '';
        const statusRaw = vals[headers.indexOf('payment status')] || vals[1] || '';
        if (!orderNo) continue;

        const lower = orderNo.toLowerCase();
        const statusLower = statusRaw.toLowerCase().trim();

        // Duplicate check
        if (seen.has(lower)) { failed++; errors.push(`Row ${i+1}: "${orderNo}" — Duplicate Order No. in file`); continue; }
        seen.add(lower);

        // Order exists check
        const sale = codOrders.find(s => s.invoiceNo.toLowerCase() === lower);
        if (!sale) { failed++; errors.push(`Row ${i+1}: "${orderNo}" — Order not found`); continue; }

        // Status validation
        if (statusLower !== 'paid' && statusLower !== 'pending') {
          failed++; errors.push(`Row ${i+1}: "${orderNo}" — Invalid status "${statusRaw}" (allowed: Pending, Paid)`); continue;
        }

        const currentlyPaid = isCODPaid(sale);

        if (statusLower === 'paid' && !currentlyPaid) {
          markPaid(sale.id); updated++;
        } else if (statusLower === 'pending' && currentlyPaid) {
          markUnpaid(sale.id); updated++;
        } else {
          // Already in desired status — skip silently
          updated++;
        }
      }
      setBulkResult({ total: lines.length - 1, paid: updated, failed, errors });
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total COD Orders', value: codOrders.length, amount: formatCurrency(totalCOD), icon: '💰', color: 'bg-indigo-50' },
          { label: 'Pending Recovery', value: pendingOrders.length, amount: formatCurrency(pendingAmount), icon: '🟡', color: 'bg-yellow-50' },
          { label: 'Paid / Recovered', value: paidOrders.length, amount: formatCurrency(paidAmount), icon: '🟢', color: 'bg-green-50' },
          { label: 'Recovery Rate', value: codOrders.length > 0 ? `${((paidOrders.length / codOrders.length) * 100).toFixed(0)}%` : '0%', amount: '', icon: '📊', color: 'bg-blue-50' },
          { label: 'Pending Amount', value: formatCurrency(pendingAmount), amount: '', icon: '⏳', color: 'bg-orange-50' },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl p-4 border border-gray-100 ${c.color}`}>
            <div className="text-xl mb-1">{c.icon}</div>
            <p className="text-lg font-black text-gray-900">{c.value}</p>
            {c.amount && <p className="text-xs text-gray-500 mt-0.5">{c.amount}</p>}
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-60 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
          <Search size={16} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Order No, AWB, Platform..." className="flex-1 text-sm outline-none bg-transparent" />
        </div>
        <div className="flex gap-1.5">
          {(['ALL', 'PENDING', 'PAID'] as PayFilter[]).map(f => (
            <button key={f} onClick={() => setPayFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${payFilter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f === 'ALL' ? 'All' : f === 'PENDING' ? '🟡 Pending' : '🟢 Paid'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-gray-400" />
          {['ALL', 'TODAY', 'WEEK', 'MONTH'].map(d => (
            <button key={d} onClick={() => setDateFilter(d)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${dateFilter === d ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {d === 'ALL' ? 'All' : d === 'TODAY' ? 'Today' : d === 'WEEK' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-500 flex items-center gap-1"><Filter size={12} /> {filtered.length}</span>
          <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <Download size={13} /> Template
          </button>
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleUpload} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 shadow-sm">
            <Upload size={13} /> Mark Paid (Excel)
          </button>
        </div>
      </div>

      {/* Bulk Result */}
      {bulkResult && (
        <div className={`rounded-2xl p-4 border ${bulkResult.failed > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-bold text-gray-900">Bulk Payment Status Update Complete</p>
                <p className="text-xs text-gray-600">Total: {bulkResult.total} · Updated: <strong className="text-green-700">{bulkResult.paid}</strong> · Failed: <strong className="text-red-600">{bulkResult.failed}</strong></p>
              </div>
            </div>
            <button onClick={() => setBulkResult(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
          </div>
          {bulkResult.errors.length > 0 && (
            <div className="mt-2">
              <div className="max-h-24 overflow-y-auto space-y-0.5 mb-2">
                {bulkResult.errors.map((err, i) => (
                  <div key={i} className="text-xs text-red-700 flex items-center gap-1"><XCircle size={12} className="flex-shrink-0" /> {err}</div>
                ))}
              </div>
              <button onClick={() => downloadErrors(bulkResult.errors)}
                className="flex items-center gap-1.5 text-xs text-red-600 font-semibold hover:text-red-700">
                <Download size={12} /> Download Error Report
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Platform</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Courier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aggregator</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">AWB</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => {
                const paid = isCODPaid(s);
                const courier = extract(s, 'Courier');
                const aggregator = extract(s, 'Aggregator');
                const isEditing = editId === s.id;
                const pColor = s.platform === 'Amazon' ? 'bg-orange-100 text-orange-700' : s.platform === 'Myntra' ? 'bg-pink-100 text-pink-700' : s.platform === 'Flipkart' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700';
                const statusInfo = s.dispatchStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' : s.dispatchStatus === 'DISPATCHED' ? 'bg-blue-100 text-blue-700' : s.dispatchStatus === 'RTO' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700';

                return (
                  <tr key={s.id} className={`hover:bg-gray-50/50 ${paid ? 'bg-green-50/30' : ''}`}>
                    <td className="px-4 py-3 text-sm font-mono font-bold text-indigo-700">{s.invoiceNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(s.date)}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-semibold ${pColor}`}>{s.platform || '—'}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-700">{isEditing ? <input value={editFields.courier} onChange={e => setEditFields(f=>({...f,courier:e.target.value}))} className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none" /> : courier}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{isEditing ? <input value={editFields.aggregator} onChange={e => setEditFields(f=>({...f,aggregator:e.target.value}))} className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none" /> : aggregator}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(s.grandTotal)}</td>
                    <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-1 rounded-full font-bold ${statusInfo}`}>{s.dispatchStatus.replace(/_/g, ' ')}</span></td>
                    <td className="px-4 py-3 text-center">
                      {paid ? (
                        <button onClick={() => { if (confirm('Change payment status back to Pending?\n\nThis order will be marked as unpaid again.')) markUnpaid(s.id); }}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-colors cursor-pointer" title="Click to revert to Pending">
                          🟢 Paid
                        </button>
                      ) : (
                        <button onClick={() => markPaid(s.id)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors cursor-pointer" title="Click to mark as Paid">
                          🟡 Pending
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{isEditing ? <input value={editFields.awb} onChange={e => setEditFields(f=>({...f,awb:e.target.value}))} className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none font-mono" /> : (s.trackingId || '—')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={saveEdit} className="px-2.5 py-1 text-xs bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Save</button>
                            <button onClick={() => setEditId(null)} className="px-2.5 py-1 text-xs bg-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(s)} className="p-1.5 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600" title="Edit"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(s)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600" title="Delete"><Trash2 size={14} /></button>
                          </>
                        )}
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
              <p className="font-medium">No COD orders found</p>
              <p className="text-xs mt-1">COD orders appear here automatically from Sales</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

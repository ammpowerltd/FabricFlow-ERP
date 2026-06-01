import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/ui/Modal';
import { formatCurrency, generateId, formatDate, getStatusColor } from '../utils/helpers';
import { Plus, Search, Eye, FileText, X, Upload, Download, CheckCircle, XCircle, ArrowRight, FileSpreadsheet, Edit2, Trash2 } from 'lucide-react';
import type { Sale, SalesItem } from '../types';

type SalesRowForm = {
  id: string;
  orderNo: string;
  awbNo: string;
  courier: string;
  courierAggregator: string;
  paymentMode: string;
  itemId: string;
  quantity: number;
  rate: number;
};

const courierOptions = ['DTDC', 'BlueDart', 'Delhivery', 'Ekart', 'Shiprocket', 'NimbusPost', 'India Post', 'FedEx', 'Ecom Express', 'Shadowfax', 'Other'];

export default function Sales() {
  const { items, parties, sales, addSale, deleteSale, addStockMovement, updateItemStock, currentUser } = useStore();
  const courierMaster = parties.filter(p => ['COURIER_PARTNER', 'COURIER_AGGREGATOR'].includes(p.type) && p.status === 'ACTIVE');
  const platformMaster = parties.filter(p => p.type === 'PLATFORM' && p.status === 'ACTIVE');
  const [modal, setModal] = useState<{ type: string; data?: unknown } | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    platform: 'Amazon',
    remarks: ''
  });

  const emptyRow = (): SalesRowForm => ({ id: generateId(), orderNo: '', awbNo: '', courier: '', courierAggregator: '', paymentMode: 'Prepaid', itemId: '', quantity: 0, rate: 0 });
  const [rows, setRows] = useState<SalesRowForm[]>([emptyRow()]);

  const grandTotal = rows.reduce((s, r) => s + r.quantity * r.rate, 0);

  const addRow = () => setRows(r => [...r, emptyRow()]);
  const updateRow = (id: string, field: keyof SalesRowForm, val: unknown) =>
    setRows(r => r.map(row => {
      if (row.id !== id) return row;
      const updated = { ...row, [field]: val };
      if (field === 'itemId') {
        const item = items.find(i => i.id === String(val));
        if (item) { updated.rate = item.salesRate; }
      }
      return updated;
    }));

  const resetForm = () => {
    setForm({ date: new Date().toISOString().split('T')[0], platform: 'Amazon', remarks: '' });
    setRows([emptyRow()]);
  };

  // ─── Bulk Upload State ───
  const fileRef = useRef<HTMLInputElement>(null);
  type BulkStep = 'upload' | 'preview' | 'result';
  const [bulkStep, setBulkStep] = useState<BulkStep>('upload');
  type BulkRow = Record<string, string> & { _status: 'valid' | 'rejected'; _message: string };
  const [bulkData, setBulkData] = useState<BulkRow[]>([]);
  const [bulkImported, setBulkImported] = useState(0);
  const [bulkRejected, setBulkRejected] = useState(0);

  const openBulkUpload = () => {
    setBulkStep('upload'); setBulkData([]); setBulkImported(0); setBulkRejected(0);
    setModal({ type: 'bulkSales' });
  };

  const downloadSalesTemplate = () => {
    const courierNames = courierMaster.map(c => c.name).join(', ') || 'BlueDart, Shiprocket';
    const aggregatorNames = parties.filter(p => p.type === 'COURIER_AGGREGATOR' && p.status === 'ACTIVE').map(a => a.name).join(', ') || 'Shiprocket, NimbusPost';
    const platformNames = platformMaster.map(p => p.name).join(', ') || 'Amazon, Myntra, Flipkart';
    const csv = `Order No,AWB No,Courier,Aggregator,Payment Mode,Platform,Item Name,Qty,Rate\n` +
      `ORD-1025,AWB558822,BlueDart Express,Shiprocket,COD,Amazon India,Slim Fit Blue Jeans,10,1299\n` +
      `ORD-1026,AWB558823,BlueDart Express,NimbusPost,Prepaid,Myntra,Classic White T-Shirt,5,499\n` +
      `ORD-1027,AWB558824,Delhivery,Shiprocket,COD,Flipkart,Bomber Jacket - Navy,2,2499\n` +
      `\n# REFERENCE - Available Couriers: ${courierNames}\n` +
      `# REFERENCE - Available Aggregators: ${aggregatorNames}\n` +
      `# REFERENCE - Available Platforms: ${platformNames}\n` +
      `# NOTE: Order No. must be unique — duplicates will be rejected\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sales_bulk_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const aggregatorMaster = parties.filter(p => p.type === 'COURIER_AGGREGATOR' && p.status === 'ACTIVE');

  // Validate a single row with duplicate tracking
  const validateBulkRow = (row: Record<string, string>, seenOrders: Set<string>): { status: 'valid' | 'rejected'; message: string } => {
    const orderNo = (row['Order No'] || '').trim();
    const itemName = (row['Item Name'] || '').trim();
    const courier = (row['Courier'] || '').trim();
    const aggregator = (row['Aggregator'] || '').trim();
    const platform = (row['Platform'] || '').trim();
    const qty = Number(row['Qty'] || 0);

    // 1. Order No duplicate in file
    if (orderNo && seenOrders.has(orderNo.toLowerCase())) return { status: 'rejected', message: `Duplicate Order No. "${orderNo}" in uploaded file` };

    // 2. Order No already exists in ERP
    if (orderNo && sales.find(s => s.invoiceNo.toLowerCase() === orderNo.toLowerCase())) return { status: 'rejected', message: `Order No. "${orderNo}" already exists in ERP` };

    // 3. Item Name
    if (!itemName) return { status: 'rejected', message: 'Item Name is empty' };
    const matchedItem = items.find(it => it.name.toLowerCase() === itemName.toLowerCase());
    if (!matchedItem) return { status: 'rejected', message: `Item "${itemName}" not found in Item Master` };

    // 4. Qty
    if (qty <= 0) return { status: 'rejected', message: 'Qty must be greater than 0' };
    if (qty > matchedItem.currentStock) return { status: 'rejected', message: `Qty (${qty}) exceeds available stock (${matchedItem.currentStock})` };

    // 5. Courier
    if (courier) {
      const mc = courierMaster.find(c => c.name.toLowerCase() === courier.toLowerCase());
      if (!mc) return { status: 'rejected', message: `Courier "${courier}" not found in Courier Master` };
    }

    // 6. Aggregator
    if (aggregator) {
      const ma = aggregatorMaster.find(a => a.name.toLowerCase() === aggregator.toLowerCase());
      if (!ma) return { status: 'rejected', message: `Aggregator "${aggregator}" not found in Courier Aggregator Master` };
    }

    // 7. Platform
    if (platform) {
      const mp = platformMaster.find(p => p.name.toLowerCase() === platform.toLowerCase());
      if (!mp) return { status: 'rejected', message: `Platform "${platform}" not found in Platform Master` };
    }

    return { status: 'valid', message: 'Valid' };
  };

  const handleBulkFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim());
      const rows: BulkRow[] = [];
      const seenOrders = new Set<string>();
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });
        const { status, message } = validateBulkRow(row, seenOrders);
        const orderNo = (row['Order No'] || '').trim().toLowerCase();
        if (orderNo) seenOrders.add(orderNo);
        rows.push({ ...row, _status: status, _message: message } as BulkRow);
      }
      setBulkData(rows);
      setBulkStep('preview');
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const executeBulkSales = () => {
    let imported = 0;
    let rejected = 0;
    const validRows = bulkData.filter(r => r._status === 'valid');

    validRows.forEach(row => {
      const itemName = (row['Item Name'] || '').trim();
      const matched = items.find(it => it.name.toLowerCase() === itemName.toLowerCase());
      if (!matched) { rejected++; return; }
      const qty = Number(row['Qty']);
      if (qty <= 0 || qty > matched.currentStock) { rejected++; return; }
      const rate = Number(row['Rate']) || matched.salesRate;
      const amount = qty * rate;

      const saleItems: SalesItem[] = [{
        id: generateId(), itemId: matched.id, quantity: qty, rate,
        gstPercent: 0, amount, gstAmount: 0, totalAmount: amount
      }];

      const sale: Sale = {
        id: generateId(), invoiceNo: row['Order No'] || `ORD-${Date.now()}-${imported + 1}`,
        date: new Date().toISOString().split('T')[0], partyId: '', gstType: 'EXEMPT',
        items: saleItems, subtotal: amount, totalGST: 0, grandTotal: amount,
        status: 'ACTIVE', dispatchStatus: 'PENDING',
        platform: row['Platform'] || '',
        trackingId: row['AWB No'] || undefined,
        remarks: `Courier: ${row['Courier'] || '—'} | Aggregator: ${row['Aggregator'] || '—'} | Payment: ${row['Payment Mode'] || 'Prepaid'}`,
        createdAt: new Date().toISOString()
      };
      addSale(sale);

      const newStock = Math.max(0, matched.currentStock - qty);
      updateItemStock(matched.id, newStock);
      addStockMovement({
        id: generateId(), itemId: matched.id, type: 'OUTWARD', quantity: qty,
        previousStock: matched.currentStock, newStock, reason: 'Bulk Sales Upload',
        reference: sale.invoiceNo, createdBy: currentUser.name, createdAt: new Date().toISOString()
      });
      imported++;
    });

    rejected += bulkData.filter(r => r._status === 'rejected').length;
    setBulkImported(imported);
    setBulkRejected(rejected);
    setBulkStep('result');
  };

  const saveSale = () => {
    const validRows = rows.filter(r => r.itemId && r.quantity > 0);
    if (!validRows.length) { alert('Add at least one item with quantity'); return; }

    // Use first row's Order No as invoice reference
    const firstRow = validRows[0];
    if (!firstRow.orderNo) { alert('Order No. is required (first row)'); return; }

    const saleItems: SalesItem[] = validRows.map(r => ({
      id: generateId(), itemId: r.itemId, quantity: r.quantity, rate: r.rate,
      gstPercent: 0, amount: r.quantity * r.rate, gstAmount: 0,
      totalAmount: r.quantity * r.rate
    }));

    const sale: Sale = {
      id: generateId(), invoiceNo: firstRow.orderNo, date: form.date,
      partyId: '', gstType: 'EXEMPT',
      items: saleItems, subtotal: grandTotal, totalGST: 0, grandTotal,
      status: 'ACTIVE', dispatchStatus: 'PENDING', platform: form.platform,
      trackingId: firstRow.awbNo || undefined,
      courierPartnerId: undefined,
      remarks: `Courier: ${firstRow.courier || '—'} | Aggregator: ${firstRow.courierAggregator || '—'} | Payment: ${firstRow.paymentMode || 'Prepaid'}${form.remarks ? ' | ' + form.remarks : ''}`,
      createdAt: new Date().toISOString()
    };

    addSale(sale);

    validRows.forEach(r => {
      const item = items.find(i => i.id === r.itemId);
      if (item) {
        const newStock = Math.max(0, item.currentStock - r.quantity);
        updateItemStock(r.itemId, newStock);
        addStockMovement({
          id: generateId(), itemId: r.itemId, type: 'OUTWARD', quantity: r.quantity,
          previousStock: item.currentStock, newStock, reason: 'Sales',
          reference: sale.invoiceNo, createdBy: currentUser.name, createdAt: new Date().toISOString()
        });
      }
    });

    resetForm();
    setModal(null);
    alert('Invoice created! Stock updated.');
  };

  // Edit sale — load into create modal
  const editSale = (s: Sale) => {
    const courierMatch = (s.remarks || '').match(/Courier:\s*([^\|]+)/);
    const paymentMatch = (s.remarks || '').match(/Payment:\s*([^\|]+)/);
    setForm({ date: s.date, platform: s.platform || 'Amazon', remarks: '' });
    const aggMatch = (s.remarks || '').match(/Aggregator:\s*([^\|]+)/);
    setRows(s.items.map(si => (
      { id: generateId(), orderNo: s.invoiceNo, awbNo: s.trackingId || '', courier: courierMatch?.[1]?.trim() || '', courierAggregator: aggMatch?.[1]?.trim() || '', paymentMode: paymentMatch?.[1]?.trim() || 'Prepaid', itemId: si.itemId, quantity: si.quantity, rate: si.rate }
    )));
    deleteSale(s.id);
    setModal({ type: 'create' });
  };

  // Delete sale
  const handleDeleteSale = (s: Sale) => {
    if (!confirm(`Delete Order?\n\nOrder No: ${s.invoiceNo}\nPlatform: ${s.platform}\nAmount: ${formatCurrency(s.grandTotal)}\n\nThis action cannot be undone.`)) return;
    deleteSale(s.id);
  };

  const filteredSales = sales.filter(s => {
    const matchSearch = s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      (s.platform || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.trackingId || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.remarks || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const viewSale = (modal?.type === 'view' ? modal?.data : undefined) as Sale | undefined;

  const platformColors: Record<string, string> = {
    Amazon: 'bg-orange-100 text-orange-700', Myntra: 'bg-pink-100 text-pink-700',
    Flipkart: 'bg-blue-100 text-blue-700', B2B: 'bg-gray-100 text-gray-700',
    Ajio: 'bg-purple-100 text-purple-700', Shopify: 'bg-green-100 text-green-700',
    Meesho: 'bg-rose-100 text-rose-700', default: 'bg-indigo-100 text-indigo-700'
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(sales.reduce((s, x) => s + x.grandTotal, 0)), icon: '💰' },
          { label: 'Total Invoices', value: sales.length, icon: '🧾' },
          { label: 'Pending Dispatch', value: sales.filter(s => s.dispatchStatus === 'PENDING').length, icon: '📦' },
          { label: 'Delivered', value: sales.filter(s => s.dispatchStatus === 'DELIVERED').length, icon: '✅' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-60 px-3 py-2.5 bg-white border border-gray-200 rounded-xl">
          <Search size={16} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by invoice, platform, AWB, order..."
            className="flex-1 text-sm outline-none" />
        </div>
        <button onClick={openBulkUpload}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-sm">
          <Upload size={16} /> Bulk Upload Sales
        </button>
        <button onClick={() => { resetForm(); setModal({ type: 'create' }); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm">
          <Plus size={16} /> New Invoice
        </button>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order No.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Platform</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Courier</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aggregator</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">AWB</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
             {filteredSales.map(s => {
              const pColor = platformColors[s.platform || ''] || platformColors.default;
              const sCourier = (s.remarks || '').match(/Courier:\s*([^\|]+)/)?.[1]?.trim() || '—';
              const sAggregator = (s.remarks || '').match(/Aggregator:\s*([^\|]+)/)?.[1]?.trim() || '—';
              return (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-bold text-green-700">{s.invoiceNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDate(s.date)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${pColor}`}>{s.platform || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{sCourier}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{sAggregator}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(s.grandTotal)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(s.dispatchStatus)}`}>{s.dispatchStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{s.trackingId || '—'}</td>
                   <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal({ type: 'view', data: s })} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600" title="View"><Eye size={14} /></button>
                      <button className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600" title="Print"><FileText size={14} /></button>
                      <button onClick={() => editSale(s)} className="p-1.5 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600" title="Edit"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeleteSale(s)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredSales.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-40" />
            <p>No sales found</p>
          </div>
        )}
      </div>

      {/* ──────────── CREATE INVOICE MODAL ──────────── */}
      <Modal isOpen={modal?.type === 'create'} onClose={() => setModal(null)} title="Create Sales Invoice" size="2xl">
        <div className="space-y-5">
          {/* Top Section: Date + Platform only */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Platform *</label>
              <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                {['Amazon', 'Myntra', 'Flipkart', 'Ajio', 'Shopify', 'Meesho', 'B2B', 'Direct', 'Other'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-400 -mt-3">💡 Order No. from the first row below will be used as the Invoice Reference Number</p>

          {/* Items Table — New Structure */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-800">Order Items</label>
              <button onClick={addRow} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                <Plus size={14} /> Add Row
              </button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-indigo-600">
                    <th className="px-2 py-2.5 text-left font-semibold text-white">Order No.</th>
                    <th className="px-2 py-2.5 text-left font-semibold text-white">AWB No.</th>
                    <th className="px-2 py-2.5 text-left font-semibold text-white">Courier</th>
                    <th className="px-2 py-2.5 text-left font-semibold text-white">Aggregator</th>
                    <th className="px-2 py-2.5 text-center font-semibold text-white">Payment</th>
                    <th className="px-2 py-2.5 text-left font-semibold text-white">Item</th>
                    <th className="px-2 py-2.5 text-center font-semibold text-white">Qty</th>
                    <th className="px-2 py-2.5 text-right font-semibold text-white">Rate (₹)</th>
                    <th className="px-2 py-2.5 text-right font-semibold text-white">Amount (₹)</th>
                    <th className="px-1 py-2.5 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => {
                    const amt = row.quantity * row.rate;
                    return (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="px-2 py-2">
                          <input value={row.orderNo} onChange={e => updateRow(row.id, 'orderNo', e.target.value)}
                            placeholder="ORD-1025"
                            className="w-28 text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 font-mono" />
                        </td>
                        <td className="px-2 py-2">
                          <input value={row.awbNo} onChange={e => updateRow(row.id, 'awbNo', e.target.value)}
                            placeholder="AWB558822"
                            className="w-28 text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 font-mono" />
                        </td>
                        <td className="px-2 py-2">
                          <select value={row.courier} onChange={e => updateRow(row.id, 'courier', e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-1 py-1.5 outline-none focus:border-indigo-400 bg-white">
                            <option value="">Select</option>
                            {courierOptions.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <select value={row.courierAggregator} onChange={e => updateRow(row.id, 'courierAggregator', e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-1 py-1.5 outline-none focus:border-indigo-400 bg-white">
                            <option value="">Select</option>
                            {parties.filter(p => p.type === 'COURIER_AGGREGATOR' && p.status === 'ACTIVE').map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <select value={row.paymentMode} onChange={e => updateRow(row.id, 'paymentMode', e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-1 py-1.5 outline-none focus:border-indigo-400 bg-white">
                            <option value="Prepaid">Prepaid</option>
                            <option value="COD">COD</option>
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <select value={row.itemId} onChange={e => updateRow(row.id, 'itemId', e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-1 py-1.5 outline-none focus:border-indigo-400 bg-white">
                            <option value="">Select item...</option>
                            {items.filter(i => i.type === 'FINISHED_GOODS' && i.status === 'ACTIVE').map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input type="number" min={0} value={row.quantity || ''} onChange={e => updateRow(row.id, 'quantity', Number(e.target.value))}
                            className="w-16 mx-auto block text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-center font-bold" />
                        </td>
                        <td className="px-2 py-2">
                          <input type="number" min={0} value={row.rate || ''} onChange={e => updateRow(row.id, 'rate', Number(e.target.value))}
                            className="w-24 ml-auto block text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-right" />
                        </td>
                        <td className="px-2 py-2 text-right">
                          <span className="text-sm font-bold text-green-700">{formatCurrency(amt)}</span>
                        </td>
                        <td className="px-1 py-2">
                          {rows.length > 1 && (
                            <button onClick={() => setRows(r => r.filter(x => x.id !== row.id))} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><X size={14} /></button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 w-64">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">Grand Total:</span>
                <span className="text-xl font-black text-green-700">{formatCurrency(grandTotal)}</span>
              </div>
              <p className="text-xs text-green-600 mt-1">{rows.filter(r => r.itemId && r.quantity > 0).length} item(s) · {rows.filter(r => r.quantity > 0).reduce((s, r) => s + r.quantity, 0)} pcs</p>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Remarks (optional)</label>
            <input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder="Any additional notes..." />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
            <button onClick={saveSale}
              disabled={!rows.some(r => r.itemId && r.quantity > 0)}
              className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <FileText size={15} /> Create Invoice
            </button>
          </div>
        </div>
      </Modal>

      {/* ──────────── VIEW INVOICE MODAL ──────────── */}
      <Modal isOpen={modal?.type === 'view'} onClose={() => setModal(null)} title="Invoice Details" size="xl">
        {viewSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Order No.', viewSale.invoiceNo], ['Date', formatDate(viewSale.date)],
                ['Platform', viewSale.platform || '—'], ['Status', viewSale.dispatchStatus],
                ['AWB / Tracking', viewSale.trackingId || '—'],
              ].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{l}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{v}</p>
                </div>
              ))}
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
            <div className="flex justify-end">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 w-56">
                <div className="flex justify-between font-bold text-green-800">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(viewSale.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ──────────── BULK SALES UPLOAD MODAL ──────────── */}
      <Modal isOpen={modal?.type === 'bulkSales'} onClose={() => setModal(null)} title="Bulk Upload Sales" size="2xl">
        <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleBulkFile} className="hidden" />

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-6">
          {[
            { step: 'upload' as BulkStep, label: 'Upload File', num: 1 },
            { step: 'preview' as BulkStep, label: 'Validate & Preview', num: 2 },
            { step: 'result' as BulkStep, label: 'Import Result', num: 3 },
          ].map((s, idx) => (
            <div key={s.step} className="flex items-center gap-2">
              {idx > 0 && <ArrowRight size={14} className="text-gray-300" />}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                bulkStep === s.step ? 'bg-green-600 text-white' :
                (['preview', 'result'].includes(bulkStep) && s.step === 'upload') || (bulkStep === 'result' && s.step === 'preview')
                  ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{s.num}</span>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* STEP 1: Upload */}
        {bulkStep === 'upload' && (
          <div className="space-y-5">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet size={22} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 text-sm">Step 1: Download Sales Template</h4>
                  <p className="text-xs text-green-700 mt-1">Template includes reference list of available Couriers & Platforms from your Master Data.</p>
                  <button onClick={downloadSalesTemplate}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-sm">
                    <Download size={14} /> Download Sales Template (.csv)
                  </button>
                </div>
              </div>
            </div>

            {/* Validation Rules */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h4 className="font-bold text-gray-800 text-sm mb-3">Validation Rules</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold text-green-700 uppercase mb-2">✅ No Validation (Ignored)</p>
                  <div className="space-y-1">
                    {['Order No', 'AWB No', 'Rate'].map(f => (
                      <div key={f} className="text-xs px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-2">
                        <span className="text-green-500">—</span> {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-700 uppercase mb-2">🔍 Validated Fields</p>
                  <div className="space-y-1">
                    {[
                      { f: 'Order No.', rule: 'Must be unique (no duplicates in file or ERP)' },
                      { f: 'Courier', rule: 'Must exist in Courier Master' },
                      { f: 'Aggregator', rule: 'Must exist in Courier Aggregator Master' },
                      { f: 'Platform', rule: 'Must exist in Platform Master' },
                      { f: 'Item Name', rule: 'Must exist in Item Master' },
                      { f: 'Qty', rule: 'Must not exceed available stock' },
                    ].map(({ f, rule }) => (
                      <div key={f} className="text-xs px-3 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        <span className="font-bold">{f}</span> <span className="text-red-500">→ {rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-400 hover:bg-green-50/30 transition-all cursor-pointer"
              onClick={() => fileRef.current?.click()}>
              <Upload size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">Step 2: Upload Your Sales CSV</p>
              <p className="text-xs text-gray-500 mt-1">Click to browse or drag & drop</p>
            </div>
          </div>
        )}

        {/* STEP 2: Validate & Preview */}
        {bulkStep === 'preview' && (() => {
          const validCount = bulkData.filter(r => r._status === 'valid').length;
          const rejectedCount = bulkData.filter(r => r._status === 'rejected').length;
          return (
            <div className="space-y-5">
              {/* Summary Banner */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-gray-900">{bulkData.length}</p>
                  <p className="text-xs text-gray-500 font-medium">Total Rows</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-green-600">{validCount}</p>
                  <p className="text-xs text-green-600 font-medium">✅ Ready to Import</p>
                </div>
                <div className={`rounded-xl p-3 text-center border ${rejectedCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-2xl font-black ${rejectedCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>{rejectedCount}</p>
                  <p className={`text-xs font-medium ${rejectedCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>❌ Rejected</p>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="px-3 py-2.5 text-center font-bold text-white w-20">Status</th>
                      <th className="px-3 py-2.5 text-left font-bold text-white">Order No</th>
                      <th className="px-3 py-2.5 text-left font-bold text-white">Courier</th>
                      <th className="px-3 py-2.5 text-left font-bold text-white">Aggregator</th>
                      <th className="px-3 py-2.5 text-left font-bold text-white">Platform</th>
                      <th className="px-3 py-2.5 text-left font-bold text-white">Item Name</th>
                      <th className="px-3 py-2.5 text-right font-bold text-white">Qty</th>
                      <th className="px-3 py-2.5 text-right font-bold text-white">Rate</th>
                      <th className="px-3 py-2.5 text-left font-bold text-white w-56">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkData.map((row, idx) => {
                      const isValid = row._status === 'valid';
                      const matched = items.find(it => it.name.toLowerCase() === (row['Item Name'] || '').toLowerCase());
                      return (
                        <tr key={idx} className={isValid ? 'bg-white hover:bg-green-50/30' : 'bg-red-50'}>
                          <td className="px-3 py-2.5 text-center">
                            {isValid ? (
                              <span className="inline-flex items-center gap-1 text-green-700 font-bold"><CheckCircle size={14} /> Ready</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-600 font-bold"><XCircle size={14} /> Rejected</span>
                            )}
                          </td>
                          <td className={`px-3 py-2 font-mono ${!isValid && (row._message.includes('Duplicate') || row._message.includes('already exists')) ? 'text-red-700 font-bold' : 'text-gray-700'}`}>{row['Order No'] || '—'}</td>
                          <td className={`px-3 py-2 ${!isValid && row._message.includes('Courier') ? 'text-red-700 font-bold' : 'text-gray-700'}`}>{row['Courier'] || '—'}</td>
                          <td className={`px-3 py-2 ${!isValid && row._message.includes('Aggregator') ? 'text-red-700 font-bold' : 'text-gray-700'}`}>{row['Aggregator'] || '—'}</td>
                          <td className={`px-3 py-2 ${!isValid && row._message.includes('Platform') ? 'text-red-700 font-bold' : 'text-gray-700'}`}>{row['Platform'] || '—'}</td>
                          <td className={`px-3 py-2 font-medium ${!isValid && row._message.includes('Item') ? 'text-red-700 font-bold' : 'text-gray-900'}`}>{row['Item Name'] || '—'}</td>
                          <td className={`px-3 py-2 text-right font-bold ${!isValid && row._message.includes('Qty') ? 'text-red-700' : 'text-gray-900'}`}>{row['Qty'] || '0'}</td>
                          <td className="px-3 py-2 text-right text-gray-700">{row['Rate'] ? `₹${row['Rate']}` : matched ? formatCurrency(matched.salesRate) : '—'}</td>
                          <td className="px-3 py-2">
                            {isValid ? (
                              <span className="text-green-600 font-semibold">✅ Valid</span>
                            ) : (
                              <span className="text-red-600 font-semibold text-xs">{row._message}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button onClick={() => setBulkStep('upload')} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">
                  ← Re-Upload
                </button>
                <div className="flex items-center gap-3">
                  {rejectedCount > 0 && (
                    <span className="text-xs text-red-600 font-medium">{rejectedCount} row(s) will be skipped</span>
                  )}
                  <button onClick={executeBulkSales}
                    disabled={validCount === 0}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <CheckCircle size={16} /> Import {validCount} Valid Orders
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* STEP 3: Result */}
        {bulkStep === 'result' && (
          <div className="space-y-5 text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Sales Import Completed!</h3>
              <div className="flex items-center justify-center gap-6 mt-3">
                <div>
                  <p className="text-3xl font-black text-green-600">{bulkImported}</p>
                  <p className="text-xs text-green-600 font-semibold">✅ Imported</p>
                </div>
                {bulkRejected > 0 && (
                  <div>
                    <p className="text-3xl font-black text-red-500">{bulkRejected}</p>
                    <p className="text-xs text-red-500 font-semibold">❌ Rejected</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mx-auto max-w-sm">
              <p className="text-sm text-green-800 font-medium">✅ Stock automatically deducted for all imported sales</p>
            </div>
            <div className="flex justify-center gap-3 pt-4">
              <button onClick={() => { setBulkStep('upload'); setBulkData([]); }} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">
                Upload More
              </button>
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

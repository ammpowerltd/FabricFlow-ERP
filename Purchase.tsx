import { useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/ui/Modal';
import { formatCurrency, generateId, formatDate, getStatusColor } from '../utils/helpers';
import { Plus, Search, Eye, FileText, Trash2, X, Edit2 } from 'lucide-react';
import type { Purchase, PurchaseItem, GSTType } from '../types';

type PurchaseItemForm = {
  id: string; itemId: string; quantity: number; rate: number; gstPercent: number;
};

import type { Item, Unit } from '../types';

function PurchaseItemRow({ row, items, units, onUpdate, onRemove }: {
  row: PurchaseItemForm;
  items: Item[];
  units: Unit[];
  onUpdate: (id: string, field: keyof PurchaseItemForm, val: unknown) => void;
  onRemove: (id: string) => void;
}) {
  const selItem = items.find((i: Item) => i.id === row.itemId);
  const unit = selItem ? units.find((u: Unit) => u.id === selItem.unitId) : null;
  const amount = row.quantity * row.rate;
  const gstAmt = amount * (row.gstPercent / 100);
  const total = amount + gstAmt;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
      <td className="px-3 py-2.5">
        <select value={row.itemId} onChange={e => {
          const item = items.find(i => i.id === e.target.value);
          onUpdate(row.id, 'itemId', e.target.value);
          if (item) { onUpdate(row.id, 'rate', item.purchaseRate); onUpdate(row.id, 'gstPercent', item.gstPercent); }
        }} className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 bg-white">
          <option value="">Select item...</option>
          {items.filter((i: Item) => i.type === 'RAW_MATERIAL' && i.status === 'ACTIVE').map((i: Item) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </td>
      <td className="px-3 py-2.5 text-xs text-gray-500 text-center">{selItem?.sku || '—'}</td>
      <td className="px-3 py-2.5 text-xs text-gray-500 text-center">{unit?.symbol || '—'}</td>
      <td className="px-3 py-2.5">
        <input type="number" value={row.quantity || ''} onChange={e => onUpdate(row.id, 'quantity', Number(e.target.value))}
          className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-right" min={0} />
      </td>
      <td className="px-3 py-2.5">
        <input type="number" value={row.rate || ''} onChange={e => onUpdate(row.id, 'rate', Number(e.target.value))}
          className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-right" min={0} />
      </td>
      <td className="px-3 py-2.5 text-center">
        <select value={row.gstPercent} onChange={e => onUpdate(row.id, 'gstPercent', Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-1 py-1.5 outline-none focus:border-indigo-400 bg-white">
          {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}%</option>)}
        </select>
      </td>
      <td className="px-3 py-2.5 text-right text-sm font-medium text-gray-700">{formatCurrency(amount)}</td>
      <td className="px-3 py-2.5 text-right text-sm text-gray-500">{formatCurrency(gstAmt)}</td>
      <td className="px-3 py-2.5 text-right text-sm font-bold text-indigo-700">{formatCurrency(total)}</td>
      <td className="px-3 py-2.5">
        <button onClick={() => onRemove(row.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><X size={14} /></button>
      </td>
    </tr>
  );
}

export default function Purchase() {
  const { items, parties, units, purchases, addPurchase, updatePurchase, addStockMovement, updateItemStock, currentUser } = useStore();
  const [modal, setModal] = useState<{ type: string; data?: unknown } | null>(null);
  const [search, setSearch] = useState('');
  const [filterParty, setFilterParty] = useState('ALL');

  // Purchase form state
  const [form, setForm] = useState({
    billNo: '', date: new Date().toISOString().split('T')[0],
    partyId: '', gstType: 'CGST_SGST' as GSTType, remarks: ''
  });
  const [rows, setRows] = useState<PurchaseItemForm[]>([{ id: generateId(), itemId: '', quantity: 0, rate: 0, gstPercent: 12 }]);

  const vendors = parties.filter(p => p.type === 'VENDOR' && p.status === 'ACTIVE');

  const addRow = () => setRows(r => [...r, { id: generateId(), itemId: '', quantity: 0, rate: 0, gstPercent: 12 }]);
  const updateRow = (id: string, field: keyof PurchaseItemForm, val: unknown) =>
    setRows(r => r.map(row => row.id === id ? { ...row, [field]: val } : row));
  const removeRow = (id: string) => setRows(r => r.filter(row => row.id !== id));

  const subtotal = rows.reduce((s, r) => s + r.quantity * r.rate, 0);
  const totalGST = rows.reduce((s, r) => s + r.quantity * r.rate * (r.gstPercent / 100), 0);
  const grandTotal = subtotal + totalGST;

  const nextBillNo = `BILL-${new Date().getFullYear()}-${String(purchases.length + 1).padStart(3, '0')}`;

  const resetForm = () => {
    setForm({ billNo: '', date: new Date().toISOString().split('T')[0], partyId: '', gstType: 'CGST_SGST', remarks: '' });
    setRows([{ id: generateId(), itemId: '', quantity: 0, rate: 0, gstPercent: 12 }]);
  };

  const savePurchase = () => {
    if (!form.partyId) { alert('Please select vendor'); return; }
    const validRows = rows.filter(r => r.itemId && r.quantity > 0 && r.rate > 0);
    if (validRows.length === 0) { alert('Add at least one item with quantity and rate'); return; }

    const purchaseItems: PurchaseItem[] = validRows.map(r => ({
      id: generateId(), itemId: r.itemId, quantity: r.quantity, rate: r.rate,
      gstPercent: r.gstPercent, amount: r.quantity * r.rate,
      gstAmount: r.quantity * r.rate * (r.gstPercent / 100),
      totalAmount: r.quantity * r.rate * (1 + r.gstPercent / 100)
    }));

    const purchase: Purchase = {
      id: generateId(), billNo: form.billNo || nextBillNo, date: form.date,
      partyId: form.partyId, gstType: form.gstType, items: purchaseItems,
      subtotal, totalGST, grandTotal, status: 'ACTIVE', remarks: form.remarks,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };

    addPurchase(purchase);

    // Update inventory
    validRows.forEach(r => {
      const item = items.find(i => i.id === r.itemId);
      if (item) {
        const newStock = item.currentStock + r.quantity;
        updateItemStock(r.itemId, newStock);
        addStockMovement({
          id: generateId(), itemId: r.itemId, type: 'INWARD', quantity: r.quantity,
          previousStock: item.currentStock, newStock, reason: 'Purchase',
          reference: purchase.billNo, createdBy: currentUser.name, createdAt: new Date().toISOString()
        });
      }
    });

    resetForm();
    setModal(null);
    alert('Purchase saved! GRN generated. Inventory updated.');
  };

  const filteredPurchases = purchases.filter(p => {
    const party = parties.find(x => x.id === p.partyId);
    const matchSearch = p.billNo.toLowerCase().includes(search.toLowerCase()) ||
      (party?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchParty = filterParty === 'ALL' || p.partyId === filterParty;
    return matchSearch && matchParty;
  });

  const viewPurchase = modal?.data as Purchase | undefined;
  const viewParty = viewPurchase ? parties.find(p => p.id === viewPurchase.partyId) : undefined;

  // Edit purchase — load into create modal
  const editPurchase = (p: Purchase) => {
    setForm({ billNo: p.billNo, date: p.date, partyId: p.partyId, gstType: p.gstType, remarks: p.remarks || '' });
    setRows(p.items.map(pi => ({ id: pi.id, itemId: pi.itemId, quantity: pi.quantity, rate: pi.rate, gstPercent: pi.gstPercent })));
    // Remove old purchase so bill number check passes
    updatePurchase(p.id, { status: 'CANCELLED' as Purchase['status'] });
    setModal({ type: 'create' });
  };

  // Delete purchase
  const deletePurchase = (p: Purchase) => {
    const party = parties.find(x => x.id === p.partyId);
    if (!confirm(`Delete Purchase Bill?\n\nBill No: ${p.billNo}\nVendor: ${party?.name || '—'}\nAmount: ${formatCurrency(p.grandTotal)}\n\nThis action cannot be undone.`)) return;
    updatePurchase(p.id, { status: 'CANCELLED' as Purchase['status'] });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Purchases', value: formatCurrency(purchases.reduce((s, p) => s + p.grandTotal, 0)), icon: '📦' },
          { label: 'This Month', value: formatCurrency(purchases.filter(p => p.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, p) => s + p.grandTotal, 0)), icon: '📅' },
          { label: 'Total Bills', value: purchases.length, icon: '🧾' },
          { label: 'Active Vendors', value: vendors.length, icon: '🏭' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by bill no or vendor..."
            className="flex-1 text-sm outline-none" />
        </div>
        <select value={filterParty} onChange={e => setFilterParty(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none">
          <option value="ALL">All Vendors</option>
          {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <button onClick={() => { resetForm(); setModal({ type: 'create' }); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm">
          <Plus size={16} /> New Purchase Bill
        </button>
      </div>

      {/* Purchase Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bill No.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vendor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">GST Type</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Subtotal</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">GST</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Grand Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPurchases.map(p => {
              const party = parties.find(x => x.id === p.partyId);
              return (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-bold text-indigo-700">{p.billNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDate(p.date)}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{party?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{party?.city}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{p.gstType}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">{formatCurrency(p.subtotal)}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500">{formatCurrency(p.totalGST)}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(p.grandTotal)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(p.status)}`}>{p.status}</span>
                  </td>
                   <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal({ type: 'view', data: p })} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600" title="View"><Eye size={14} /></button>
                      <button className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600" title="Print GRN"><FileText size={14} /></button>
                      {p.status === 'ACTIVE' && (
                        <>
                          <button onClick={() => editPurchase(p)} className="p-1.5 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600" title="Edit"><Edit2 size={14} /></button>
                          <button onClick={() => deletePurchase(p)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600" title="Delete"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredPurchases.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-40" />
            <p>No purchases found</p>
          </div>
        )}
      </div>

      {/* Create Purchase Modal */}
      <Modal isOpen={modal?.type === 'create'} onClose={() => setModal(null)} title="New Purchase Bill" size="2xl">
        <div className="space-y-5">
          {/* Header Fields */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bill No.</label>
              <input value={form.billNo || nextBillNo} onChange={e => setForm(f => ({ ...f, billNo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder={nextBillNo} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Vendor *</label>
              <select value={form.partyId} onChange={e => setForm(f => ({ ...f, partyId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-indigo-400">
                <option value="">Select vendor...</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name} — {v.city}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">GST Type</label>
              <div className="flex gap-2">
                {(['CGST_SGST', 'IGST', 'EXEMPT'] as GSTType[]).map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, gstType: t }))}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${form.gstType === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
              <input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder="Optional remarks..." />
            </div>
          </div>

          {/* Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-800">Purchase Items</label>
              <button onClick={addRow} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                <Plus size={14} /> Add Row
              </button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500 w-52">Item</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-500">SKU</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Unit</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Qty</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Rate (₹)</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-500">GST%</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Amount</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-500">GST Amt</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Total</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <PurchaseItemRow key={row.id} row={row} items={items} units={units} onUpdate={updateRow} onRemove={removeRow} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="bg-gray-50 rounded-xl p-4 w-72 space-y-2">
              <div className="flex justify-between text-sm text-gray-600"><span>Subtotal:</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Total GST:</span><span className="font-medium">{formatCurrency(totalGST)}</span></div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900"><span>Grand Total:</span><span className="text-indigo-700">{formatCurrency(grandTotal)}</span></div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={savePurchase} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2">
              <FileText size={15} /> Save & Generate GRN
            </button>
          </div>
        </div>
      </Modal>

      {/* View Purchase Modal */}
      <Modal isOpen={modal?.type === 'view'} onClose={() => setModal(null)} title="Purchase Bill Details" size="xl">
        {viewPurchase && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Bill No.', viewPurchase.billNo], ['Date', formatDate(viewPurchase.date)],
                ['Vendor', viewParty?.name || '—'], ['GST Type', viewPurchase.gstType],
              ].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{l}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{v}</p>
                </div>
              ))}
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Item</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">GST%</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">GST Amt</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {viewPurchase.items.map(pi => {
                    const item = items.find(i => i.id === pi.itemId);
                    return (
                      <tr key={pi.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{item?.name || '—'}</p>
                          <p className="text-xs text-gray-400">{item?.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">{pi.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(pi.rate)}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{pi.gstPercent}%</td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(pi.amount)}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(pi.gstAmount)}</td>
                        <td className="px-4 py-3 text-right font-bold text-indigo-700">{formatCurrency(pi.totalAmount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="bg-indigo-50 rounded-xl p-4 w-64 space-y-2">
                <div className="flex justify-between text-sm text-gray-600"><span>Subtotal:</span><span>{formatCurrency(viewPurchase.subtotal)}</span></div>
                <div className="flex justify-between text-sm text-gray-600"><span>Total GST:</span><span>{formatCurrency(viewPurchase.totalGST)}</span></div>
                <div className="border-t border-indigo-200 pt-2 flex justify-between font-bold text-indigo-900"><span>Grand Total:</span><span>{formatCurrency(viewPurchase.grandTotal)}</span></div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

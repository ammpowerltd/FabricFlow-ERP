import { useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/ui/Modal';
import { formatCurrency, generateId, formatDateTime } from '../utils/helpers';
import { Package, Search, AlertTriangle, ArrowDown, ArrowUp, RefreshCw, Sliders, History } from 'lucide-react';
import type { StockMovement } from '../types';

type Filter = 'ALL' | 'RAW_MATERIAL' | 'FINISHED_GOODS' | 'LOW_STOCK';
type SortOrder = 'DEFAULT' | 'LOW_HIGH' | 'HIGH_LOW';

export default function Inventory() {
  const { items, categories, units, stockMovements, addStockMovement, updateItemStock, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [sort, setSort] = useState<SortOrder>('DEFAULT');
  const [modal, setModal] = useState<{ type: string; itemId?: string } | null>(null);
  const [adjustForm, setAdjustForm] = useState({ qty: 0, reason: '', type: 'INWARD' as 'INWARD' | 'OUTWARD' | 'ADJUSTMENT' });

  const filteredItems = items
    .filter(i => {
      const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'ALL' || (filter === 'RAW_MATERIAL' && i.type === 'RAW_MATERIAL')
        || (filter === 'FINISHED_GOODS' && i.type === 'FINISHED_GOODS')
        || (filter === 'LOW_STOCK' && i.currentStock <= i.minimumStock);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sort === 'LOW_HIGH') return a.currentStock - b.currentStock;
      if (sort === 'HIGH_LOW') return b.currentStock - a.currentStock;
      return 0;
    });

  const selectedItem = items.find(i => i.id === modal?.itemId);
  const itemCategory = selectedItem ? categories.find(c => c.id === selectedItem.categoryId) : null;
  const itemUnit = selectedItem ? units.find(u => u.id === selectedItem.unitId) : null;

  const totalValue = items.reduce((sum, i) => sum + i.currentStock * (i.type === 'RAW_MATERIAL' ? i.purchaseRate : i.salesRate), 0);
  const lowStockCount = items.filter(i => i.currentStock <= i.minimumStock).length;
  const rawMaterialCount = items.filter(i => i.type === 'RAW_MATERIAL').length;
  const finishedGoodsCount = items.filter(i => i.type === 'FINISHED_GOODS').length;

  const handleAdjust = () => {
    if (!selectedItem || adjustForm.qty <= 0) return;
    const prev = selectedItem.currentStock;
    let newStock = prev;
    if (adjustForm.type === 'INWARD') newStock = prev + adjustForm.qty;
    else if (adjustForm.type === 'OUTWARD') newStock = Math.max(0, prev - adjustForm.qty);
    else newStock = adjustForm.qty;

    const sm: StockMovement = {
      id: generateId(), itemId: selectedItem.id, type: adjustForm.type,
      quantity: adjustForm.qty, previousStock: prev, newStock,
      reason: adjustForm.reason || 'Manual Adjustment', reference: `ADJ-${Date.now()}`,
      createdBy: currentUser.name, createdAt: new Date().toISOString()
    };
    addStockMovement(sm);
    updateItemStock(selectedItem.id, newStock);
    setModal(null);
    setAdjustForm({ qty: 0, reason: '', type: 'INWARD' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Inventory Value', value: formatCurrency(totalValue), icon: '💰', color: 'bg-indigo-50 border-indigo-200', textColor: 'text-indigo-700' },
          { label: 'Raw Materials', value: rawMaterialCount + ' Items', icon: '🧵', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
          { label: 'Finished Goods', value: finishedGoodsCount + ' Items', icon: '👔', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' },
          { label: 'Low Stock Alerts', value: lowStockCount + ' Items', icon: '⚠️', color: 'bg-red-50 border-red-200', textColor: 'text-red-700' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl p-4 border ${card.color}`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className={`text-xl font-bold ${card.textColor}`}>{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-60 px-3 py-2.5 bg-white border border-gray-200 rounded-xl">
          <Search size={16} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU..."
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'RAW_MATERIAL', 'FINISHED_GOODS', 'LOW_STOCK'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f === 'ALL' ? 'All' : f === 'RAW_MATERIAL' ? 'Raw' : f === 'FINISHED_GOODS' ? 'Finished' : '⚠️ Low Stock'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Sliders size={14} className="text-gray-400" />
          <select value={sort} onChange={e => setSort(e.target.value as SortOrder)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white outline-none">
            <option value="DEFAULT">Default Sort</option>
            <option value="LOW_HIGH">Stock: Low → High</option>
            <option value="HIGH_LOW">Stock: High → Low</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Stock Inventory ({filteredItems.length} items)</h3>
          <button onClick={() => setModal({ type: 'stockLedger' })} className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-700">
            <History size={14} /> Stock Ledger
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Min Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Current Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map(item => {
                const isLow = item.currentStock <= item.minimumStock;
                const cat = categories.find(c => c.id === item.categoryId);
                const unit = units.find(u => u.id === item.unitId);
                const stockPct = Math.min(100, (item.currentStock / Math.max(item.minimumStock * 2, 1)) * 100);
                const rate = item.type === 'RAW_MATERIAL' ? item.purchaseRate : item.salesRate;
                return (
                  <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${isLow ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isLow && <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />}
                        <div>
                          <p className="font-medium text-sm text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-400">{unit?.symbol || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{item.sku}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.type === 'RAW_MATERIAL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {item.type === 'RAW_MATERIAL' ? 'Raw' : 'FG'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{cat?.name || '—'}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{item.minimumStock}</td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <span className={`text-sm font-bold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{item.currentStock}</span>
                        <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1 ml-auto">
                          <div className={`h-1.5 rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${stockPct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-700">{formatCurrency(item.currentStock * rate)}</td>
                    <td className="px-4 py-3">
                      {isLow ? (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">Low Stock</span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">In Stock</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setModal({ type: 'adjust', itemId: item.id }); setAdjustForm({ qty: 0, reason: '', type: 'INWARD' }); }}
                          className="px-2 py-1.5 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium flex items-center gap-1 transition-colors">
                          <RefreshCw size={12} /> Adjust
                        </button>
                        <button onClick={() => setModal({ type: 'ledger', itemId: item.id })}
                          className="px-2 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-1 transition-colors">
                          <History size={12} /> Ledger
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-40" />
              <p>No items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Stock Adjust Modal */}
      <Modal isOpen={modal?.type === 'adjust'} onClose={() => setModal(null)} title="Stock Adjustment" size="md">
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-indigo-900">{selectedItem.name}</p>
                  <p className="text-xs text-indigo-600">{selectedItem.sku} · {itemCategory?.name} · {itemUnit?.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-700">{selectedItem.currentStock}</p>
                  <p className="text-xs text-indigo-500">Current Stock</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-indigo-600">
                <AlertTriangle size={12} />
                <span>Minimum Stock: {selectedItem.minimumStock}</span>
                {selectedItem.currentStock <= selectedItem.minimumStock && <span className="text-red-600 font-semibold">⚠️ LOW STOCK</span>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'INWARD', label: '📥 Inward', color: 'border-green-400 bg-green-50 text-green-700' },
                  { val: 'OUTWARD', label: '📤 Outward', color: 'border-red-400 bg-red-50 text-red-700' },
                  { val: 'ADJUSTMENT', label: '⚖️ Set Stock', color: 'border-blue-400 bg-blue-50 text-blue-700' },
                ].map(t => (
                  <button key={t.val} type="button" onClick={() => setAdjustForm(f => ({ ...f, type: t.val as typeof adjustForm.type }))}
                    className={`p-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${adjustForm.type === t.val ? t.color : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {adjustForm.type === 'ADJUSTMENT' ? 'Set Stock To' : 'Quantity'}
              </label>
              <input type="number" min={0} value={adjustForm.qty || ''}
                onChange={e => setAdjustForm(f => ({ ...f, qty: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              {adjustForm.qty > 0 && adjustForm.type !== 'ADJUSTMENT' && (
                <p className="text-xs text-gray-500 mt-1">
                  New stock will be: {adjustForm.type === 'INWARD' ? selectedItem.currentStock + adjustForm.qty : Math.max(0, selectedItem.currentStock - adjustForm.qty)} {itemUnit?.symbol}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <select value={adjustForm.reason} onChange={e => setAdjustForm(f => ({ ...f, reason: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-indigo-400">
                <option value="">Select reason</option>
                <option value="Purchase Receipt">Purchase Receipt</option>
                <option value="Sales Dispatch">Sales Dispatch</option>
                <option value="Job Work Issue">Job Work Issue</option>
                <option value="Material In">Material In</option>
                <option value="Damage Entry">Damage Entry</option>
                <option value="Stock Correction">Stock Correction</option>
                <option value="Physical Audit">Physical Audit</option>
                <option value="Warehouse Transfer">Warehouse Transfer</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAdjust} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm">
                Apply Adjustment
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Stock Ledger Modal */}
      <Modal isOpen={modal?.type === 'ledger'} onClose={() => setModal(null)} title={`Stock Ledger - ${selectedItem?.name || ''}`} size="xl">
        <div className="space-y-3">
          {stockMovements.filter(sm => sm.itemId === modal?.itemId).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <History size={32} className="mx-auto mb-2 opacity-40" />
              <p>No stock movements recorded</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 rounded-xl">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Date</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Type</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Qty</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Prev Stock</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">New Stock</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Reason</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Reference</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stockMovements.filter(sm => sm.itemId === modal?.itemId).map(sm => (
                  <tr key={sm.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-xs text-gray-600">{formatDateTime(sm.createdAt)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`flex items-center gap-1 text-xs font-semibold ${sm.type === 'INWARD' ? 'text-green-600' : sm.type === 'OUTWARD' ? 'text-red-600' : 'text-blue-600'}`}>
                        {sm.type === 'INWARD' ? <ArrowDown size={12} /> : sm.type === 'OUTWARD' ? <ArrowUp size={12} /> : <RefreshCw size={12} />}
                        {sm.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold text-gray-900">{sm.quantity}</td>
                    <td className="px-3 py-2.5 text-right text-sm text-gray-600">{sm.previousStock}</td>
                    <td className="px-3 py-2.5 text-right text-sm font-semibold text-indigo-700">{sm.newStock}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{sm.reason}</td>
                    <td className="px-3 py-2.5 text-xs font-mono text-gray-500">{sm.reference || '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{sm.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>

      {/* Global Stock Ledger Modal */}
      <Modal isOpen={modal?.type === 'stockLedger'} onClose={() => setModal(null)} title="Stock Ledger - All Items" size="2xl">
        <div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Date & Time</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Item</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Type</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Qty</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">Prev</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500">New</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Reason</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stockMovements.map(sm => {
                const item = items.find(i => i.id === sm.itemId);
                return (
                  <tr key={sm.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-xs text-gray-500">{formatDateTime(sm.createdAt)}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-gray-900">{item?.name || '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs font-semibold ${sm.type === 'INWARD' ? 'text-green-600' : sm.type === 'OUTWARD' ? 'text-red-600' : 'text-blue-600'}`}>
                        {sm.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold">{sm.quantity}</td>
                    <td className="px-3 py-2.5 text-right text-xs text-gray-500">{sm.previousStock}</td>
                    <td className="px-3 py-2.5 text-right text-xs font-semibold text-indigo-600">{sm.newStock}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{sm.reason}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{sm.createdBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}

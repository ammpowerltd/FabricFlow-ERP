import { useState } from 'react';
import { items, warehouses } from '../data/mockData';
import {
  Package, ArrowDown, ArrowUp, RotateCcw, AlertTriangle, Download,
  Plus, Search, Filter, Building, Box, TrendingUp, RefreshCw
} from 'lucide-react';

const stockMovements = [
  { id: 'SM001', date: '2024-12-24 10:30', type: 'IN', item: 'Cotton White Fabric', ref: 'PUR-INV-002', qty: 200, warehouse: 'MUM-01', user: 'admin' },
  { id: 'SM002', date: '2024-12-24 09:15', type: 'OUT', item: 'Classic Polo White S', ref: 'B2C-SHP-1001', qty: 2, warehouse: 'MUM-01', user: 'system' },
  { id: 'SM003', date: '2024-23 16:45', type: 'OUT', item: 'Classic Polo White M', ref: 'JW-101', qty: 50, warehouse: 'MUM-01', user: 'admin' },
  { id: 'SM004', date: '2024-12-23 14:20', type: 'TRANSFER', item: 'Classic Polo Black M', ref: 'WH-TFR-001', qty: 30, warehouse: 'MUM-01 → DEL-01', user: 'admin' },
  { id: 'SM005', date: '2024-12-22 11:00', type: 'ADJUST', item: 'Cotton Grey Fabric', ref: 'ADJ-001', qty: -5, warehouse: 'MUM-01', user: 'admin' },
  { id: 'SM006', date: '2024-12-22 09:30', type: 'IN', item: 'Classic Polo Black M', ref: 'JW-100', qty: 60, warehouse: 'MUM-01', user: 'system' },
];

const lowStockItems = items.filter(item => item.currentStock < item.reorderLevel);

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  const tabs = [
    { id: 'overview', label: 'Stock Overview', icon: Box },
    { id: 'movements', label: 'Stock Movements', icon: TrendingUp },
    { id: 'lowStock', label: 'Low Stock Alerts', icon: AlertTriangle, count: lowStockItems.length },
    { id: 'transfers', label: 'Warehouse Transfer', icon: RefreshCw },
    { id: 'adjustments', label: 'Adjustments', icon: RotateCcw },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track stock levels, movements, and warehouse operations</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* Warehouse Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouses.map((wh) => (
          <div key={wh.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 card-hover cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{wh.code}</p>
                <p className="font-medium text-gray-800">{wh.name}</p>
              </div>
              <Building className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Raw Material</p>
                <p className="font-medium">₹85,000</p>
              </div>
              <div>
                <p className="text-gray-500">Finished Goods</p>
                <p className="font-medium">₹245,000</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count && tab.count > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items by name, SKU, code..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map(wh => (
              <option key={wh.id} value={wh.id}>{wh.name}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>

        {/* Stock Overview */}
        {activeTab === 'overview' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 bg-gray-50">
                  <th className="px-4 py-3 font-medium">Item Code</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 font-medium text-right">MUM-01</th>
                  <th className="px-4 py-3 font-medium text-right">DEL-01</th>
                  <th className="px-4 py-3 font-medium text-right">BLR-01</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-right">Reorder</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const isLow = item.currentStock < item.reorderLevel;
                  const isOut = item.currentStock === 0;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm text-indigo-600">{item.itemCode}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.type === 'Finished Good' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.unit}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {item.type === 'Finished Good' ? Math.floor(item.currentStock * 0.5) : item.currentStock}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {item.type === 'Finished Good' ? Math.floor(item.currentStock * 0.3) : 0}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {item.type === 'Finished Good' ? Math.floor(item.currentStock * 0.2) : 0}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{item.currentStock}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{item.reorderLevel}</td>
                      <td className="px-4 py-3 text-center">
                        {isOut ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Stock Movements */}
        {activeTab === 'movements' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 bg-gray-50">
                  <th className="px-4 py-3 font-medium">Date & Time</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium text-right">Qty</th>
                  <th className="px-4 py-3 font-medium">Warehouse</th>
                  <th className="px-4 py-3 font-medium">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stockMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{movement.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                        movement.type === 'IN' ? 'bg-green-100 text-green-700' :
                        movement.type === 'OUT' ? 'bg-red-100 text-red-700' :
                        movement.type === 'TRANSFER' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {movement.type === 'IN' && <ArrowDown className="w-3 h-3" />}
                        {movement.type === 'OUT' && <ArrowUp className="w-3 h-3" />}
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{movement.item}</td>
                    <td className="px-4 py-3 font-mono text-sm text-indigo-600">{movement.ref}</td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      movement.qty > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.qty > 0 ? '+' : ''}{movement.qty}
                    </td>
                    <td className="px-4 py-3 text-sm">{movement.warehouse}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{movement.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Low Stock Alerts */}
        {activeTab === 'lowStock' && (
          <div className="p-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Low Stock Alert</p>
                  <p className="text-sm text-amber-600">{lowStockItems.length} items are below their reorder level. Consider placing purchase orders.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      item.currentStock === 0 ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      <Package className={`w-6 h-6 ${
                        item.currentStock === 0 ? 'text-red-600' : 'text-amber-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.sku} • {item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${item.currentStock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {item.currentStock} {item.unit}
                    </p>
                    <p className="text-sm text-gray-500">Reorder Level: {item.reorderLevel}</p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    Create PO
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transfers & Adjustments placeholders */}
        {(activeTab === 'transfers' || activeTab === 'adjustments') && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'transfers' ? <RefreshCw className="w-8 h-8 text-gray-400" /> : <RotateCcw className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {activeTab === 'transfers' ? 'Warehouse Transfers' : 'Stock Adjustments'}
            </h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'transfers'
                ? 'Transfer stock between warehouses with proper documentation and approval.'
                : 'Adjust physical stock counts with approval workflow and audit trail.'}
            </p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              {activeTab === 'transfers' ? 'New Transfer' : 'New Adjustment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

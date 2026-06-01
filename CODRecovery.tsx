import { useState } from 'react';
import { codSettlements, orders } from '../data/mockData';
import {
  CreditCard, Search, Filter, Download, Upload, FileText, Eye,
  CheckCircle, Clock, AlertTriangle, TrendingUp, Package, RefreshCw
} from 'lucide-react';

const codOrders = orders.filter(o => o.paymentType === 'COD');
const totalCOD = codOrders.reduce((sum, o) => sum + o.codAmount, 0);
const collectedCOD = codOrders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.codAmount, 0);

export default function CODRecovery() {
  const [activeTab, setActiveTab] = useState('ledger');

  const tabs = [
    { id: 'ledger', label: 'COD Ledger', icon: CreditCard },
    { id: 'settlements', label: 'Courier Settlement', icon: Package },
    { id: 'bulk', label: 'Bulk Upload', icon: Upload },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">COD Recovery</h1>
          <p className="text-gray-500 text-sm mt-1">Track COD collections, settlements, and reconciliation</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <RefreshCw className="w-4 h-4" />
            Sync
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
            <Upload className="w-4 h-4" />
            New Settlement
          </button>
        </div>
      </div>

      {/* COD Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total COD Amount</p>
              <p className="text-2xl font-bold mt-1">₹{totalCOD.toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm mt-3 opacity-80">{codOrders.length} COD orders</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Collected</p>
              <p className="text-2xl font-bold text-green-600">₹{collectedCOD.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${(collectedCOD / totalCOD) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{((collectedCOD / totalCOD) * 100).toFixed(1)}% collected</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-amber-600">₹{(totalCOD - collectedCOD).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">{codOrders.filter(o => o.status !== 'Delivered').length} orders pending</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue (&gt;7 days)</p>
              <p className="text-2xl font-bold text-red-600">₹15,000</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-red-500 mt-3 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Requires attention
          </p>
        </div>
      </div>

      {/* Aggregator Settlement Summary */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Aggregator Settlement Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Express Logistics', pending: 85000, completed: 195000, color: 'blue' },
            { name: 'Delhivery', pending: 25000, completed: 65000, color: 'green' },
            { name: 'Shiprocket', pending: 15000, completed: 40000, color: 'purple' },
          ].map((agg) => (
            <div key={agg.name} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-800">{agg.name}</p>
                <button className="text-sm text-indigo-600 hover:underline">Settle</button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Completed</p>
                  <p className="font-medium text-green-600">₹{(agg.completed / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-gray-500">Pending</p>
                  <p className="font-medium text-amber-600">₹{(agg.pending / 1000).toFixed(1)}K</p>
                </div>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(agg.completed / (agg.completed + agg.pending)) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
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
              </button>
            ))}
          </div>
        </div>

        {/* COD Ledger */}
        {activeTab === 'ledger' && (
          <div className="overflow-x-auto">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Order No, AWB..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 bg-gray-50">
                  <th className="px-4 py-3 font-medium">Order No</th>
                  <th className="px-4 py-3 font-medium">AWB</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium text-right">COD Amount</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {codOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-indigo-600">{order.orderNo}</td>
                    <td className="px-4 py-3 font-mono text-sm">{order.awbNo}</td>
                    <td className="px-4 py-3 text-sm font-medium">{order.customerName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        order.platform === 'Shopify' ? 'bg-green-100 text-green-700' :
                        order.platform === 'Amazon' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">₹{order.codAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'RTO' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status === 'Delivered' ? 'Collected' : order.status === 'RTO' ? 'RTO' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Settlements */}
        {activeTab === 'settlements' && (
          <div className="p-6 space-y-4">
            {codSettlements.map((settlement) => (
              <div key={settlement.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">{settlement.batchNo}</h4>
                    <p className="text-sm text-gray-500">{settlement.courierName} • {settlement.settlementDate}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    settlement.status === 'Settled' ? 'bg-green-100 text-green-700' :
                    settlement.status === 'Partially Settled' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {settlement.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">COD Amount</p>
                    <p className="font-medium">₹{settlement.totalCodAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Received</p>
                    <p className="font-medium text-green-600">₹{settlement.totalReceived.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Charges</p>
                    <p className="font-medium text-red-600">₹{settlement.totalCharges.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Adjustments</p>
                    <p className="font-medium">₹{settlement.totalAdjustments.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Net Received</p>
                    <p className="font-bold text-indigo-600">₹{settlement.netReceived.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bulk Upload */}
        {activeTab === 'bulk' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Bulk COD Settlement Upload</h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              Upload multiple COD settlements using Excel template. Includes validation, error reports, and rollback support.
            </p>
            <div className="flex justify-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Download Template
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                <Upload className="w-4 h-4" />
                Upload Excel
              </button>
            </div>
          </div>
        )}

        {/* Reports */}
        {activeTab === 'reports' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">COD Recovery Reports</h3>
            <p className="text-gray-500 mb-4">
              Generate detailed reports on COD collections, pending amounts, and courier settlements.
            </p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              Generate Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

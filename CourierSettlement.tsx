import { useState } from 'react';
import { orders } from '../data/mockData';
import { Search, Filter, Upload, FileText, CreditCard, TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';

const aggregators = [
  { name: 'Shiprocket', totalCOD: 280000, received: 195000, pending: 85000, charges: 14000 },
  { name: 'NimbusPost', totalCOD: 145000, received: 120000, pending: 25000, charges: 7250 },
  { name: 'Delhivery', totalCOD: 90000, received: 65000, pending: 25000, charges: 4500 },
  { name: 'Xpressbees', totalCOD: 55000, received: 40000, pending: 15000, charges: 2750 },
  { name: 'Ecom Express', totalCOD: 35000, received: 25000, pending: 10000, charges: 1750 },
];

export default function CourierSettlement() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'settlements', label: 'Settlements', icon: CreditCard },
    { id: 'reconciliation', label: 'Reconciliation', icon: FileText },
  ];

  const codOrders = orders.filter(o => o.paymentType === 'COD');
  const totalCOD = codOrders.reduce((sum, o) => sum + o.codAmount, 0);
  const totalPending = aggregators.reduce((sum, a) => sum + a.pending, 0);
  const totalReceived = aggregators.reduce((sum, a) => sum + a.received, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Courier Settlement</h1>
          <p className="text-gray-500 text-sm mt-1">Track and reconcile COD settlements from courier aggregators</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <RefreshCw className="w-4 h-4" />
            Sync
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
            <Upload className="w-4 h-4" />
            Upload Settlement
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total COD Due</p>
              <p className="text-2xl font-bold mt-1">₹{(totalCOD / 1000).toFixed(1)}K</p>
            </div>
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Received</p>
              <p className="text-2xl font-bold text-green-600">₹{(totalReceived / 1000).toFixed(1)}K</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pending</p>
              <p className="text-2xl font-bold text-amber-600">₹{(totalPending / 1000).toFixed(1)}K</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Charges</p>
              <p className="text-2xl font-bold text-red-600">₹{(aggregators.reduce((s, a) => s + a.charges, 0) / 1000).toFixed(1)}K</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
          </div>
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

        {/* Aggregator Settlement Table */}
        {(activeTab === 'dashboard' || activeTab === 'settlements') && (
          <div className="overflow-x-auto">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Search aggregator..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
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
                  <th className="px-4 py-3 font-medium">Aggregator</th>
                  <th className="px-4 py-3 font-medium text-right">Total COD</th>
                  <th className="px-4 py-3 font-medium text-right">Received</th>
                  <th className="px-4 py-3 font-medium text-right">Pending</th>
                  <th className="px-4 py-3 font-medium text-right">Charges</th>
                  <th className="px-4 py-3 font-medium text-right">Net Receivable</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aggregators.map((agg) => (
                  <tr key={agg.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{agg.name}</td>
                    <td className="px-4 py-3 text-right font-medium">₹{(agg.totalCOD / 1000).toFixed(1)}K</td>
                    <td className="px-4 py-3 text-right text-green-600">₹{(agg.received / 1000).toFixed(1)}K</td>
                    <td className="px-4 py-3 text-right text-amber-600 font-medium">₹{(agg.pending / 1000).toFixed(1)}K</td>
                    <td className="px-4 py-3 text-right text-red-600">₹{(agg.charges / 1000).toFixed(1)}K</td>
                    <td className="px-4 py-3 text-right font-bold">₹{((agg.totalCOD - agg.charges - agg.pending) / 1000).toFixed(1)}K</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        agg.pending === 0 ? 'bg-green-100 text-green-700' :
                        agg.pending < agg.totalCOD * 0.3 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {agg.pending === 0 ? 'Settled' : agg.pending < agg.totalCOD * 0.3 ? 'Partially Settled' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-sm text-indigo-600 hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">₹{(aggregators.reduce((s, a) => s + a.totalCOD, 0) / 1000).toFixed(1)}K</td>
                  <td className="px-4 py-3 text-right text-green-600">₹{(aggregators.reduce((s, a) => s + a.received, 0) / 1000).toFixed(1)}K</td>
                  <td className="px-4 py-3 text-right text-amber-600">₹{(aggregators.reduce((s, a) => s + a.pending, 0) / 1000).toFixed(1)}K</td>
                  <td className="px-4 py-3 text-right text-red-600">₹{(aggregators.reduce((s, a) => s + a.charges, 0) / 1000).toFixed(1)}K</td>
                  <td className="px-4 py-3 text-right">₹{(aggregators.reduce((s, a) => s + a.totalCOD - a.charges - a.pending, 0) / 1000).toFixed(1)}K</td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Reconciliation */}
        {activeTab === 'reconciliation' && (
          <div className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">COD Reconciliation Formula</h3>
            <div className="bg-indigo-50 p-4 rounded-xl mb-6">
              <p className="text-sm text-indigo-800 font-medium">
                Net Settlement = COD Amount - Courier Charges - RTO Charges - Weight Dispute - Other Adjustments
              </p>
            </div>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-800 mb-2">Reconciliation Report</h4>
              <p className="text-gray-500 mb-4">Generate detailed reconciliation reports for each aggregator.</p>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Generate Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

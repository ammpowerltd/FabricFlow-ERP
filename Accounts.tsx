import { useState } from 'react';
import { ledgers, vouchers } from '../data/mockData';
import {
  Plus, Search, Filter, Download, FileText, Calculator, Book,
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

export default function Accounts() {
  const [activeTab, setActiveTab] = useState('vouchers');

  const tabs = [
    { id: 'vouchers', label: 'Vouchers', icon: FileText },
    { id: 'ledger', label: 'Ledgers', icon: Book },
    { id: 'trial', label: 'Trial Balance', icon: Calculator },
    { id: 'pnl', label: 'P&L', icon: TrendingUp },
    { id: 'balance', label: 'Balance Sheet', icon: DollarSign },
    { id: 'cashbook', label: 'Cash/Bank Book', icon: ArrowUpRight },
    { id: 'daybook', label: 'Day Book', icon: ArrowDownRight },
  ];

  const debitTotal = ledgers.filter(l => l.type === 'Debit').reduce((sum, l) => sum + l.currentBalance, 0);
  const creditTotal = ledgers.filter(l => l.type === 'Credit').reduce((sum, l) => sum + l.currentBalance, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">Double-entry accounting, ledgers, and financial reports</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
            <Plus className="w-4 h-4" />
            New Voucher
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Debits</p>
              <p className="text-2xl font-bold mt-1">₹{(debitTotal / 1000).toFixed(1)}K</p>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Credits</p>
              <p className="text-2xl font-bold mt-1">₹{(creditTotal / 1000).toFixed(1)}K</p>
            </div>
            <TrendingDown className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cash Balance</p>
              <p className="text-2xl font-bold text-gray-800">₹1.85L</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bank Balance</p>
              <p className="text-2xl font-bold text-gray-800">₹8.41L</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
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

        {/* Vouchers */}
        {activeTab === 'vouchers' && (
          <div className="overflow-x-auto">
            <div className="p-4 border-b border-gray-100 flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vouchers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 bg-gray-50">
                  <th className="px-4 py-3 font-medium">Voucher No</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Particulars</th>
                  <th className="px-4 py-3 font-medium">Debit Ledger</th>
                  <th className="px-4 py-3 font-medium">Credit Ledger</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-indigo-600">{v.voucherNo}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        v.voucherType === 'Payment' ? 'bg-red-100 text-red-700' :
                        v.voucherType === 'Receipt' ? 'bg-green-100 text-green-700' :
                        v.voucherType === 'Journal' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {v.voucherType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{v.date}</td>
                    <td className="px-4 py-3 text-sm">{v.particulars}</td>
                    <td className="px-4 py-3 text-sm">{v.debitLedger}</td>
                    <td className="px-4 py-3 text-sm">{v.creditLedger}</td>
                    <td className="px-4 py-3 text-right font-medium">₹{v.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-sm text-indigo-600 hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Ledger */}
        {activeTab === 'ledger' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 bg-gray-50">
                  <th className="px-4 py-3 font-medium">Ledger Name</th>
                  <th className="px-4 py-3 font-medium">Group</th>
                  <th className="px-4 py-3 font-medium text-right">Opening Balance</th>
                  <th className="px-4 py-3 font-medium text-right">Current Balance</th>
                  <th className="px-4 py-3 font-medium text-center">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ledgers.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{l.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{l.group}</td>
                    <td className="px-4 py-3 text-right">₹{l.openingBalance.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-medium ${l.type === 'Debit' ? 'text-blue-600' : 'text-green-600'}`}>
                      ₹{l.currentBalance.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        l.type === 'Debit' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {l.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={2} className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">₹{(debitTotal + creditTotal).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">₹{(debitTotal + creditTotal).toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Trial Balance */}
        {activeTab === 'trial' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Trial Balance</h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium">Particulars</th>
                    <th className="text-right py-2 font-medium">Debit (₹)</th>
                    <th className="text-right py-2 font-medium">Credit (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgers.map((l) => (
                    <tr key={l.id} className="border-b border-gray-100">
                      <td className="py-2">{l.name}</td>
                      <td className="py-2 text-right">{l.type === 'Debit' ? l.currentBalance.toLocaleString() : ''}</td>
                      <td className="py-2 text-right">{l.type === 'Credit' ? l.currentBalance.toLocaleString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="font-semibold">
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-2">Total</td>
                    <td className="py-2 text-right">₹{debitTotal.toLocaleString()}</td>
                    <td className="py-2 text-right">₹{creditTotal.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
              <div className="mt-4 flex items-center justify-between bg-green-50 p-3 rounded-lg">
                <span className="font-medium text-green-700">Difference</span>
                <span className="font-bold text-green-700">₹{Math.abs(debitTotal - creditTotal).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* P&L, Balance Sheet, etc. placeholders */}
        {(activeTab === 'pnl' || activeTab === 'balance' || activeTab === 'cashbook' || activeTab === 'daybook') && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-gray-500 mb-4">
              Generate and view {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} reports with date range filters.
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

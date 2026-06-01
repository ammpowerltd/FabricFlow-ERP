import { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, generateId } from '../utils/helpers';
import Modal from '../components/ui/Modal';
import { Plus, TrendingUp, TrendingDown, CreditCard, Receipt } from 'lucide-react';
import type { Expense } from '../types';

type Tab = 'overview' | 'expenses' | 'gst' | 'pl';

export default function Accounts() {
  const { purchases, sales, expenses, parties, addExpense } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [modal, setModal] = useState(false);
  const [expForm, setExpForm] = useState({ date: new Date().toISOString().split('T')[0], category: '', description: '', amount: 0, partyId: '' });

  const totalRevenue = sales.reduce((s, x) => s + x.grandTotal, 0);
  const totalPurchaseCost = purchases.reduce((s, x) => s + x.subtotal, 0);
  const totalExpenses = expenses.reduce((s, x) => s + x.amount, 0);
  const grossProfit = totalRevenue - totalPurchaseCost;
  const netProfit = grossProfit - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;

  const totalGSTCollected = sales.reduce((s, x) => s + x.totalGST, 0);
  const totalGSTPaid = purchases.reduce((s, x) => s + x.totalGST, 0);
  const gstPayable = totalGSTCollected - totalGSTPaid;

  const expenseCategories = [...new Set(expenses.map(e => e.category))];

  const saveExpense = () => {
    if (!expForm.category || expForm.amount <= 0) { alert('Fill category and amount'); return; }
    const exp: Expense = {
      id: generateId(), date: expForm.date, category: expForm.category,
      description: expForm.description, amount: expForm.amount,
      partyId: expForm.partyId || undefined, createdAt: new Date().toISOString()
    };
    addExpense(exp);
    setExpForm({ date: new Date().toISOString().split('T')[0], category: '', description: '', amount: 0, partyId: '' });
    setModal(false);
  };

  // Party ledger
  const partyLedger = parties.filter(p => ['VENDOR', 'CUSTOMER'].includes(p.type)).map(p => {
    const totalPurchased = purchases.filter(x => x.partyId === p.id).reduce((s, x) => s + x.grandTotal, 0);
    const totalSold = sales.filter(x => x.partyId === p.id).reduce((s, x) => s + x.grandTotal, 0);
    return { ...p, totalPurchased, totalSold, balance: totalSold - totalPurchased };
  });

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
          <TrendingUp size={22} className="mb-3 opacity-80" />
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          <p className="text-green-100 text-sm mt-1">Total Revenue</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
          <CreditCard size={22} className="mb-3 opacity-80" />
          <p className="text-2xl font-bold">{formatCurrency(totalPurchaseCost + totalExpenses)}</p>
          <p className="text-blue-100 text-sm mt-1">Total Expenses</p>
        </div>
        <div className={`rounded-2xl p-5 text-white ${netProfit >= 0 ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
          {netProfit >= 0 ? <TrendingUp size={22} className="mb-3 opacity-80" /> : <TrendingDown size={22} className="mb-3 opacity-80" />}
          <p className="text-2xl font-bold">{formatCurrency(Math.abs(netProfit))}</p>
          <p className="text-sm mt-1 opacity-80">Net {netProfit >= 0 ? 'Profit' : 'Loss'}</p>
        </div>
        <div className={`rounded-2xl p-5 text-white ${gstPayable >= 0 ? 'bg-gradient-to-br from-orange-500 to-yellow-600' : 'bg-gradient-to-br from-cyan-500 to-teal-600'}`}>
          <Receipt size={22} className="mb-3 opacity-80" />
          <p className="text-2xl font-bold">{formatCurrency(Math.abs(gstPayable))}</p>
          <p className="text-sm mt-1 opacity-80">GST {gstPayable >= 0 ? 'Payable' : 'Refundable'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'overview' as Tab, label: '📊 Overview' },
          { id: 'expenses' as Tab, label: '💸 Expenses' },
          { id: 'gst' as Tab, label: '🏛️ GST Report' },
          { id: 'pl' as Tab, label: '📈 P&L Statement' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">Party Outstanding Ledger</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Party</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Purchases</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Sales</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {partyLedger.filter(p => p.totalPurchased > 0 || p.totalSold > 0).map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.city}, {p.state}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.type === 'VENDOR' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-blue-700 font-medium">{p.totalPurchased > 0 ? formatCurrency(p.totalPurchased) : '—'}</td>
                    <td className="px-4 py-3 text-right text-sm text-green-700 font-medium">{p.totalSold > 0 ? formatCurrency(p.totalSold) : '—'}</td>
                    <td className={`px-4 py-3 text-right text-sm font-bold ${p.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(p.balance))} {p.balance >= 0 ? '(CR)' : '(DR)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-3 gap-3">
              {expenseCategories.map(cat => {
                const total = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
                return (
                  <div key={cat} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500">{cat}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(total)}</p>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm ml-4">
              <Plus size={16} /> Add Expense
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(e.date)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">{e.category}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{e.description}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{formatCurrency(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GST Tab */}
      {activeTab === 'gst' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <h4 className="font-bold text-green-800 mb-4">GST Collected (Output)</h4>
              {[5, 12, 18, 28].map(rate => {
                const amt = sales.reduce((s, x) => {
                  const gst = x.items.filter(i => i.gstPercent === rate).reduce((ss, ii) => ss + ii.gstAmount, 0);
                  return s + gst;
                }, 0);
                return amt > 0 ? (
                  <div key={rate} className="flex justify-between items-center mb-2">
                    <span className="text-sm text-green-700">{rate}% GST</span>
                    <span className="font-bold text-green-800">{formatCurrency(amt)}</span>
                  </div>
                ) : null;
              })}
              <div className="border-t border-green-300 pt-3 flex justify-between font-bold text-green-900">
                <span>Total Output GST</span>
                <span>{formatCurrency(totalGSTCollected)}</span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <h4 className="font-bold text-blue-800 mb-4">GST Paid (Input)</h4>
              {[5, 12, 18, 28].map(rate => {
                const amt = purchases.reduce((s, x) => {
                  const gst = x.items.filter(i => i.gstPercent === rate).reduce((ss, ii) => ss + ii.gstAmount, 0);
                  return s + gst;
                }, 0);
                return amt > 0 ? (
                  <div key={rate} className="flex justify-between items-center mb-2">
                    <span className="text-sm text-blue-700">{rate}% GST</span>
                    <span className="font-bold text-blue-800">{formatCurrency(amt)}</span>
                  </div>
                ) : null;
              })}
              <div className="border-t border-blue-300 pt-3 flex justify-between font-bold text-blue-900">
                <span>Total Input GST</span>
                <span>{formatCurrency(totalGSTPaid)}</span>
              </div>
            </div>
            <div className={`border rounded-2xl p-5 ${gstPayable >= 0 ? 'bg-orange-50 border-orange-200' : 'bg-teal-50 border-teal-200'}`}>
              <h4 className={`font-bold mb-4 ${gstPayable >= 0 ? 'text-orange-800' : 'text-teal-800'}`}>
                Net GST {gstPayable >= 0 ? 'Payable' : 'Refundable'}
              </h4>
              <div className={`text-3xl font-bold ${gstPayable >= 0 ? 'text-orange-700' : 'text-teal-700'}`}>
                {formatCurrency(Math.abs(gstPayable))}
              </div>
              <p className={`text-sm mt-2 ${gstPayable >= 0 ? 'text-orange-600' : 'text-teal-600'}`}>
                {gstPayable >= 0 ? 'Amount to be paid to government' : 'Input credit available'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* P&L Tab */}
      {activeTab === 'pl' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Profit & Loss Statement</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-3">Revenue</h4>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gross Sales</span>
                  <span className="font-medium">{formatCurrency(sales.reduce((s, x) => s + x.subtotal, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST Collected</span>
                  <span className="font-medium">{formatCurrency(totalGSTCollected)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                  <span>Total Revenue</span>
                  <span className="text-green-700">{formatCurrency(totalRevenue)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-3">Cost of Goods</h4>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Raw Material Cost</span>
                  <span className="font-medium">{formatCurrency(totalPurchaseCost)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                  <span>Gross Profit</span>
                  <span className={grossProfit >= 0 ? 'text-green-700' : 'text-red-700'}>{formatCurrency(grossProfit)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-orange-700 uppercase tracking-wide mb-3">Operating Expenses</h4>
              <div className="space-y-2 ml-4">
                {expenseCategories.map(cat => {
                  const total = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
                  return (
                    <div key={cat} className="flex justify-between text-sm">
                      <span className="text-gray-600">{cat}</span>
                      <span className="font-medium">{formatCurrency(total)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                  <span>Total Expenses</span>
                  <span className="text-red-600">{formatCurrency(totalExpenses)}</span>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 ${netProfit >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                    Net {netProfit >= 0 ? 'Profit' : 'Loss'}
                  </p>
                  <p className={`text-sm mt-0.5 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Profit Margin: {profitMargin.toFixed(1)}%
                  </p>
                </div>
                <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(Math.abs(netProfit))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Expense" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={expForm.date} onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Amount (₹) *</label>
              <input type="number" value={expForm.amount || ''} onChange={e => setExpForm(f => ({ ...f, amount: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
              <select value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-indigo-400">
                <option value="">Select category</option>
                {['Rent', 'Electricity', 'Transport', 'Salary', 'Marketing', 'Maintenance', 'Courier', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <input value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder="Optional description..." />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={saveExpense} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

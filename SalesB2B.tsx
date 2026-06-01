import { useState } from 'react';
import { salesInvoices, parties, items } from '../data/mockData';
import {
  Plus, Search, Filter, Download, Upload, FileText, Eye,
  Trash2, Printer, Send, ArrowLeft
} from 'lucide-react';

const tabs = [
  { id: 'invoices', label: 'Tax Invoices', count: 2 },
  { id: 'quotations', label: 'Quotations', count: 5 },
  { id: 'proforma', label: 'Proforma', count: 3 },
  { id: 'delivery', label: 'Delivery Challans', count: 8 },
  { id: 'receipts', label: 'Payments', count: 12 },
  { id: 'returns', label: 'Sales Returns', count: 2 },
  { id: 'bulk', label: 'Bulk Upload' },
];

export default function SalesB2B() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [showNewInvoice, setShowNewInvoice] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      {showNewInvoice ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowNewInvoice(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">New B2B Tax Invoice</h1>
              <p className="text-gray-500 text-sm mt-1">Create a GST tax invoice for wholesale customers</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No *</label>
                <input type="text" defaultValue="B2B-INV-003" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
                <input type="date" defaultValue="2024-12-24" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option>Net 30 Days</option>
                  <option>Net 45 Days</option>
                  <option>Net 60 Days</option>
                  <option>Cash on Delivery</option>
                  <option>Advance</option>
                </select>
              </div>
            </div>

            {/* Customer Selection */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select Customer</option>
                    {parties.filter(p => p.partyType.includes('Customer')).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.partyCode}) - GSTIN: {c.gstin}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    <p className="text-gray-500">Outstanding: <span className="font-medium text-red-600">₹285,000</span></p>
                    <p className="text-gray-500">Credit Limit: <span className="font-medium">₹10,00,000</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Grid */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 bg-gray-50">
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium min-w-[250px]">Item *</th>
                      <th className="px-3 py-2 font-medium">HSN</th>
                      <th className="px-3 py-2 font-medium text-right">Qty *</th>
                      <th className="px-3 py-2 font-medium text-right">Rate *</th>
                      <th className="px-3 py-2 font-medium text-right">Disc %</th>
                      <th className="px-3 py-2 font-medium text-right">GST %</th>
                      <th className="px-3 py-2 font-medium text-right">Amount</th>
                      <th className="px-3 py-2 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-500">1</td>
                      <td className="px-3 py-2">
                        <select className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                          <option value="">Select Item</option>
                          {items.filter(i => i.type === 'Finished Good').map(i => (
                            <option key={i.id}>{i.name} ({i.sku}) - Stock: {i.currentStock}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-sm">6105</td>
                      <td className="px-3 py-2">
                        <input type="number" className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" className="w-16 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right" />
                      </td>
                      <td className="px-3 py-2">
                        <select className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right">
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right font-medium">₹0.00</td>
                      <td className="px-3 py-2 text-center">
                        <button className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200">
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxable</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">CGST</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SGST</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Round Off</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">₹0.00</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button onClick={() => setShowNewInvoice(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">
                Save as Draft
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Save & Post
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">B2B Sales</h1>
              <p className="text-gray-500 text-sm mt-1">Wholesale invoices, quotations, and customer management</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                <Upload className="w-4 h-4" />
                Bulk Upload
              </button>
              <button
                onClick={() => setShowNewInvoice(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Invoice
              </button>
            </div>
          </div>

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
                    {tab.label}
                    {tab.count && tab.count > 0 && (
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices by number, customer..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>

            {/* Table */}
            {activeTab === 'invoices' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 bg-gray-50">
                      <th className="px-4 py-3 font-medium">Invoice No</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">PO No</th>
                      <th className="px-4 py-3 font-medium text-center">Items</th>
                      <th className="px-4 py-3 font-medium text-right">Total</th>
                      <th className="px-4 py-3 font-medium text-center">Status</th>
                      <th className="px-4 py-3 font-medium text-center">Payment</th>
                      <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {salesInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm text-indigo-600">{inv.invoiceNo}</td>
                        <td className="px-4 py-3 text-sm">{inv.invoiceDate}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{inv.customerName}</p>
                          <p className="text-xs text-gray-500 font-mono">{inv.customerGstin}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">{inv.poNo}</td>
                        <td className="px-4 py-3 text-center">{inv.items.length}</td>
                        <td className="px-4 py-3 text-right font-medium">₹{inv.total.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            inv.status === 'Dispatched' ? 'bg-green-100 text-green-700' :
                            inv.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                            inv.status === 'Returned' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            inv.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                            inv.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Print">
                              <Printer className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Email">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(activeTab === 'quotations' || activeTab === 'proforma' || activeTab === 'delivery' || 
              activeTab === 'receipts' || activeTab === 'returns' || activeTab === 'bulk') && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'bulk' 
                    ? 'Upload multiple invoices using Excel template with validation and error reports.'
                    : `Manage your ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} efficiently.`}
                </p>
                {activeTab === 'bulk' ? (
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
                ) : (
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    Create New
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import { parties, items } from '../data/mockData';
import {
  Plus, Search, Filter, Download, Upload, FileText, Eye, Edit,
  Trash2, CheckCircle, XCircle, ChevronDown, ArrowLeft
} from 'lucide-react';

const purchaseInvoices = [
  { id: 'PUR001', invoiceNo: 'PUR-INV-001', date: '2024-12-20', vendor: 'Premium Textiles Pvt Ltd', items: 3, total: 45000, gst: 2250, status: 'Posted', grnNo: 'GRN-001' },
  { id: 'PUR002', invoiceNo: 'PUR-INV-002', date: '2024-12-22', vendor: 'Premium Textiles Pvt Ltd', items: 2, total: 28000, gst: 1400, status: 'Posted', grnNo: 'GRN-002' },
  { id: 'PUR003', invoiceNo: 'PUR-INV-003', date: '2024-12-23', vendor: 'Cotton Mills Corp', items: 5, total: 82000, gst: 4100, status: 'Draft', grnNo: 'GRN-003' },
  { id: 'PUR004', invoiceNo: 'PUR-INV-004', date: '2024-12-24', vendor: 'Premium Textiles Pvt Ltd', items: 1, total: 15000, gst: 750, status: 'Cancelled', grnNo: '-' },
];

const tabs = [
  { id: 'invoices', label: 'Purchase Invoices', count: 4 },
  { id: 'bulk', label: 'Bulk Upload', count: 0 },
  { id: 'returns', label: 'Purchase Returns', count: 1 },
  { id: 'payments', label: 'Vendor Payments', count: 8 },
];

export default function Purchase() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([
    { id: 1, itemId: '', itemName: '', qty: 1, rate: 0, gstPercent: 5, taxable: 0, gstAmount: 0, amount: 0 }
  ]);

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, {
      id: invoiceItems.length + 1,
      itemId: '',
      itemName: '',
      qty: 1,
      rate: 0,
      gstPercent: 5,
      taxable: 0,
      gstAmount: 0,
      amount: 0
    }]);
  };

  const removeInvoiceItem = (id: number) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {showNewInvoice ? (
        /* New Purchase Invoice Form */
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNewInvoice(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">New Purchase Invoice</h1>
              <p className="text-gray-500 text-sm mt-1">Create a new purchase invoice for raw materials</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No *</label>
                <input
                  type="text"
                  defaultValue="PUR-INV-005"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
                <input
                  type="date"
                  defaultValue="2024-12-24"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
                <div className="relative">
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none">
                    <option value="">Select Vendor</option>
                    {parties.filter(p => p.partyType.includes('Vendor')).map(v => (
                      <option key={v.id} value={v.id}>{v.companyName} - {v.partyCode}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Items Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-800">Items</h3>
                <button
                  onClick={addInvoiceItem}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 bg-gray-50">
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium min-w-[250px]">Item *</th>
                      <th className="px-3 py-2 font-medium text-right">Qty *</th>
                      <th className="px-3 py-2 font-medium text-right">Rate *</th>
                      <th className="px-3 py-2 font-medium text-right">Taxable</th>
                      <th className="px-3 py-2 font-medium text-right">GST %</th>
                      <th className="px-3 py-2 font-medium text-right">GST Amt</th>
                      <th className="px-3 py-2 font-medium text-right">Amount</th>
                      <th className="px-3 py-2 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item, index) => (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                        <td className="px-3 py-2">
                          <select className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                            <option value="">Select Item</option>
                            {items.filter(i => i.type === 'Raw Material').map(i => (
                              <option key={i.id} value={i.id}>{i.name} ({i.sku}) - Stock: {i.currentStock}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" defaultValue={1} min={1} className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right" />
                        </td>
                        <td className="px-3 py-2 text-right text-sm">₹0.00</td>
                        <td className="px-3 py-2">
                          <select className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right">
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right text-sm">₹0.00</td>
                        <td className="px-3 py-2 text-right font-medium">₹0.00</td>
                        <td className="px-3 py-2 text-center">
                          {invoiceItems.length > 1 && (
                            <button
                              onClick={() => removeInvoiceItem(item.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹0.00</span>
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
              <button
                onClick={() => setShowNewInvoice(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
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
        /* Purchase List View */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Purchase Module</h1>
              <p className="text-gray-500 text-sm mt-1">Manage purchase invoices, returns, and vendor payments</p>
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
                    {tab.count > 0 && (
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {tab.count}
                      </span>
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
                    placeholder="Search invoices by number, vendor..."
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
                      <th className="px-4 py-3 font-medium">Vendor</th>
                      <th className="px-4 py-3 font-medium text-center">Items</th>
                      <th className="px-4 py-3 font-medium text-right">Total</th>
                      <th className="px-4 py-3 font-medium text-right">GST</th>
                      <th className="px-4 py-3 font-medium">GRN No</th>
                      <th className="px-4 py-3 font-medium text-center">Status</th>
                      <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchaseInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm text-indigo-600">{inv.invoiceNo}</td>
                        <td className="px-4 py-3 text-sm">{inv.date}</td>
                        <td className="px-4 py-3 text-sm font-medium">{inv.vendor}</td>
                        <td className="px-4 py-3 text-center">{inv.items}</td>
                        <td className="px-4 py-3 text-right font-medium">₹{inv.total.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm">₹{inv.gst.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-mono">{inv.grnNo}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            inv.status === 'Posted' ? 'bg-green-100 text-green-700' :
                            inv.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'bulk' && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Bulk Purchase Upload</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Upload multiple purchase invoices at once using our Excel template.
                  Validate data row-by-row with detailed error reports.
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

            {(activeTab === 'returns' || activeTab === 'payments') && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'returns' ? <XCircle className="w-8 h-8 text-gray-400" /> : <CheckCircle className="w-8 h-8 text-gray-400" />}
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {activeTab === 'returns' ? 'Purchase Returns' : 'Vendor Payments'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'returns' 
                    ? 'Track and manage purchase returns against vendors.' 
                    : 'Record and track payments to vendors against invoices.'}
                </p>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  {activeTab === 'returns' ? 'New Return' : 'Record Payment'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

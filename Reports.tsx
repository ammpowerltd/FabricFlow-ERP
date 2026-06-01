import { useState } from 'react';
import {
  BarChart3, Download, Filter, Calendar, TrendingUp, Package,
  Truck, CreditCard, FileText, ShoppingCart
} from 'lucide-react';

const reportCategories = [
  {
    id: 'sales',
    label: 'Sales Reports',
    icon: TrendingUp,
    reports: [
      { id: 'sales-summary', name: 'Sales Summary', desc: 'Total sales by period, channel, and product' },
      { id: 'sales-register', name: 'Sales Register', desc: 'Detailed sales invoice list' },
      { id: 'channel-wise', name: 'Channel-wise Sales', desc: 'Sales breakdown by B2B/B2C channels' },
      { id: 'customer-wise', name: 'Customer-wise Sales', desc: 'Sales grouped by customer' },
      { id: 'product-wise', name: 'Product-wise Sales', desc: 'Sales by product/SKU' },
    ]
  },
  {
    id: 'purchase',
    label: 'Purchase Reports',
    icon: ShoppingCart,
    reports: [
      { id: 'purchase-summary', name: 'Purchase Summary', desc: 'Total purchases by period and vendor' },
      { id: 'purchase-register', name: 'Purchase Register', desc: 'Detailed purchase invoice list' },
      { id: 'vendor-wise', name: 'Vendor-wise Purchase', desc: 'Purchases grouped by vendor' },
      { id: 'material-consumption', name: 'Material Consumption', desc: 'Raw material usage report' },
    ]
  },
  {
    id: 'inventory',
    label: 'Inventory Reports',
    icon: Package,
    reports: [
      { id: 'stock-summary', name: 'Stock Summary', desc: 'Current stock levels by warehouse' },
      { id: 'stock-valuation', name: 'Stock Valuation', desc: 'Inventory value report (FIFO/Weighted Avg)' },
      { id: 'low-stock', name: 'Low Stock Alert', desc: 'Items below reorder level' },
      { id: 'stock-movement', name: 'Stock Movement', desc: 'Detailed stock transaction log' },
      { id: 'slow-moving', name: 'Slow Moving Items', desc: 'Items with low turnover' },
    ]
  },
  {
    id: 'production',
    label: 'Production Reports',
    icon: Package,
    reports: [
      { id: 'job-work-summary', name: 'Job Work Summary', desc: 'All job works with status' },
      { id: 'cost-analysis', name: 'Cost Analysis', desc: 'Production cost per item/contractor' },
      { id: 'rejection-report', name: 'Rejection Report', desc: 'Rejected items and reasons' },
      { id: 'contractor-performance', name: 'Contractor Performance', desc: 'Contractor-wise efficiency' },
    ]
  },
  {
    id: 'logistics',
    label: 'Logistics Reports',
    icon: Truck,
    reports: [
      { id: 'dispatch-report', name: 'Dispatch Report', desc: 'All dispatched orders' },
      { id: 'courier-performance', name: 'Courier Performance', desc: 'Delivery success rate by courier' },
      { id: 'rto-report', name: 'RTO Report', desc: 'Returned orders analysis' },
      { id: 'cod-report', name: 'COD Collection', desc: 'COD collection and pending amounts' },
    ]
  },
  {
    id: 'financial',
    label: 'Financial Reports',
    icon: CreditCard,
    reports: [
      { id: 'trial-balance', name: 'Trial Balance', desc: 'Debit and credit balances' },
      { id: 'profit-loss', name: 'Profit & Loss', desc: 'Income and expense statement' },
      { id: 'balance-sheet', name: 'Balance Sheet', desc: 'Assets and liabilities' },
      { id: 'cash-book', name: 'Cash/Bank Book', desc: 'Cash and bank transactions' },
      { id: 'receivables', name: 'Receivables', desc: 'Pending customer payments' },
      { id: 'payables', name: 'Payables', desc: 'Pending vendor payments' },
    ]
  },
  {
    id: 'gst',
    label: 'GST Reports',
    icon: FileText,
    reports: [
      { id: 'gstr1', name: 'GSTR-1', desc: 'Outward supplies summary' },
      { id: 'gstr3b', name: 'GSTR-3B', desc: 'Monthly return summary' },
      { id: 'purchase-register-gst', name: 'Purchase Register', desc: 'Inward supplies with ITC' },
      { id: 'hsn-summary', name: 'HSN Summary', desc: 'HSN-wise summary' },
    ]
  },
];

export default function Reports() {
  const [selectedCategory, setSelectedCategory] = useState('sales');
  const [dateRange, setDateRange] = useState('this-month');

  const category = reportCategories.find(c => c.id === selectedCategory);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Generate and export comprehensive business reports</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['today', 'this-week', 'this-month', 'last-month', 'this-quarter', 'custom'].map((option) => (
              <button
                key={option}
                onClick={() => setDateRange(option)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === option
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              defaultValue="2024-12-01"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              defaultValue="2024-12-31"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-medium text-gray-800 mb-3">Report Categories</h3>
          <div className="space-y-2">
            {reportCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <cat.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{cat.label}</span>
                <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {cat.reports.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Report List */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{category?.label}</h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {category?.reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{report.name}</h4>
                      <p className="text-sm text-gray-500">{report.desc}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                    View
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {category?.reports.length} reports in {category?.label}
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                Print
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                PDF
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

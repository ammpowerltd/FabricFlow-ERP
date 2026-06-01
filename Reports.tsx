import { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import { BarChart3, Download, Printer, Filter, TrendingUp, Package, ShoppingCart, Factory, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type ReportType = 'sales' | 'purchase' | 'inventory' | 'production' | 'gst' | 'contractor';

const formatYAxis = (v: unknown) => `₹${(Number(v) / 1000).toFixed(0)}k`;
const formatTooltip = (value: unknown) => formatCurrency(Number(value));

export default function Reports() {
  const { items, purchases, sales, jobWorks, materialIns, parties, categories } = useStore();
  const [activeReport, setActiveReport] = useState<ReportType>('sales');
  const [dateFrom, setDateFrom] = useState('2024-12-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const reports = [
    { id: 'sales' as ReportType, label: 'Sales Report', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'purchase' as ReportType, label: 'Purchase Report', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'inventory' as ReportType, label: 'Inventory Report', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'production' as ReportType, label: 'Production Report', icon: Factory, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'gst' as ReportType, label: 'GST Report', icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'contractor' as ReportType, label: 'Contractor Report', icon: BarChart3, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  // Sales data
  const filteredSales = sales.filter(s => s.date >= dateFrom && s.date <= dateTo);
  const salesByPlatform = ['Amazon', 'Myntra', 'Flipkart', 'B2B', 'Ajio', 'Direct', 'Others'].map(p => ({
    platform: p,
    revenue: filteredSales.filter(s => (s.platform || 'Others') === p).reduce((s, x) => s + x.grandTotal, 0),
    orders: filteredSales.filter(s => (s.platform || 'Others') === p).length,
  })).filter(p => p.orders > 0);

  const filteredPurchases = purchases.filter(p => p.date >= dateFrom && p.date <= dateTo);

  const categoryWiseStock = categories.map(cat => ({
    name: cat.name,
    rawCount: items.filter(i => i.categoryId === cat.id && i.type === 'RAW_MATERIAL').length,
    fgCount: items.filter(i => i.categoryId === cat.id && i.type === 'FINISHED_GOODS').length,
    value: items.filter(i => i.categoryId === cat.id).reduce((s, i) => s + i.currentStock * (i.type === 'RAW_MATERIAL' ? i.purchaseRate : i.salesRate), 0)
  })).filter(c => c.rawCount + c.fgCount > 0);

  const contractorPerformance = parties.filter(p => p.type === 'CONTRACTOR').map(c => {
    const cJWs = jobWorks.filter(jw => jw.contractorId === c.id);
    const completed = cJWs.filter(jw => jw.status === 'COMPLETED').length;
    const totalRM = cJWs.reduce((s, jw) => s + jw.rawMaterials.reduce((ss, rm) => ss + rm.amount, 0), 0);
    const totalMI = materialIns.filter(mi => mi.contractorId === c.id);
    const totalReceived = totalMI.reduce((s, mi) => s + mi.items.reduce((ss, x) => ss + x.receivedQty, 0), 0);
    const totalRejected = totalMI.reduce((s, mi) => s + mi.items.reduce((ss, x) => ss + x.rejectedQty, 0), 0);
    return { ...c, totalJW: cJWs.length, completed, totalRM, totalReceived, totalRejected };
  });

  const handleExport = () => alert('Export to PDF/Excel feature — connect to backend API for actual file generation.');
  const handlePrint = () => window.print();

  return (
    <div className="p-6 space-y-6">
      {/* Report Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {reports.map(r => {
          const Icon = r.icon;
          return (
            <button key={r.id} onClick={() => setActiveReport(r.id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${activeReport === r.id ? `border-indigo-500 bg-indigo-50` : 'border-gray-200 bg-white hover:border-indigo-200'}`}>
              <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center mb-2`}>
                <Icon size={18} className={r.color} />
              </div>
              <p className="text-xs font-semibold text-gray-800">{r.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 flex-wrap">
        <Filter size={16} className="text-gray-400" />
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">From:</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-400" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">To:</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-400" />
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700">
            <Download size={14} /> Export PDF
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Sales Report */}
      {activeReport === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-green-700 mt-1">{formatCurrency(filteredSales.reduce((s, x) => s + x.grandTotal, 0))}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{filteredSales.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Delivered</p>
              <p className="text-xl font-bold text-blue-700 mt-1">{filteredSales.filter(s => s.dispatchStatus === 'DELIVERED').length}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Avg Order Value</p>
              <p className="text-xl font-bold text-purple-700 mt-1">{filteredSales.length > 0 ? formatCurrency(filteredSales.reduce((s, x) => s + x.grandTotal, 0) / filteredSales.length) : '₹0'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4">Platform-wise Revenue</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salesByPlatform} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="platform" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={formatYAxis} />
                  <Tooltip formatter={formatTooltip} contentStyle={{ borderRadius: '12px' }} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4">Sales Details</h4>
              <div className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs">
                      <th className="px-3 py-2 text-left font-semibold text-gray-500">Invoice</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-500">Date</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-500">Platform</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-500">Amount</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredSales.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-xs font-bold text-green-700">{s.invoiceNo}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{formatDate(s.date)}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{s.platform}</td>
                        <td className="px-3 py-2 text-right text-xs font-bold">{formatCurrency(s.grandTotal)}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getStatusColor(s.dispatchStatus)}`}>{s.dispatchStatus}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Report */}
      {activeReport === 'purchase' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Total Purchases</p>
              <p className="text-xl font-bold text-blue-700 mt-1">{formatCurrency(filteredPurchases.reduce((s, x) => s + x.grandTotal, 0))}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Total Bills</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{filteredPurchases.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Total GST Paid</p>
              <p className="text-xl font-bold text-orange-700 mt-1">{formatCurrency(filteredPurchases.reduce((s, x) => s + x.totalGST, 0))}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Unique Vendors</p>
              <p className="text-xl font-bold text-purple-700 mt-1">{new Set(filteredPurchases.map(p => p.partyId)).size}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs">
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Bill No.</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Vendor</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-500">Subtotal</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-500">GST</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPurchases.map(p => {
                  const party = parties.find(x => x.id === p.partyId);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-blue-700 text-xs">{p.billNo}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{formatDate(p.date)}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-900">{party?.name || '—'}</td>
                      <td className="px-4 py-3 text-right text-xs">{formatCurrency(p.subtotal)}</td>
                      <td className="px-4 py-3 text-right text-xs text-orange-600">{formatCurrency(p.totalGST)}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold">{formatCurrency(p.grandTotal)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(p.status)}`}>{p.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Report */}
      {activeReport === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4">Category-wise Stock Value</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryWiseStock} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={formatYAxis} />
                <Tooltip formatter={formatTooltip} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h4 className="font-bold text-gray-900">Complete Stock List</h4>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs">
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Item</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Type</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-500">Stock</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-500">Min Stock</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-500">Rate</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-500">Value</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => {
                  const cat = categories.find(c => c.id === item.categoryId);
                  const rate = item.type === 'RAW_MATERIAL' ? item.purchaseRate : item.salesRate;
                  const isLow = item.currentStock <= item.minimumStock;
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 ${isLow ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-2.5 text-xs font-mono text-gray-600">{item.sku}</td>
                      <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">{cat?.name || '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${item.type === 'RAW_MATERIAL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {item.type === 'RAW_MATERIAL' ? 'RM' : 'FG'}
                        </span>
                      </td>
                      <td className={`px-4 py-2.5 text-right text-xs font-bold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{item.currentStock}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-gray-500">{item.minimumStock}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-gray-600">{formatCurrency(rate)}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-semibold text-indigo-700">{formatCurrency(item.currentStock * rate)}</td>
                      <td className="px-4 py-2.5">
                        {isLow ? <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Low ⚠️</span>
                          : <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">OK ✅</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Production Report */}
      {activeReport === 'production' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500">Total Job Works</p><p className="text-xl font-bold text-gray-900 mt-1">{jobWorks.length}</p></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500">Completed</p><p className="text-xl font-bold text-green-700 mt-1">{jobWorks.filter(j => j.status === 'COMPLETED').length}</p></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500">In Process</p><p className="text-xl font-bold text-yellow-700 mt-1">{jobWorks.filter(j => j.status === 'IN_PROCESS').length}</p></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"><p className="text-xs text-gray-500">Total MI Entries</p><p className="text-xl font-bold text-blue-700 mt-1">{materialIns.length}</p></div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs">
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">JW No.</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Contractor</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Priority</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Expected</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-500">RM Value</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-500">MI Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobWorks.map(jw => {
                  const contractor = parties.find(p => p.id === jw.contractorId);
                  const rmValue = jw.rawMaterials.reduce((s, r) => s + r.amount, 0);
                  const miCount = materialIns.filter(m => m.jobWorkId === jw.id).length;
                  return (
                    <tr key={jw.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono text-xs font-bold text-orange-700">{jw.jobWorkNo}</td>
                      <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{contractor?.name || '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-bold ${jw.priority === 'URGENT' ? 'text-red-600' : jw.priority === 'HIGH' ? 'text-orange-600' : jw.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {jw.priority}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">{formatDate(jw.expectedReturnDate)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(jw.status)}`}>{jw.status.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-bold text-indigo-700">{formatCurrency(rmValue)}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-gray-600">{miCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GST Report */}
      {activeReport === 'gst' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-3">Output GST (Sales)</h4>
              <div className="space-y-2">
                {filteredSales.map(s => {
                  const party = parties.find(p => p.id === s.partyId);
                  return (
                    <div key={s.id} className="flex justify-between items-center p-2 bg-green-50 rounded-lg text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{s.invoiceNo}</span>
                        <span className="text-xs text-gray-500 ml-2">({party?.name})</span>
                      </div>
                      <span className="font-bold text-green-700">{formatCurrency(s.totalGST)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-2 border-t border-green-200 font-bold text-green-800">
                  <span>Total Output GST</span>
                  <span>{formatCurrency(filteredSales.reduce((s, x) => s + x.totalGST, 0))}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-3">Input GST (Purchases)</h4>
              <div className="space-y-2">
                {filteredPurchases.map(p => {
                  const party = parties.find(x => x.id === p.partyId);
                  return (
                    <div key={p.id} className="flex justify-between items-center p-2 bg-blue-50 rounded-lg text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{p.billNo}</span>
                        <span className="text-xs text-gray-500 ml-2">({party?.name})</span>
                      </div>
                      <span className="font-bold text-blue-700">{formatCurrency(p.totalGST)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-2 border-t border-blue-200 font-bold text-blue-800">
                  <span>Total Input GST</span>
                  <span>{formatCurrency(filteredPurchases.reduce((s, x) => s + x.totalGST, 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contractor Report */}
      {activeReport === 'contractor' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h4 className="font-bold text-gray-900">Contractor Performance Report</h4>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs">
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Contractor</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">Total JW</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">Completed</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">RM Value</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">Received</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">Rejected</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-500">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contractorPerformance.map(c => {
                const successRate = c.totalReceived > 0 ? ((c.totalReceived - c.totalRejected) / c.totalReceived * 100) : 0;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.city}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{c.totalJW}</td>
                    <td className="px-4 py-3 text-right text-green-700 font-semibold">{c.completed}</td>
                    <td className="px-4 py-3 text-right text-indigo-700 font-semibold">{formatCurrency(c.totalRM)}</td>
                    <td className="px-4 py-3 text-right text-green-600">{c.totalReceived}</td>
                    <td className="px-4 py-3 text-right text-red-600">{c.totalRejected}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-bold ${successRate >= 95 ? 'text-green-600' : successRate >= 85 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {successRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

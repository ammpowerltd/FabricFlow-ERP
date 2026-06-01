import { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/helpers';
import {
  ShoppingCart, ShoppingBag, Package, Factory, AlertTriangle, Truck,
  TrendingUp, ArrowUpRight, DollarSign, BarChart3, Activity, Layers, RotateCcw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const fmtAxis = (v: unknown) => `₹${(Number(v)/1000).toFixed(0)}k`;
const fmtTip = (value: unknown) => formatCurrency(Number(value));

type DashTab = 'overview' | 'sales' | 'inventory' | 'production' | 'logistics' | 'cod' | 'finance';

const tabs: { id: DashTab; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'sales', label: 'Sales Analytics', icon: ShoppingBag },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'production', label: 'Production', icon: Factory },
  { id: 'logistics', label: 'Logistics', icon: Truck },
  { id: 'cod', label: 'COD Recovery', icon: DollarSign },
  { id: 'finance', label: 'Finance', icon: TrendingUp },
];

const COLORS = ['#6366f1','#22d3ee','#f97316','#ec4899','#10b981','#8b5cf6','#ef4444','#eab308'];

export default function Dashboard() {
  const { items, purchases, sales, jobWorks, materialIns, parties, expenses, notifications, setActiveModule } = useStore();
  const [activeTab, setActiveTab] = useState<DashTab>('overview');
  const [dateRange, setDateRange] = useState('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // ── Date filter logic ──
  const inDateRange = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateRange === 'today') return d >= today;
    if (dateRange === 'yesterday') { const y = new Date(today); y.setDate(y.getDate() - 1); return d >= y && d < today; }
    if (dateRange === '7') { const w = new Date(today); w.setDate(w.getDate() - 7); return d >= w; }
    if (dateRange === '30') { const m = new Date(today); m.setDate(m.getDate() - 30); return d >= m; }
    if (dateRange === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (dateRange === 'prevmonth') { const pm = now.getMonth() === 0 ? 11 : now.getMonth() - 1; const py = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(); return d.getMonth() === pm && d.getFullYear() === py; }
    if (dateRange === 'quarter') { const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1); return d >= qStart; }
    if (dateRange === 'year') return d.getFullYear() === now.getFullYear();
    if (dateRange === 'custom') {
      if (customFrom && d < new Date(customFrom)) return false;
      if (customTo && d > new Date(customTo + 'T23:59:59')) return false;
      return !!(customFrom || customTo);
    }
    return true;
  };

  const fSales = sales.filter(s => inDateRange(s.date));
  const fPurchases = purchases.filter(p => inDateRange(p.date));
  const fExpenses = expenses.filter(e => inDateRange(e.date));

  const resetFilters = () => { setDateRange('month'); setCustomFrom(''); setCustomTo(''); };

  // ── Computed Metrics (filtered) ──
  const totalSales = fSales.reduce((s, x) => s + x.grandTotal, 0);
  const totalPurchases = fPurchases.reduce((s, x) => s + x.grandTotal, 0);
  const totalExpenses = fExpenses.reduce((s, x) => s + x.amount, 0);
  const grossProfit = totalSales - totalPurchases;
  const netProfit = grossProfit - totalExpenses;
  const inventoryValue = items.reduce((s, i) => s + i.currentStock * (i.type === 'RAW_MATERIAL' ? i.purchaseRate : i.salesRate), 0);
  const lowStock = items.filter(i => i.currentStock <= i.minimumStock).length;
  const pendingOrders = fSales.filter(s => s.dispatchStatus === 'PENDING').length;
  const deliveredOrders = fSales.filter(s => s.dispatchStatus === 'DELIVERED').length;
  const rtoOrders = fSales.filter(s => s.dispatchStatus === 'RTO').length;
  const codOrders = fSales.filter(s => (s.remarks || '').toLowerCase().includes('payment: cod'));
  const codPaid = codOrders.filter(s => (s.remarks || '').includes('COD_PAID:true'));
  const codPending = codOrders.filter(s => !(s.remarks || '').includes('COD_PAID:true'));
  const codPendingAmt = codPending.reduce((s, o) => s + o.grandTotal, 0);
  const codPaidAmt = codPaid.reduce((s, o) => s + o.grandTotal, 0);
  const prepaidOrders = fSales.filter(s => (s.remarks || '').toLowerCase().includes('payment: prepaid'));
  const prepaidRevenue = prepaidOrders.reduce((s, o) => s + o.grandTotal, 0);
  const activeJW = jobWorks.filter(j => ['OPEN', 'IN_PROCESS', 'PARTIAL_RECEIVED'].includes(j.status)).length;
  const completedJW = jobWorks.filter(j => j.status === 'COMPLETED').length;
  const unread = notifications.filter(n => !n.isRead).length;

  // Charts data
  const monthlyData = [
    { month: 'Aug', sales: 180000, purchases: 120000, profit: 60000 },
    { month: 'Sep', sales: 210000, purchases: 140000, profit: 70000 },
    { month: 'Oct', sales: 195000, purchases: 130000, profit: 65000 },
    { month: 'Nov', sales: 285000, purchases: 175000, profit: 110000 },
    { month: 'Dec', sales: 320000, purchases: 190000, profit: 130000 },
    { month: 'Jan', sales: 245000, purchases: 155000, profit: 90000 },
  ];

  const platformData = fSales.reduce((acc, s) => {
    const p = s.platform || 'Other';
    const existing = acc.find(x => x.name === p);
    if (existing) { existing.value += s.grandTotal; existing.orders++; }
    else acc.push({ name: p, value: s.grandTotal, orders: 1 });
    return acc;
  }, [] as { name: string; value: number; orders: number }[]);

  const statusData = [
    { name: 'Pending', value: fSales.filter(s => s.dispatchStatus === 'PENDING').length, color: '#f97316' },
    { name: 'Dispatched', value: fSales.filter(s => s.dispatchStatus === 'DISPATCHED').length, color: '#3b82f6' },
    { name: 'RTO', value: rtoOrders, color: '#ef4444' },
    { name: 'Delivered', value: deliveredOrders, color: '#10b981' },
    { name: 'Return', value: fSales.filter(s => s.dispatchStatus === 'CUSTOMER_RETURN').length, color: '#8b5cf6' },
  ];

  const courierData = fSales.reduce((acc, s) => {
    const c = (s.remarks || '').match(/Courier:\s*([^\|]+)/)?.[1]?.trim() || 'Unknown';
    const existing = acc.find(x => x.name === c);
    if (existing) { existing.total++; if (s.dispatchStatus === 'DELIVERED') existing.delivered++; if (s.dispatchStatus === 'RTO') existing.rto++; }
    else acc.push({ name: c, total: 1, delivered: s.dispatchStatus === 'DELIVERED' ? 1 : 0, rto: s.dispatchStatus === 'RTO' ? 1 : 0 });
    return acc;
  }, [] as { name: string; total: number; delivered: number; rto: number }[]).filter(c => c.name !== '—' && c.name !== 'Unknown');

  const KPI = ({ label, value, sub, icon: Icon, color, bg, trend, onClick }: { label: string; value: string | number; sub?: string; icon: typeof Activity; color: string; bg: string; trend?: number; onClick?: () => void }) => (
    <div onClick={onClick} className={`${bg} rounded-2xl p-4 border border-white/50 ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''} transition-all`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2.5 rounded-xl bg-white/60 shadow-sm`}><Icon size={18} className={color} /></div>
        {trend !== undefined && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{trend >= 0 ? '↑' : '↓'}{Math.abs(trend)}%</span>}
      </div>
      <p className="text-xl font-black text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-600 font-medium mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* ── Tab Navigation ── */}
      <div className="sticky top-0 z-20 bg-gray-50 -mx-4 md:-mx-6 px-4 md:px-6 pt-1 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'}`}>
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            {/* Date Filter */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-0.5">
              {[
                { v: 'today', l: 'Today' },
                { v: 'month', l: 'This Month' },
                { v: '7', l: '7D' },
                { v: '30', l: '30D' },
              ].map(d => (
                <button key={d.v} onClick={() => setDateRange(d.v)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${dateRange === d.v ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                  {d.l}
                </button>
              ))}
              <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                className="px-2 py-1.5 text-xs outline-none bg-transparent text-gray-500 font-medium cursor-pointer">
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="month">Current Month</option>
                <option value="prevmonth">Previous Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
                <option value="custom">📅 Custom Date Range</option>
              </select>
            </div>
            {/* Custom Date Range Picker */}
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-xl px-3 py-1.5 shadow-sm">
                <span className="text-xs text-indigo-600 font-semibold">From</span>
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                  className="px-2 py-1 border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-400 bg-gray-50 font-medium" />
                <span className="text-xs text-gray-400 font-bold">→</span>
                <span className="text-xs text-indigo-600 font-semibold">To</span>
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                  min={customFrom || undefined} max={new Date().toISOString().split('T')[0]}
                  className="px-2 py-1 border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-400 bg-gray-50 font-medium" />
                {customFrom && customTo && customFrom > customTo && (
                  <span className="text-xs text-red-600 font-bold">⚠️ Invalid</span>
                )}
              </div>
            )}
            {/* Reset */}
            {dateRange !== 'month' && (
              <button onClick={resetFilters} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors" title="Reset Filters">
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Welcome */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="relative">
              <h2 className="text-xl font-bold">FabricFlow Business Intelligence</h2>
              <p className="text-white/80 text-sm mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              {unread > 0 && <div className="mt-2 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs"><span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />{unread} alerts</div>}
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            <KPI label="Total Sales" value={formatCurrency(totalSales)} sub={`${fSales.length} orders`} icon={ShoppingBag} color="text-green-600" bg="bg-green-50" trend={12} onClick={() => setActiveTab('sales')} />
            <KPI label="Total Purchase" value={formatCurrency(totalPurchases)} icon={ShoppingCart} color="text-blue-600" bg="bg-blue-50" trend={8} onClick={() => setActiveModule('purchase')} />
            <KPI label="Net Profit" value={formatCurrency(netProfit)} icon={TrendingUp} color={netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'} bg={netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'} trend={netProfit >= 0 ? 15 : -5} onClick={() => setActiveTab('finance')} />
            <KPI label="Inventory Value" value={formatCurrency(inventoryValue)} icon={Package} color="text-purple-600" bg="bg-purple-50" onClick={() => setActiveTab('inventory')} />
            <KPI label="Pending Orders" value={pendingOrders} sub="Awaiting dispatch" icon={Truck} color="text-orange-600" bg="bg-orange-50" onClick={() => setActiveModule('track')} />
            <KPI label="COD Orders" value={codOrders.length} sub={formatCurrency(codPendingAmt) + ' pending'} icon={DollarSign} color="text-amber-600" bg="bg-amber-50" onClick={() => setActiveModule('cod')} />
            <KPI label="Prepaid Orders" value={prepaidOrders.length} sub={formatCurrency(prepaidRevenue)} icon={Activity} color="text-emerald-600" bg="bg-emerald-50" onClick={() => setActiveModule('sales')} />
            <KPI label="Low Stock" value={lowStock} sub="Need reorder" icon={AlertTriangle} color="text-red-600" bg="bg-red-50" onClick={() => setActiveModule('inventory')} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4"><div><h3 className="font-bold text-gray-900 text-sm">Revenue Trend</h3><p className="text-xs text-gray-500">Sales vs Purchase vs Profit</p></div></div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
                  <Tooltip formatter={fmtTip} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} fill="url(#gSales)" name="Sales" />
                  <Area type="monotone" dataKey="purchases" stroke="#f97316" strokeWidth={2} fill="transparent" strokeDasharray="5 5" name="Purchase" />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="url(#gProfit)" name="Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-1">Order Status</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart><Pie data={statusData.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" paddingAngle={3}>
                  {statusData.map((_, i) => <Cell key={i} fill={statusData[i].color} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-1">{statusData.filter(d => d.value > 0).map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs"><div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} /><span className="text-gray-600">{d.name}</span><span className="font-bold text-gray-800 ml-auto">{d.value}</span></div>
              ))}</div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Platform Sales */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Platform Revenue</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={platformData} layout="vertical" barSize={16}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip formatter={fmtTip} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>{platformData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* COD Recovery */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-gray-900 text-sm">COD Recovery</h3><button onClick={() => setActiveTab('cod')} className="text-xs text-indigo-600 flex items-center gap-1"><ArrowUpRight size={12} /></button></div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-yellow-50 rounded-xl p-3 text-center"><p className="text-lg font-black text-yellow-700">{formatCurrency(codPendingAmt)}</p><p className="text-xs text-yellow-600">🟡 Pending</p></div>
                <div className="bg-green-50 rounded-xl p-3 text-center"><p className="text-lg font-black text-green-700">{formatCurrency(codPaidAmt)}</p><p className="text-xs text-green-600">🟢 Received</p></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${codOrders.length > 0 ? (codPaid.length / codOrders.length * 100) : 0}%` }} /></div>
              <p className="text-xs text-gray-500 mt-1 text-center">{codOrders.length > 0 ? (codPaid.length / codOrders.length * 100).toFixed(0) : 0}% Recovery Rate</p>
            </div>

            {/* Production */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-gray-900 text-sm">Production Status</h3><button onClick={() => setActiveModule('production')} className="text-xs text-indigo-600 flex items-center gap-1"><ArrowUpRight size={12} /></button></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Active Job Works</span><span className="text-sm font-black text-orange-600">{activeJW}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Completed</span><span className="text-sm font-black text-green-600">{completedJW}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Material In Entries</span><span className="text-sm font-black text-blue-600">{materialIns.length}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Raw Materials</span><span className="text-sm font-black text-purple-600">{items.filter(i => i.type === 'RAW_MATERIAL').length}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Finished Goods</span><span className="text-sm font-black text-indigo-600">{items.filter(i => i.type === 'FINISHED_GOODS').length}</span></div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'New Purchase', icon: ShoppingCart, color: 'from-blue-500 to-blue-700', module: 'purchase' },
              { label: 'New Job Work', icon: Factory, color: 'from-orange-500 to-red-600', module: 'production' },
              { label: 'New Invoice', icon: ShoppingBag, color: 'from-green-500 to-emerald-700', module: 'sales' },
              { label: 'Track Orders', icon: Truck, color: 'from-purple-500 to-indigo-700', module: 'track' },
            ].map(a => { const Icon = a.icon; return (
              <button key={a.label} onClick={() => setActiveModule(a.module)} className={`bg-gradient-to-br ${a.color} text-white rounded-2xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity shadow-lg`}>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Icon size={20} /></div>
                <span className="font-semibold text-sm">{a.label}</span>
              </button>
            ); })}
          </div>
        </div>
      )}

      {/* ═══ SALES TAB ═══ */}
      {activeTab === 'sales' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            <KPI label="Total Revenue" value={formatCurrency(totalSales)} sub={`${fSales.length} orders`} icon={ShoppingBag} color="text-green-600" bg="bg-green-50" trend={12} onClick={() => setActiveModule('sales')} />
            <KPI label="Total Orders" value={fSales.length} icon={Layers} color="text-indigo-600" bg="bg-indigo-50" onClick={() => setActiveModule('track')} />
            <KPI label="Avg Order Value" value={fSales.length > 0 ? formatCurrency(totalSales / fSales.length) : '₹0'} icon={TrendingUp} color="text-purple-600" bg="bg-purple-50" onClick={() => setActiveModule('sales')} />
            <KPI label="Delivered" value={deliveredOrders} sub={formatCurrency(fSales.filter(s=>s.dispatchStatus==='DELIVERED').reduce((a,s)=>a+s.grandTotal,0))} icon={Truck} color="text-green-600" bg="bg-green-50" onClick={() => setActiveModule('track')} />
            <KPI label="RTO Orders" value={rtoOrders} sub={formatCurrency(fSales.filter(s=>s.dispatchStatus==='RTO').reduce((a,s)=>a+s.grandTotal,0))} icon={AlertTriangle} color="text-red-600" bg="bg-red-50" onClick={() => setActiveModule('track')} />
            <KPI label="COD Orders" value={codOrders.length} sub={formatCurrency(codOrders.reduce((s,o)=>s+o.grandTotal,0))} icon={DollarSign} color="text-amber-600" bg="bg-amber-50" onClick={() => setActiveModule('cod')} />
            <KPI label="Prepaid Orders" value={prepaidOrders.length} sub={formatCurrency(prepaidRevenue)} icon={Activity} color="text-emerald-600" bg="bg-emerald-50" onClick={() => setActiveModule('sales')} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Platform Performance</h3>
              <ResponsiveContainer width="100%" height={220}><BarChart data={platformData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
                <Tooltip formatter={fmtTip} /><Bar dataKey="value" radius={[6,6,0,0]}>{platformData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Bar>
              </BarChart></ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Sales Trend</h3>
              <ResponsiveContainer width="100%" height={220}><AreaChart data={monthlyData}>
                <defs><linearGradient id="gS2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
                <Tooltip formatter={fmtTip} /><Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5} fill="url(#gS2)" />
              </AreaChart></ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ═══ INVENTORY TAB ═══ */}
      {activeTab === 'inventory' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            <KPI label="Total Items" value={items.length} icon={Package} color="text-indigo-600" bg="bg-indigo-50" />
            <KPI label="Stock Value" value={formatCurrency(inventoryValue)} icon={DollarSign} color="text-purple-600" bg="bg-purple-50" />
            <KPI label="Raw Materials" value={items.filter(i=>i.type==='RAW_MATERIAL').length} icon={Layers} color="text-blue-600" bg="bg-blue-50" />
            <KPI label="Finished Goods" value={items.filter(i=>i.type==='FINISHED_GOODS').length} icon={ShoppingBag} color="text-green-600" bg="bg-green-50" />
            <KPI label="Low Stock" value={lowStock} icon={AlertTriangle} color="text-red-600" bg="bg-red-50" />
            <KPI label="Out of Stock" value={items.filter(i=>i.currentStock<=0).length} icon={AlertTriangle} color="text-red-600" bg="bg-red-100" />
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Low Stock Items</h3>
            <div className="space-y-2">{items.filter(i=>i.currentStock<=i.minimumStock).slice(0,8).map(i => (
              <div key={i.id} className="flex items-center justify-between bg-red-50/50 rounded-xl px-4 py-2.5 border border-red-100">
                <div><p className="text-sm font-semibold text-gray-900">{i.name}</p><p className="text-xs text-gray-500">{i.sku}</p></div>
                <div className="text-right"><p className={`text-sm font-black ${i.currentStock <= 0 ? 'text-red-600' : 'text-orange-600'}`}>{i.currentStock}</p><p className="text-xs text-gray-400">Min: {i.minimumStock}</p></div>
              </div>
            ))}</div>
          </div>
        </div>
      )}

      {/* ═══ PRODUCTION TAB ═══ */}
      {activeTab === 'production' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPI label="Total Job Works" value={jobWorks.length} icon={Factory} color="text-indigo-600" bg="bg-indigo-50" />
            <KPI label="In Process" value={activeJW} icon={Activity} color="text-orange-600" bg="bg-orange-50" />
            <KPI label="Completed" value={completedJW} icon={TrendingUp} color="text-green-600" bg="bg-green-50" />
            <KPI label="Material In" value={materialIns.length} icon={Package} color="text-blue-600" bg="bg-blue-50" />
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Active Productions</h3>
            <div className="space-y-2">{jobWorks.filter(j=>['OPEN','IN_PROCESS','PARTIAL_RECEIVED'].includes(j.status)).map(jw => {
              const c = parties.find(p => p.id === jw.contractorId);
              return (<div key={jw.id} className="flex items-center justify-between bg-orange-50/50 rounded-xl px-4 py-2.5 border border-orange-100">
                <div><p className="text-sm font-bold text-gray-900">{jw.jobWorkNo}</p><p className="text-xs text-gray-500">🏭 {c?.name} · Due: {jw.expectedReturnDate}</p></div>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${jw.status === 'IN_PROCESS' ? 'bg-yellow-100 text-yellow-700' : jw.status === 'PARTIAL_RECEIVED' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{jw.status.replace(/_/g,' ')}</span>
              </div>);
            })}</div>
          </div>
        </div>
      )}

      {/* ═══ LOGISTICS TAB ═══ */}
      {activeTab === 'logistics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
            <KPI label="Total Shipments" value={sales.length} icon={Truck} color="text-indigo-600" bg="bg-indigo-50" />
            <KPI label="Delivery Success" value={sales.length > 0 ? `${(deliveredOrders/sales.length*100).toFixed(0)}%` : '0%'} icon={TrendingUp} color="text-green-600" bg="bg-green-50" />
            <KPI label="RTO Rate" value={sales.length > 0 ? `${(rtoOrders/sales.length*100).toFixed(0)}%` : '0%'} icon={AlertTriangle} color="text-red-600" bg="bg-red-50" />
            <KPI label="Dispatched" value={sales.filter(s=>s.dispatchStatus==='DISPATCHED').length} icon={Truck} color="text-blue-600" bg="bg-blue-50" />
            <KPI label="Returns" value={sales.filter(s=>s.dispatchStatus==='CUSTOMER_RETURN').length} icon={ShoppingCart} color="text-purple-600" bg="bg-purple-50" />
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Courier Performance</h3>
            {courierData.length > 0 ? (
              <div className="space-y-2">{courierData.map(c => {
                const successRate = c.total > 0 ? (c.delivered / c.total * 100) : 0;
                const rtoRate = c.total > 0 ? (c.rto / c.total * 100) : 0;
                return (<div key={c.name} className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex-1"><p className="text-sm font-bold text-gray-900">{c.name}</p><p className="text-xs text-gray-500">{c.total} orders</p></div>
                  <div className="text-center"><p className={`text-sm font-black ${successRate >= 80 ? 'text-green-600' : successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{successRate.toFixed(0)}%</p><p className="text-xs text-gray-400">Delivered</p></div>
                  <div className="text-center"><p className={`text-sm font-black ${rtoRate <= 5 ? 'text-green-600' : rtoRate <= 15 ? 'text-yellow-600' : 'text-red-600'}`}>{rtoRate.toFixed(0)}%</p><p className="text-xs text-gray-400">RTO</p></div>
                  <div className="w-24 bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${successRate >= 80 ? 'bg-green-500' : 'bg-orange-500'}`} style={{width:`${successRate}%`}} /></div>
                </div>);
              })}</div>
            ) : <p className="text-sm text-gray-400 text-center py-8">No courier data available</p>}
          </div>
        </div>
      )}

      {/* ═══ COD TAB ═══ */}
      {activeTab === 'cod' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
            <KPI label="Total COD" value={codOrders.length} sub={formatCurrency(codOrders.reduce((s,o)=>s+o.grandTotal,0))} icon={DollarSign} color="text-indigo-600" bg="bg-indigo-50" />
            <KPI label="Pending Recovery" value={codPending.length} sub={formatCurrency(codPendingAmt)} icon={AlertTriangle} color="text-yellow-600" bg="bg-yellow-50" />
            <KPI label="Recovered" value={codPaid.length} sub={formatCurrency(codPaidAmt)} icon={TrendingUp} color="text-green-600" bg="bg-green-50" />
            <KPI label="Recovery Rate" value={codOrders.length > 0 ? `${(codPaid.length/codOrders.length*100).toFixed(0)}%` : '0%'} icon={Activity} color="text-blue-600" bg="bg-blue-50" />
            <KPI label="Pending Amount" value={formatCurrency(codPendingAmt)} icon={DollarSign} color="text-orange-600" bg="bg-orange-50" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-3">COD Recovery Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={[{name:'Recovered',value:codPaidAmt,color:'#10b981'},{name:'Pending',value:codPendingAmt,color:'#f59e0b'}].filter(d=>d.value>0)} cx="50%" cy="50%" outerRadius={80} innerRadius={50} dataKey="value" paddingAngle={3}>
                  <Cell fill="#10b981" /><Cell fill="#f59e0b" />
                </Pie><Tooltip formatter={fmtTip} /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Recovery Summary</h3>
              <div className="space-y-4 mt-4">
                <div><div className="flex justify-between text-xs text-gray-500 mb-1"><span>Total COD Amount</span><span className="font-bold text-gray-900">{formatCurrency(codPendingAmt + codPaidAmt)}</span></div></div>
                <div><div className="flex justify-between text-xs mb-1"><span className="text-green-600 font-medium">Recovered</span><span className="font-bold text-green-700">{formatCurrency(codPaidAmt)}</span></div><div className="w-full bg-green-100 rounded-full h-2.5"><div className="bg-green-500 h-2.5 rounded-full" style={{width:`${(codPaidAmt/(codPaidAmt+codPendingAmt||1))*100}%`}} /></div></div>
                <div><div className="flex justify-between text-xs mb-1"><span className="text-yellow-600 font-medium">Pending</span><span className="font-bold text-yellow-700">{formatCurrency(codPendingAmt)}</span></div><div className="w-full bg-yellow-100 rounded-full h-2.5"><div className="bg-yellow-500 h-2.5 rounded-full" style={{width:`${(codPendingAmt/(codPaidAmt+codPendingAmt||1))*100}%`}} /></div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FINANCE TAB ═══ */}
      {activeTab === 'finance' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            <KPI label="Revenue" value={formatCurrency(totalSales)} icon={ShoppingBag} color="text-green-600" bg="bg-green-50" trend={12} />
            <KPI label="COGS" value={formatCurrency(totalPurchases)} icon={ShoppingCart} color="text-blue-600" bg="bg-blue-50" />
            <KPI label="Gross Profit" value={formatCurrency(grossProfit)} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
            <KPI label="Expenses" value={formatCurrency(totalExpenses)} icon={DollarSign} color="text-orange-600" bg="bg-orange-50" />
            <KPI label="Net Profit" value={formatCurrency(netProfit)} icon={TrendingUp} color={netProfit>=0?'text-green-600':'text-red-600'} bg={netProfit>=0?'bg-green-50':'bg-red-50'} trend={netProfit>=0?15:-5} />
            <KPI label="Profit Margin" value={totalSales > 0 ? `${(netProfit/totalSales*100).toFixed(1)}%` : '0%'} icon={Activity} color="text-purple-600" bg="bg-purple-50" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Profit & Loss Trend</h3>
              <ResponsiveContainer width="100%" height={220}><BarChart data={monthlyData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
                <Tooltip formatter={fmtTip} /><Bar dataKey="sales" fill="#6366f1" radius={[4,4,0,0]} name="Revenue" /><Bar dataKey="purchases" fill="#e0e7ff" radius={[4,4,0,0]} name="Cost" /><Bar dataKey="profit" fill="#10b981" radius={[4,4,0,0]} name="Profit" />
              </BarChart></ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Financial Summary</h3>
              <div className="space-y-3 mt-2">
                {[
                  { label: 'Total Revenue', value: formatCurrency(totalSales), color: 'text-green-700', bg: 'bg-green-50' },
                  { label: 'Cost of Goods', value: formatCurrency(totalPurchases), color: 'text-blue-700', bg: 'bg-blue-50' },
                  { label: 'Gross Profit', value: formatCurrency(grossProfit), color: 'text-emerald-700', bg: 'bg-emerald-50' },
                  { label: 'Operating Expenses', value: formatCurrency(totalExpenses), color: 'text-orange-700', bg: 'bg-orange-50' },
                  { label: 'Net Profit', value: formatCurrency(netProfit), color: netProfit>=0?'text-green-800':'text-red-800', bg: netProfit>=0?'bg-green-100':'bg-red-100' },
                ].map(r => (
                  <div key={r.label} className={`flex items-center justify-between ${r.bg} rounded-xl px-4 py-2.5`}>
                    <span className="text-sm font-medium text-gray-700">{r.label}</span>
                    <span className={`text-sm font-black ${r.color}`}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

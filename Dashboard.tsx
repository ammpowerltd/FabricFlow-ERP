import { dashboardStats } from '../data/mockData';
import {
  TrendingUp, DollarSign, ShoppingCart, Package,
  Factory, Truck, CreditCard, AlertTriangle, ArrowUpRight,
  ArrowDownRight, Clock, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function StatCard({ title, value, change, icon: Icon, color, onClick }: any) {
  const isPositive = change >= 0;
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {typeof value === 'number' ? `₹${(value / 1000).toFixed(1)}K` : value}
          </p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(change)}% vs prev</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const stats = dashboardStats;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          change={stats.revenueGrowth}
          icon={DollarSign}
          color="bg-gradient-to-r from-indigo-500 to-purple-500"
        />
        <StatCard
          title="Gross Profit"
          value={stats.grossProfit}
          change={stats.profitGrowth}
          icon={TrendingUp}
          color="bg-gradient-to-r from-green-500 to-emerald-500"
        />
        <StatCard
          title="Net Profit"
          value={stats.netProfit}
          change={8.3}
          icon={DollarSign}
          color="bg-gradient-to-r from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.ordersCount.toLocaleString()}
          change={stats.ordersGrowth}
          icon={ShoppingCart}
          color="bg-gradient-to-r from-amber-500 to-orange-500"
        />
      </div>

      {/* Sales Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Channel */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Sales by Channel</h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Quarter</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.channelSales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: any) => [`₹${(Number(value) / 1000).toFixed(1)}K`, 'Amount']} />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Trend */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: any) => [`₹${(Number(value) / 1000).toFixed(1)}K`, '']} />
              <Legend />
              <Line type="monotone" dataKey="b2b" stroke="#6366f1" strokeWidth={2} name="B2B" />
              <Line type="monotone" dataKey="b2c" stroke="#10b981" strokeWidth={2} name="B2C" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Top 10 Selling Products</h3>
          <button className="text-sm text-indigo-600 hover:underline font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">SKU</th>
                <th className="pb-3 font-medium">Product Name</th>
                <th className="pb-3 font-medium text-right">Quantity Sold</th>
                <th className="pb-3 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.slice(0, 5).map((product, index) => (
                <tr key={product.sku} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 text-gray-500">{index + 1}</td>
                  <td className="py-3 font-mono text-sm text-indigo-600">{product.sku}</td>
                  <td className="py-3 font-medium text-gray-800">{product.name}</td>
                  <td className="py-3 text-right">{product.quantity}</td>
                  <td className="py-3 text-right font-medium">₹{product.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Middle Row - Inventory, Production, Logistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Inventory */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Inventory Overview</h3>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Stock Value</span>
              <span className="font-semibold">₹{(stats.inventoryStats.totalValue / 1000).toFixed(1)}K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Raw Materials</span>
              <span className="font-medium text-blue-600">₹{(stats.inventoryStats.rawMaterialValue / 1000).toFixed(1)}K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Finished Goods</span>
              <span className="font-medium text-green-600">₹{(stats.inventoryStats.finishedGoodsValue / 1000).toFixed(1)}K</span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">{stats.inventoryStats.lowStockItems} Items Below Reorder Level</span>
              </div>
            </div>
          </div>
        </div>

        {/* Production */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Production Status</h3>
            <Factory className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.productionStats.inProcess}</p>
              <p className="text-xs text-blue-600">In Process</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.productionStats.completed}</p>
              <p className="text-xs text-green-600">Completed</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{stats.productionStats.pending}</p>
              <p className="text-xs text-amber-600">Pending</p>
            </div>
          </div>
          {stats.productionStats.delayedJobs > 0 && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{stats.productionStats.delayedJobs} Delayed Job(s)</span>
            </div>
          )}
        </div>

        {/* Logistics */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Order Status</h3>
            <Truck className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Delivered', value: stats.logisticsStats.delivered },
                  { name: 'In Transit', value: stats.logisticsStats.inTransit },
                  { name: 'RTO', value: stats.logisticsStats.rto },
                  { name: 'Pending', value: stats.logisticsStats.pending },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                dataKey="value"
              >
                {COLORS.slice(0, 4).map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Orders']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Delivered: {stats.logisticsStats.delivered}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>In Transit: {stats.logisticsStats.inTransit}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>RTO: {stats.logisticsStats.rto}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Pending: {stats.logisticsStats.pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* COD & Finance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COD Recovery */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">COD Recovery</h3>
            <CreditCard className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Collection Progress</span>
              <span className="font-medium">{((stats.codStats.collected / stats.codStats.totalCOD) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                style={{ width: `${(stats.codStats.collected / stats.codStats.totalCOD) * 100}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-bold text-green-600">₹{(stats.codStats.collected / 1000).toFixed(0)}K</p>
              <p className="text-xs text-green-600">Collected</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-lg font-bold text-amber-600">₹{(stats.codStats.pending / 1000).toFixed(0)}K</p>
              <p className="text-xs text-amber-600">Pending</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-lg font-bold text-red-600">₹{(stats.codStats.overdue / 1000).toFixed(0)}K</p>
              <p className="text-xs text-red-600">Overdue</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Aggregator Settlement</h4>
            {stats.codStats.aggregatorSettlement.map((agg) => (
              <div key={agg.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{agg.name}</span>
                <span className="text-amber-600 font-medium">₹{(agg.pending / 1000).toFixed(1)}K pending</span>
              </div>
            ))}
          </div>
        </div>

        {/* Finance Summary */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Financial Summary</h3>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
              <p className="text-sm opacity-90">Cash in Hand</p>
              <p className="text-2xl font-bold mt-1">₹{(stats.financeStats.cashBalance / 1000).toFixed(0)}K</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white">
              <p className="text-sm opacity-90">Bank Balance</p>
              <p className="text-2xl font-bold mt-1">₹{(stats.financeStats.bankBalance / 1000).toFixed(0)}K</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Total Receivables</p>
                <p className="text-lg font-bold text-green-600">₹{(stats.financeStats.totalReceivables / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Total Payables</p>
                <p className="text-lg font-bold text-red-600">₹{(stats.financeStats.totalPayables / 1000).toFixed(0)}K</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-800">GST Payable</span>
                <span className="font-bold text-amber-700">₹{(stats.financeStats.gstPayable / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors">
            <ShoppingCart className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">New Sale</span>
          </button>
          <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors">
            <Package className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Stock Entry</span>
          </button>
          <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors">
            <Factory className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">New Job Work</span>
          </button>
          <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors">
            <RefreshCw className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Bulk Upload</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { orders } from '../data/mockData';
import {
  Search, Download, Eye, Truck, Package,
  ShoppingBag, XCircle,
  RefreshCw, ExternalLink, Printer
} from 'lucide-react';

const platformColors: Record<string, string> = {
  Shopify: 'bg-green-100 text-green-700',
  Amazon: 'bg-orange-100 text-orange-700',
  Flipkart: 'bg-blue-100 text-blue-700',
};

const statusColors: Record<string, string> = {
  'Delivered': 'bg-green-100 text-green-700',
  'In Transit': 'bg-blue-100 text-blue-700',
  'Pending Dispatch': 'bg-amber-100 text-amber-700',
  'RTO': 'bg-red-100 text-red-700',
  'Cancelled': 'bg-gray-100 text-gray-700',
};

export default function SalesB2C() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const filterOptions = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status.includes('Pending')).length },
    { id: 'transit', label: 'In Transit', count: orders.filter(o => o.status === 'In Transit').length },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length },
    { id: 'rto', label: 'RTO', count: orders.filter(o => o.status === 'RTO').length },
    { id: 'cod', label: 'COD', count: orders.filter(o => o.paymentType === 'COD').length },
  ];

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : activeFilter === 'pending' 
      ? orders.filter(o => o.status.includes('Pending'))
      : activeFilter === 'transit'
        ? orders.filter(o => o.status === 'In Transit')
        : activeFilter === 'delivered'
          ? orders.filter(o => o.status === 'Delivered')
          : activeFilter === 'rto'
            ? orders.filter(o => o.status === 'RTO')
            : orders.filter(o => o.paymentType === 'COD');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">B2C E-Commerce</h1>
          <p className="text-gray-500 text-sm mt-1">Manage orders from Shopify, Amazon, Flipkart and other platforms</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <RefreshCw className="w-4 h-4" />
            Sync Orders
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Platform Integration Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: 'Shopify', orders: 385, revenue: 320000, icon: '🛒', color: 'from-green-500 to-emerald-500' },
          { name: 'Amazon', orders: 290, revenue: 125000, icon: '📦', color: 'from-orange-500 to-amber-500' },
          { name: 'Flipkart', orders: 525, revenue: 55000, icon: '🏷️', color: 'from-blue-500 to-cyan-500' },
        ].map((platform) => (
          <div key={platform.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 card-hover cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${platform.color} rounded-xl flex items-center justify-center text-2xl`}>
                {platform.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{platform.name}</h3>
                <p className="text-sm text-gray-500">{platform.orders} orders this month</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="font-semibold">₹{(platform.revenue / 1000).toFixed(0)}K</p>
              </div>
              <button className="text-sm text-indigo-600 hover:underline font-medium">View Orders</button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-wrap gap-2 mb-3">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                  <span className="ml-1">{filter.count}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order No, AWB, Customer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 bg-gray-50">
                  <th className="px-4 py-3 font-medium">Order No</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-center">Type</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedOrder?.id === order.id ? 'bg-indigo-50' : ''}`}
                  >
                    <td className="px-4 py-3 font-mono text-sm text-indigo-600">{order.orderNo}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${platformColors[order.platform!] || 'bg-gray-100 text-gray-700'}`}>
                        {order.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerMobile}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">₹{order.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        order.paymentType === 'COD' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {order.paymentType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.awbNo && (
                          <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Track">
                            <Truck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {selectedOrder ? (
            <div>
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Order Details</h3>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <p className="font-mono text-indigo-600 mt-1">{selectedOrder.orderNo}</p>
              </div>

              <div className="p-4 space-y-4">
                {/* Status */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Platform & Payment */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Platform</p>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${platformColors[selectedOrder.platform]}`}>
                      {selectedOrder.platform}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment</p>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      selectedOrder.paymentType === 'COD' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedOrder.paymentType}
                    </span>
                  </div>
                </div>

                {/* Customer */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Customer</p>
                  <p className="font-medium text-gray-800">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customerMobile}</p>
                </div>

                {/* Items */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Items ({selectedOrder.items.length})</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.itemName}</p>
                          <p className="text-xs text-gray-500">Qty: {item.qty} × ₹{item.rate}</p>
                        </div>
                        <p className="text-sm font-medium">₹{item.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 pt-2 border-t border-gray-200">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-indigo-600">₹{selectedOrder.amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Shipping */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Shipping</p>
                  <div className="text-sm">
                    <p>{selectedOrder.shippingAddress.addressLine1}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                  </div>
                </div>

                {/* Tracking */}
                {selectedOrder.awbNo && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Tracking</p>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">{selectedOrder.courierName}</p>
                      <p className="text-xs font-mono text-blue-600">{selectedOrder.awbNo}</p>
                      {selectedOrder.trackingUrl && (
                        <a href={selectedOrder.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                          Track Shipment <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Timeline</p>
                  <div className="space-y-3">
                    {selectedOrder.timeline.slice().reverse().map((event: any, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        <div className="relative">
                          <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                          {idx < selectedOrder.timeline.length - 1 && (
                            <div className="absolute left-1.5 top-3 w-0.5 h-full bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{event.status}</p>
                          <p className="text-xs text-gray-500">{event.timestamp}</p>
                          {event.remarks && <p className="text-xs text-gray-500 italic">{event.remarks}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
                    <Truck className="w-4 h-4" />
                    Update Status
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Printer className="w-4 h-4" />
                      Print Label
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Package className="w-4 h-4" />
                      Packing Slip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Select an Order</h3>
              <p className="text-gray-500">Click on any order to view its details and timeline</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

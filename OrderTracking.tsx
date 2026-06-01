import { useState } from 'react';
import { orders } from '../data/mockData';
import {
  Search, Truck, Package, MapPin, CheckCircle,
  XCircle, ExternalLink, Download, RefreshCw
} from 'lucide-react';

const statusSteps = [
  { key: 'Order Placed', icon: Package },
  { key: 'Confirmed', icon: CheckCircle },
  { key: 'Packed', icon: Package },
  { key: 'Dispatched', icon: Truck },
  { key: 'In Transit', icon: Truck },
  { key: 'Out for Delivery', icon: MapPin },
  { key: 'Delivered', icon: CheckCircle },
];

export default function OrderTracking() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.awbNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerMobile.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || order.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const statusColors: Record<string, string> = {
    'Delivered': 'bg-green-100 text-green-700 border-green-300',
    'In Transit': 'bg-blue-100 text-blue-700 border-blue-300',
    'Pending Dispatch': 'bg-amber-100 text-amber-700 border-amber-300',
    'RTO': 'bg-red-100 text-red-700 border-red-300',
    'Cancelled': 'bg-gray-100 text-gray-700 border-gray-300',
    'Out for Delivery': 'bg-purple-100 text-purple-700 border-purple-300',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Tracking</h1>
          <p className="text-gray-500 text-sm mt-1">Track orders across all channels with real-time updates</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
          <p className="text-sm text-green-600">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'Delivered').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
          <p className="text-sm text-blue-600">In Transit</p>
          <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'In Transit').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
          <p className="text-sm text-amber-600">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{orders.filter(o => o.status.includes('Pending')).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
          <p className="text-sm text-red-600">RTO</p>
          <p className="text-2xl font-bold text-red-600">{orders.filter(o => o.status === 'RTO').length}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order No, AWB, or Customer Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="Delivered">Delivered</option>
            <option value="In Transit">In Transit</option>
            <option value="Pending Dispatch">Pending Dispatch</option>
            <option value="RTO">RTO</option>
          </select>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Platforms</option>
            <option value="Shopify">Shopify</option>
            <option value="Amazon">Amazon</option>
            <option value="Flipkart">Flipkart</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            onClick={() => setSelectedOrder(order)}
            className={`bg-white rounded-xl shadow-sm border-2 p-4 cursor-pointer transition-all ${
              selectedOrder?.id === order.id ? 'border-indigo-500' : 'border-gray-100 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">{order.orderNo}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                    statusColors[order.status] || 'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{order.platform} • {order.paymentType}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">₹{order.amount.toLocaleString()}</p>
                {order.paymentType === 'COD' && (
                  <p className="text-xs text-amber-600">COD: ₹{order.codAmount}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span>{order.customerName}</span>
              <span>{order.customerMobile}</span>
            </div>

            {order.awbNo && (
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{order.courierName}</span>
                <span className="font-mono text-indigo-600">{order.awbNo}</span>
                {order.trackingUrl && (
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                  </a>
                )}
              </div>
            )}

            {/* Progress Bar */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                {statusSteps.slice(0, 5).map((step, idx) => {
                  const isCompleted = statusSteps.findIndex(s => s.key === order.status) >= idx;
                  return (
                    <div key={step.key} className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">{idx + 1}</span>}
                      </div>
                      {idx < 4 && (
                        <div className={`w-8 h-1 ${isCompleted ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{selectedOrder.orderNo}</h2>
                  <p className="text-gray-500">{selectedOrder.platform} • {selectedOrder.createdAt}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              {/* Status Timeline */}
              <div>
                <h3 className="font-medium text-gray-800 mb-4">Order Timeline</h3>
                <div className="relative">
                  {selectedOrder.timeline.map((event: any, idx: number) => (
                    <div key={idx} className="flex gap-4 pb-4">
                      <div className="relative">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          idx === 0 ? 'bg-indigo-600' : 'bg-gray-300'
                        }`} />
                        {idx < selectedOrder.timeline.length - 1 && (
                          <div className="absolute left-1.5 top-4 w-0.5 h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800">{event.status}</p>
                          <span className="text-sm text-gray-500">{event.timestamp}</span>
                        </div>
                        {event.location && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {event.location}
                          </p>
                        )}
                        {event.remarks && (
                          <p className="text-sm text-gray-500 italic mt-1">{event.remarks}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Items Ordered</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{item.itemName}</p>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.qty} × ₹{item.rate}</p>
                        <p className="text-sm text-gray-500">₹{item.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Shipping Address</h3>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p className="font-medium">{selectedOrder.customerName}</p>
                  <p>{selectedOrder.shippingAddress.addressLine1}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                Close
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

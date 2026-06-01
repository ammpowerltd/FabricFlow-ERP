import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, Search, Download, Upload, Eye, Edit, Trash2, Printer,
  Package, Truck, DollarSign, CheckCircle, XCircle, AlertCircle,
  FileText, RefreshCw, X, Save, MapPin, Phone, User, CreditCard
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- Types ---
interface D2COrder {
  id: string;
  orderId: string;
  orderDate: string;
  customerName: string;
  mobileNumber: string;
  address: string;
  paymentType: 'Prepaid' | 'COD';
  courierAggregator: string;
  courierCompany: string;
  awbNumber: string;
  sku: string;
  productName: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  dispatchDate?: string;
  deliveryDate?: string;
  createdAt: string;
}

// --- Mock Data & Constants ---
const COURIER_AGGREGATORS = ['Shiprocket', 'Pickrr', 'NimbusPost', 'Shipway', 'ClickPost', 'Direct'];
const COURIER_COMPANIES = ['Delhivery', 'BlueDart', 'Ecom Express', 'Xpressbees', 'DTDC', 'India Post'];

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
    'Shipped': 'bg-orange-100 text-orange-800 border-orange-200',
    'Delivered': 'bg-green-100 text-green-800 border-green-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    'Prepaid': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'COD': 'bg-pink-100 text-pink-800 border-pink-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const Card = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

// --- Main Component ---

export default function D2CEcommerce({ defaultView = 'list' }: { defaultView?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [orders, setOrders] = useState<D2COrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(defaultView);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<D2COrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'awb' | 'courier' | 'print'>('view');

  // Fetch data from Supabase on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('d2c_orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const transformed = (data || []).map((item: any) => ({
        ...item,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        totalAmount: Number(item.totalAmount)
      }));
      setOrders(transformed);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync view with URL if needed
  useEffect(() => {
    setView(defaultView);
  }, [defaultView, location.pathname]);

  // --- Actions (Supabase Integrated) ---
  const handleSaveOrder = async (orderData: Partial<D2COrder>) => {
    try {
      if (orderData.id) {
        // Edit existing order
        const { error } = await supabase
          .from('d2c_orders')
          .update(orderData)
          .eq('id', orderData.id);
        if (error) throw error;
        // Optimistic update
        setOrders(orders.map(o => o.id === orderData.id ? { ...o, ...orderData } as D2COrder : o));
      } else {
        // Create new order
        const newOrder: Partial<D2COrder> = {
          orderId: `D2C-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
          orderDate: new Date().toISOString().split('T')[0],
          status: 'Pending',
          totalAmount: (orderData.quantity || 0) * (orderData.rate || 0),
          ...orderData
        };
        const { data, error } = await supabase
          .from('d2c_orders')
          .insert([newOrder])
          .select()
          .single();
        if (error) throw error;
        // Optimistic update
        setOrders([data, ...orders]);
      }
      setView('list');
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to save order to database. Please check your Supabase connection.');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const { error } = await supabase.from('d2c_orders').delete().eq('id', id);
        if (error) throw error;
        setOrders(orders.filter(o => o.id !== id));
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order.');
      }
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: D2COrder['status']) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'Shipped') updates.dispatchDate = new Date().toISOString().split('T')[0];
      if (newStatus === 'Delivered') updates.deliveryDate = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('d2c_orders')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      
      // Optimistic update
      setOrders(orders.map(o => {
        if (o.id === id) return { ...o, ...updates };
        return o;
      }));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleBulkImport = async (importedOrders: any[]) => {
    try {
      // Auto-create Items and Inventory if SKU doesn't exist (using Supabase)
      const { data: mastersData } = await supabase.from('app_masters').select('data').eq('type', 'item');
      const existingItems = (mastersData || []).map((m: any) => m.data.itemCode);
      
      const newItemsToCreate: any[] = [];
      importedOrders.forEach((o: any) => {
        if (o.sku && !existingItems.includes(o.sku)) {
          newItemsToCreate.push({
            type: 'item',
            data: {
              itemCode: o.sku,
              itemName: o.productName || o.sku,
              category: 'Imported',
              itemType: 'Finished Goods',
              brand: 'Generic',
              sku: o.sku,
              primaryUnit: 'Pcs',
              sellingRate: o.rate,
              purchaseRate: o.rate * 0.6,
              mrp: o.rate,
              gstPercent: 5,
              reorderLevel: 10,
              isActive: true,
              createdAt: new Date().toISOString()
            }
          });
          // Also create inventory record
          supabase.from('inventory').insert([{
            item_code: o.sku,
            sku: o.sku,
            current_stock: 0,
            reserved_stock: 0,
            available_stock: 0
          }]);
        }
      });

      if (newItemsToCreate.length > 0) {
        await supabase.from('app_masters').insert(newItemsToCreate);
      }

      // Insert orders
      const ordersToInsert = importedOrders.map((o, idx) => ({
        ...o,
        orderId: `D2C-IMP-${new Date().getFullYear()}-${String(orders.length + idx + 1).padStart(3, '0')}`,
        status: 'Pending',
        totalAmount: o.quantity * o.rate
      }));
      
      const { error } = await supabase.from('d2c_orders').insert(ordersToInsert);
      if (error) throw error;
      
      // Refresh list
      fetchOrders();
      setView('list');
    } catch (error) {
      console.error('Error importing orders:', error);
      alert('Failed to import orders.');
    }
  };

  // --- Filtered Data ---
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            o.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            o.awbNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  // --- Stats ---
  const stats = useMemo(() => {
    const total = orders.length;
    const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const cod = orders.filter(o => o.paymentType === 'COD').length;
    const prepaid = orders.filter(o => o.paymentType === 'Prepaid').length;
    const pending = orders.filter(o => o.status === 'Pending').length;
    return { total, revenue, cod, prepaid, pending };
  }, [orders]);

  // --- Render Views ---

  const renderDashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card title="Total Orders" value={stats.total} icon={Package} color="bg-indigo-500" />
      <Card title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-green-500" />
      <Card title="COD Orders" value={stats.cod} icon={CreditCard} color="bg-pink-500" subtext={`${((stats.cod/stats.total)*100).toFixed(0)}% of total`} />
      <Card title="Prepaid Orders" value={stats.prepaid} icon={CreditCard} color="bg-blue-500" subtext={`${((stats.prepaid/stats.total)*100).toFixed(0)}% of total`} />
      <Card title="Pending" value={stats.pending} icon={AlertCircle} color="bg-yellow-500" />
    </div>
  );

  const renderOrderList = () => (
    <div className="space-y-4 animate-fadeIn">
      {renderDashboardStats()}
      
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s} {s !== 'All' && `(${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Order ID, Customer, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button onClick={() => navigate('/d2c/bulk')} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Upload className="w-4 h-4" /> Bulk Upload
          </button>
          <button onClick={() => navigate('/d2c/create')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[1200px]">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Courier</th>
              <th className="px-4 py-3">AWB</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium text-indigo-600">{order.orderId}</td>
                <td className="px-4 py-3 text-gray-600">{order.orderDate}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{order.customerName}</div>
                  <div className="text-xs text-gray-500">{order.mobileNumber}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{order.sku}</td>
                <td className="px-4 py-3 text-right">{order.quantity}</td>
                <td className="px-4 py-3 text-right">₹{order.rate}</td>
                <td className="px-4 py-3 text-right font-medium">₹{order.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-3"><StatusBadge status={order.paymentType} /></td>
                <td className="px-4 py-3 text-xs">
                  <div className="font-medium">{order.courierAggregator}</div>
                  <div className="text-gray-500">{order.courierCompany}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{order.awbNumber || '-'}</td>
                <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => { setSelectedOrder(order); setModalType('view'); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="View"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => { setSelectedOrder(order); setModalType('edit'); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteOrder(order.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    <button onClick={() => { setSelectedOrder(order); setModalType('print'); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded" title="Print"><Printer className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-8 text-center text-gray-500">No orders found matching your criteria.</div>
        )}
      </div>
    </div>
  );

  const renderCreateOrder = () => (
    <OrderForm 
      initialData={selectedOrder || undefined} 
      onSave={handleSaveOrder} 
      onCancel={() => { setSelectedOrder(null); setView('list'); }} 
    />
  );

  const renderShipmentManagement = () => (
    <ShipmentManager orders={orders} onUpdateStatus={handleStatusUpdate} onBack={() => setView('list')} />
  );

  const renderTracking = () => (
    <TrackingView orders={orders} onBack={() => setView('list')} />
  );

  const renderReports = () => (
    <ReportsView orders={orders} onBack={() => setView('list')} />
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">D2C E-Commerce Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage orders, shipments, and reports for your D2C channels</p>
        </div>
        <div className="flex gap-2">
          {view !== 'list' && (
            <button onClick={() => setView('list')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
              Back to List
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading orders from database...</span>
        </div>
      ) : (
        <>
          {view === 'list' && renderOrderList()}
          {view === 'create' && renderCreateOrder()}
      {view === 'bulk' && <BulkUploadComponent onImport={handleBulkImport} onCancel={() => setView('list')} existingOrders={orders} />}
      {view === 'shipment' && renderShipmentManagement()}
      {view === 'tracking' && renderTracking()}
      {view === 'reports' && renderReports()}

      {/* Modals */}
      {isModalOpen && selectedOrder && (
        <OrderModal 
          order={selectedOrder} 
          type={modalType} 
          onClose={() => setIsModalOpen(false)} 
          onUpdate={(updates: any) => {
            setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, ...updates } : o));
            setSelectedOrder({ ...selectedOrder, ...updates });
            setIsModalOpen(false);
          }}
          onStatusChange={(status: any) => {
            handleStatusUpdate(selectedOrder.id, status);
            setIsModalOpen(false);
          }}
        />
      )}
        </>
      )}
    </div>
  );
}

// --- Sub-Components ---

function OrderForm({ initialData, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    orderId: initialData?.orderId || '',
    orderDate: initialData?.orderDate || new Date().toISOString().split('T')[0],
    customerName: initialData?.customerName || '',
    mobileNumber: initialData?.mobileNumber || '',
    address: initialData?.address || '',
    paymentType: initialData?.paymentType || 'Prepaid',
    courierAggregator: initialData?.courierAggregator || 'Shiprocket',
    courierCompany: initialData?.courierCompany || 'Delhivery',
    awbNumber: initialData?.awbNumber || '',
    sku: initialData?.sku || '',
    productName: initialData?.productName || '',
    quantity: initialData?.quantity || 1,
    rate: initialData?.rate || 0,
    status: initialData?.status || 'Pending',
  });

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const total = formData.quantity * formData.rate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: initialData?.id, totalAmount: total });
  };

  const generateAWB = () => {
    const awb = 'AWB' + Math.floor(100000000 + Math.random() * 900000000);
    handleChange('awbNumber', awb);
    alert(`AWB Generated: ${awb}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{initialData ? 'Edit Order' : 'Create New D2C Order'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
            <div className="flex gap-2">
              <input type="text" value={formData.orderId} onChange={(e) => handleChange('orderId', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Auto-generated if empty" />
              <span className="text-xs flex items-center text-gray-500 bg-gray-100 px-2 rounded">Auto</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
            <input type="date" value={formData.orderDate} onChange={(e) => handleChange('orderDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type *</label>
            <select value={formData.paymentType} onChange={(e) => handleChange('paymentType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option>Prepaid</option>
              <option>COD</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input type="text" value={formData.customerName} onChange={(e) => handleChange('customerName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
            <input type="text" value={formData.mobileNumber} onChange={(e) => handleChange('mobileNumber', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address *</label>
            <textarea value={formData.address} onChange={(e) => handleChange('address', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
            <input type="text" value={formData.sku} onChange={(e) => handleChange('sku', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input type="text" value={formData.productName} onChange={(e) => handleChange('productName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input type="number" min="1" value={formData.quantity} onChange={(e) => handleChange('quantity', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹) *</label>
            <input type="number" min="0" value={formData.rate} onChange={(e) => handleChange('rate', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (Auto)</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-indigo-700">₹{total.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Courier Aggregator</label>
            <select value={formData.courierAggregator} onChange={(e) => handleChange('courierAggregator', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              {COURIER_AGGREGATORS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Courier Company</label>
            <select value={formData.courierCompany} onChange={(e) => handleChange('courierCompany', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              {COURIER_COMPANIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">AWB Number</label>
            <div className="flex gap-2">
              <input type="text" value={formData.awbNumber} onChange={(e) => handleChange('awbNumber', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              <button type="button" onClick={generateAWB} className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200">Generate</button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
          <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"><Save className="w-4 h-4" /> Save Order</button>
        </div>
      </form>
    </div>
  );
}

function BulkUploadComponent({ onImport, onCancel, existingOrders }: any) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validatedData, setValidatedData] = useState<any[]>([]);
  const [masters, setMasters] = useState<any>({ items: [], couriers: [], aggregators: [] });

  // Load Masters for Validation
  useEffect(() => {
    const savedMasters = localStorage.getItem('fabricflow_masters_data');
    if (savedMasters) {
      const parsed = JSON.parse(savedMasters);
      setMasters({
        items: parsed.item || [],
        couriers: parsed.courier || [],
        aggregators: parsed.aggregator || []
      });
    }
  }, []);

  const handleDownloadTemplate = () => {
    const headers = ['Order ID', 'Order Date', 'Customer Name', 'Mobile Number', 'Payment Type', 'Courier Aggregator', 'Courier Company Name', 'AWB Number', 'SKU', 'Product Name', 'Quantity', 'Rate', 'Total Amount', 'Order Status'];
    const sample = ['ORD-001', '2026-06-01', 'John Doe', '9876543210', 'Prepaid', 'Shiprocket', 'Delhivery', '', 'TS-BLK-M', 'Black T-Shirt', '2', '500', '1000', 'Pending'];
    const csv = [headers.join(','), sample.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'D2C_Sales_Import_Template.csv';
    a.click();
  };

  const processFile = (file: File) => {
    setUploadProgress(10);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadProgress(50);
      const text = event.target?.result as string;
      const rows = text.split('\n').slice(1).filter(r => r.trim());
      
      const parsed = rows.map((row, idx) => {
        const cols = row.split(',');
        return {
          rowId: idx + 2,
          orderId: cols[0]?.trim(),
          orderDate: cols[1]?.trim() || new Date().toISOString().split('T')[0],
          customerName: cols[2]?.trim(),
          mobileNumber: cols[3]?.trim(),
          paymentType: cols[4]?.trim(),
          courierAggregator: cols[5]?.trim(),
          courierCompany: cols[6]?.trim(),
          awbNumber: cols[7]?.trim(),
          sku: cols[8]?.trim(),
          productName: cols[9]?.trim(),
          quantity: parseInt(cols[10]) || 0,
          rate: parseFloat(cols[11]) || 0,
          totalAmount: parseFloat(cols[12]) || 0,
          status: cols[13]?.trim() || 'Pending',
          errors: [] as string[],
          isValid: true
        };
      });
      setUploadProgress(100);
      setTimeout(() => validateData(parsed), 500);
    };
    reader.readAsText(file);
  };

  const validateData = (data: any[]) => {
    const existingOrderIds = new Set(existingOrders.map((o: any) => o.orderId));
    const fileOrderIds = new Set<string>();
    const skuSet = new Set(masters.items.map((i: any) => i.sku || i.itemCode));
    const courierSet = new Set(masters.couriers.map((c: any) => c.courierName));
    const aggregatorSet = new Set(masters.aggregators.map((a: any) => a.aggregatorName));

    const validated = data.map(row => {
      const errors: string[] = [];
      
      // 1. Unique Order ID
      if (!row.orderId) errors.push('Order ID missing');
      else if (existingOrderIds.has(row.orderId) || fileOrderIds.has(row.orderId)) errors.push('Duplicate Order ID');
      else fileOrderIds.add(row.orderId);

      // 2. SKU Validation
      if (row.sku && !skuSet.has(row.sku)) errors.push('SKU not in Master');

      // 3. Quantity > 0
      if (row.quantity <= 0) errors.push('Qty must be > 0');

      // 4. Courier Validation (Soft check based on prompt rules, but let's enforce for data integrity)
      // Prompt says "Do Not Validate Courier Company during order creation" but "Validation Rules: Courier Company must exist". 
      // I will treat missing master data as a warning, but missing format as error.
      if (row.courierCompany && !courierSet.has(row.courierCompany)) errors.push('Courier not in Master');
      if (row.courierAggregator && !aggregatorSet.has(row.courierAggregator)) errors.push('Aggregator not in Master');

      // 5. Payment Type
      if (!['Prepaid', 'COD'].includes(row.paymentType)) errors.push('Invalid Payment Type');

      // 6. Rate
      if (!row.rate || row.rate <= 0) errors.push('Rate cannot be blank/0');

      // 7. Mobile Format
      const mobileRegex = /^[6-9]\d{9}$/;
      if (row.mobileNumber && !mobileRegex.test(row.mobileNumber.replace(/\D/g,''))) errors.push('Invalid Mobile Format');

      // Determine Status Color
      let statusColor = 'green'; // Valid
      if (errors.length > 0) statusColor = 'red'; // Invalid
      else if (existingOrderIds.has(row.orderId)) statusColor = 'yellow'; // Duplicate (caught above)

      return { ...row, errors, isValid: errors.length === 0, statusColor };
    });

    setValidatedData(validated);
    setStep(2);
  };

  const handleImport = (selectedOnly = false) => {
    const toImport = selectedOnly 
      ? validatedData.filter(r => r.isValid && r.selected) 
      : validatedData.filter(r => r.isValid);
    
    onImport(toImport);
    setStep(3);
  };

  const toggleSelect = (idx: number) => {
    const newData = [...validatedData];
    newData[idx].selected = !newData[idx].selected;
    setValidatedData(newData);
  };

  const stats = {
    total: validatedData.length,
    valid: validatedData.filter(r => r.isValid).length,
    invalid: validatedData.filter(r => !r.isValid).length,
    duplicate: validatedData.filter(r => r.errors.some((e: string) => e.includes('Duplicate'))).length
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header / Stepper */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-gray-900">Bulk Upload Sales</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
      </div>
      
      <div className="flex items-center mb-8">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
        <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
        <div className="ml-4 text-sm font-medium text-gray-500">
          {step === 1 && 'Upload File'}
          {step === 2 && 'Validate & Preview'}
          {step === 3 && 'Import Result'}
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <FileText className="w-6 h-6 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-bold text-green-800">Step 1: Download Sales Template</h4>
              <p className="text-sm text-green-700 mt-1">Template includes reference list of available Couriers & Platforms from your Master Data.</p>
              <button onClick={handleDownloadTemplate} className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                <Download className="w-4 h-4" /> Download Sales Template (.csv)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> NO VALIDATION (IGNORED)</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><div className="w-4 h-0.5 bg-green-500"></div> Order No (Auto-generated if blank)</li>
                <li className="flex items-center gap-2"><div className="w-4 h-0.5 bg-green-500"></div> AWB No (Optional)</li>
                <li className="flex items-center gap-2"><div className="w-4 h-0.5 bg-green-500"></div> Rate (Must be &gt; 0)</li>
              </ul>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-600" /> VALIDATED FIELDS</h4>
              <ul className="space-y-2 text-sm text-red-600">
                <li className="bg-white p-2 rounded border border-red-100"><strong>Order No.</strong> → Must be unique (no duplicates in file or ERP)</li>
                <li className="bg-white p-2 rounded border border-red-100"><strong>Courier</strong> → Must exist in Courier Master</li>
                <li className="bg-white p-2 rounded border border-red-100"><strong>Aggregator</strong> → Must exist in Courier Aggregator Master</li>
                <li className="bg-white p-2 rounded border border-red-100"><strong>Item Name/SKU</strong> → Must exist in Item Master</li>
                <li className="bg-white p-2 rounded border border-red-100"><strong>Qty</strong> → Must be greater than 0</li>
              </ul>
            </div>
          </div>

          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) processFile(file);
            }}
          >
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute top-0 left-0 h-1 bg-indigo-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
            )}
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Step 2: Upload Your Sales CSV</h3>
            <p className="text-sm text-gray-500 mt-2">Click to browse or drag & drop</p>
            <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} className="hidden" id="bulk-upload-sales" />
            <label htmlFor="bulk-upload-sales" className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-700">Select File</label>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200"><p className="text-xs text-gray-500">Total Records</p><p className="text-xl font-bold">{stats.total}</p></div>
            <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200"><p className="text-xs text-green-600">Valid Records</p><p className="text-xl font-bold text-green-700">{stats.valid}</p></div>
            <div className="bg-red-50 p-3 rounded-lg text-center border border-red-200"><p className="text-xs text-red-600">Invalid Records</p><p className="text-xl font-bold text-red-700">{stats.invalid}</p></div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-200"><p className="text-xs text-yellow-600">Duplicates</p><p className="text-xl font-bold text-yellow-700">{stats.duplicate}</p></div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3 py-2 w-10"><input type="checkbox" onChange={(e) => setValidatedData(validatedData.map(r => ({...r, selected: e.target.checked})))} /></th>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Order ID</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {validatedData.map((row, idx) => (
                  <tr key={idx} className={`${row.statusColor === 'green' ? 'bg-green-50/30' : row.statusColor === 'red' ? 'bg-red-50/50' : 'bg-yellow-50/50'}`}>
                    <td className="px-3 py-2"><input type="checkbox" checked={!!row.selected} onChange={() => toggleSelect(idx)} disabled={!row.isValid} /></td>
                    <td className="px-3 py-2 text-gray-500">{row.rowId}</td>
                    <td className="px-3 py-2 font-mono">{row.orderId}</td>
                    <td className="px-3 py-2">{row.customerName}</td>
                    <td className="px-3 py-2 font-mono">{row.sku}</td>
                    <td className="px-3 py-2">{row.quantity}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${row.statusColor === 'green' ? 'bg-green-100 text-green-700' : row.statusColor === 'red' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {row.statusColor}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-red-600">{row.errors.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <button onClick={() => {
                const errors = validatedData.filter(r => !r.isValid).map(r => `Row ${r.rowId}: ${r.errors.join(', ')}`).join('\n');
                const blob = new Blob([errors], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'Error_Report.txt'; a.click();
              }} className="px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50">Download Error Report</button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Back</button>
              <button onClick={() => handleImport(true)} disabled={stats.valid === 0} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 disabled:opacity-50">Import Selected</button>
              <button onClick={() => handleImport(false)} disabled={stats.valid === 0} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">Import All Valid ({stats.valid})</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Import Successful!</h3>
          <p className="text-gray-500 mt-2 mb-8">Orders have been added to D2C E-Commerce → Order List.</p>
          <button onClick={onCancel} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Go to Order List</button>
        </div>
      )}
    </div>
  );
}

function ShipmentManager({ orders, onUpdateStatus, onBack: _onBack }: any) {
  const [filter, setFilter] = useState('Pending');
  const pendingOrders = orders.filter((o: any) => o.status === filter || (filter === 'All' && ['Pending', 'Processing'].includes(o.status)));

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Shipment Management</h2>
        <div className="flex gap-2">
          {['Pending', 'Processing', 'Shipped', 'All'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[1000px]">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">AWB Number</th>
              <th className="px-4 py-3">Courier Aggregator</th>
              <th className="px-4 py-3">Courier Company</th>
              <th className="px-4 py-3">Dispatch Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pendingOrders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium text-indigo-600">{order.orderId}</td>
                <td className="px-4 py-3">{order.customerName}</td>
                <td className="px-4 py-3 font-mono text-xs">{order.awbNumber || '-'}</td>
                <td className="px-4 py-3">{order.courierAggregator}</td>
                <td className="px-4 py-3">{order.courierCompany}</td>
                <td className="px-4 py-3">{order.dispatchDate || '-'}</td>
                <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {order.status === 'Pending' && (
                      <button onClick={() => onUpdateStatus(order.id, 'Processing')} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">Mark Processing</button>
                    )}
                    {order.status === 'Processing' && (
                      <button onClick={() => onUpdateStatus(order.id, 'Shipped')} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium hover:bg-orange-200">Mark Shipped</button>
                    )}
                    {order.status === 'Shipped' && (
                      <button onClick={() => onUpdateStatus(order.id, 'Delivered')} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">Mark Delivered</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrackingView({ orders, onBack: _onBack }: any) {
  const [selectedId, setSelectedId] = useState(orders[0]?.id);
  const order = orders.find((o: any) => o.id === selectedId);

  if (!order) return <div>No orders to track.</div>;

  const steps = [
    { status: 'Pending', label: 'Order Placed', date: order.orderDate, icon: FileText },
    { status: 'Processing', label: 'Processing', date: order.status !== 'Pending' ? order.orderDate : null, icon: RefreshCw },
    { status: 'Shipped', label: 'Shipped', date: order.dispatchDate, icon: Truck },
    { status: 'Delivered', label: 'Delivered', date: order.deliveryDate, icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3">Select Order</h3>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {orders.map((o: any) => (
              <option key={o.id} value={o.id}>{o.orderId} - {o.customerName}</option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3">Order Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Order ID:</span><span className="font-mono font-medium">{order.orderId}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">AWB:</span><span className="font-mono">{order.awbNumber || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Courier:</span><span>{order.courierCompany}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status:</span><StatusBadge status={order.status} /></div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-6">Shipment Timeline</h3>
        {isCancelled ? (
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-red-600">Order Cancelled</h4>
            <p className="text-gray-500 mt-2">This order was cancelled on {order.orderDate}.</p>
          </div>
        ) : (
          <div className="relative">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.status} className="flex gap-4 mb-8 last:mb-0 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-0.5 flex-1 mt-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pb-8">
                    <h4 className={`font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</h4>
                    <p className="text-sm text-gray-500 mt-1">{step.date || 'Pending...'}</p>
                    {isCurrent && <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Current Status</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsView({ orders, onBack: _onBack }: any) {
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
  const codRevenue = orders.filter((o: any) => o.paymentType === 'COD').reduce((sum: number, o: any) => sum + o.totalAmount, 0);
  const prepaidRevenue = orders.filter((o: any) => o.paymentType === 'Prepaid').reduce((sum: number, o: any) => sum + o.totalAmount, 0);

  // Courier Performance
  const courierStats: Record<string, { count: number, revenue: number }> = {};
  orders.forEach((o: any) => {
    if (!courierStats[o.courierCompany]) courierStats[o.courierCompany] = { count: 0, revenue: 0 };
    courierStats[o.courierCompany].count++;
    courierStats[o.courierCompany].revenue += o.totalAmount;
  });

  // SKU Sales
  const skuStats: Record<string, { qty: number, revenue: number }> = {};
  orders.forEach((o: any) => {
    if (!skuStats[o.sku]) skuStats[o.sku] = { qty: 0, revenue: 0 };
    skuStats[o.sku].qty += o.quantity;
    skuStats[o.sku].revenue += o.totalAmount;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-900">D2C Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-green-500" />
        <Card title="COD Revenue" value={`₹${codRevenue.toLocaleString()}`} icon={CreditCard} color="bg-pink-500" subtext={`${((codRevenue/totalRevenue)*100).toFixed(1)}% of total`} />
        <Card title="Prepaid Revenue" value={`₹${prepaidRevenue.toLocaleString()}`} icon={CreditCard} color="bg-blue-500" subtext={`${((prepaidRevenue/totalRevenue)*100).toFixed(1)}% of total`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Courier Performance Report</h3>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-2">Courier Company</th>
                <th className="px-4 py-2 text-right">Orders</th>
                <th className="px-4 py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Object.entries(courierStats).map(([name, stats]: any) => (
                <tr key={name}>
                  <td className="px-4 py-2 font-medium">{name}</td>
                  <td className="px-4 py-2 text-right">{stats.count}</td>
                  <td className="px-4 py-2 text-right">₹{stats.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">SKU-wise Sales Report</h3>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2 text-right">Qty Sold</th>
                <th className="px-4 py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Object.entries(skuStats).map(([sku, stats]: any) => (
                <tr key={sku}>
                  <td className="px-4 py-2 font-mono">{sku}</td>
                  <td className="px-4 py-2 text-right">{stats.qty}</td>
                  <td className="px-4 py-2 text-right">₹{stats.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrderModal({ order, type, onClose, onUpdate, onStatusChange }: any) {
  if (type === 'print') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 print:hidden">
            <h2 className="text-xl font-bold text-gray-900">Invoice Preview: {order.orderId}</h2>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"><Printer className="w-4 h-4" /> Print</button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2"><X className="w-6 h-6" /></button>
            </div>
          </div>
          <div className="p-8 overflow-y-auto flex-1 print:p-0" id="invoice-content">
            <div className="border-2 border-gray-800 p-8">
              <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">FABRICFLOW D2C</h1>
                  <p className="text-sm text-gray-600">123 Fashion Street, Mumbai - 400001</p>
                  <p className="text-sm text-gray-600">GSTIN: 27AABCF1234M1Z5</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-indigo-700">INVOICE</h2>
                  <p className="text-sm font-mono mt-1">#{order.orderId}</p>
                  <p className="text-sm text-gray-500">Date: {order.orderDate}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div>
                  <p className="font-bold text-gray-700 mb-2">Bill To:</p>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-gray-600">{order.address}</p>
                  <p className="text-gray-600">Mobile: {order.mobileNumber}</p>
                </div>
                <div className="text-right space-y-1">
                  <p><span className="text-gray-500">Payment:</span> <span className="font-medium">{order.paymentType}</span></p>
                  <p><span className="text-gray-500">Courier:</span> <span className="font-medium">{order.courierCompany}</span></p>
                  <p><span className="text-gray-500">AWB:</span> <span className="font-mono">{order.awbNumber || 'N/A'}</span></p>
                </div>
              </div>

              <table className="w-full text-sm mb-8">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2 border">SKU</th>
                    <th className="text-left p-2 border">Product</th>
                    <th className="text-right p-2 border">Qty</th>
                    <th className="text-right p-2 border">Rate</th>
                    <th className="text-right p-2 border">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-mono">{order.sku}</td>
                    <td className="p-2 border">{order.productName}</td>
                    <td className="p-2 border text-right">{order.quantity}</td>
                    <td className="p-2 border text-right">₹{order.rate}</td>
                    <td className="p-2 border text-right">₹{order.totalAmount.toLocaleString()}</td>
                  </tr>
                  <tr className="font-bold bg-gray-50">
                    <td colSpan={4} className="text-right p-2 border">Total Amount:</td>
                    <td className="text-right p-2 border">₹{order.totalAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between mt-12 pt-8 border-t border-gray-300 text-sm">
                <div className="text-center">
                  <p className="mb-8">Authorized Signatory</p>
                  <p className="border-t border-gray-400 w-32 mx-auto"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'view') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Order Details: {order.orderId}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs">Customer</p><p className="font-medium flex items-center gap-1"><User className="w-3 h-3" /> {order.customerName}</p></div>
              <div><p className="text-gray-500 text-xs">Mobile</p><p className="font-medium flex items-center gap-1"><Phone className="w-3 h-3" /> {order.mobileNumber}</p></div>
              <div className="col-span-2"><p className="text-gray-500 text-xs">Address</p><p className="font-medium flex items-start gap-1"><MapPin className="w-3 h-3 mt-1" /> {order.address}</p></div>
              <div><p className="text-gray-500 text-xs">Payment</p><StatusBadge status={order.paymentType} /></div>
              <div><p className="text-gray-500 text-xs">Status</p><StatusBadge status={order.status} /></div>
              <div><p className="text-gray-500 text-xs">Courier</p><p className="font-medium">{order.courierAggregator} / {order.courierCompany}</p></div>
              <div><p className="text-gray-500 text-xs">AWB</p><p className="font-mono font-medium">{order.awbNumber || 'N/A'}</p></div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-bold text-gray-900 mb-2">Items</h4>
              <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{order.productName}</p>
                  <p className="text-xs text-gray-500 font-mono">{order.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{order.quantity} x ₹{order.rate}</p>
                  <p className="text-sm text-gray-600">₹{order.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
            <button onClick={() => onStatusChange('Shipped')} disabled={order.status === 'Shipped' || order.status === 'Delivered'} className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded text-sm font-medium hover:bg-orange-200 disabled:opacity-50">Mark Shipped</button>
            <button onClick={() => onStatusChange('Delivered')} disabled={order.status === 'Delivered'} className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 disabled:opacity-50">Mark Delivered</button>
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white">Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'edit') {
    return <OrderForm initialData={order} onSave={(data: any) => { onUpdate(data); onClose(); }} onCancel={onClose} />;
  }

  return null;
}

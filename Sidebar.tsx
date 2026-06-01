import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse, Factory,
  TrendingUp, Truck, Calculator, FileText, BarChart3,
  Bot, Settings, ChevronDown, ChevronRight, Factory as FactoryIcon,
  ChevronLeft, X, Monitor
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: any;
  path?: string;
  children?: { label: string; path: string }[];
}

const navigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Masters', icon: Package, path: '/masters' },
  { label: 'Purchase', icon: ShoppingCart, path: '/purchase' },
  { label: 'Inventory', icon: Warehouse, path: '/inventory' },
  { label: 'Production', icon: Factory, children: [
    { label: 'New Job Work Out', path: '/production/job-work' },
    { label: 'New Material In', path: '/production/material-in' },
    { label: 'Production Reports', path: '/production/reports' },
  ]},
  { label: 'Sales', icon: TrendingUp, children: [
    { label: 'B2B Wholesale', path: '/sales/b2b' },
    { label: 'B2C E-Commerce', path: '/sales/b2c' },
  ]},
  { label: 'D2C E-Commerce', icon: Monitor, children: [
    { label: 'Order List', path: '/d2c/orders' },
    { label: 'Create Order', path: '/d2c/create' },
    { label: 'Bulk Upload', path: '/d2c/bulk' },
    { label: 'Shipment Mgmt', path: '/d2c/shipment' },
    { label: 'Order Tracking', path: '/d2c/tracking' },
    { label: 'Reports', path: '/d2c/reports' },
  ]},
  { label: 'Order Management', icon: Truck, children: [
    { label: 'Order Tracking', path: '/orders' },
    { label: 'COD Reconciliation', path: '/cod' },
    { label: 'Courier Settlement', path: '/courier-settlement' },
    { label: 'Bulk Excel Upload', path: '/bulk-upload' },
    { label: 'Upload History', path: '/upload-history' },
  ]},
  { label: 'Accounts', icon: Calculator, path: '/accounts' },
  { label: 'GST', icon: FileText, path: '/gst' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'AI Manager', icon: Bot, path: '/ai-manager' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen } = useApp();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Production', 'Sales', 'Order Management']);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (item: NavItem) => {
    if (item.path) return isActive(item.path);
    return item.children?.some(child => isActive(child.path)) || false;
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white z-50 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-slate-700 ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FactoryIcon className="w-6 h-6" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg leading-tight">FabricFlow</h1>
                <p className="text-xs text-slate-400">ERP System</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="py-4 overflow-y-auto h-[calc(100%-4rem)] sidebar-scrollbar">
          <div className={`${sidebarCollapsed ? 'px-2' : 'px-3'} space-y-1`}>
            {navigation.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => !sidebarCollapsed && toggleExpand(item.label)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                        isParentActive(item)
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                          {expandedItems.includes(item.label) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>
                    {!sidebarCollapsed && expandedItems.includes(item.label) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                              isActive(child.path)
                                ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path!}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive(item.path!)
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Collapse button (desktop only) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-slate-700 rounded-full items-center justify-center text-slate-400 hover:bg-slate-600 hover:text-white transition-all"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </>
  );
}

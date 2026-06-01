import { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  LayoutDashboard, Package, ShoppingCart, Factory, ShoppingBag,
  Calculator, BarChart3, Users, Settings, Database, ChevronLeft,
  ChevronRight, ChevronDown, Zap, MapPin, Globe, Briefcase, Banknote
} from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  color: string;
  children?: { id: string; label: string; icon: typeof LayoutDashboard; color: string }[];
};

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-400' },
  { id: 'master', label: 'Master Data', icon: Database, color: 'text-purple-400' },
  { id: 'inventory', label: 'Inventory', icon: Package, color: 'text-cyan-400' },
  { id: 'purchase', label: 'Purchase', icon: ShoppingCart, color: 'text-blue-400' },
  { id: 'production', label: 'Production', icon: Factory, color: 'text-orange-400' },
  {
    id: 'sales-group', label: 'Sales', icon: ShoppingBag, color: 'text-green-400',
    children: [
      { id: 'sales', label: 'Online / B2C', icon: Globe, color: 'text-green-400' },
      { id: 'b2b', label: 'B2B Invoices', icon: Briefcase, color: 'text-emerald-400' },
    ]
  },
  { id: 'track', label: 'Track', icon: MapPin, color: 'text-rose-400' },
  { id: 'cod', label: 'COD Recovery', icon: Banknote, color: 'text-amber-400' },
  { id: 'accounts', label: 'Accounts', icon: Calculator, color: 'text-yellow-400' },
  { id: 'reports', label: 'Reports', icon: BarChart3, color: 'text-pink-400' },
  { id: 'users', label: 'User Management', icon: Users, color: 'text-teal-400' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-400' },
];

export default function Sidebar() {
  const { activeModule, setActiveModule, sidebarCollapsed, setSidebarCollapsed, notifications } = useStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ 'sales-group': true });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isChildActive = (item: NavItem) => item.children?.some(c => c.id === activeModule) || false;

  return (
    <div className={`flex flex-col h-full bg-gray-900 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-800 ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <Zap size={18} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">FabricFlow</h1>
            <p className="text-gray-500 text-xs">ERP System</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        {navItems.map(item => {
          const Icon = item.icon;

          // Group with children
          if (item.children) {
            const isExpanded = expandedGroups[item.id] || false;
            const childActive = isChildActive(item);
            return (
              <div key={item.id} className="mb-0.5">
                <button
                  onClick={() => {
                    if (sidebarCollapsed) {
                      setActiveModule(item.children![0].id);
                    } else {
                      toggleGroup(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl transition-all text-left
                    ${sidebarCollapsed ? 'justify-center w-10 mx-auto' : ''}
                    ${childActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon size={18} className={childActive ? 'text-green-400' : item.color} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      <ChevronDown
                        size={14}
                        className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </>
                  )}
                </button>

                {/* Children - animated expand */}
                {!sidebarCollapsed && (
                  <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="ml-4 pl-3 border-l border-gray-700/50 mt-1 mb-1 space-y-0.5">
                      {item.children.map(child => {
                        const ChildIcon = child.icon;
                        const isActive = activeModule === child.id;
                        return (
                          <button
                            key={child.id}
                            onClick={() => setActiveModule(child.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left
                              ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                              }`}
                          >
                            <ChildIcon size={15} className={isActive ? 'text-white' : child.color} />
                            <span className="text-xs font-medium">{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Regular item
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl transition-all mb-0.5 text-left
                ${sidebarCollapsed ? 'justify-center w-10 mx-auto' : ''}
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon size={18} className={isActive ? 'text-white' : item.color} />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {!sidebarCollapsed && item.id === 'dashboard' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`flex items-center gap-2 px-4 py-3 border-t border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {!sidebarCollapsed && <span className="text-xs">Collapse</span>}
      </button>
    </div>
  );
}

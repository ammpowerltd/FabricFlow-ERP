import { useState } from 'react';
import { Bell, Search, Moon, Sun, User, ChevronDown, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { timeAgo } from '../../utils/helpers';

const moduleLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  master: 'Master Data',
  inventory: 'Inventory',
  purchase: 'Purchase',
  production: 'Production',
  sales: 'Sales — Online / B2C',
  b2b: 'Sales — B2B Invoices',
  track: 'Track',
  cod: 'B2C COD Sale Recovery',
  accounts: 'Accounts',
  reports: 'Reports',
  users: 'User Management',
  settings: 'Settings',
};

export default function Header() {
  const { activeModule, darkMode, setDarkMode, notifications, markNotificationRead, markAllNotificationsRead, globalSearch, setGlobalSearch, currentUser } = useStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const notifIcons: Record<string, string> = {
    LOW_STOCK: '📦',
    PENDING_JOB: '🏭',
    DELAYED_RETURN: '⚠️',
    DISPATCH: '🚚',
    PAYMENT: '💰',
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 sticky top-0 z-40 shadow-sm">
      {/* Module Title */}
      <div className="flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-900">{moduleLabels[activeModule] || 'ERP'}</h2>
        <p className="text-xs text-gray-500">FabricFlow ERP</p>
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search items, parties, orders..."
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Dark Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); }}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <button onClick={markAllNotificationsRead} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-indigo-50/40' : ''}`}
                  >
                    <span className="text-lg">{notifIcons[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{n.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(!showUser); setShowNotifs(false); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-2">
              <div className="px-3 py-2 border-b border-gray-100 mb-2">
                <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {currentUser.role}
                </span>
              </div>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                <User size={14} /> Profile Settings
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                <Check size={14} /> Audit Logs
              </button>
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button className="w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg text-left">Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

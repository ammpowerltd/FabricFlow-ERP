import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';
import {
  Menu, Bell, Search, Moon, Sun, LogOut, User,
  Calendar, ChevronDown
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/masters': 'Master Data',
  '/purchase': 'Purchase Module',
  '/inventory': 'Inventory Management',
  '/production': 'Production & Job Work',
  '/sales/b2b': 'B2B Sales',
  '/sales/b2c': 'B2C E-Commerce',
  '/orders': 'Order Tracking',
  '/cod': 'COD Recovery',
  '/accounts': 'Accounts',
  '/gst': 'GST Module',
  '/reports': 'Reports & Analytics',
  '/ai-manager': 'AI Manager',
  '/settings': 'Settings',
};

const dateRangeOptions = [
  { label: 'Today', start: '2024-12-24', end: '2024-12-24' },
  { label: '7 Days', start: '2024-12-18', end: '2024-12-24' },
  { label: '30 Days', start: '2024-11-25', end: '2024-12-24' },
  { label: 'This Month', start: '2024-12-01', end: '2024-12-31' },
  { label: 'Last Month', start: '2024-11-01', end: '2024-11-30' },
];

export default function Header() {
  const { user, logout, theme, setTheme, alerts, markAlertRead, unreadAlerts, selectedDateRange, setSelectedDateRange, setSidebarOpen } = useApp();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  const pageTitle = pageTitles[location.pathname] || 'FabricFlow ERP';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
          <p className="text-xs text-gray-500">Last updated: Just now</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Quick search..."
            className="bg-transparent text-sm outline-none w-full"
          />
          <kbd className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-500">⌘K</kbd>
        </div>

        {/* Date Range */}
        <div className="relative" ref={dateRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">{selectedDateRange.label}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showDatePicker && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    setSelectedDateRange({ ...option, label: option.label });
                    setShowDatePicker(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 transition-colors ${
                    selectedDateRange.label === option.label ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadAlerts}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <span className="text-xs text-indigo-600 cursor-pointer hover:underline">Mark all read</span>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => markAlertRead(alert.id)}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !alert.isRead ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        alert.type === 'critical' ? 'bg-red-500' :
                        alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{alert.title}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{alert.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-200">
                <a href="/ai-manager" className="text-center text-sm text-indigo-600 font-medium hover:underline block">
                  View all notifications
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user?.fullName.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="font-medium text-gray-800">{user?.fullName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <User className="w-4 h-4" />
                My Profile
              </button>
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

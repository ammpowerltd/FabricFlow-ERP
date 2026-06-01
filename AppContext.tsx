import { createContext, useContext, useState, ReactNode } from 'react';
import type { User, AIAlert } from '../types';
import { currentUser, aiAlerts as initialAlerts } from '../data/mockData';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  login: (email?: string) => Promise<boolean>;
  logout: () => void;
  alerts: AIAlert[];
  markAlertRead: (id: string) => void;
  unreadAlerts: number;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  selectedDateRange: { start: string; end: string; label: string };
  setSelectedDateRange: (range: { start: string; end: string; label: string }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alerts, setAlerts] = useState<AIAlert[]>(initialAlerts);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: '2024-12-01',
    end: '2024-12-31',
    label: 'This Month'
  });

  const login = async (_?: string): Promise<boolean> => {
    // Simple login - no password required
    setUser(currentUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  return (
    <AppContext.Provider value={{
      user,
      isAuthenticated,
      sidebarOpen,
      setSidebarOpen,
      sidebarCollapsed,
      setSidebarCollapsed,
      login,
      logout,
      alerts,
      markAlertRead,
      unreadAlerts,
      theme,
      setTheme,
      selectedDateRange,
      setSelectedDateRange,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

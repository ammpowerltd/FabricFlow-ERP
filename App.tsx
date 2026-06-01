import { useStore } from './store/useStore';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './modules/Dashboard';
import MasterData from './modules/MasterData';
import Inventory from './modules/Inventory';
import Purchase from './modules/Purchase';
import Production from './modules/Production';
import Sales from './modules/Sales';
import B2BInvoice from './modules/B2BInvoice';
import Track from './modules/Track';
import CODRecovery from './modules/CODRecovery';
import Accounts from './modules/Accounts';
import Reports from './modules/Reports';
import UserManagement from './modules/UserManagement';
import Settings from './modules/Settings';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

function ModuleContent({ module }: { module: string }) {
  switch (module) {
    case 'dashboard': return <Dashboard />;
    case 'master': return <MasterData />;
    case 'inventory': return <Inventory />;
    case 'purchase': return <Purchase />;
    case 'production': return <Production />;
    case 'sales': return <Sales />;
    case 'b2b': return <B2BInvoice />;
    case 'track': return <Track />;
    case 'cod': return <CODRecovery />;
    case 'accounts': return <Accounts />;
    case 'reports': return <Reports />;
    case 'users': return <UserManagement />;
    case 'settings': return <Settings />;
    default: return <Dashboard />;
  }
}

export default function App() {
  const { activeModule } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when module changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeModule]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar - mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-gray-800">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold">FF</span>
            </div>
            <span className="text-sm font-bold">FabricFlow ERP</span>
          </div>
          <div className="w-9" />
        </div>

        <Header />

        {/* Scrollable Module Content */}
        <main className="flex-1 overflow-y-auto">
          <ModuleContent module={activeModule} />
        </main>
      </div>
    </div>
  );
}

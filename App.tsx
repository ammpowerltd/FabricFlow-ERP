import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Masters from './pages/Masters';
import Purchase from './pages/Purchase';
import Inventory from './pages/Inventory';
import ProductionJobWork from './pages/production/JobWork';
import ProductionMaterialIn from './pages/production/MaterialIn';
import ProductionReports from './pages/production/Reports';
import SalesB2B from './pages/SalesB2B';
import SalesB2C from './pages/SalesB2C';
import OrderTracking from './pages/OrderTracking';
import CODRecovery from './pages/CODRecovery';
import CourierSettlement from './pages/CourierSettlement';
import BulkUpload from './pages/BulkUpload';
import UploadHistory from './pages/UploadHistory';
import Accounts from './pages/Accounts';
import GST from './pages/GST';
import Reports from './pages/Reports';
import AIManager from './pages/AIManager';
import Settings from './pages/Settings';
import D2CEcommerce from './pages/D2CEcommerce';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/masters" element={<ProtectedRoute><Masters /></ProtectedRoute>} />
      <Route path="/purchase" element={<ProtectedRoute><Purchase /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/production/job-work" element={<ProtectedRoute><ProductionJobWork /></ProtectedRoute>} />
      <Route path="/production/material-in" element={<ProtectedRoute><ProductionMaterialIn /></ProtectedRoute>} />
      <Route path="/production/reports" element={<ProtectedRoute><ProductionReports /></ProtectedRoute>} />
      <Route path="/sales/b2b" element={<ProtectedRoute><SalesB2B /></ProtectedRoute>} />
      <Route path="/sales/b2c" element={<ProtectedRoute><SalesB2C /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
      <Route path="/cod" element={<ProtectedRoute><CODRecovery /></ProtectedRoute>} />
      <Route path="/courier-settlement" element={<ProtectedRoute><CourierSettlement /></ProtectedRoute>} />
      <Route path="/bulk-upload" element={<ProtectedRoute><BulkUpload /></ProtectedRoute>} />
      <Route path="/upload-history" element={<ProtectedRoute><UploadHistory /></ProtectedRoute>} />
      <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
      <Route path="/gst" element={<ProtectedRoute><GST /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/ai-manager" element={<ProtectedRoute><AIManager /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      
      {/* D2C E-Commerce Routes */}
      <Route path="/d2c/orders" element={<ProtectedRoute><D2CEcommerce defaultView="list" /></ProtectedRoute>} />
      <Route path="/d2c/create" element={<ProtectedRoute><D2CEcommerce defaultView="create" /></ProtectedRoute>} />
      <Route path="/d2c/bulk" element={<ProtectedRoute><D2CEcommerce defaultView="bulk" /></ProtectedRoute>} />
      <Route path="/d2c/shipment" element={<ProtectedRoute><D2CEcommerce defaultView="shipment" /></ProtectedRoute>} />
      <Route path="/d2c/tracking" element={<ProtectedRoute><D2CEcommerce defaultView="tracking" /></ProtectedRoute>} />
      <Route path="/d2c/reports" element={<ProtectedRoute><D2CEcommerce defaultView="reports" /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;

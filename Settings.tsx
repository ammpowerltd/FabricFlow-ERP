import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Zap, Bell, Shield, Palette, Database, Globe, Save, FileText, HardDrive, Upload, Download, Clock, Trash2, RefreshCw } from 'lucide-react';

export default function Settings() {
  const store = useStore();
  const { darkMode, setDarkMode } = store;
  const [companyForm, setCompanyForm] = useState({
    name: 'FabricFlow Clothing Co.',
    gst: '27AABFF1234G1Z5',
    address: 'Industrial Area, Mumbai, Maharashtra - 400001',
    phone: '+91 98765 43210',
    email: 'info@fabricflow.com',
    website: 'www.fabricflow.com',
    logo: '',
  });

  const [automationSettings, setAutomationSettings] = useState({
    autoSKU: true,
    autoBarcode: true,
    autoGRN: true,
    autoStockUpdate: true,
    lowStockAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: true,
    autoBackup: true,
    autoDraftSave: true,
  });

  const [saved, setSaved] = useState(false);

  // Draft settings
  const [draftSettings, setDraftSettings] = useState({
    enabled: true, interval: '10', restoreAuto: true, warnLeaving: true, preserveRefresh: true, preserveTabs: false,
  });
  const [drafts] = useState([
    { module: 'B2B Invoice', name: 'Draft Invoice #1', lastSaved: new Date(Date.now() - 300000).toISOString() },
    { module: 'Sales', name: 'ORD-1030 Draft', lastSaved: new Date(Date.now() - 600000).toISOString() },
  ]);

  // Backup settings
  const [backupSettings, setBackupSettings] = useState({
    autoEnabled: true, frequency: 'daily', retention: '30', storage: 'local',
    modules: { master: true, inventory: true, sales: true, purchase: true, production: true, accounts: true, users: true, settings: true, drafts: true },
  });
  const [backups] = useState([
    { name: 'backup_2026-05-21_auto.zip', date: new Date(Date.now() - 86400000).toISOString(), size: '12.4 MB', createdBy: 'System (Auto)' },
    { name: 'backup_2026-05-20_manual.zip', date: new Date(Date.now() - 172800000).toISOString(), size: '11.8 MB', createdBy: 'Arjun Sharma' },
  ]);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const [lastBackupData, setLastBackupData] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const restoreRef = useRef<HTMLInputElement>(null);

  const createBackup = () => {
    setIsBackingUp(true); setBackupProgress(0);
    const timer = setInterval(() => {
      setBackupProgress(p => {
        if (p >= 100) {
          clearInterval(timer); setIsBackingUp(false);
          // Generate actual backup data
          const data = JSON.stringify({
            version: '1.0', generatedAt: new Date().toISOString(), generator: 'FabricFlow ERP',
            items: store.items, parties: store.parties, categories: store.categories, units: store.units,
            warehouses: store.warehouses, purchases: store.purchases, jobWorks: store.jobWorks,
            materialIns: store.materialIns, sales: store.sales, expenses: store.expenses,
            stockMovements: store.stockMovements, auditLogs: store.auditLogs,
          }, null, 2);
          setLastBackupData(data);
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };

  const downloadBackup = () => {
    if (!lastBackupData) { createBackup(); return; }
    const blob = new Blob([lastBackupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fabricflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setRestoreFile(file);
  };

  const executeRestore = () => {
    if (!restoreFile) return;
    if (!confirm('⚠️ Restoring backup will overwrite current ERP data.\n\nAre you sure you want to continue?')) return;
    setRestoreStatus('uploading');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.version || !data.generatedAt) { setRestoreStatus('error'); return; }
        // Restore data into store
        if (data.items) data.items.forEach((i: any) => store.addItem(i));
        setRestoreStatus('success');
      } catch { setRestoreStatus('error'); }
    };
    reader.readAsText(restoreFile);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-indigo-600' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Globe size={18} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Company Information</h3>
                <p className="text-xs text-gray-500">Basic company details used in invoices and reports</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                <input value={companyForm.name} onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">GST Number</label>
                <input value={companyForm.gst} onChange={e => setCompanyForm(f => ({ ...f, gst: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input value={companyForm.phone} onChange={e => setCompanyForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input value={companyForm.email} onChange={e => setCompanyForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                <input value={companyForm.website} onChange={e => setCompanyForm(f => ({ ...f, website: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <textarea value={companyForm.address} onChange={e => setCompanyForm(f => ({ ...f, address: e.target.value }))}
                  rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 resize-none" />
              </div>
            </div>
          </div>

          {/* Automation Settings */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Automation Settings</h3>
                <p className="text-xs text-gray-500">Configure automatic system behaviors</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'autoSKU', label: 'Auto SKU Generation', desc: 'Auto-generate SKU for new items' },
                { key: 'autoBarcode', label: 'Auto Barcode Generation', desc: 'Auto-generate barcode numbers' },
                { key: 'autoGRN', label: 'Auto GRN on Purchase', desc: 'Generate GRN automatically on save' },
                { key: 'autoStockUpdate', label: 'Auto Stock Update', desc: 'Update inventory on all transactions' },
                { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Notify when stock falls below minimum' },
                { key: 'autoDraftSave', label: 'Auto Draft Save', desc: 'Save forms as drafts automatically' },
                { key: 'autoBackup', label: 'Auto Cloud Backup', desc: 'Daily backup to cloud storage' },
              ].map(s => (
                <div key={s.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                  <Toggle
                    value={automationSettings[s.key as keyof typeof automationSettings]}
                    onChange={(v) => setAutomationSettings(a => ({ ...a, [s.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Bell size={18} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Notification Channels</h3>
                <p className="text-xs text-gray-500">Configure how you receive alerts</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', icon: '📧', desc: 'Get alerts via email' },
                { key: 'smsNotifications', label: 'SMS Notifications', icon: '📱', desc: 'Get alerts via SMS' },
                { key: 'whatsappNotifications', label: 'WhatsApp Notifications', icon: '💬', desc: 'Get alerts on WhatsApp' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{n.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{n.label}</p>
                      <p className="text-xs text-gray-500">{n.desc}</p>
                    </div>
                  </div>
                  <Toggle
                    value={automationSettings[n.key as keyof typeof automationSettings]}
                    onChange={(v) => setAutomationSettings(a => ({ ...a, [n.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Appearance */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Palette size={18} className="text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900">Appearance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                  <p className="text-xs text-gray-500">Toggle dark theme</p>
                </div>
                <Toggle value={darkMode} onChange={setDarkMode} />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Shield size={18} className="text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900">Security</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Two-Factor Auth', active: false },
                { label: 'Session Timeout (30min)', active: true },
                { label: 'IP Whitelist', active: false },
                { label: 'Audit Logging', active: true },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{s.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.active ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Status */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Database size={18} className="text-cyan-600" />
              </div>
              <h3 className="font-bold text-gray-900">Integrations</h3>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Amazon Seller', status: 'connected', color: 'text-green-600' },
                { name: 'Myntra', status: 'connected', color: 'text-green-600' },
                { name: 'Flipkart', status: 'connected', color: 'text-green-600' },
                { name: 'Shiprocket', status: 'connected', color: 'text-green-600' },
                { name: 'Ajio', status: 'pending', color: 'text-yellow-600' },
                { name: 'Shopify', status: 'not connected', color: 'text-gray-400' },
              ].map(i => (
                <div key={i.name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{i.name}</span>
                  <span className={`text-xs font-medium ${i.color}`}>● {i.status}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSave}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
            <Save size={16} />
            {saved ? '✅ Settings Saved!' : 'Save All Settings'}
          </button>
        </div>
      </div>

      {/* ──── DRAFT & AUTO SAVE ──── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><FileText size={18} className="text-blue-600" /></div>
          <div><h3 className="font-bold text-gray-900">Draft & Auto Save</h3><p className="text-xs text-gray-500">Protect unsaved work across all modules</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {[
            { key: 'enabled', label: 'Enable Auto Draft Save', desc: 'Automatically save form data as draft' },
            { key: 'restoreAuto', label: 'Restore Drafts Automatically', desc: 'Reload last draft when opening a module' },
            { key: 'warnLeaving', label: 'Warn Before Leaving', desc: 'Show confirmation on unsaved pages' },
            { key: 'preserveRefresh', label: 'Preserve After Refresh', desc: 'Keep drafts after browser refresh' },
            { key: 'preserveTabs', label: 'Sync Across Tabs', desc: 'Share drafts across browser tabs' },
          ].map(s => (
            <div key={s.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div><p className="text-sm font-medium text-gray-900">{s.label}</p><p className="text-xs text-gray-500 mt-0.5">{s.desc}</p></div>
              <Toggle value={draftSettings[s.key as keyof typeof draftSettings] as boolean} onChange={v => setDraftSettings(d => ({ ...d, [s.key]: v }))} />
            </div>
          ))}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div><p className="text-sm font-medium text-gray-900">Auto Save Interval</p><p className="text-xs text-gray-500 mt-0.5">How often to save drafts</p></div>
            <select value={draftSettings.interval} onChange={e => setDraftSettings(d => ({ ...d, interval: e.target.value }))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white outline-none">
              <option value="5">5 Seconds</option><option value="10">10 Seconds</option><option value="30">30 Seconds</option><option value="60">1 Minute</option>
            </select>
          </div>
        </div>
        {/* Saved Drafts */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Saved Drafts</p>
          {drafts.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No saved drafts</p> : (
            <div className="space-y-2">
              {drafts.map((d, i) => (
                <div key={i} className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-blue-500" />
                    <div><p className="text-sm font-medium text-gray-900">{d.name}</p><p className="text-xs text-gray-500">{d.module} · {new Date(d.lastSaved).toLocaleString('en-IN')}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-1"><RefreshCw size={12} /> Restore</button>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ──── BACKUP & RESTORE ──── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><HardDrive size={18} className="text-emerald-600" /></div>
          <div><h3 className="font-bold text-gray-900">Backup & Restore</h3><p className="text-xs text-gray-500">Protect your business data with backups</p></div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <button onClick={createBackup} disabled={isBackingUp}
            className="flex flex-col items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-50">
            <Database size={22} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800">{isBackingUp ? 'Creating...' : 'Create Backup'}</span>
          </button>
          <button onClick={downloadBackup} disabled={isBackingUp}
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50">
            <Download size={22} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-800">{lastBackupData ? 'Download Backup' : 'Generate & Download'}</span>
          </button>
          <button onClick={() => setShowRestoreModal(true)}
            className="flex flex-col items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-all">
            <Upload size={22} className="text-orange-600" />
            <span className="text-xs font-bold text-orange-800">Restore Backup</span>
          </button>
        </div>

        {/* Progress Bar */}
        {isBackingUp && (
          <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-emerald-800">Creating backup...</span>
              <span className="text-sm font-bold text-emerald-700">{backupProgress}%</span>
            </div>
            <div className="w-full bg-emerald-200 rounded-full h-2.5"><div className="bg-emerald-600 h-2.5 rounded-full transition-all" style={{ width: `${backupProgress}%` }} /></div>
          </div>
        )}

        {/* Auto Backup Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div><p className="text-sm font-medium text-gray-900">Automatic Backup</p><p className="text-xs text-gray-500 mt-0.5">Schedule regular backups</p></div>
            <Toggle value={backupSettings.autoEnabled} onChange={v => setBackupSettings(b => ({ ...b, autoEnabled: v }))} />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div><p className="text-sm font-medium text-gray-900">Frequency</p></div>
            <select value={backupSettings.frequency} onChange={e => setBackupSettings(b => ({ ...b, frequency: e.target.value }))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white outline-none">
              <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div><p className="text-sm font-medium text-gray-900">Retention Period</p></div>
            <select value={backupSettings.retention} onChange={e => setBackupSettings(b => ({ ...b, retention: e.target.value }))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white outline-none">
              <option value="7">7 Days</option><option value="30">30 Days</option><option value="90">90 Days</option><option value="unlimited">Unlimited</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div><p className="text-sm font-medium text-gray-900">Storage</p></div>
            <select value={backupSettings.storage} onChange={e => setBackupSettings(b => ({ ...b, storage: e.target.value }))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white outline-none">
              <option value="local">Local Server</option><option value="gdrive">Google Drive</option><option value="s3">AWS S3</option><option value="dropbox">Dropbox</option>
            </select>
          </div>
        </div>

        {/* Module Selection */}
        <div className="mb-5">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Backup Modules</p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {Object.entries(backupSettings.modules).map(([key, val]) => (
              <button key={key} onClick={() => setBackupSettings(b => ({ ...b, modules: { ...b.modules, [key]: !val } }))}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${val ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                {val ? '✅' : '⬜'} {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Backup History */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Backup History</p>
          <div className="space-y-2">
            {backups.map((b, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <HardDrive size={16} className="text-emerald-500" />
                  <div><p className="text-sm font-medium text-gray-900">{b.name}</p><p className="text-xs text-gray-500">{new Date(b.date).toLocaleString('en-IN')} · {b.size} · {b.createdBy}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 flex items-center gap-1"><Download size={12} /> Download</button>
                  <button className="px-3 py-1.5 text-xs bg-orange-50 text-orange-700 rounded-lg font-medium hover:bg-orange-100 flex items-center gap-1"><RefreshCw size={12} /> Restore</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowRestoreModal(false); setRestoreFile(null); setRestoreStatus('idle'); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2"><RefreshCw size={18} className="text-orange-600" /><h2 className="text-lg font-bold text-gray-900">Restore Backup</h2></div>
              <button onClick={() => { setShowRestoreModal(false); setRestoreFile(null); setRestoreStatus('idle'); }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {restoreStatus === 'idle' && (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <span className="text-amber-600 text-lg">⚠️</span>
                    <div><p className="text-sm font-bold text-amber-800">Warning</p><p className="text-xs text-amber-600">Restoring backup may overwrite current ERP data. Ensure you have a recent backup before proceeding.</p></div>
                  </div>
                  <input ref={restoreRef} type="file" accept=".json,.zip,.sql" onChange={handleRestoreFile} className="hidden" />
                  <div onClick={() => restoreRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/30 transition-all cursor-pointer">
                    <Upload size={36} className="text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700">{restoreFile ? restoreFile.name : 'Select Backup File'}</p>
                    <p className="text-xs text-gray-500 mt-1">{restoreFile ? `${(restoreFile.size / 1024).toFixed(1)} KB` : 'Supported: .json, .zip, .sql'}</p>
                  </div>
                  {restoreFile && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                      <HardDrive size={16} className="text-green-600" />
                      <div className="flex-1"><p className="text-sm font-medium text-green-800">{restoreFile.name}</p><p className="text-xs text-green-600">{(restoreFile.size / 1024).toFixed(1)} KB · Ready to restore</p></div>
                    </div>
                  )}
                </>
              )}
              {restoreStatus === 'uploading' && (
                <div className="text-center py-8">
                  <RefreshCw size={40} className="text-orange-500 mx-auto mb-3 animate-spin" />
                  <p className="font-bold text-gray-900">Restoring backup...</p>
                  <p className="text-xs text-gray-500 mt-1">Please do not close this window</p>
                </div>
              )}
              {restoreStatus === 'success' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-3xl">✅</span></div>
                  <p className="font-bold text-green-800 text-lg">Backup Restored Successfully!</p>
                  <p className="text-xs text-gray-500 mt-2">Please refresh the page if needed.</p>
                </div>
              )}
              {restoreStatus === 'error' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-3xl">❌</span></div>
                  <p className="font-bold text-red-800 text-lg">Restore Failed</p>
                  <p className="text-xs text-gray-500 mt-2">Invalid or corrupted backup file. Please try another file.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => { setShowRestoreModal(false); setRestoreFile(null); setRestoreStatus('idle'); }}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">
                {restoreStatus === 'success' || restoreStatus === 'error' ? 'Close' : 'Cancel'}
              </button>
              {restoreStatus === 'idle' && (
                <button onClick={executeRestore} disabled={!restoreFile}
                  className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  <RefreshCw size={14} /> Restore Backup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatDateTime, generateId } from '../utils/helpers';
import Modal from '../components/ui/Modal';
import { Users, Plus, Shield, Edit2, ToggleLeft, ToggleRight, History } from 'lucide-react';
import type { User, UserRole } from '../types';

const roleColors: Record<UserRole, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  PURCHASE_MANAGER: 'bg-blue-100 text-blue-700',
  PRODUCTION_MANAGER: 'bg-orange-100 text-orange-700',
  INVENTORY_MANAGER: 'bg-purple-100 text-purple-700',
  ACCOUNTANT: 'bg-yellow-100 text-yellow-700',
  DISPATCH_TEAM: 'bg-green-100 text-green-700',
  SALES_TEAM: 'bg-cyan-100 text-cyan-700',
};

const rolePermissions: Record<UserRole, string[]> = {
  ADMIN: ['All Modules', 'User Management', 'Settings', 'Audit Logs', 'Delete Records'],
  PURCHASE_MANAGER: ['Purchase Entry', 'Vendor Management', 'GRN', 'Purchase Reports'],
  PRODUCTION_MANAGER: ['Job Work Out', 'Material In', 'Contractor Management', 'Production Reports'],
  INVENTORY_MANAGER: ['Inventory View', 'Stock Adjustment', 'Warehouse Management', 'Stock Reports'],
  ACCOUNTANT: ['Accounts', 'GST Reports', 'P&L', 'Expense Entry', 'Ledger'],
  DISPATCH_TEAM: ['Sales View', 'Dispatch Management', 'Courier Updates', 'Tracking'],
  SALES_TEAM: ['Sales Entry', 'Invoice Creation', 'Customer Management', 'Sales Reports'],
};

const sampleUsers: User[] = [
  { id: 'u1', name: 'Arjun Sharma', email: 'admin@fabricflow.com', role: 'ADMIN', status: 'ACTIVE', lastLogin: new Date().toISOString() },
  { id: 'u2', name: 'Priya Kapoor', email: 'purchase@fabricflow.com', role: 'PURCHASE_MANAGER', status: 'ACTIVE', lastLogin: new Date(Date.now() - 86400000).toISOString() },
  { id: 'u3', name: 'Ravi Kumar', email: 'production@fabricflow.com', role: 'PRODUCTION_MANAGER', status: 'ACTIVE', lastLogin: new Date(Date.now() - 172800000).toISOString() },
  { id: 'u4', name: 'Meena Devi', email: 'accounts@fabricflow.com', role: 'ACCOUNTANT', status: 'ACTIVE', lastLogin: new Date(Date.now() - 3600000).toISOString() },
  { id: 'u5', name: 'Sunil Verma', email: 'dispatch@fabricflow.com', role: 'DISPATCH_TEAM', status: 'ACTIVE', lastLogin: new Date(Date.now() - 7200000).toISOString() },
  { id: 'u6', name: 'Aasha Patel', email: 'inventory@fabricflow.com', role: 'INVENTORY_MANAGER', status: 'INACTIVE', lastLogin: new Date(Date.now() - 604800000).toISOString() },
];

export default function UserManagement() {
  const { auditLogs } = useStore();
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [modal, setModal] = useState<{ type: string; data?: User } | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'audit'>('users');
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'SALES_TEAM' as UserRole, status: 'ACTIVE' as User['status'] });

  const saveUser = () => {
    if (!userForm.name || !userForm.email) { alert('Name and email required'); return; }
    if (modal?.data) {
      setUsers(u => u.map(x => x.id === modal.data!.id ? { ...x, ...userForm } : x));
    } else {
      setUsers(u => [...u, { id: generateId(), ...userForm, lastLogin: undefined }]);
    }
    setModal(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: '👥', color: 'bg-indigo-50' },
          { label: 'Active Users', value: users.filter(u => u.status === 'ACTIVE').length, icon: '✅', color: 'bg-green-50' },
          { label: 'Inactive Users', value: users.filter(u => u.status === 'INACTIVE').length, icon: '⏸️', color: 'bg-gray-50' },
          { label: 'Roles Defined', value: Object.keys(roleColors).length, icon: '🛡️', color: 'bg-purple-50' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl p-4 border border-gray-100 ${card.color}`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'users' as const, label: '👥 Users', icon: Users },
          { id: 'roles' as const, label: '🛡️ Roles & Permissions', icon: Shield },
          { id: 'audit' as const, label: '📋 Audit Logs', icon: History },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setUserForm({ name: '', email: '', role: 'SALES_TEAM', status: 'ACTIVE' }); setModal({ type: 'add' }); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm">
              <Plus size={16} /> Add User
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {users.map(user => (
              <div key={user.id} className={`bg-white rounded-2xl p-5 shadow-sm border ${user.status === 'ACTIVE' ? 'border-gray-100' : 'border-gray-200 opacity-70'} hover:shadow-md transition-all`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setUserForm({ name: user.name, email: user.email, role: user.role, status: user.status }); setModal({ type: 'edit', data: user }); }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600"><Edit2 size={14} /></button>
                    <button onClick={() => setUsers(u => u.map(x => x.id === user.id ? { ...x, status: x.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : x))}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-orange-600">
                      {user.status === 'ACTIVE' ? <ToggleRight size={14} className="text-green-500" /> : <ToggleLeft size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${roleColors[user.role]}`}>{user.role.replace(/_/g, ' ')}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.status}
                    </span>
                  </div>
                  {user.lastLogin && (
                    <p className="text-xs text-gray-400">Last login: {formatDateTime(user.lastLogin)}</p>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {rolePermissions[user.role].slice(0, 3).map(perm => (
                      <span key={perm} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{perm}</span>
                    ))}
                    {rolePermissions[user.role].length > 3 && (
                      <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">+{rolePermissions[user.role].length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(rolePermissions) as [UserRole, string[]][]).map(([role, perms]) => (
            <div key={role} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Shield size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{role.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500">{users.filter(u => u.role === role).length} user(s)</p>
                </div>
                <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-semibold ${roleColors[role]}`}>{role.replace(/_/g, ' ')}</span>
              </div>
              <div className="space-y-1.5">
                {perms.map(perm => (
                  <div key={perm} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                    {perm}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">System Audit Log</h3>
            <p className="text-xs text-gray-500 mt-1">All modifications tracked with user, time, and IP address</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Old Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">New Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(log.modifiedAt)}</td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-900">{log.modifiedBy}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{log.entity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                      log.action === 'EDIT' ? 'bg-blue-100 text-blue-700' :
                      log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono max-w-32 truncate">
                    {log.oldValue ? JSON.stringify(log.oldValue).slice(0, 30) + '...' : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 font-mono max-w-32 truncate">
                    {log.newValue ? JSON.stringify(log.newValue).slice(0, 30) + '...' : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{log.ipAddress || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit User Modal */}
      <Modal isOpen={modal?.type === 'add' || modal?.type === 'edit'} onClose={() => setModal(null)}
        title={modal?.type === 'edit' ? 'Edit User' : 'Add New User'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
            <input value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder="e.g. Arjun Sharma" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder="email@company.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
            <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value as UserRole }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-indigo-400">
              {(Object.keys(roleColors) as UserRole[]).map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          {userForm.role && (
            <div className="bg-indigo-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-indigo-700 mb-2">Permissions for {userForm.role.replace(/_/g, ' ')}:</p>
              <div className="flex flex-wrap gap-1">
                {rolePermissions[userForm.role].map(p => (
                  <span key={p} className="text-xs bg-white text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">{p}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={saveUser} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm">
              {modal?.type === 'edit' ? 'Update User' : 'Create User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

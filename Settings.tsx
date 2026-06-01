import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building, FileText, Mail, Key, Users,
  Database, Palette, Shield, Save
} from 'lucide-react';

const tabs = [
  { id: 'company', label: 'Company Profile', icon: Building },
  { id: 'invoice', label: 'Invoice Numbering', icon: FileText },
  { id: 'email', label: 'Email Settings', icon: Mail },
  { id: 'integrations', label: 'Integrations', icon: Key },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'backup', label: 'Backup & Restore', icon: Database },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function Settings() {
  const { theme, setTheme } = useApp();
  const [activeTab, setActiveTab] = useState('company');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your FabricFlow ERP system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Company Profile */}
          {activeTab === 'company' && (
            <div className="p-6 space-y-6">
              <h3 className="font-semibold text-gray-800 text-lg">Company Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input type="text" defaultValue="FabricFlow Fashion Pvt Ltd" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                  <input type="text" defaultValue="FabricFlow" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN *</label>
                  <input type="text" defaultValue="27AABCF1234M1Z5" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN *</label>
                  <input type="text" defaultValue="AABCF1234M" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" defaultValue="+91 98765 43210" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" defaultValue="info@fabricflow.in" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address *</label>
                  <textarea rows={2} defaultValue="123 Fashion District, Andheri West, Mumbai - 400058, Maharashtra" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">Bank Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input type="text" defaultValue="HDFC Bank" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input type="text" defaultValue="50100012345678" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input type="text" defaultValue="HDFC0001234" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <input type="text" defaultValue="Andheri West" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Invoice Numbering */}
          {activeTab === 'invoice' && (
            <div className="p-6 space-y-6">
              <h3 className="font-semibold text-gray-800 text-lg">Invoice Numbering</h3>
              
              <div className="space-y-4">
                {[
                  { label: 'B2B Sales Invoice', prefix: 'B2B-INV-', next: '003', current: 'B2B-INV-002' },
                  { label: 'B2C Sales Invoice', prefix: 'B2C-INV-', next: '001', current: 'B2C-INV-000' },
                  { label: 'Purchase Invoice', prefix: 'PUR-INV-', next: '005', current: 'PUR-INV-004' },
                  { label: 'Job Work', prefix: 'JW-', next: '104', current: 'JW-103' },
                  { label: 'Delivery Challan', prefix: 'DC-', next: '021', current: 'DC-020' },
                  { label: 'Quotation', prefix: 'QUO-', next: '016', current: 'QUO-015' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.label}</p>
                      <p className="text-sm text-gray-500">Last used: {item.current}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={item.prefix}
                        className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                      />
                      <span className="text-gray-500">Next:</span>
                      <input
                        type="text"
                        defaultValue={item.next}
                        className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Theme Settings */}
          {activeTab === 'theme' && (
            <div className="p-6 space-y-6">
              <h3 className="font-semibold text-gray-800 text-lg">Theme Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Color Theme</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                      theme === 'light' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-20 bg-white rounded-lg border border-gray-200 mb-2" />
                    <p className="text-sm font-medium text-gray-800">Light Mode</p>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                      theme === 'dark' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-20 bg-gray-800 rounded-lg mb-2" />
                    <p className="text-sm font-medium text-gray-800">Dark Mode</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Accent Color</label>
                <div className="flex gap-3">
                  {['bg-indigo-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'].map((color) => (
                    <button key={color} className={`w-10 h-10 rounded-full ${color} ring-2 ring-offset-2 ring-indigo-500`} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users & Roles */}
          {activeTab === 'users' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-lg">Users & Roles</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  Add User
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium text-center">Status</th>
                      <th className="pb-3 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">R</div>
                          <span className="font-medium text-gray-800">Rajesh Kumar</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-600">admin@fabricflow.in</td>
                      <td className="py-3"><span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">Super Admin</span></td>
                      <td className="py-3 text-center"><span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Active</span></td>
                      <td className="py-3 text-center text-sm text-indigo-600">Edit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {!['company', 'invoice', 'theme', 'users'].includes(activeTab) && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {tabs.find(t => t.id === activeTab)?.icon && 
                  (() => { const Icon = tabs.find(t => t.id === activeTab)!.icon; return <Icon className="w-8 h-8 text-gray-400" />; })()
                }
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <p className="text-gray-500 mb-4">
                Configure {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} settings for your ERP system.
              </p>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Configure
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

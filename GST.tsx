import { useState } from 'react';
import {
  FileText, Download, Upload, Calculator, TrendingUp, TrendingDown
} from 'lucide-react';

export default function GST() {
  const [activeTab, setActiveTab] = useState('gstr1');

  const tabs = [
    { id: 'gstr1', label: 'GSTR-1 (Sales)' },
    { id: 'gstr3b', label: 'GSTR-3B Summary' },
    { id: 'purchase', label: 'Purchase Register' },
    { id: 'itc', label: 'Input Tax Credit' },
    { id: 'hsn', label: 'HSN Summary' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">GST Module</h1>
          <p className="text-gray-500 text-sm mt-1">GST returns, input tax credit, and reconciliation</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Download className="w-4 h-4" />
            Export Returns
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
            <FileText className="w-4 h-4" />
            Generate Return
          </button>
        </div>
      </div>

      {/* GST Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Output CGST</p>
              <p className="text-2xl font-bold text-gray-800">₹62,500</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Output SGST</p>
              <p className="text-2xl font-bold text-gray-800">₹62,500</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Input CGST</p>
              <p className="text-2xl font-bold text-gray-800">₹37,500</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Net GST Payable</p>
              <p className="text-2xl font-bold mt-1">₹50,000</p>
            </div>
            <Calculator className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm mt-3 opacity-80">Due by: Jan 20, 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* GSTR-1 */}
          {activeTab === 'gstr1' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-800">GSTR-1 Sales Register</h3>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>December 2024</option>
                  <option>November 2024</option>
                  <option>October 2024</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500">Total B2B Invoices</p>
                  <p className="text-xl font-bold">45</p>
                  <p className="text-sm text-gray-500">Taxable: ₹8,50,000</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500">Total B2C Invoices</p>
                  <p className="text-xl font-bold">385</p>
                  <p className="text-sm text-gray-500">Taxable: ₹4,00,000</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500">HSN-wise Summary</p>
                  <p className="text-xl font-bold">8 HSNs</p>
                  <button className="text-sm text-indigo-600 hover:underline">View Details</button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 bg-gray-50">
                      <th className="px-4 py-3 font-medium">Invoice No</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">GSTIN</th>
                      <th className="px-4 py-3 font-medium text-right">Taxable</th>
                      <th className="px-4 py-3 font-medium text-right">CGST</th>
                      <th className="px-4 py-3 font-medium text-right">SGST</th>
                      <th className="px-4 py-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm text-indigo-600">B2B-INV-001</td>
                      <td className="px-4 py-3 text-sm">Fashion Hub Retail</td>
                      <td className="px-4 py-3 font-mono text-sm">24AABCF9012H1Z8</td>
                      <td className="px-4 py-3 text-right">₹40,500</td>
                      <td className="px-4 py-3 text-right">₹1,012.50</td>
                      <td className="px-4 py-3 text-right">₹1,012.50</td>
                      <td className="px-4 py-3 text-right font-medium">₹42,525</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm text-indigo-600">B2B-INV-002</td>
                      <td className="px-4 py-3 text-sm">Style Street Outlet</td>
                      <td className="px-4 py-3 font-mono text-sm">06AABCS3456J1Z4</td>
                      <td className="px-4 py-3 text-right">₹26,230</td>
                      <td className="px-4 py-3 text-right">₹655.75</td>
                      <td className="px-4 py-3 text-right">₹655.75</td>
                      <td className="px-4 py-3 text-right font-medium">₹27,542</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  Download GSTR-1 JSON
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  <Upload className="w-4 h-4" />
                  File Return
                </button>
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {activeTab !== 'gstr1' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'itc' 
                  ? 'Track your Input Tax Credit across all purchases and claims.'
                  : activeTab === 'hsn'
                    ? 'View HSN-wise summary of all sales and purchases.'
                    : 'Generate and view this GST report for the selected period.'}
              </p>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Generate Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

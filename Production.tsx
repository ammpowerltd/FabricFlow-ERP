import { useState } from 'react';
import { jobWorks, parties, items } from '../data/mockData';
import {
  Plus, Download, Eye,
  ArrowLeft, Clock, CheckCircle, AlertTriangle, Truck, Package,
  Printer, Send
} from 'lucide-react';

export default function Production() {
  const [activeTab, setActiveTab] = useState('list');
  const [showNewJobWork, setShowNewJobWork] = useState(false);

  const tabs = [
    { id: 'list', label: 'Job Works', count: jobWorks.length },
    { id: 'pending', label: 'Pending', count: jobWorks.filter(j => j.status !== 'Completed').length },
    { id: 'delayed', label: 'Delayed', count: 1 },
    { id: 'reports', label: 'Reports' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Issued': return 'bg-blue-100 text-blue-700';
      case 'In Process': return 'bg-amber-100 text-amber-700';
      case 'Partial Received': return 'bg-purple-100 text-purple-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {showNewJobWork ? (
        /* New Job Work Form */
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowNewJobWork(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">New Job Work Out</h1>
              <p className="text-gray-500 text-sm mt-1">Create a new job work order for contractor</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Work No *</label>
                <input type="text" defaultValue="JW-103" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" defaultValue="2024-12-24" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contractor *</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Contractor</option>
                  {parties.filter(p => p.partyType.includes('Contractor')).map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date *</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea rows={1} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
              </div>
            </div>

            {/* Raw Materials Section */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Raw Materials to Issue</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 bg-gray-50">
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium min-w-[250px]">Item *</th>
                      <th className="px-3 py-2 font-medium text-right">Available Stock</th>
                      <th className="px-3 py-2 font-medium text-right">Issue Qty *</th>
                      <th className="px-3 py-2 font-medium text-right">Rate</th>
                      <th className="px-3 py-2 font-medium text-center">Warehouse *</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-500">1</td>
                      <td className="px-3 py-2">
                        <select className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                          <option value="">Select Item</option>
                          {items.filter(i => i.type === 'Raw Material').map(i => (
                            <option key={i.id}>{i.name} ({i.sku})</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right text-sm">0</td>
                      <td className="px-3 py-2">
                        <input type="number" className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right" />
                      </td>
                      <td className="px-3 py-2">
                        <select className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                          <option>MUM-01</option>
                          <option>DEL-01</option>
                          <option>BLR-01</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200">
                <Plus className="w-4 h-4" />
                Add Material
              </button>
            </div>

            {/* Expected Output Section */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Expected Output</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 bg-gray-50">
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium min-w-[250px]">Finished Good *</th>
                      <th className="px-3 py-2 font-medium text-right">Expected Qty *</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-500">1</td>
                      <td className="px-3 py-2">
                        <select className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                          <option value="">Select Finished Good</option>
                          {items.filter(i => i.type === 'Finished Good').map(i => (
                            <option key={i.id}>{i.name} ({i.sku})</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200">
                <Plus className="w-4 h-4" />
                Add Output
              </button>
            </div>

            {/* Production Costing */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Production Costing</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Stitching (₹/pc)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Printing (₹/pc)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Embroidery (₹/pc)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Washing (₹/pc)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Other (₹/pc)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button onClick={() => setShowNewJobWork(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">
                Save Draft
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Save & Issue
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Job Work List View */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Production & Job Work</h1>
              <p className="text-gray-500 text-sm mt-1">Manage job works, material issue & receipt, production costing</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowNewJobWork(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Job Work
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{jobWorks.filter(j => j.status === 'In Process').length}</p>
                  <p className="text-sm text-gray-500">In Process</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{jobWorks.filter(j => j.status === 'Completed').length}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">1</p>
                  <p className="text-sm text-gray-500">Delayed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{jobWorks.filter(j => j.status === 'In Process').length}</p>
                  <p className="text-sm text-gray-500">In Process</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
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
                    {tab.count && tab.count > 0 && (
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Work List */}
            <div className="p-4 space-y-4">
              {jobWorks.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {job.jobWorkNo.split('-')[1]}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-800">{job.jobWorkNo}</h3>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(job.priority)}`}>
                            {job.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Contractor: <span className="font-medium text-gray-700">{job.contractorName}</span> • 
                          Date: {job.date} • 
                          Expected: {job.expectedReturnDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Receive Material">
                        <Package className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Print Challan">
                        <Printer className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="Send Email">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Materials & Output Summary */}
                  <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">Raw Materials Issued</p>
                      <div className="flex flex-wrap gap-2">
                        {job.rawMaterials.map((rm, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg">
                            {rm.itemName} • {rm.issueQty} units
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">Expected Output</p>
                      <div className="flex flex-wrap gap-2">
                        {job.expectedOutputs.map((eo, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-lg">
                            {eo.itemName} • {eo.expectedQty} pcs
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

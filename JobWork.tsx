import { useState, useEffect } from 'react';
import { parties, items } from '../../data/mockData';
import { Plus, Search, Filter, Edit, Trash2, Printer, ArrowLeft, Package, CheckCircle, AlertTriangle, Calendar, X, RefreshCw } from 'lucide-react';
import SmartDropdown from '../../components/SmartDropdown';
import { supabase } from '../../lib/supabase';

export default function JobWork() {
  const [jobWorks, setJobWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialIns] = useState<any[]>([]);
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    jobWorkNo: '',
    date: new Date().toISOString().split('T')[0],
    contractorId: '',
    expectedReturnDate: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    remarks: '',
    rawMaterials: [] as any[],
    expectedOutputs: [] as any[]
  });
  const [stockError, setStockError] = useState<string>('');

  // Fetch data from Supabase on mount
  useEffect(() => {
    fetchJobWorks();
  }, []);

  const fetchJobWorks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('job_works').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setJobWorks(data || []);
    } catch (error) {
      console.error('Error fetching job works:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs
  const today = new Date().toISOString().split('T')[0];
  const totalJW = jobWorks.length;
  const inProcessJW = jobWorks.filter(j => j.status === 'In Process').length;
  const completedJW = jobWorks.filter(j => j.status === 'Completed').length;
  const overdueJW = jobWorks.filter(j => j.status === 'Overdue' || (new Date(j.expectedReturnDate) < new Date(today) && j.status !== 'Completed')).length;

  const resetForm = () => {
    setFormData({
      jobWorkNo: `JW-${new Date().getFullYear()}-${String(jobWorks.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      contractorId: '',
      expectedReturnDate: '',
      priority: 'Medium',
      remarks: '',
      rawMaterials: [],
      expectedOutputs: []
    });
    setEditingId(null);
    setStockError('');
  };

  const handleModify = (job: any) => {
    // Check if Material In exists
    const hasMaterialIn = materialIns.some(mi => mi.jobWorkId === job.id);
    if (hasMaterialIn) {
      alert('Cannot modify: Material In entries exist for this Job Work.');
      return;
    }
    setFormData({
      jobWorkNo: job.jobWorkNo,
      date: job.date,
      contractorId: job.contractorId,
      expectedReturnDate: job.expectedReturnDate,
      priority: job.priority,
      remarks: job.remarks,
      rawMaterials: job.rawMaterials,
      expectedOutputs: job.expectedOutputs
    });
    setEditingId(job.id);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this Job Work? (Admin/Manager only)')) {
      try {
        const { error } = await supabase.from('job_works').delete().eq('id', id);
        if (error) throw error;
        setJobWorks(jobWorks.filter(j => j.id !== id));
      } catch (error) {
        console.error('Error deleting job work:', error);
        alert('Failed to delete job work.');
      }
    }
  };

  const handleSave = async (status: string) => {
    // Validation: Available Stock >= Issue Qty (using mock items for now, should fetch from Supabase)
    let error = '';
    formData.rawMaterials.forEach((rm: any) => {
      const item = items.find(i => i.id === rm.itemId);
      if (item && item.currentStock < rm.issueQty) {
        error = `Insufficient stock for ${item.name}. Available: ${item.currentStock}, Required: ${rm.issueQty}`;
      }
    });

    if (error) {
      setStockError(error);
      return;
    }

    try {
      const contractor = parties.find(p => p.id === formData.contractorId);
      const totalExpected = formData.expectedOutputs.reduce((sum, eo) => sum + eo.expectedQty, 0);
      
      const jobData = {
        ...formData,
        contractorName: contractor?.companyName || 'Unknown',
        status: status === 'Issue' ? 'In Process' : 'Draft',
        totalAccepted: 0,
        totalRejected: 0,
        totalReceived: 0,
        pendingQty: totalExpected,
        raw_materials: formData.rawMaterials,
        expected_outputs: formData.expectedOutputs
      };

      if (editingId) {
        const { error } = await supabase.from('job_works').update(jobData).eq('id', editingId);
        if (error) throw error;
        setJobWorks(jobWorks.map(j => j.id === editingId ? { ...j, ...jobData, id: editingId } : j));
      } else {
        const { data, error } = await supabase.from('job_works').insert([jobData]).select().single();
        if (error) throw error;
        setJobWorks([data, ...jobWorks]);
      }
      setView('dashboard');
      resetForm();
      fetchJobWorks(); // Refresh to get latest DB state
    } catch (error) {
      console.error('Error saving job work:', error);
      alert('Failed to save job work.');
    }
  };

  const addRawMaterial = () => {
    setFormData({ ...formData, rawMaterials: [...formData.rawMaterials, { itemId: '', itemName: '', availableStock: 0, issueQty: 0, unit: '', rate: 0, amount: 0 }] });
  };

  const updateRawMaterial = (idx: number, field: string, value: any) => {
    const newMaterials = [...formData.rawMaterials];
    newMaterials[idx] = { ...newMaterials[idx], [field]: value };
    
    if (field === 'issueQty' || field === 'rate') {
      newMaterials[idx].amount = newMaterials[idx].issueQty * newMaterials[idx].rate;
    }
    if (field === 'itemId') {
      const item = items.find(i => i.id === value);
      if (item) {
        newMaterials[idx].itemName = item.name;
        newMaterials[idx].availableStock = item.currentStock;
        newMaterials[idx].unit = item.unit;
        newMaterials[idx].rate = item.purchaseRate;
        newMaterials[idx].amount = newMaterials[idx].issueQty * item.purchaseRate;
      }
    }
    setFormData({ ...formData, rawMaterials: newMaterials });
    setStockError('');
  };

  const removeRawMaterial = (idx: number) => {
    setFormData({ ...formData, rawMaterials: formData.rawMaterials.filter((_, i) => i !== idx) });
  };

  const addExpectedOutput = () => {
    setFormData({ ...formData, expectedOutputs: [...formData.expectedOutputs, { itemId: '', itemName: '', expectedQty: 0, productionCost: 0 }] });
  };

  const updateExpectedOutput = (idx: number, field: string, value: any) => {
    const newOutputs = [...formData.expectedOutputs];
    newOutputs[idx] = { ...newOutputs[idx], [field]: value };
    if (field === 'itemId') {
      const item = items.find(i => i.id === value);
      if (item) newOutputs[idx].itemName = item.name;
    }
    setFormData({ ...formData, expectedOutputs: newOutputs });
  };

  const removeExpectedOutput = (idx: number) => {
    setFormData({ ...formData, expectedOutputs: formData.expectedOutputs.filter((_, i) => i !== idx) });
  };

  const totalIssueValue = formData.rawMaterials.reduce((sum, m) => sum + (m.amount || 0), 0);

  const filteredJobWorks = jobWorks.filter(j => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'in-process') return j.status === 'In Process';
    if (filterStatus === 'completed') return j.status === 'Completed';
    if (filterStatus === 'overdue') return j.status === 'Overdue';
    return true;
  });

  // Dashboard View
  if (view === 'dashboard') {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading Job Works from database...</span>
        </div>
      );
    }
    return (
      <div className="space-y-6 animate-fadeIn pb-20">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div onClick={() => setFilterStatus('all')} className={`bg-white rounded-xl p-5 shadow-sm border cursor-pointer transition-all hover:shadow-md ${filterStatus === 'all' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Job Works</p>
                <p className="text-2xl font-bold text-gray-800">{totalJW}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-gray-600" /></div>
            </div>
          </div>
          <div onClick={() => setFilterStatus('in-process')} className={`bg-white rounded-xl p-5 shadow-sm border cursor-pointer transition-all hover:shadow-md ${filterStatus === 'in-process' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">In Process</p>
                <p className="text-2xl font-bold text-blue-600">{inProcessJW}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-blue-600" /></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Pending Qty &gt; 0</p>
          </div>
          <div onClick={() => setFilterStatus('completed')} className={`bg-white rounded-xl p-5 shadow-sm border cursor-pointer transition-all hover:shadow-md ${filterStatus === 'completed' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedJW}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Pending Qty = 0</p>
          </div>
          <div onClick={() => setFilterStatus('overdue')} className={`bg-white rounded-xl p-5 shadow-sm border cursor-pointer transition-all hover:shadow-md ${filterStatus === 'overdue' ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueJW}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-red-600" /></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Date &lt; Today &amp; Pending &gt; 0</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Work Register</h1>
            <p className="text-gray-500 text-sm mt-1">{filteredJobWorks.length} entries found</p>
          </div>
          <button onClick={() => { resetForm(); setView('form'); }} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-bold shadow-sm">
            <Plus className="w-4 h-4" /> New Job Work Out
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search JW No or Contractor..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"><Filter className="w-4 h-4" /> Filters</button>
        </div>

        {/* List View (Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobWorks.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-indigo-600">{job.jobWorkNo}</h3>
                  <p className="text-sm text-gray-500">{job.contractorName}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  job.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                  job.status === 'In Process' ? 'bg-blue-100 text-blue-700' : 
                  job.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div><span className="text-gray-400 text-xs block">Issue Date</span><span className="font-medium">{job.date}</span></div>
                <div><span className="text-gray-400 text-xs block">Expected Return</span><span className="font-medium">{job.expectedReturnDate}</span></div>
                <div><span className="text-gray-400 text-xs block">Total Received</span><span className="font-medium">{job.totalReceived}</span></div>
                <div><span className="text-gray-400 text-xs block">Pending Qty</span><span className="font-bold text-amber-600">{job.pendingQty}</span></div>
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                <button onClick={() => setShowPdfModal(job)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100"><Printer className="w-3 h-3" /> PDF</button>
                <button onClick={() => handleModify(job)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100"><Edit className="w-3 h-3" /> Modify</button>
                <button onClick={() => handleDelete(job.id)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100"><Trash2 className="w-3 h-3" /> Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* PDF Modal */}
        {showPdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 print:hidden">
                <h2 className="text-xl font-bold text-gray-900">Job Work PDF Preview</h2>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"><Printer className="w-4 h-4" /> Print / Save PDF</button>
                  <button onClick={() => setShowPdfModal(null)} className="text-gray-400 hover:text-gray-600 p-2"><X className="w-6 h-6" /></button>
                </div>
              </div>
              <div className="p-8 overflow-y-auto flex-1 print:p-0" id="pdf-content">
                {/* PDF Content */}
                <div className="border-2 border-gray-800 p-8">
                  <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">FABRICFLOW ERP</h1>
                      <p className="text-sm text-gray-600">123 Fashion District, Mumbai - 400058</p>
                      <p className="text-sm text-gray-600">GSTIN: 27AABCF1234M1Z5</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-2xl font-bold text-indigo-700">JOB WORK OUT</h2>
                      <p className="text-sm font-mono mt-1">#{showPdfModal.jobWorkNo}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                    <div>
                      <p className="font-bold text-gray-700 mb-2">Contractor Details:</p>
                      <p className="font-medium">{showPdfModal.contractorName}</p>
                      <p className="text-gray-600">Mumbai, Maharashtra</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p><span className="text-gray-500">Date:</span> <span className="font-medium">{showPdfModal.date}</span></p>
                      <p><span className="text-gray-500">Expected Return:</span> <span className="font-medium">{showPdfModal.expectedReturnDate}</span></p>
                      <p><span className="text-gray-500">Priority:</span> <span className="font-medium">{showPdfModal.priority}</span></p>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">Issued Materials</h3>
                  <table className="w-full text-sm mb-6">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2 border">Item</th>
                        <th className="text-right p-2 border">Qty</th>
                        <th className="text-right p-2 border">Unit</th>
                        <th className="text-right p-2 border">Rate</th>
                        <th className="text-right p-2 border">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showPdfModal.rawMaterials.map((rm: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2 border">{rm.itemName}</td>
                          <td className="text-right p-2 border">{rm.issueQty}</td>
                          <td className="text-right p-2 border">{rm.unit}</td>
                          <td className="text-right p-2 border">₹{rm.rate}</td>
                          <td className="text-right p-2 border">₹{rm.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-gray-50">
                        <td colSpan={4} className="text-right p-2 border">Total Issue Value:</td>
                        <td className="text-right p-2 border">₹{showPdfModal.rawMaterials.reduce((s: number, m: any) => s + m.amount, 0).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h3 className="font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">Expected Output</h3>
                  <table className="w-full text-sm mb-8">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2 border">Finished Good</th>
                        <th className="text-right p-2 border">Expected Qty</th>
                        <th className="text-right p-2 border">Prod. Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showPdfModal.expectedOutputs.map((eo: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2 border">{eo.itemName}</td>
                          <td className="text-right p-2 border">{eo.expectedQty}</td>
                          <td className="text-right p-2 border">₹{eo.productionCost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mb-8">
                    <p className="text-sm text-gray-600"><span className="font-bold">Remarks:</span> {showPdfModal.remarks || 'N/A'}</p>
                  </div>

                  <div className="flex justify-between mt-12 pt-8 border-t border-gray-300 text-sm">
                    <div className="text-center">
                      <p className="mb-8">Prepared By</p>
                      <p className="border-t border-gray-400 w-32 mx-auto"></p>
                    </div>
                    <div className="text-center">
                      <p className="mb-8">Authorized Signature</p>
                      <p className="border-t border-gray-400 w-32 mx-auto"></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Form View
  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex items-center gap-4 sticky top-0 bg-gray-50 z-10 py-4 border-b border-gray-200">
        <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-200 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{editingId ? 'Modify Job Work Out' : 'New Job Work Out'}</h1>
          <p className="text-gray-500 text-sm">Issue raw materials to contractor and define expected finished goods</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-8">
        {stockError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> {stockError}
          </div>
        )}

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Work No *</label>
            <input type="text" value={formData.jobWorkNo} readOnly className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contractor *</label>
            <SmartDropdown label="" items={parties.filter(p => p.partyType.includes('Contractor'))} value={formData.contractorId} onChange={(val) => setFormData({...formData, contractorId: val})} placeholder="Select Contractor..." type="contractor" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date *</label>
            <input type="date" value={formData.expectedReturnDate} onChange={(e) => setFormData({...formData, expectedReturnDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <input type="text" value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>

        {/* Raw Materials */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Package className="w-5 h-5 text-indigo-600" /> Raw Materials to Issue</h3>
            <button onClick={addRawMaterial} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100"><Plus className="w-4 h-4" /> Add Material</button>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-2 w-1/3">Item</th>
                  <th className="px-4 py-2 text-right">Available Qty</th>
                  <th className="px-4 py-2 text-right">Issue Qty *</th>
                  <th className="px-4 py-2 text-right">Unit</th>
                  <th className="px-4 py-2 text-right">Rate</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {formData.rawMaterials.map((rm: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">
                      <SmartDropdown label="" items={items.filter(i => i.type === 'Raw Material')} value={rm.itemId} onChange={(val) => updateRawMaterial(idx, 'itemId', val)} placeholder="Select Item..." type="item" />
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">{rm.availableStock}</td>
                    <td className="px-4 py-2 text-right">
                      <input type="number" value={rm.issueQty} onChange={(e) => updateRawMaterial(idx, 'issueQty', Number(e.target.value))} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right ml-auto block" />
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">{rm.unit}</td>
                    <td className="px-4 py-2 text-right text-gray-500">₹{rm.rate}</td>
                    <td className="px-4 py-2 text-right font-medium">₹{rm.amount.toLocaleString()}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => removeRawMaterial(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold text-gray-700">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right">Total Issue Value:</td>
                  <td className="px-4 py-3 text-right text-indigo-700">₹{totalIssueValue.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Expected Finished Goods */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" /> Expected Finished Goods</h3>
            <button onClick={addExpectedOutput} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100"><Plus className="w-4 h-4" /> Add Finished Good</button>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-2 w-2/3">Finished Good</th>
                  <th className="px-4 py-2 text-right">Expected Qty *</th>
                  <th className="px-4 py-2 text-right">Production Cost</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {formData.expectedOutputs.map((eo: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">
                      <SmartDropdown label="" items={items.filter(i => i.type === 'Finished Good')} value={eo.itemId} onChange={(val) => updateExpectedOutput(idx, 'itemId', val)} placeholder="Select Finished Good..." type="item" />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input type="number" value={eo.expectedQty} onChange={(e) => updateExpectedOutput(idx, 'expectedQty', Number(e.target.value))} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right ml-auto block" />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input type="number" value={eo.productionCost} onChange={(e) => updateExpectedOutput(idx, 'productionCost', Number(e.target.value))} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right ml-auto block" />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => removeExpectedOutput(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button onClick={() => setView('dashboard')} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
          <button onClick={() => handleSave('Draft')} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Save Draft</button>
          <button onClick={() => handleSave('Issue')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Save & Issue</button>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { jobWorks as initialJobWorks } from '../../data/mockData';
import { Plus, Search, Filter, Download, Eye, Trash2, Printer, CheckCircle, Package, ClipboardList, X } from 'lucide-react';

// Mock Data for Material In Register
const initialMaterialIns = [
  {
    id: 'MI001', miNo: 'MI-2024-001', date: '20 Dec 2024', jobWorkId: 'JW004', jobWorkNo: 'JW-099', contractorName: 'Star Stitching Works',
    status: 'Completed', items: [{ itemName: 'Classic Polo White S', expectedQty: 50, prevAccepted: 0, prevRejected: 0, acceptedQty: 48, rejectedQty: 2, totalReceived: 50 }],
    remarks: 'Full delivery received.'
  }
];

export default function MaterialIn() {
  const [jobWorks, setJobWorks] = useState<any[]>(initialJobWorks);
  const [materialIns, setMaterialIns] = useState<any[]>(initialMaterialIns);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPdfModal, setShowPdfModal] = useState<any>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<any>(null);
  
  // Form State
  const [miNo] = useState(`MI-2026-${String(materialIns.length + 1).padStart(3, '0')}`);
  const [miDate, setMiDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedJWId, setSelectedJWId] = useState('');
  const [selectedJW, setSelectedJW] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const [receivedItems, setReceivedItems] = useState<any[]>([]);

  const handleJWChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedJWId(id);
    const job = jobWorks.find(j => j.id === id);
    setSelectedJW(job || null);
    if (job) {
      setReceivedItems(job.expectedOutputs.map((eo: any) => ({
        ...eo, 
        prevAccepted: eo.totalAccepted || 0, 
        prevRejected: eo.totalRejected || 0, 
        prevReceived: eo.totalReceived || 0,
        pendingQty: eo.pendingQty || eo.expectedQty,
        acceptedQty: 0, 
        rejectedQty: 0 
      })));
    }
  };

  const updateItem = (idx: number, field: string, value: number) => {
    const newItems = [...receivedItems];
    newItems[idx] = { ...newItems[idx], [field]: value };
    
    // Validation: Accepted + Rejected cannot exceed Pending Qty + Prev Received? 
    // Actually, prompt says: Total Received = Accepted + Rejected. Pending = Expected - Total Received Till Date.
    // So user enters Accepted and Rejected for *this* receipt.
    // Total Received Till Date = Prev Received + Accepted + Rejected.
    // Pending = Expected - Total Received Till Date.
    
    const currentAccepted = field === 'acceptedQty' ? value : newItems[idx].acceptedQty;
    const currentRejected = field === 'rejectedQty' ? value : newItems[idx].rejectedQty;
    const totalReceivedTillDate = newItems[idx].prevReceived + currentAccepted + currentRejected;
    
    if (totalReceivedTillDate > newItems[idx].expectedQty) {
      alert(`Total received (${totalReceivedTillDate}) cannot exceed expected quantity (${newItems[idx].expectedQty})`);
      return;
    }

    setReceivedItems(newItems);
  };

  const handleSave = () => {
    if (!selectedJW) return;
    
    const newMI = {
      id: Date.now().toString(),
      miNo,
      date: miDate,
      jobWorkId: selectedJW.id,
      jobWorkNo: selectedJW.jobWorkNo,
      contractorName: selectedJW.contractorName,
      status: 'Completed', // Will be updated based on logic
      items: receivedItems.map((item: any) => ({
        itemName: item.itemName,
        expectedQty: item.expectedQty,
        prevAccepted: item.prevAccepted,
        prevRejected: item.prevRejected,
        acceptedQty: item.acceptedQty,
        rejectedQty: item.rejectedQty,
        totalReceived: item.prevReceived + item.acceptedQty + item.rejectedQty
      })),
      remarks
    };

    // Update Job Work Status and Totals
    const updatedJobWorks = jobWorks.map((jw: any) => {
      if (jw.id === selectedJW.id) {
        let newTotalAccepted = jw.totalAccepted;
        let newTotalRejected = jw.totalRejected;
        let newTotalReceived = jw.totalReceived;
        let newPendingQty = jw.pendingQty;
        let newStatus = jw.status;

        receivedItems.forEach((item: any) => {
          newTotalAccepted += item.acceptedQty;
          newTotalRejected += item.rejectedQty;
          newTotalReceived += (item.acceptedQty + item.rejectedQty);
        });
        newPendingQty = jw.expectedOutputs.reduce((sum: number, eo: any) => sum + eo.expectedQty, 0) - newTotalReceived;

        // Completion Logic: Expected == Total Accepted + Total Rejected
        const totalExpected = jw.expectedOutputs.reduce((sum: number, eo: any) => sum + eo.expectedQty, 0);
        if (newTotalReceived >= totalExpected) {
          newStatus = 'Completed';
        } else if (new Date(jw.expectedReturnDate) < new Date() && newPendingQty > 0) {
          newStatus = 'Overdue';
        } else {
          newStatus = 'In Process';
        }

        return { 
          ...jw, 
          totalAccepted: newTotalAccepted, 
          totalRejected: newTotalRejected, 
          totalReceived: newTotalReceived, 
          pendingQty: newPendingQty,
          status: newStatus
        };
      }
      return jw;
    });

    setJobWorks(updatedJobWorks);
    setMaterialIns([...materialIns, newMI]);
    setShowModal(false);
    // Reset form
    setSelectedJWId('');
    setSelectedJW(null);
    setRemarks('');
    setReceivedItems([]);
  };

  const filteredIns = materialIns.filter(mi => 
    mi.miNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mi.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mi.jobWorkNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Material In Register</h1>
          <p className="text-gray-500 text-sm mt-1">{materialIns.length} entries · Against {new Set(materialIns.map(m => m.jobWorkNo)).size} Job Works</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-bold shadow-sm transition-all">
          <Plus className="w-5 h-5" /> New Material In
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search MI No, Contractor, or Job Work..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"><Filter className="w-4 h-4" /> Filters</button>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"><Download className="w-4 h-4" /> Export</button>
      </div>

      {/* List View */}
      <div className="space-y-4">
        {filteredIns.map((mi) => (
          <div key={mi.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">{mi.miNo}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                    mi.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {mi.status}
                  </span>
                  <span className="text-gray-400">·</span>
                  <span className="text-sm font-medium text-indigo-600">Against {mi.jobWorkNo}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><ClipboardList className="w-4 h-4" /> {mi.date}</span>
                  <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {mi.contractorName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowHistoryModal(mi)} className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"><Eye className="w-4 h-4" /> History</button>
                <button onClick={() => setShowPdfModal(mi)} className="flex items-center gap-1.5 px-3 py-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium transition-colors"><Printer className="w-4 h-4" /> PDF</button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"><Trash2 className="w-4 h-4" /> Delete</button>
              </div>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Finished Good</th>
                    <th className="px-6 py-3 text-center">Expected</th>
                    <th className="px-6 py-3 text-center text-blue-600">Prev Accepted</th>
                    <th className="px-6 py-3 text-center text-green-700">Accepted ✅</th>
                    <th className="px-6 py-3 text-center text-red-600">Rejected ❌</th>
                    <th className="px-6 py-3 text-center text-gray-600">Total Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mi.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.itemName}</td>
                      <td className="px-6 py-4 text-center font-medium">{item.expectedQty}</td>
                      <td className="px-6 py-4 text-center font-bold text-blue-700">{item.prevAccepted}</td>
                      <td className="px-6 py-4 text-center font-bold text-green-700 text-lg">{item.acceptedQty}</td>
                      <td className="px-6 py-4 text-center font-bold text-red-600 text-lg">{item.rejectedQty}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-700">{item.totalReceived}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {mi.remarks && <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 italic border-t border-gray-100">💬 {mi.remarks}</div>}
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Record Material In</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material In No.</label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-green-700 font-mono font-bold">{miNo}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={miDate} onChange={(e) => setMiDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Work No. *</label>
                  <select value={selectedJWId} onChange={handleJWChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white">
                    <option value="">Select Job Work Out...</option>
                    {jobWorks.filter((j: any) => j.status !== 'Completed').map((jw: any) => (<option key={jw.id} value={jw.id}>{jw.jobWorkNo} — {jw.contractorName} (Pending: {jw.pendingQty})</option>))}
                  </select>
                </div>
                {selectedJW && (
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contractor (Auto)</label>
                    <input type="text" value={selectedJW.contractorName} readOnly className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500" />
                  </div>
                )}
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="E.g. Partial delivery..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>

              {selectedJW && (
                <>
                  {/* Finished Goods Received */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-indigo-600" /> Finished Goods Received</h4>
                    </div>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3">Finished Good</th>
                          <th className="px-4 py-3 text-right">Expected</th>
                          <th className="px-4 py-3 text-right text-blue-600">Prev Accepted</th>
                          <th className="px-4 py-3 text-right text-amber-600">Pending</th>
                          <th className="px-4 py-3 text-right text-green-700 bg-green-50">Accepted *</th>
                          <th className="px-4 py-3 text-right text-red-600 bg-red-50">Rejected *</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {receivedItems.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{item.itemName}</td>
                            <td className="px-4 py-3 text-right font-medium">{item.expectedQty}</td>
                            <td className="px-4 py-3 text-right text-blue-600">{item.prevAccepted}</td>
                            <td className="px-4 py-3 text-right font-bold text-amber-600">{item.pendingQty}</td>
                            <td className="px-4 py-3">
                              <input type="number" value={item.acceptedQty} onChange={(e) => updateItem(idx, 'acceptedQty', Number(e.target.value))} className="w-20 px-2 py-1 border border-gray-300 rounded text-right ml-auto block focus:ring-1 focus:ring-green-500" />
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" value={item.rejectedQty} onChange={(e) => updateItem(idx, 'rejectedQty', Number(e.target.value))} className="w-20 px-2 py-1 border border-gray-300 rounded text-right ml-auto block focus:ring-1 focus:ring-red-500" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-indigo-600 font-bold uppercase">Total Expected</p>
                      <p className="text-2xl font-bold text-gray-800">{selectedJW.expectedOutputs.reduce((s: number, eo: any) => s + eo.expectedQty, 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-bold uppercase">Total Received</p>
                      <p className="text-2xl font-bold text-green-700">{selectedJW.totalReceived + receivedItems.reduce((s: any, i: any) => s + i.acceptedQty + i.rejectedQty, 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-red-600 font-bold uppercase">Total Rejected</p>
                      <p className="text-2xl font-bold text-red-700">{selectedJW.totalRejected + receivedItems.reduce((s: any, i: any) => s + i.rejectedQty, 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-600 font-bold uppercase">Remaining Pending</p>
                      <p className="text-2xl font-bold text-amber-700">{selectedJW.pendingQty - receivedItems.reduce((s: any, i: any) => s + i.acceptedQty + i.rejectedQty, 0)}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Save & Complete</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Material In History: {showHistoryModal.jobWorkNo}</h2>
              <button onClick={() => setShowHistoryModal(null)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {materialIns.filter((mi: any) => mi.jobWorkId === showHistoryModal.jobWorkId).map((mi: any) => (
                  <div key={mi.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-indigo-600">{mi.miNo}</h4>
                      <span className="text-sm text-gray-500">{mi.date}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-center">
                      <div className="bg-green-50 p-2 rounded"><p className="text-xs text-green-600">Accepted</p><p className="font-bold text-green-700">{mi.items.reduce((s: number, i: any) => s + i.acceptedQty, 0)}</p></div>
                      <div className="bg-red-50 p-2 rounded"><p className="text-xs text-red-600">Rejected</p><p className="font-bold text-red-700">{mi.items.reduce((s: number, i: any) => s + i.rejectedQty, 0)}</p></div>
                      <div className="bg-amber-50 p-2 rounded"><p className="text-xs text-amber-600">Pending After</p><p className="font-bold text-amber-700">{jobWorks.find((j: any) => j.id === mi.jobWorkId)?.pendingQty || 0}</p></div>
                    </div>
                  </div>
                ))}
                {materialIns.filter((mi: any) => mi.jobWorkId === showHistoryModal.jobWorkId).length === 0 && <p className="text-center text-gray-500">No history found.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 print:hidden">
              <h2 className="text-xl font-bold text-gray-900">Material In PDF Preview</h2>
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
                    <h2 className="text-2xl font-bold text-green-700">MATERIAL IN</h2>
                    <p className="text-sm font-mono mt-1">#{showPdfModal.miNo}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                  <div>
                    <p className="font-bold text-gray-700 mb-2">Job Work Details:</p>
                    <p className="font-medium">{showPdfModal.jobWorkNo}</p>
                    <p className="text-gray-600">{showPdfModal.contractorName}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p><span className="text-gray-500">Date:</span> <span className="font-medium">{showPdfModal.date}</span></p>
                    <p><span className="text-gray-500">Status:</span> <span className="font-medium">{showPdfModal.status}</span></p>
                  </div>
                </div>

                <h3 className="font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">Receipt Summary</h3>
                <table className="w-full text-sm mb-6">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-2 border">Finished Good</th>
                      <th className="text-right p-2 border">Expected</th>
                      <th className="text-right p-2 border">Accepted</th>
                      <th className="text-right p-2 border">Rejected</th>
                      <th className="text-right p-2 border">Total Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showPdfModal.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2 border">{item.itemName}</td>
                        <td className="text-right p-2 border">{item.expectedQty}</td>
                        <td className="text-right p-2 border text-green-700 font-bold">{item.acceptedQty}</td>
                        <td className="text-right p-2 border text-red-600 font-bold">{item.rejectedQty}</td>
                        <td className="text-right p-2 border">{item.totalReceived}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mb-8">
                  <p className="text-sm text-gray-600"><span className="font-bold">Inventory Impact:</span> Accepted Qty added to Finished Goods Stock. Rejected Qty moved to Rejected Stock.</p>
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
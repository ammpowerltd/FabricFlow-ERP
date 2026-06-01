import { useState } from 'react';
import { Search, Filter, Download, Eye, RotateCcw, FileText } from 'lucide-react';

const uploadHistory = [
  { id: 'UP-001', uploadId: 'UP-00045', fileName: 'order_status_dec24.xlsx', uploadType: 'Status Update', uploadedBy: 'admin', uploadedAt: '2024-12-24 10:30', totalRecords: 1000, successRecords: 950, warningRecords: 35, errorRecords: 15, status: 'Completed' },
  { id: 'UP-002', uploadId: 'UP-00044', fileName: 'cod_settlement_shiprocket.xlsx', uploadType: 'COD Settlement', uploadedBy: 'admin', uploadedAt: '2024-12-23 14:15', totalRecords: 500, successRecords: 480, warningRecords: 10, errorRecords: 10, status: 'Completed' },
  { id: 'UP-003', uploadId: 'UP-00043', fileName: 'combined_update_dec22.xlsx', uploadType: 'Combined', uploadedBy: 'sales_exec', uploadedAt: '2024-12-22 09:00', totalRecords: 250, successRecords: 0, warningRecords: 0, errorRecords: 250, status: 'Failed' },
  { id: 'UP-004', uploadId: 'UP-00042', fileName: 'order_status_dec21.xlsx', uploadType: 'Status Update', uploadedBy: 'admin', uploadedAt: '2024-12-21 16:45', totalRecords: 800, successRecords: 800, warningRecords: 0, errorRecords: 0, status: 'Rolled Back' },
];

export default function UploadHistory() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = uploadHistory.filter(h =>
    h.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.uploadId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.uploadType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Upload History</h1>
        <p className="text-gray-500 text-sm mt-1">View, download, and rollback previous bulk uploads</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by file name, upload ID, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Upload History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 bg-gray-50">
                <th className="px-4 py-3 font-medium">Upload ID</th>
                <th className="px-4 py-3 font-medium">File Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Uploaded By</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Success</th>
                <th className="px-4 py-3 font-medium text-right">Warnings</th>
                <th className="px-4 py-3 font-medium text-right">Errors</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHistory.map((upload) => (
                <tr key={upload.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm text-indigo-600">{upload.uploadId}</td>
                  <td className="px-4 py-3 text-sm font-medium">{upload.fileName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      upload.uploadType === 'Status Update' ? 'bg-blue-100 text-blue-700' :
                      upload.uploadType === 'COD Settlement' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {upload.uploadType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{upload.uploadedBy}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{upload.uploadedAt}</td>
                  <td className="px-4 py-3 text-right font-medium">{upload.totalRecords}</td>
                  <td className="px-4 py-3 text-right text-green-600">{upload.successRecords}</td>
                  <td className="px-4 py-3 text-right text-amber-600">{upload.warningRecords}</td>
                  <td className="px-4 py-3 text-right text-red-600">{upload.errorRecords}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      upload.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      upload.status === 'Failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {upload.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Download Original">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Download Error File">
                        <FileText className="w-4 h-4" />
                      </button>
                      {upload.status === 'Completed' && (
                        <button className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title="Rollback (Admin Only)">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

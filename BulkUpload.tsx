import { useState } from 'react';
import { Download, Upload, CheckCircle, XCircle, Info } from 'lucide-react';

export default function BulkUpload() {
  const [activeTab, setActiveTab] = useState('status');
  const [uploadStep, setUploadStep] = useState(1);
  const [validationResult, setValidationResult] = useState<any>(null);

  const tabs = [
    { id: 'status', label: 'Order Status Update' },
    { id: 'cod', label: 'COD Settlement' },
    { id: 'combined', label: 'Combined Update' },
  ];

  const handleUpload = () => {
    // Simulate validation
    setValidationResult({
      totalRecords: 1000,
      validRecords: 950,
      warningRecords: 35,
      errorRecords: 15,
      errors: [
        { row: 5, orderNo: 'ORD-1005', message: 'Duplicate Order Found', type: 'Error' },
        { row: 12, orderNo: 'ORD-1012', message: 'Order Not Found', type: 'Error' },
        { row: 23, orderNo: 'ORD-1023', message: 'AWB Mismatch Detected', type: 'Error' },
        { row: 45, orderNo: 'ORD-1045', message: 'Invalid Status Movement (Delivered -> In Transit)', type: 'Error' },
        { row: 67, orderNo: 'ORD-1067', message: 'COD Already Settled', type: 'Warning' },
        { row: 89, orderNo: 'ORD-1089', message: 'Over Settlement Detected', type: 'Error' },
      ]
    });
    setUploadStep(2);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Bulk Excel Upload</h1>
        <p className="text-gray-500 text-sm mt-1">Upload order status updates and COD settlements in bulk with validation</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setUploadStep(1); setValidationResult(null); }}
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
          {/* Step 1: Download Template & Upload */}
          {uploadStep === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">How to use Bulk Upload</h4>
                    <ol className="text-sm text-blue-700 mt-2 list-decimal list-inside space-y-1">
                      <li>Download the Excel template for the selected upload type</li>
                      <li>Fill in your data following the column headers</li>
                      <li>Upload the file - the system will validate all records</li>
                      <li>Review validation results and proceed with valid records</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                  <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-800 mb-2">Download Template</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {activeTab === 'status' && 'Order No | AWB No | New Status | Status Date | Remarks'}
                    {activeTab === 'cod' && 'Order No | AWB No | COD Amount | Received Amount | Settlement Date | Reference No'}
                    {activeTab === 'combined' && 'Order No | AWB No | Status | COD Received | Settlement Date | Remarks'}
                  </p>
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 mx-auto">
                    <Download className="w-4 h-4" />
                    Download Excel Template
                  </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-800 mb-2">Upload File</h3>
                  <p className="text-sm text-gray-500 mb-4">Drag and drop your Excel file here, or click to browse</p>
                  <input type="file" accept=".xlsx,.xls,.csv" className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 mx-auto cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Select File
                  </label>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleUpload}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Validate & Upload
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Validation Summary */}
          {uploadStep === 2 && validationResult && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-800">Validation Summary</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">Total Records</p>
                  <p className="text-2xl font-bold text-gray-800">{validationResult.totalRecords}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                  <p className="text-sm text-green-600">Valid Records</p>
                  <p className="text-2xl font-bold text-green-600">{validationResult.validRecords}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
                  <p className="text-sm text-amber-600">Warnings</p>
                  <p className="text-2xl font-bold text-amber-600">{validationResult.warningRecords}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
                  <p className="text-sm text-red-600">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{validationResult.errorRecords}</p>
                </div>
              </div>

              {/* Error Types */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-800 mb-3">Validation Rules Applied</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> Duplicate Order Detection</div>
                  <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> Duplicate File Detection</div>
                  <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> Order Not Found</div>
                  <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> AWB Mismatch</div>
                  <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> Invalid Status Movement (Backward Protection)</div>
                  <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> COD Already Settled</div>
                  <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> Over Settlement Detection</div>
                  <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Partial Settlement Detection</div>
                </div>
              </div>

              {/* Error Details */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Error Details</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 bg-gray-50">
                        <th className="px-4 py-2 font-medium">Row</th>
                        <th className="px-4 py-2 font-medium">Order No</th>
                        <th className="px-4 py-2 font-medium">Message</th>
                        <th className="px-4 py-2 font-medium text-center">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {validationResult.errors.map((err: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm">{err.row}</td>
                          <td className="px-4 py-2 font-mono text-sm text-indigo-600">{err.orderNo}</td>
                          <td className="px-4 py-2 text-sm">{err.message}</td>
                          <td className="px-4 py-2 text-center">
                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                              err.type === 'Error' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {err.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  Download Error Report
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  Download Warning Report
                </button>
                <button
                  onClick={() => setUploadStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel Upload
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  <CheckCircle className="w-4 h-4" />
                  Proceed with Valid Records
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

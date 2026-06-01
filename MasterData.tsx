import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/ui/Modal';
import { formatCurrency, generateId, generateSKU, generateBarcode, getStatusColor, formatDate } from '../utils/helpers';
import {
  Plus, Search, Edit2, Trash2, Eye, Copy, Package, Users, Tag, Ruler,
  Warehouse, AlertCircle, ToggleLeft, ToggleRight, History, Upload, Download, FileSpreadsheet, CheckCircle, XCircle, ArrowRight
} from 'lucide-react';
import type { Item, Party } from '../types';

type Tab = 'items' | 'parties' | 'categories' | 'units' | 'warehouses';

const tabItems = [
  { id: 'items' as Tab, label: 'Item Master', icon: Package },
  { id: 'parties' as Tab, label: 'Party Master', icon: Users },
  { id: 'categories' as Tab, label: 'Categories', icon: Tag },
  { id: 'units' as Tab, label: 'Units', icon: Ruler },
  { id: 'warehouses' as Tab, label: 'Warehouses', icon: Warehouse },
];

const partyTypeLabels: Record<string, string> = {
  CUSTOMER: 'Customer', VENDOR: 'Vendor', CONTRACTOR: 'Contractor',
  COURIER_PARTNER: 'Courier Partner', COURIER_AGGREGATOR: 'Courier Aggregator', PLATFORM: 'Platform'
};

const partyTypeColors: Record<string, string> = {
  CUSTOMER: 'bg-green-100 text-green-700', VENDOR: 'bg-blue-100 text-blue-700',
  CONTRACTOR: 'bg-orange-100 text-orange-700', COURIER_PARTNER: 'bg-purple-100 text-purple-700',
  COURIER_AGGREGATOR: 'bg-pink-100 text-pink-700', PLATFORM: 'bg-cyan-100 text-cyan-700'
};

// ---- Item Form ----
function ItemForm({ initial, onSave, onClose }: { initial?: Partial<Item>; onSave: (item: Item) => void; onClose: () => void }) {
  const { categories, units } = useStore();
  const [form, setForm] = useState({
    name: initial?.name || '',
    type: initial?.type || 'RAW_MATERIAL' as Item['type'],
    categoryId: initial?.categoryId || '',
    unitId: initial?.unitId || '',
    gstPercent: initial?.gstPercent ?? 12,
    hsnCode: initial?.hsnCode || '',
    purchaseRate: initial?.purchaseRate ?? 0,
    salesRate: initial?.salesRate ?? 0,
    minimumStock: initial?.minimumStock ?? 10,
    openingStock: initial?.openingStock ?? 0,
    status: initial?.status || 'ACTIVE' as Item['status'],
  });

  const cat = categories.find(c => c.id === form.categoryId);
  const sku = initial?.sku || (cat ? generateSKU(form.type, cat.name) : '');
  const barcode = initial?.barcode || generateBarcode();

  const save = () => {
    if (!form.name || !form.categoryId || !form.unitId) {
      alert('Please fill required fields');
      return;
    }
    const item: Item = {
      id: initial?.id || generateId(),
      sku,
      barcode,
      ...form,
      currentStock: initial?.currentStock ?? form.openingStock,
      createdAt: initial?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(item);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Type *</label>
          <div className="grid grid-cols-2 gap-2">
            {(['RAW_MATERIAL', 'FINISHED_GOODS'] as const).map(t => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${form.type === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {t === 'RAW_MATERIAL' ? '🧵 Raw Material' : '👔 Finished Goods'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name / SKU *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none" placeholder="e.g. Cotton Fabric White" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none bg-white">
            <option value="">Select category</option>
            {categories.filter(c => c.status === 'ACTIVE').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
          <select value={form.unitId} onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none bg-white">
            <option value="">Select unit</option>
            {units.filter(u => u.status === 'ACTIVE').map(u => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
          <select value={form.gstPercent} onChange={e => setForm(f => ({ ...f, gstPercent: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none bg-white">
            {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}%</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
          <input value={form.hsnCode} onChange={e => setForm(f => ({ ...f, hsnCode: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none" placeholder="e.g. 5208" />
        </div>
        {form.type === 'RAW_MATERIAL' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Rate (₹)</label>
            <input type="number" value={form.purchaseRate} onChange={e => setForm(f => ({ ...f, purchaseRate: Number(e.target.value) }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none" />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sales Rate (₹)</label>
            <input type="number" value={form.salesRate} onChange={e => setForm(f => ({ ...f, salesRate: Number(e.target.value) }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
          <input type="number" value={form.minimumStock} onChange={e => setForm(f => ({ ...f, minimumStock: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Opening Stock</label>
          <input type="number" value={form.openingStock} onChange={e => setForm(f => ({ ...f, openingStock: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none" />
        </div>

      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={save} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm">
          {initial?.id ? 'Update Item' : 'Create Item'}
        </button>
      </div>
    </div>
  );
}

// ---- Party Form ----
function PartyForm({ initial, onSave, onClose }: { initial?: Partial<Party>; onSave: (p: Party) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || '', type: initial?.type || 'VENDOR' as Party['type'],
    gstNumber: initial?.gstNumber || '', phone: initial?.phone || '',
    email: initial?.email || '', address: initial?.address || '',
    city: initial?.city || '', state: initial?.state || '',
    pincode: initial?.pincode || '', contactPerson: initial?.contactPerson || '',
    status: initial?.status || 'ACTIVE' as Party['status'],
  });

  const save = () => {
    if (!form.name || !form.phone) { alert('Name and phone required'); return; }
    onSave({ id: initial?.id || generateId(), ...form, createdAt: initial?.createdAt || new Date().toISOString() });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Party Type *</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(partyTypeLabels).map(([val, lbl]) => (
            <button key={val} type="button" onClick={() => setForm(f => ({ ...f, type: val as Party['type'] }))}
              className={`p-2 rounded-xl border-2 text-xs font-medium transition-all ${form.type === val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Party Name *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="e.g. Textile Hub Mumbai" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
          <input value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="e.g. 27AABCT1234A1Z5" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
          <input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={save} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          {initial?.id ? 'Update Party' : 'Create Party'}
        </button>
      </div>
    </div>
  );
}

export default function MasterData() {
  const { items, parties, categories, units, warehouses, addItem, updateItem, deleteItem, addParty, updateParty, addCategory, addUnit } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('items');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ type: string; data?: unknown } | null>(null);
  const [filterType, setFilterType] = useState('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Bulk Import State ───
  type BulkStep = 'upload' | 'preview' | 'result';
  const [bulkStep, setBulkStep] = useState<BulkStep>('upload');
  const [bulkType, setBulkType] = useState<'items' | 'parties'>('items');
  const [bulkData, setBulkData] = useState<Record<string, string>[]>([]);
  const [bulkErrors, setBulkErrors] = useState<{ row: number; field: string; message: string }[]>([]);
  const [bulkImported, setBulkImported] = useState(0);

  const openBulkImport = (type: 'items' | 'parties') => {
    setBulkType(type);
    setBulkStep('upload');
    setBulkData([]);
    setBulkErrors([]);
    setBulkImported(0);
    setModal({ type: 'bulkImport' });
  };

  const downloadTemplate = () => {
    let csv = '';
    if (bulkType === 'items') {
      csv = 'Item Name,Type (RAW_MATERIAL/FINISHED_GOODS),Category,Unit,GST %,HSN Code,Purchase Rate,Sales Rate,Minimum Stock,Opening Stock\n';
      csv += 'Cotton Fabric White,RAW_MATERIAL,Fabric,Meter,5,5208,120,0,100,500\n';
      csv += 'Classic White T-Shirt,FINISHED_GOODS,Tops,Piece,12,6109,0,499,50,200\n';
    } else {
      csv = 'Party Name,Type (CUSTOMER/VENDOR/CONTRACTOR/COURIER_PARTNER/PLATFORM),Phone,Email,GST Number,Contact Person,Address,City,State\n';
      csv += 'Textile Hub,VENDOR,9876543210,info@textile.com,27AABCT1234A1Z5,Rajesh Shah,45 Bhuleshwar Market,Mumbai,Maharashtra\n';
      csv += 'StyleZone Retail,CUSTOMER,9855667788,buy@style.in,29AABCS7890E1Z2,Vivek Nair,34 Commercial Street,Bangalore,Karnataka\n';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = bulkType === 'items' ? 'item_master_template.csv' : 'party_master_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { setBulkErrors([{ row: 0, field: 'file', message: 'File is empty or has no data rows' }]); return; }
      const headers = lines[0].split(',').map(h => h.trim());
      const rows: Record<string, string>[] = [];
      const errors: { row: number; field: string; message: string }[] = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });
        // Validate
        if (bulkType === 'items') {
          if (!row['Item Name']) errors.push({ row: i + 1, field: 'Item Name', message: 'Item Name is required' });
          if (!['RAW_MATERIAL', 'FINISHED_GOODS'].includes(row['Type (RAW_MATERIAL/FINISHED_GOODS)'] || ''))
            errors.push({ row: i + 1, field: 'Type', message: 'Type must be RAW_MATERIAL or FINISHED_GOODS' });
        } else {
          if (!row['Party Name']) errors.push({ row: i + 1, field: 'Party Name', message: 'Party Name is required' });
          if (!row['Phone']) errors.push({ row: i + 1, field: 'Phone', message: 'Phone is required' });
        }
        rows.push(row);
      }
      setBulkData(rows);
      setBulkErrors(errors);
      setBulkStep('preview');
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeBulkImport = () => {
    let imported = 0;
    if (bulkType === 'items') {
      bulkData.forEach(row => {
        const name = row['Item Name'];
        if (!name) return;
        const type = (row['Type (RAW_MATERIAL/FINISHED_GOODS)'] || 'RAW_MATERIAL') as Item['type'];
        const cat = categories.find(c => c.name.toLowerCase() === (row['Category'] || '').toLowerCase());
        const unit = units.find(u => u.name.toLowerCase() === (row['Unit'] || '').toLowerCase());
        const item: Item = {
          id: generateId(), sku: generateSKU(type, row['Category'] || 'GEN'), name,
          type, categoryId: cat?.id || '', unitId: unit?.id || '',
          gstPercent: Number(row['GST %']) || 12, hsnCode: row['HSN Code'] || '',
          barcode: generateBarcode(), purchaseRate: Number(row['Purchase Rate']) || 0,
          salesRate: Number(row['Sales Rate']) || 0, minimumStock: Number(row['Minimum Stock']) || 10,
          openingStock: Number(row['Opening Stock']) || 0, currentStock: Number(row['Opening Stock']) || 0,
          status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        addItem(item);
        imported++;
      });
    } else {
      bulkData.forEach(row => {
        const name = row['Party Name'];
        if (!name) return;
        const party: Party = {
          id: generateId(), name,
          type: (row['Type (CUSTOMER/VENDOR/CONTRACTOR/COURIER_PARTNER/PLATFORM)'] || 'VENDOR') as Party['type'],
          phone: row['Phone'] || '', email: row['Email'] || '',
          gstNumber: row['GST Number'] || '', contactPerson: row['Contact Person'] || '',
          address: row['Address'] || '', city: row['City'] || '', state: row['State'] || '',
          status: 'ACTIVE', createdAt: new Date().toISOString(),
        };
        addParty(party);
        imported++;
      });
    }
    setBulkImported(imported);
    setBulkStep('result');
  };

  const closeModal = () => setModal(null);

  const filteredItems = items.filter(i =>
    (i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())) &&
    (filterType === 'ALL' || i.type === filterType)
  );

  const filteredParties = parties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterType === 'ALL' || p.type === filterType)
  );

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabItems.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setSearch(''); setFilterType('ALL'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div>
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-60 px-3 py-2.5 bg-white border border-gray-200 rounded-xl">
              <Search size={16} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items by name or SKU..."
                className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none">
              <option value="ALL">All Types</option>
              <option value="RAW_MATERIAL">Raw Material</option>
              <option value="FINISHED_GOODS">Finished Goods</option>
            </select>
            <button onClick={() => openBulkImport('items')} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-sm">
              <Upload size={16} /> Bulk Upload
            </button>
            <button onClick={() => setModal({ type: 'addItem' })} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm">
              <Plus size={16} /> Add Item
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">GST</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map(item => {
                  const isLow = item.currentStock <= item.minimumStock;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">HSN: {item.hsnCode || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.type === 'RAW_MATERIAL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {item.type === 'RAW_MATERIAL' ? '🧵 Raw' : '👔 Finished'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">{item.sku}</td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1 text-sm font-semibold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                          {isLow && <AlertCircle size={12} className="text-red-500" />}
                          {item.currentStock}
                        </div>
                        <div className="text-xs text-gray-400">Min: {item.minimumStock}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.type === 'RAW_MATERIAL' ? formatCurrency(item.purchaseRate) : formatCurrency(item.salesRate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.gstPercent}%</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(item.status)}`}>{item.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setModal({ type: 'viewItem', data: item })} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors" title="View"><Eye size={14} /></button>
                          <button onClick={() => setModal({ type: 'editItem', data: item })} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors" title="Edit"><Edit2 size={14} /></button>
                          <button onClick={() => setModal({ type: 'addItem', data: { ...item, id: undefined, sku: undefined, name: item.name + ' (Copy)' } })} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors" title="Duplicate"><Copy size={14} /></button>
                          <button onClick={() => updateItem(item.id, { status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-orange-600 transition-colors" title="Toggle Status">
                            {item.status === 'ACTIVE' ? <ToggleRight size={14} className="text-green-500" /> : <ToggleLeft size={14} />}
                          </button>
                          <button onClick={() => deleteItem(item.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Package size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No items found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parties Tab */}
      {activeTab === 'parties' && (
        <div>
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-60 px-3 py-2.5 bg-white border border-gray-200 rounded-xl">
              <Search size={16} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parties..."
                className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none">
              <option value="ALL">All Types</option>
              {Object.entries(partyTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button onClick={() => openBulkImport('parties')} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-sm">
              <Upload size={16} /> Bulk Upload
            </button>
            <button onClick={() => setModal({ type: 'addParty' })} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm">
              <Plus size={16} /> Add Party
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredParties.map(party => (
              <div key={party.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {party.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{party.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${partyTypeColors[party.type]}`}>{partyTypeLabels[party.type]}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setModal({ type: 'editParty', data: party })} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600"><Edit2 size={14} /></button>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><span>📞</span>{party.phone}</div>
                  {party.email && <div className="flex items-center gap-2"><span>📧</span>{party.email}</div>}
                  <div className="flex items-center gap-2"><span>📍</span>{party.city}, {party.state}</div>
                  {party.gstNumber && <div className="flex items-center gap-2"><span>🏛️</span><span className="font-mono">{party.gstNumber}</span></div>}
                  {party.contactPerson && <div className="flex items-center gap-2"><span>👤</span>{party.contactPerson}</div>}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(party.status)}`}>{party.status}</span>
                  <span className="text-xs text-gray-400">{formatDate(party.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
          {filteredParties.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No parties found</p>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl">
              <Search size={16} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..."
                className="flex-1 text-sm outline-none" />
            </div>
            <button onClick={() => setModal({ type: 'addCategory' })} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
              <Plus size={16} /> Add Category
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(cat => (
              <div key={cat.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-indigo-200 transition-all">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                  <Tag size={18} className="text-purple-600" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                <p className="text-xs text-gray-500 mt-1">{cat.description || '—'}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(cat.status)}`}>{cat.status}</span>
                  <span className="text-xs text-gray-400">{items.filter(i => i.categoryId === cat.id).length} items</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Units Tab */}
      {activeTab === 'units' && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl">
              <Search size={16} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search units..."
                className="flex-1 text-sm outline-none" />
            </div>
            <button onClick={() => setModal({ type: 'addUnit' })} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
              <Plus size={16} /> Add Unit
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {units.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).map(unit => (
              <div key={unit.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-indigo-200 transition-all">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-3">
                  <span className="font-bold text-cyan-700 text-lg">{unit.symbol}</span>
                </div>
                <p className="font-semibold text-gray-900">{unit.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-2 inline-block ${getStatusColor(unit.status)}`}>{unit.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warehouses Tab */}
      {activeTab === 'warehouses' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warehouses.map(wh => (
              <div key={wh.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                  <Warehouse size={22} className="text-yellow-600" />
                </div>
                <p className="font-bold text-gray-900 text-lg">{wh.name}</p>
                <p className="text-sm text-gray-500 mt-1">📍 {wh.location}</p>
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(wh.status)}`}>{wh.status}</span>
                    <span className="text-xs text-gray-400">{items.filter(i => i.currentStock > 0).length} items stocked</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={modal?.type === 'addItem' || modal?.type === 'editItem'} onClose={closeModal}
        title={modal?.type === 'editItem' ? 'Edit Item' : 'Create New Item'} size="xl">
        <ItemForm
          initial={modal?.data as Partial<Item>}
          onSave={(item) => {
            if (modal?.type === 'editItem') updateItem(item.id, item);
            else addItem(item);
            closeModal();
          }}
          onClose={closeModal}
        />
      </Modal>

      <Modal isOpen={modal?.type === 'addParty' || modal?.type === 'editParty'} onClose={closeModal}
        title={modal?.type === 'editParty' ? 'Edit Party' : 'Create New Party'} size="xl">
        <PartyForm
          initial={modal?.data as Partial<Party>}
          onSave={(party) => {
            if (modal?.type === 'editParty') updateParty(party.id, party);
            else addParty(party);
            closeModal();
          }}
          onClose={closeModal}
        />
      </Modal>

      <Modal isOpen={modal?.type === 'addCategory'} onClose={closeModal} title="Add Category" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input id="catName" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder="e.g. Tops" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input id="catDesc" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder="Optional description" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={() => {
              const name = (document.getElementById('catName') as HTMLInputElement)?.value;
              if (name) { addCategory({ id: generateId(), name, description: (document.getElementById('catDesc') as HTMLInputElement)?.value, status: 'ACTIVE' }); closeModal(); }
            }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Save</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal?.type === 'addUnit'} onClose={closeModal} title="Add Unit" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name *</label>
            <input id="unitName" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder="e.g. Meter" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symbol *</label>
            <input id="unitSymbol" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder="e.g. MTR" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={closeModal} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={() => {
              const name = (document.getElementById('unitName') as HTMLInputElement)?.value;
              const symbol = (document.getElementById('unitSymbol') as HTMLInputElement)?.value;
              if (name && symbol) { addUnit({ id: generateId(), name, symbol, status: 'ACTIVE' }); closeModal(); }
            }} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Save</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal?.type === 'viewItem'} onClose={closeModal} title="Item Details" size="lg">
        <ItemDetailView data={modal?.data} />
      </Modal>

      {/* ──────────── BULK IMPORT MODAL ──────────── */}
      <Modal isOpen={modal?.type === 'bulkImport'} onClose={closeModal} title={`Bulk Upload — ${bulkType === 'items' ? 'Item Master' : 'Party Master'}`} size="2xl">
        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-6">
          {[
            { step: 'upload' as BulkStep, label: 'Upload File', num: 1 },
            { step: 'preview' as BulkStep, label: 'Preview & Validate', num: 2 },
            { step: 'result' as BulkStep, label: 'Import Result', num: 3 },
          ].map((s, idx) => (
            <div key={s.step} className="flex items-center gap-2">
              {idx > 0 && <ArrowRight size={14} className="text-gray-300" />}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                bulkStep === s.step ? 'bg-indigo-600 text-white' :
                (['preview', 'result'].includes(bulkStep) && s.step === 'upload') || (bulkStep === 'result' && s.step === 'preview')
                  ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{s.num}</span>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* STEP 1: Upload */}
        {bulkStep === 'upload' && (
          <div className="space-y-5">
            {/* Template Download */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet size={22} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-indigo-900 text-sm">Step 1: Download Template</h4>
                  <p className="text-xs text-indigo-600 mt-1">Download the CSV template, fill in your data, then upload the file.</p>
                  <button onClick={downloadTemplate}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm">
                    <Download size={14} /> Download {bulkType === 'items' ? 'Item' : 'Party'} Template (.csv)
                  </button>
                </div>
              </div>
            </div>

            {/* Template Fields Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h4 className="font-bold text-gray-800 text-sm mb-3">Template Fields</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {bulkType === 'items' ? (
                  ['Item Name *', 'Type *', 'Category', 'Unit', 'GST %', 'HSN Code', 'Purchase Rate', 'Sales Rate', 'Minimum Stock', 'Opening Stock'].map(f => (
                    <div key={f} className={`text-xs px-3 py-2 rounded-lg ${f.includes('*') ? 'bg-red-50 text-red-700 font-semibold border border-red-200' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      {f}
                    </div>
                  ))
                ) : (
                  ['Party Name *', 'Type *', 'Phone *', 'Email', 'GST Number', 'Contact Person', 'Address', 'City', 'State'].map(f => (
                    <div key={f} className={`text-xs px-3 py-2 rounded-lg ${f.includes('*') ? 'bg-red-50 text-red-700 font-semibold border border-red-200' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      {f}
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">* Required fields</p>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              <Upload size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">Step 2: Upload Your CSV File</p>
              <p className="text-xs text-gray-500 mt-1">Click to browse or drag & drop your filled template here</p>
              <p className="text-xs text-gray-400 mt-2">Supported: .csv files</p>
            </div>
          </div>
        )}

        {/* STEP 2: Preview & Validate */}
        {bulkStep === 'preview' && (
          <div className="space-y-5">
            {/* Validation Summary */}
            <div className={`rounded-2xl p-4 border flex items-center gap-3 ${bulkErrors.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
              {bulkErrors.length > 0 ? (
                <>
                  <XCircle size={22} className="text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">{bulkErrors.length} validation warning(s) found</p>
                    <p className="text-xs text-amber-600 mt-0.5">Records with warnings will still be imported with default values for missing fields.</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle size={22} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-800">All {bulkData.length} records validated successfully!</p>
                    <p className="text-xs text-green-600 mt-0.5">Ready to import into the system.</p>
                  </div>
                </>
              )}
            </div>

            {/* Errors List */}
            {bulkErrors.length > 0 && (
              <div className="bg-white border border-amber-200 rounded-xl p-3 max-h-32 overflow-y-auto">
                {bulkErrors.map((err, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-amber-700 py-1">
                    <XCircle size={12} className="flex-shrink-0" />
                    <span>Row {err.row}: <strong>{err.field}</strong> — {err.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Data Preview Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-gray-800">Data Preview ({bulkData.length} records)</p>
                <span className="text-xs text-gray-500">Showing all rows from uploaded file</span>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-indigo-600">
                      <th className="px-3 py-2.5 text-left font-bold text-white">#</th>
                      {bulkData.length > 0 && Object.keys(bulkData[0]).map(key => (
                        <th key={key} className="px-3 py-2.5 text-left font-bold text-white whitespace-nowrap">{key.replace(/\(.*?\)/g, '').trim()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bulkData.map((row, idx) => {
                      const hasErr = bulkErrors.some(e => e.row === idx + 2);
                      return (
                        <tr key={idx} className={`border-b border-gray-100 ${hasErr ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                          <td className="px-3 py-2 text-gray-400 font-medium">{idx + 1}</td>
                          {Object.values(row).map((val, vi) => (
                            <td key={vi} className={`px-3 py-2 whitespace-nowrap ${val ? 'text-gray-800 font-medium' : 'text-gray-300 italic'}`}>
                              {val || 'empty'}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button onClick={() => setBulkStep('upload')} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">
                ← Back to Upload
              </button>
              <button onClick={executeBulkImport}
                className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 shadow-sm flex items-center gap-2">
                <CheckCircle size={16} /> Import {bulkData.length} Records
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Result */}
        {bulkStep === 'result' && (
          <div className="space-y-5 text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Import Completed!</h3>
              <p className="text-gray-600 mt-2">
                <span className="text-2xl font-black text-green-600">{bulkImported}</span>
                <span className="text-sm ml-1">{bulkType === 'items' ? 'items' : 'parties'} imported successfully</span>
              </p>
              {bulkErrors.length > 0 && (
                <p className="text-xs text-amber-600 mt-2">{bulkErrors.length} rows had warnings (imported with defaults)</p>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mx-auto max-w-sm">
              <p className="text-sm text-green-800 font-medium">✅ All records have been added to your {bulkType === 'items' ? 'Item Master' : 'Party Master'}</p>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button onClick={() => setBulkStep('upload')} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">
                Upload More
              </button>
              <button onClick={closeModal} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm">
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ItemDetailView({ data }: { data: unknown }) {
  const { categories, units } = useStore();
  if (!data) return null;
  const item = data as Item;
  const cat = categories.find((c: { id: string }) => c.id === item.categoryId);
  const unit = units.find((u: { id: string }) => u.id === item.unitId);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[
          ['SKU', item.sku], ['Item Name', item.name], ['Type', item.type.replace('_', ' ')],
          ['Category', cat?.name || '—'], ['Unit', unit?.name || '—'], ['HSN Code', item.hsnCode || '—'],
          ['GST %', `${item.gstPercent}%`], ['Purchase Rate', formatCurrency(item.purchaseRate)],
          ['Sales Rate', formatCurrency(item.salesRate)], ['Min Stock', item.minimumStock],
          ['Current Stock', item.currentStock], ['Barcode', item.barcode || '—'],
        ].map(([label, val]) => (
          <div key={label as string} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">{label as string}</p>
            <p className="text-sm font-semibold text-gray-900">{String(val)}</p>
          </div>
        ))}
      </div>
      <div className={`p-3 rounded-xl ${item.currentStock <= item.minimumStock ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex items-center gap-2">
          {item.currentStock <= item.minimumStock ? <AlertCircle size={16} className="text-red-600" /> : <History size={16} className="text-green-600" />}
          <span className={`text-sm font-semibold ${item.currentStock <= item.minimumStock ? 'text-red-700' : 'text-green-700'}`}>
            {item.currentStock <= item.minimumStock ? `⚠️ Low Stock! Current: ${item.currentStock}, Minimum: ${item.minimumStock}` : `✅ Stock OK - Current: ${item.currentStock}`}
          </span>
        </div>
      </div>
    </div>
  );
}

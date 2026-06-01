import { useState, useMemo, useEffect } from 'react';
import { 
  Users, Package, Tag, Scale, Percent, Truck, Layers, Monitor, 
  CreditCard, Landmark, FileSpreadsheet, Receipt, Hash, 
  Plus, Search, Filter, Download, Upload, Edit, Trash2, 
  X, Check, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MasterRecord } from '../types';

// --- Configuration for all Masters ---
const MASTER_CONFIG: Record<string, any> = {
  party: {
    id: 'party', name: 'Party Master', icon: Users,
    columns: [
      { key: 'partyCode', label: 'Code' },
      { key: 'partyName', label: 'Name' },
      { key: 'partyType', label: 'Type' },
      { key: 'gstin', label: 'GSTIN' },
      { key: 'contactPerson', label: 'Contact' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'city', label: 'City' },
      { key: 'creditLimit', label: 'Credit Limit', type: 'currency' },
      { key: 'isActive', label: 'Status', type: 'badge' },
    ],
    formFields: [
      { key: 'partyName', label: 'Party Name', type: 'text', required: true },
      { key: 'legalName', label: 'Legal Business Name', type: 'text' },
      { key: 'partyType', label: 'Party Type', type: 'select', options: ['Customer', 'Supplier', 'Job Worker', 'Transporter', 'Contractor'], required: true },
      { key: 'gstin', label: 'GST Number', type: 'text' },
      { key: 'pan', label: 'PAN Number', type: 'text' },
      { key: 'contactPerson', label: 'Contact Person', type: 'text' },
      { key: 'mobile', label: 'Mobile Number', type: 'text' },
      { key: 'email', label: 'Email Address', type: 'email' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'state', label: 'State', type: 'text' },
      { key: 'creditLimit', label: 'Credit Limit', type: 'number' },
      { key: 'creditDays', label: 'Credit Days', type: 'number' },
    ],
    importTemplate: ['Party Name', 'Legal Name', 'Type', 'GSTIN', 'PAN', 'Contact Person', 'Mobile', 'Email', 'City', 'State', 'Credit Limit', 'Credit Days'],
    initialData: { partyCode: 'P-', partyType: 'Customer', isActive: true }
  },
  item: {
    id: 'item', name: 'Item Master', icon: Package,
    columns: [
      { key: 'itemCode', label: 'SKU/Code' },
      { key: 'itemName', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'itemType', label: 'Type' },
      { key: 'brand', label: 'Brand' },
      { key: 'primaryUnit', label: 'Unit' },
      { key: 'purchaseRate', label: 'Purchase Rate', type: 'currency' },
      { key: 'sellingRate', label: 'Selling Rate', type: 'currency' },
      { key: 'isActive', label: 'Status', type: 'badge' },
    ],
    formFields: [
      { key: 'itemName', label: 'Item Name', type: 'text', required: true },
      { key: 'itemCode', label: 'SKU/Code', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'itemType', label: 'Item Type', type: 'select', options: ['Raw Material', 'Semi Finished', 'Finished Goods', 'Consumable', 'Service'], required: true },
      { key: 'brand', label: 'Brand', type: 'text' },
      { key: 'primaryUnit', label: 'Primary Unit', type: 'text' },
      { key: 'purchaseRate', label: 'Purchase Rate', type: 'number' },
      { key: 'sellingRate', label: 'Selling Rate', type: 'number' },
    ],
    // Specific template for Item Import with Inventory linkage
    importTemplate: ['SKU', 'Item Name', 'Category', 'Brand', 'Color', 'Size', 'Unit', 'Opening Stock', 'Sales Rate', 'Purchase Rate'],
    initialData: { itemCode: 'I-', itemType: 'Raw Material', isActive: true }
  },
  category: {
    id: 'category', name: 'Category Master', icon: Tag,
    columns: [
      { key: 'categoryCode', label: 'Code' },
      { key: 'categoryName', label: 'Name' },
      { key: 'parentCategory', label: 'Parent Category' },
      { key: 'description', label: 'Description' },
      { key: 'isActive', label: 'Status', type: 'badge' },
    ],
    formFields: [
      { key: 'categoryName', label: 'Category Name', type: 'text', required: true },
      { key: 'parentCategory', label: 'Parent Category', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    importTemplate: ['Category Name', 'Parent Category', 'Description'],
    initialData: { categoryCode: 'C-', isActive: true }
  },
  unit: {
    id: 'unit', name: 'Unit Master', icon: Scale,
    columns: [
      { key: 'unitCode', label: 'Code' },
      { key: 'unitName', label: 'Name' },
      { key: 'shortName', label: 'Short Name' },
      { key: 'decimalAllowed', label: 'Decimal Allowed', type: 'boolean' },
      { key: 'isActive', label: 'Status', type: 'badge' },
    ],
    formFields: [
      { key: 'unitName', label: 'Unit Name', type: 'text', required: true },
      { key: 'shortName', label: 'Short Name', type: 'text' },
      { key: 'decimalAllowed', label: 'Decimal Allowed', type: 'checkbox' },
    ],
    importTemplate: ['Unit Name', 'Short Name', 'Decimal Allowed (Yes/No)'],
    initialData: { unitCode: 'U-', decimalAllowed: false, isActive: true }
  },
  tax: {
    id: 'tax', name: 'Tax Master', icon: Percent,
    columns: [
      { key: 'taxCode', label: 'Code' },
      { key: 'taxName', label: 'Name' },
      { key: 'taxType', label: 'Type' },
      { key: 'taxPercent', label: 'Percentage' },
      { key: 'isActive', label: 'Status', type: 'badge' },
    ],
    formFields: [
      { key: 'taxName', label: 'Tax Name', type: 'text', required: true },
      { key: 'taxType', label: 'Tax Type', type: 'select', options: ['GST', 'IGST', 'CGST', 'SGST', 'TDS', 'TCS'], required: true },
      { key: 'taxPercent', label: 'Tax Percentage', type: 'number', required: true },
    ],
    importTemplate: ['Tax Name', 'Type', 'Percentage'],
    initialData: { taxCode: 'T-', isActive: true }
  },
  courier: {
    id: 'courier', name: 'Courier Partner', icon: Truck,
    columns: [
      { key: 'courierCode', label: 'Code' },
      { key: 'courierName', label: 'Name' },
      { key: 'courierType', label: 'Type' },
      { key: 'contactPerson', label: 'Contact' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'codAvailable', label: 'COD', type: 'boolean' },
      { key: 'isActive', label: 'Status', type: 'badge' },
    ],
    formFields: [
      { key: 'courierName', label: 'Courier Name', type: 'text', required: true },
      { key: 'courierType', label: 'Courier Type', type: 'select', options: ['Domestic', 'International', 'Local'], required: true },
      { key: 'contactPerson', label: 'Contact Person', type: 'text' },
      { key: 'mobile', label: 'Mobile Number', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'trackingUrl', label: 'Tracking URL', type: 'text' },
      { key: 'codAvailable', label: 'COD Available', type: 'checkbox' },
    ],
    importTemplate: ['Courier Name', 'Type', 'Contact Person', 'Mobile', 'Email', 'Tracking URL', 'COD Available (Yes/No)'],
    initialData: { courierCode: 'CR-', isActive: true }
  },
  aggregator: {
    id: 'aggregator', name: 'Courier Aggregator', icon: Layers,
    columns: [
      { key: 'aggregatorCode', label: 'Code' },
      { key: 'aggregatorName', label: 'Name' },
      { key: 'contactPerson', label: 'Contact' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'isActive', label: 'Status', type: 'badge' },
    ],
    formFields: [
      { key: 'aggregatorName', label: 'Aggregator Name', type: 'text', required: true },
      { key: 'contactPerson', label: 'Contact Person', type: 'text' },
      { key: 'mobile', label: 'Mobile Number', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'apiKey', label: 'API Key', type: 'text' },
    ],
    importTemplate: ['Aggregator Name', 'Contact Person', 'Mobile', 'Email', 'API Key'],
    initialData: { aggregatorCode: 'A-', isActive: true }
  },
  platform: {
    id: 'platform', name: 'Platform Master', icon: Monitor,
    columns: [
      { key: 'platformCode', label: 'Code' },
      { key: 'platformName', label: 'Name' },
      { key: 'platformType', label: 'Type' },
      { key: 'feesPercent', label: 'Fees %' },
      { key: 'isActive', label: 'Status', type: 'badge' },
    ],
    formFields: [
      { key: 'platformName', label: 'Platform Name', type: 'text', required: true },
      { key: 'platformType', label: 'Platform Type', type: 'select', options: ['Marketplace', 'Website', 'Retail', 'Wholesale'], required: true },
      { key: 'apiKey', label: 'API Key', type: 'text' },
      { key: 'feesPercent', label: 'Marketplace Fees %', type: 'number' },
    ],
    importTemplate: ['Platform Name', 'Type', 'API Key', 'Fees %'],
    initialData: { platformCode: 'PL-', isActive: true }
  },
  // Generic config for remaining masters to save space but maintain functionality
  payment: { id: 'payment', name: 'Payment Terms', icon: CreditCard, columns: [{key:'termName',label:'Name'},{key:'dueDays',label:'Due Days'},{key:'isActive',label:'Status',type:'badge'}], formFields: [{key:'termName',label:'Term Name',type:'text',required:true},{key:'dueDays',label:'Due Days',type:'number'},{key:'advancePercent',label:'Advance %',type:'number'},{key:'description',label:'Description',type:'textarea'}], importTemplate: ['Term Name', 'Due Days', 'Advance %', 'Description'], initialData: { isActive: true } },
  bank: { id: 'bank', name: 'Bank Master', icon: Landmark, columns: [{key:'bankName',label:'Bank Name'},{key:'accountHolder',label:'Holder'},{key:'accountNumber',label:'Account No'},{key:'ifscCode',label:'IFSC'},{key:'isActive',label:'Status',type:'badge'}], formFields: [{key:'bankName',label:'Bank Name',type:'text',required:true},{key:'accountHolder',label:'Account Holder',type:'text'},{key:'accountNumber',label:'Account Number',type:'text'},{key:'ifscCode',label:'IFSC Code',type:'text'},{key:'branchName',label:'Branch',type:'text'},{key:'accountType',label:'Account Type',type:'select',options:['Savings','Current']},{key:'upiId',label:'UPI ID',type:'text'}], importTemplate: ['Bank Name', 'Holder', 'Account No', 'IFSC', 'Branch', 'Type', 'UPI'], initialData: { isActive: true } },
  bom: { id: 'bom', name: 'BOM Master', icon: FileSpreadsheet, columns: [{key:'bomCode',label:'Code'},{key:'bomName',label:'Name'},{key:'productName',label:'Product'},{key:'productSku',label:'SKU'},{key:'totalCost',label:'Total Cost',type:'currency'},{key:'isActive',label:'Status',type:'badge'}], formFields: [{key:'bomName',label:'BOM Name',type:'text',required:true},{key:'productName',label:'Product Name',type:'text'},{key:'productSku',label:'Product SKU',type:'text'},{key:'version',label:'Version',type:'text'},{key:'totalCost',label:'Total Cost',type:'number'}], importTemplate: ['BOM Name', 'Product Name', 'SKU', 'Version', 'Total Cost'], initialData: { bomCode: 'BOM-', isActive: true } },
  expense: { id: 'expense', name: 'Expense Head', icon: Receipt, columns: [{key:'expenseCode',label:'Code'},{key:'expenseName',label:'Name'},{key:'category',label:'Category'},{key:'accountingGroup',label:'Group'},{key:'isActive',label:'Status',type:'badge'}], formFields: [{key:'expenseName',label:'Expense Name',type:'text',required:true},{key:'category',label:'Category',type:'text'},{key:'accountingGroup',label:'Accounting Group',type:'text'}], importTemplate: ['Expense Name', 'Category', 'Accounting Group'], initialData: { expenseCode: 'EXP-', isActive: true } },
  docnum: { id: 'docnum', name: 'Doc Numbering', icon: Hash, columns: [{key:'docType',label:'Document Type'},{key:'prefix',label:'Prefix'},{key:'suffix',label:'Suffix'},{key:'currentNumber',label:'Current No'},{key:'autoResetYearly',label:'Auto Reset',type:'boolean'},{key:'isActive',label:'Status',type:'badge'}], formFields: [{key:'docType',label:'Document Type',type:'text',required:true},{key:'prefix',label:'Prefix',type:'text'},{key:'suffix',label:'Suffix',type:'text'},{key:'startNumber',label:'Start Number',type:'number'},{key:'currentNumber',label:'Current Number',type:'number'},{key:'autoResetYearly',label:'Auto Reset Yearly',type:'checkbox'}], importTemplate: ['Document Type', 'Prefix', 'Suffix', 'Start No', 'Current No', 'Auto Reset (Yes/No)'], initialData: { isActive: true } },
};

const MASTER_LIST = Object.values(MASTER_CONFIG);

export default function Masters() {
  const [activeMaster, setActiveMaster] = useState<string>('party');
  const [data, setData] = useState<Record<string, MasterRecord[]>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterRecord | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'preview' | 'success' | 'error'>('idle');
  const [importStats, setImportStats] = useState<any>({ total: 0, success: 0, failed: 0, duplicates: 0, newItems: 0, updatedItems: 0, invCreated: 0 });

  // Fetch data from Supabase when activeMaster changes
  useEffect(() => {
    fetchMasters(activeMaster);
  }, [activeMaster]);

  const fetchMasters = async (type: string) => {
    setLoading(true);
    try {
      const { data: records, error } = await supabase
        .from('app_masters')
        .select('id, data')
        .eq('type', type);
      
      if (error) throw error;
      
      // Transform data: merge id into the data object
      const transformed = (records || []).map((r: any) => ({ id: r.id, ...r.data }));
      setData(prev => ({ ...prev, [type]: transformed }));
    } catch (error) {
      console.error(`Error fetching ${type} masters:`, error);
      setData(prev => ({ ...prev, [type]: [] }));
    } finally {
      setLoading(false);
    }
  };

  const config = MASTER_CONFIG[activeMaster];
  const currentData = data[activeMaster] || [];

  // Filter Data
  const filteredData = useMemo(() => {
    if (!searchTerm) return currentData;
    const lowerTerm = searchTerm.toLowerCase();
    return currentData.filter((item: any) => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(lowerTerm)
      )
    );
  }, [currentData, searchTerm]);

  // Handlers
  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: MasterRecord) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record? (Admin only)')) {
      setData(prev => ({
        ...prev,
        [activeMaster]: prev[activeMaster].filter(item => item.id !== id)
      }));
    }
  };

  const handleToggleStatus = (id: string) => {
    setData(prev => ({
      ...prev,
      [activeMaster]: prev[activeMaster].map(item => 
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    }));
  };

  const handleSave = (formData: any) => {
    // Duplicate Validation
    const codeKey = Object.keys(formData).find(k => k.endsWith('Code') || k.endsWith('Name'));
    if (codeKey && !editingItem) {
      const exists = currentData.some(item => item[codeKey] === formData[codeKey]);
      if (exists) {
        alert(`Duplicate record found: ${formData[codeKey]}`);
        return;
      }
    }

    if (editingItem) {
      setData(prev => ({
        ...prev,
        [activeMaster]: prev[activeMaster].map(item => 
          item.id === editingItem.id ? { ...item, ...formData, modifiedAt: new Date().toISOString() } : item
        )
      }));
    } else {
      const newId = `${activeMaster.substring(0,3).toUpperCase()}${Date.now()}`;
      const codeKey = Object.keys(formData).find(k => k.endsWith('Code'));
      const newCode = codeKey ? `${config.initialData[codeKey]}${String(currentData.length + 1).padStart(3, '0')}` : '';
      
      setData(prev => ({
        ...prev,
        [activeMaster]: [...prev[activeMaster], { id: newId, [codeKey || 'id']: newCode, ...formData, createdBy: 'admin', createdAt: new Date().toISOString(), isActive: true }]
      }));
    }
    setIsModalOpen(false);
  };

  // Import Logic
  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + config.importTemplate.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${config.name}_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const rows = text.split('\n').slice(1).filter(r => r.trim());
        
        let parsed: any[] = [];
        let stats = { total: rows.length, success: 0, failed: 0, duplicates: 0, newItems: 0, updatedItems: 0, invCreated: 0 };

        if (activeMaster === 'item') {
          // Specific Logic for Item Master Import
          const existingItems = new Map(currentData.map((i: any) => [i.itemCode, i]));
          const existingCategories = new Set((data.category || []).map((c: any) => c.categoryName));
          const newCategories: any[] = [];
          const newItems: any[] = [];
          const updatedItems: any[] = [];
          const newInventory: any[] = [];

          rows.forEach((row, idx) => {
            const cols = row.split(',');
            // Mapping: SKU, Item Name, Category, Brand, Color, Size, Unit, Opening Stock, Sales Rate, Purchase Rate
            const sku = cols[0]?.trim();
            const name = cols[1]?.trim();
            const category = cols[2]?.trim();
            const brand = cols[3]?.trim();
            const color = cols[4]?.trim();
            const size = cols[5]?.trim();
            const unit = cols[6]?.trim() || 'Pcs';
            const openingStock = parseFloat(cols[7]) || 0;
            const salesRate = parseFloat(cols[8]) || 0;
            const purchaseRate = parseFloat(cols[9]) || 0;

            if (!sku || !name) {
              stats.failed++;
              return;
            }

            // Auto-create Category
            if (category && !existingCategories.has(category) && !newCategories.find(c => c.categoryName === category)) {
              newCategories.push({
                id: `cat_${Date.now()}_${idx}`,
                categoryCode: `CAT-${category.substring(0,3).toUpperCase()}`,
                categoryName: category,
                parentCategory: 'Imported',
                description: 'Auto-created during import',
                isActive: true
              });
              existingCategories.add(category);
            }

            const itemData = {
              itemCode: sku,
              itemName: name,
              category: category || 'General',
              itemType: 'Finished Goods', // Default for sales items
              brand: brand || 'Generic',
              sku: sku,
              primaryUnit: unit,
              sellingRate: salesRate,
              purchaseRate: purchaseRate,
              mrp: salesRate,
              gstPercent: 5,
              reorderLevel: 10,
              isActive: true,
              color, size // Store extra fields if schema allows, or ignore
            };

            if (existingItems.has(sku)) {
              // Update existing
              stats.updatedItems++;
              stats.success++;
              updatedItems.push({ ...existingItems.get(sku), ...itemData });
              // Update inventory if opening stock provided > 0
              if (openingStock > 0) {
                 newInventory.push({ itemId: existingItems.get(sku).id, sku, stockChange: openingStock, type: 'adjustment', date: new Date().toISOString() });
                 stats.invCreated++; // Technically updated, but counting as inventory action
              }
            } else {
              // Create new
              stats.newItems++;
              stats.success++;
              const newId = `item_${Date.now()}_${idx}`;
              newItems.push({ id: newId, ...itemData, createdAt: new Date().toISOString() });
              newInventory.push({ itemId: newId, sku, currentStock: openingStock, reservedStock: 0, availableStock: openingStock });
              stats.invCreated++;
            }
          });

          // Apply updates to state (simulated here, applied in confirm)
          parsed = rows.map((row, idx) => ({ rowId: idx + 2, data: row, status: 'valid' })); // Simplified preview
          // Store processed data in a ref or state for confirmation
          (window as any).pendingItemImport = { newItems, updatedItems, newCategories, newInventory, stats };
          setImportStats(stats);

        } else {
          // Generic Logic for other masters
          parsed = rows.filter(r => r.trim()).map((row, idx) => {
            const cols = row.split(',');
            const obj: any = { id: `imp_${idx}` };
            config.importTemplate.forEach((header: string, i: number) => {
              const key = Object.keys(config.formFields.find((f: any) => f.label === header) || {})?.[0] || `col${i}`;
              obj[key] = cols[i]?.trim();
            });
            return obj;
          });
          let duplicates = 0;
          parsed.forEach((p: any) => {
            const codeKey = Object.keys(p).find(k => k.endsWith('Code') || k.endsWith('Name'));
            if (codeKey && currentData.some(item => item[codeKey] === p[codeKey])) duplicates++;
          });
          setImportStats({ total: parsed.length, success: parsed.length - duplicates, failed: 0, duplicates });
        }

        setImportPreview(parsed);
        setImportStatus('preview');
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmImport = async () => {
    try {
      if (activeMaster === 'item' && (window as any).pendingItemImport) {
        const { newItems, updatedItems, newCategories, newInventory, stats } = (window as any).pendingItemImport;
        
        // 1. Insert new Items into app_masters
        if (newItems.length > 0) {
          const { error } = await supabase.from('app_masters').insert(newItems.map((i: any) => ({ type: 'item', data: i })));
          if (error) throw error;
        }
        
        // 2. Update existing Items
        for (const item of updatedItems) {
          const { id, ...dataPayload } = item;
          const { error } = await supabase.from('app_masters').update({ data: dataPayload, updated_at: new Date().toISOString() }).eq('id', id);
          if (error) throw error;
        }

        // 3. Insert new Categories
        if (newCategories.length > 0) {
          const { error } = await supabase.from('app_masters').insert(newCategories.map((c: any) => ({ type: 'category', data: c })));
          if (error) throw error;
        }

        // 4. Insert new Inventory records
        if (newInventory.length > 0) {
          const { error } = await supabase.from('inventory').insert(newInventory);
          if (error) throw error;
        }

        setImportStats(stats);
        // Refresh data
        fetchMasters('item');
        fetchMasters('category');
      } else {
        // Generic Import
        const newRecords = importPreview.map((p: any) => {
          const { id, ...dataPayload } = p;
          return { type: activeMaster, data: { ...dataPayload, createdBy: 'import', createdAt: new Date().toISOString(), isActive: true } };
        });
        
        if (newRecords.length > 0) {
          const { error } = await supabase.from('app_masters').insert(newRecords);
          if (error) throw error;
        }
        
        // Refresh data
        fetchMasters(activeMaster);
      }
      
      setImportStatus('success');
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportStatus('idle');
        setImportPreview([]);
        if (activeMaster === 'item') (window as any).pendingItemImport = null;
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import data. Please check console for details.');
      setImportStatus('error');
    }
  };

  const handleExport = () => {
    const headers = config.columns.map((c: any) => c.label).join(',');
    const rows = filteredData.map((item: any) => 
      config.columns.map((c: any) => item[c.key] || '').join(',')
    ).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${config.name}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 animate-fadeIn">
      {/* Sidebar for Masters */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Master Data</h2>
          <p className="text-xs text-gray-500">Central Repository</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {MASTER_LIST.map((m: any) => (
            <button
              key={m.id}
              onClick={() => { setActiveMaster(m.id); setSearchTerm(''); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeMaster === m.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <m.icon className="w-4 h-4" />
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <config.icon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{config.name}</h1>
              <p className="text-sm text-gray-500">{currentData.length} records found</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Upload className="w-4 h-4" /> Bulk Import
            </button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
              <Plus className="w-4 h-4" /> Add New
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-white border-b border-gray-200 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={`Search ${config.name}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading {config.name} from database...</span>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[1000px]">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  {config.columns.map((col: any) => (
                    <th key={col.key} className="px-6 py-3 whitespace-nowrap">{col.label}</th>
                  ))}
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.length > 0 ? filteredData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {config.columns.map((col: any) => (
                      <td key={col.key} className="px-6 py-3 whitespace-nowrap">
                        {col.type === 'badge' ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${item[col.key] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item[col.key] ? 'Active' : 'Inactive'}
                          </span>
                        ) : col.type === 'currency' ? (
                          <span className="font-medium">₹{Number(item[col.key] || 0).toLocaleString()}</span>
                        ) : col.type === 'boolean' ? (
                          <span className="text-gray-600">{item[col.key] ? 'Yes' : 'No'}</span>
                        ) : (
                          <span className="text-gray-700">{item[col.key] || '-'}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleToggleStatus(item.id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Toggle Status"><Check className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={config.columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                      No records found. Click "Add New" or "Bulk Import" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <MasterFormModal 
          config={config} 
          item={editingItem} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}

      {/* Bulk Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Bulk Import: {config.name}</h2>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {importStatus === 'idle' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Instructions</h4>
                      <p className="text-sm text-blue-700 mt-1">Download the template, fill in your data, and upload it here. Duplicate records will be highlighted.</p>
                    </div>
                  </div>
                  <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 w-full justify-center">
                    <Download className="w-4 h-4" /> Download Import Template (.csv)
                  </button>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">CSV or Excel files only</p>
                    <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-indigo-700">Select File</label>
                  </div>
                </div>
              )}

              {importStatus === 'preview' && (
                <div className="space-y-4">
                  {activeMaster === 'item' ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200"><p className="text-xs text-blue-600">New Items</p><p className="text-xl font-bold text-blue-700">{importStats.newItems}</p></div>
                      <div className="bg-amber-50 p-3 rounded-lg text-center border border-amber-200"><p className="text-xs text-amber-600">Updated Items</p><p className="text-xl font-bold text-amber-700">{importStats.updatedItems}</p></div>
                      <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200"><p className="text-xs text-green-600">Inventory Created</p><p className="text-xl font-bold text-green-700">{importStats.invCreated}</p></div>
                      <div className="bg-red-50 p-3 rounded-lg text-center border border-red-200"><p className="text-xs text-red-600">Failed</p><p className="text-xl font-bold text-red-700">{importStats.failed}</p></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg text-center"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold">{importStats.total}</p></div>
                      <div className="bg-green-50 p-3 rounded-lg text-center"><p className="text-xs text-green-600">Success</p><p className="text-xl font-bold text-green-700">{importStats.success}</p></div>
                      <div className="bg-amber-50 p-3 rounded-lg text-center"><p className="text-xs text-amber-600">Duplicates</p><p className="text-xl font-bold text-amber-700">{importStats.duplicates}</p></div>
                      <div className="bg-red-50 p-3 rounded-lg text-center"><p className="text-xs text-red-600">Failed</p><p className="text-xl font-bold text-red-700">{importStats.failed}</p></div>
                    </div>
                  )}
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50">
                        <tr>{config.importTemplate.map((h: string) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y">
                        {importPreview.map((row: any, idx: number) => (
                          <tr key={idx}>
                            {config.importTemplate.map((h: string) => {
                              const key = Object.keys(config.formFields.find((f: any) => f.label === h) || {})?.[0] || `col`;
                              const isDup = key && currentData.some((item: any) => item[key] === row[key]);
                              return <td key={h} className={`px-3 py-2 ${isDup ? 'bg-red-50 text-red-600' : ''}`}>{row[key] || '-'}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importStatus === 'success' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Import Successful!</h3>
                  <p className="text-gray-500 mt-2">{importStats.success} records added successfully.</p>
                </div>
              )}
            </div>

            {importStatus === 'preview' && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => { setImportStatus('idle'); setImportPreview([]); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white">Cancel</button>
                <button onClick={handleConfirmImport} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Confirm Import</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-Components ---

function MasterFormModal({ config, item, onClose, onSave }: any) {
  const [formData, setFormData] = useState(item || config.initialData || {});

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic required validation
    for (const field of config.formFields) {
      if (field.required && !formData[field.key]) {
        alert(`${field.label} is required`);
        return;
      }
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{item ? 'Edit' : 'Add New'} {config.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.formFields.map((field: any) => (
              <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select 
                    value={formData[field.key] || ''} 
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required={field.required}
                  >
                    <option value="">Select...</option>
                    {field.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea 
                    value={formData[field.key] || ''} 
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      checked={!!formData[field.key]} 
                      onChange={(e) => handleChange(field.key, e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600">Yes</span>
                  </div>
                ) : (
                  <input 
                    type={field.type} 
                    value={formData[field.key] || ''} 
                    onChange={(e) => handleChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
        </form>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Save Record</button>
        </div>
      </div>
    </div>
  );
}
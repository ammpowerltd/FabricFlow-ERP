// B2B Invoice module - temporarily simplified to fix crash
import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { formatCurrency, generateId, formatDate, generateSKU, generateBarcode } from '../utils/helpers';
import { Plus, Search, Eye, FileText, Printer, X, UserPlus, Package, Edit2, Trash2 } from 'lucide-react';
import type { GSTType, Item, Party } from '../types';

type InvoiceStatus = 'DRAFT' | 'UNPAID' | 'PARTIAL_PAID' | 'PAID' | 'OVERDUE';
interface B2BLineItem { id: string; itemId: string; itemName: string; description: string; hsnCode: string; quantity: number; unitPrice: number; discount: number; gstPercent: number; }
interface B2BInvoice { id: string; invoiceNo: string; invoiceDate: string; dueDate: string; sellerName: string; sellerGST: string; sellerAddress: string; buyerName: string; buyerGST: string; billingAddress: string; shippingAddress: string; gstType: GSTType; items: B2BLineItem[]; subtotal: number; totalDiscount: number; totalGST: number; grandTotal: number; paymentTerms: string; bankDetails: string; notes: string; status: InvoiceStatus; paidAmount: number; createdAt: string; }

const statusColors: Record<InvoiceStatus, string> = { DRAFT: 'bg-gray-100 text-gray-600', UNPAID: 'bg-red-100 text-red-700', PARTIAL_PAID: 'bg-orange-100 text-orange-700', PAID: 'bg-green-100 text-green-700', OVERDUE: 'bg-red-200 text-red-800' };
const emptyLine = (): B2BLineItem => ({ id: generateId(), itemId: '', itemName: '', description: '', hsnCode: '', quantity: 1, unitPrice: 0, discount: 0, gstPercent: 18 });

export default function B2BInvoice() {
  const { items: masterItems, parties, categories, units, addItem, addParty, setSidebarCollapsed } = useStore();
  const customers = parties.filter(p => p.type === 'CUSTOMER' && p.status === 'ACTIVE');
  const allItems = masterItems.filter(i => i.status === 'ACTIVE');
  const [invoices, setInvoices] = useState<B2BInvoice[]>([]);
  const [modal, setModal] = useState<{ type: string; data?: unknown } | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [currentView, setCurrentView] = useState<'dashboard' | 'create'>('dashboard');
  const [savedInvNo, setSavedInvNo] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [billMode, setBillMode] = useState<'auto' | 'manual'>('auto');
  const [manualBillNo, setManualBillNo] = useState('');
  const [itemSearchOpen, setItemSearchOpen] = useState<string | null>(null);
  const [itemSearchText, setItemSearchText] = useState<Record<string, string>>({});
  const [custSearch, setCustSearch] = useState('');
  const [custOpen, setCustOpen] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const custRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (custRef.current && !custRef.current.contains(e.target as Node)) setCustOpen(false); const t = e.target as HTMLElement; if (!t.closest('td')) setItemSearchOpen(null); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const custResults = custSearch.trim() ? customers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) || (c.gstNumber||'').toLowerCase().includes(custSearch.toLowerCase()) || c.phone.includes(custSearch)) : customers;

  const selectCust = (id: string) => {
    const c = customers.find(p => p.id === id);
    if (c) { setCustSearch(c.name); setForm(f => ({ ...f, buyerName: c.name, buyerGST: c.gstNumber || '', billingAddress: `${c.address}${c.city ? ', '+c.city : ''}${c.state ? ', '+c.state : ''}` })); setSameAsBilling(false); }
    setCustOpen(false);
  };

  // Create Item inline modal
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [createItemForRow, setCreateItemForRow] = useState('');
  const [newItem, setNewItem] = useState({ name: '', type: 'FINISHED_GOODS' as Item['type'], categoryId: '', unitId: '', gstPercent: 12, hsnCode: '', purchaseRate: 0, salesRate: 0, minimumStock: 10, openingStock: 0 });

  const saveNewItem = () => {
    if (!newItem.name) return;
    const item: Item = { id: generateId(), sku: generateSKU(newItem.type, 'GEN'), name: newItem.name, type: newItem.type, categoryId: newItem.categoryId, unitId: newItem.unitId, gstPercent: newItem.gstPercent, hsnCode: newItem.hsnCode, barcode: generateBarcode(), purchaseRate: newItem.purchaseRate, salesRate: newItem.salesRate, minimumStock: newItem.minimumStock, openingStock: newItem.openingStock, currentStock: newItem.openingStock, status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    addItem(item);
    // Auto-select in the row
    if (createItemForRow) {
      setLineItems(rows => rows.map(r => r.id === createItemForRow ? { ...r, itemId: item.id, itemName: item.name, hsnCode: item.hsnCode, unitPrice: item.salesRate || item.purchaseRate, gstPercent: item.gstPercent, quantity: r.quantity || 1 } : r));
    }
    setShowCreateItem(false);
    setNewItem({ name: '', type: 'FINISHED_GOODS', categoryId: '', unitId: '', gstPercent: 12, hsnCode: '', purchaseRate: 0, salesRate: 0, minimumStock: 10, openingStock: 0 });
    setCreateItemForRow('');
  };

  // Create Party inline modal
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [newParty, setNewParty] = useState({ name: '', type: 'CUSTOMER' as Party['type'], phone: '', email: '', gstNumber: '', contactPerson: '', address: '', city: '', state: '' });

  const saveNewParty = () => {
    if (!newParty.name || !newParty.phone) return;
    const party: Party = { id: generateId(), ...newParty, status: 'ACTIVE', createdAt: new Date().toISOString() };
    addParty(party);
    setCustSearch(party.name);
    setForm(f => ({ ...f, buyerName: party.name, buyerGST: party.gstNumber || '', billingAddress: `${party.address}${party.city ? ', '+party.city : ''}${party.state ? ', '+party.state : ''}` }));
    setShowCreateParty(false);
    setNewParty({ name: '', type: 'CUSTOMER', phone: '', email: '', gstNumber: '', contactPerson: '', address: '', city: '', state: '' });
  };

  const [form, setForm] = useState({ invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', buyerName: '', buyerGST: '', billingAddress: '', shippingAddress: '', gstType: 'CGST_SGST' as GSTType, paymentTerms: 'Net 30', bankDetails: '', notes: '' });
  const [lineItems, setLineItems] = useState<B2BLineItem[]>([emptyLine(), emptyLine()]);

  const calcLine = (l: B2BLineItem) => { const base = l.quantity * l.unitPrice; const disc = base * l.discount / 100; const taxable = base - disc; const gst = taxable * l.gstPercent / 100; return { base, disc, taxable, gst, total: taxable + gst }; };
  const subtotal = lineItems.reduce((s, l) => s + calcLine(l).taxable, 0);
  const totalDiscount = lineItems.reduce((s, l) => s + calcLine(l).disc, 0);
  const totalGST = lineItems.reduce((s, l) => s + calcLine(l).gst, 0);
  const grandTotal = subtotal + totalGST;
  const nextNo = `B2B-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
  const getEffectiveBillNo = () => billMode === 'manual' ? manualBillNo : nextNo;
  const isDuplicateBillNo = (no: string) => invoices.some(inv => inv.invoiceNo.toLowerCase() === no.toLowerCase());
  const switchView = (view: 'dashboard' | 'create') => { setCurrentView(view); setSidebarCollapsed(view === 'create'); setValidationErrors([]); };

  const updateLine = (id: string, field: keyof B2BLineItem, val: unknown) => {
    setLineItems(rows => {
      const updated = rows.map(r => r.id === id ? { ...r, [field]: val } : r);
      const lastRow = updated[updated.length - 1];
      if (lastRow && lastRow.id === id && (lastRow.itemName || lastRow.description) && lastRow.quantity > 0 && lastRow.unitPrice > 0) return [...updated, emptyLine()];
      return updated;
    });
  };

  const resetForm = () => { setForm({ invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', buyerName: '', buyerGST: '', billingAddress: '', shippingAddress: '', gstType: 'CGST_SGST', paymentTerms: 'Net 30', bankDetails: '', notes: '' }); setLineItems([emptyLine(), emptyLine()]); setManualBillNo(''); setBillMode('auto'); setItemSearchOpen(null); setItemSearchText({}); setCustSearch(''); setSameAsBilling(false); };

  const saveInvoice = (status: InvoiceStatus = 'UNPAID') => {
    const errors: string[] = [];
    const billNo = getEffectiveBillNo();
    if (!billNo.trim()) errors.push('Bill number is required');
    if (billNo.trim() && isDuplicateBillNo(billNo)) errors.push(`Bill number "${billNo}" already exists`);
    if (!form.buyerName) errors.push('Company Name is required');
    if (!form.billingAddress) errors.push('Billing Address is required');
    const validLines = lineItems.filter(l => (l.itemName || l.itemId || l.description) && l.quantity > 0 && l.unitPrice > 0);
    lineItems.forEach((l, idx) => {
      const hasData = l.itemName || l.itemId || l.description || l.hsnCode || l.quantity > 1 || l.unitPrice > 0;
      if (!hasData) return;
      if (!l.itemName && !l.itemId && !l.description) errors.push(`Row ${idx+1}: Select item or enter description`);
      else if (l.quantity <= 0) errors.push(`Row ${idx+1}: Quantity must be > 0`);
      else if (l.unitPrice <= 0) errors.push(`Row ${idx+1}: Unit Price must be > 0`);
    });
    if (validLines.length === 0 && !errors.some(e => e.startsWith('Row'))) errors.push('Add at least one item');
    if (errors.length > 0) { setValidationErrors(errors); return; }
    setValidationErrors([]);
    if (!customers.find(c => c.name.toLowerCase() === form.buyerName.toLowerCase())) {
      addParty({ id: generateId(), name: form.buyerName, type: 'CUSTOMER', gstNumber: form.buyerGST, phone: '', email: '', address: form.billingAddress, city: '', state: '', status: 'ACTIVE', createdAt: new Date().toISOString() });
    }
    const inv: B2BInvoice = { id: generateId(), invoiceNo: billNo, invoiceDate: form.invoiceDate, dueDate: form.dueDate, sellerName: 'FabricFlow Clothing Co.', sellerGST: '27AABFF1234G1Z5', sellerAddress: 'Industrial Area, Mumbai, MH', buyerName: form.buyerName, buyerGST: form.buyerGST, billingAddress: form.billingAddress, shippingAddress: form.shippingAddress || form.billingAddress, gstType: form.gstType, items: validLines, subtotal, totalDiscount, totalGST, grandTotal, paymentTerms: form.paymentTerms, bankDetails: form.bankDetails, notes: form.notes, status, paidAmount: 0, createdAt: new Date().toISOString() };
    setInvoices(prev => [...prev, inv]); setSavedInvNo(billNo); resetForm(); setModal(null); switchView('dashboard');
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus, paidAmount?: number) => { setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status, paidAmount: paidAmount ?? inv.paidAmount } : inv)); };

  // Edit invoice — load into create view
  const editInvoice = (inv: B2BInvoice) => {
    setForm({ invoiceDate: inv.invoiceDate, dueDate: inv.dueDate, buyerName: inv.buyerName, buyerGST: inv.buyerGST, billingAddress: inv.billingAddress, shippingAddress: inv.shippingAddress, gstType: inv.gstType, paymentTerms: inv.paymentTerms, bankDetails: inv.bankDetails, notes: inv.notes });
    setCustSearch(inv.buyerName);
    setLineItems(inv.items.length > 0 ? [...inv.items, emptyLine()] : [emptyLine(), emptyLine()]);
    setBillMode('manual'); setManualBillNo(inv.invoiceNo);
    // Remove old invoice so the "duplicate" check won't block, and save will create new entry
    setInvoices(prev => prev.filter(i => i.id !== inv.id));
    switchView('create');
  };

  // Delete invoice
  const deleteInvoice = (inv: B2BInvoice) => {
    if (!confirm(`Delete invoice ${inv.invoiceNo}?\n\nBuyer: ${inv.buyerName}\nAmount: ${formatCurrency(inv.grandTotal)}\n\nThis action cannot be undone.`)) return;
    setInvoices(prev => prev.filter(i => i.id !== inv.id));
  };

  const filtered = invoices.filter(inv => { const ms = inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) || inv.buyerName.toLowerCase().includes(search.toLowerCase()); return ms && (filterStatus === 'ALL' || inv.status === filterStatus); });
  const totalOutstanding = invoices.filter(i => ['UNPAID','PARTIAL_PAID','OVERDUE'].includes(i.status)).reduce((s, i) => s + i.grandTotal - i.paidAmount, 0);
  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.grandTotal, 0);
  const viewInv = (modal?.type === 'viewB2B' ? modal?.data : undefined) as B2BInvoice | undefined;

  const printB2B = (inv: B2BInvoice) => {
    const rows = inv.items.map((l, i) => { const c = calcLine(l); return `<tr><td style="border:1px solid #d1d5db;padding:8px">${i+1}</td><td style="border:1px solid #d1d5db;padding:8px;font-weight:600">${l.itemName || l.description}</td><td style="border:1px solid #d1d5db;padding:8px;text-align:right">${l.quantity}</td><td style="border:1px solid #d1d5db;padding:8px;text-align:right">${formatCurrency(l.unitPrice)}</td><td style="border:1px solid #d1d5db;padding:8px;text-align:right">${l.gstPercent}%</td><td style="border:1px solid #d1d5db;padding:8px;text-align:right;font-weight:700;color:#4338ca">${formatCurrency(c.total)}</td></tr>`; }).join('');
    const w = window.open('','_blank','width=820,height=900'); if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${inv.invoiceNo}</title><style>*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important}body{font-family:'Segoe UI',sans-serif;padding:32px;max-width:800px;margin:0 auto}table{border-collapse:collapse;width:100%}@media print{body{padding:16px}}</style></head><body><div style="border-bottom:3px solid #1e293b;padding-bottom:16px;margin-bottom:20px"><h1 style="font-size:22px;font-weight:900">TAX INVOICE</h1><p style="font-size:13px;color:#475569">${inv.sellerName}</p><p style="font-size:11px;color:#94a3b8">GSTIN: ${inv.sellerGST}</p><p style="float:right;font-size:16px;font-weight:900;color:#4338ca;font-family:monospace">${inv.invoiceNo}</p></div><p><strong>Bill To:</strong> ${inv.buyerName}${inv.buyerGST ? ` (${inv.buyerGST})` : ''}</p><p style="margin-bottom:16px">${inv.billingAddress}</p><table><thead><tr style="background:#4338ca"><th style="padding:8px;color:white;text-align:left">#</th><th style="padding:8px;color:white;text-align:left">Item</th><th style="padding:8px;color:white;text-align:right">Qty</th><th style="padding:8px;color:white;text-align:right">Price</th><th style="padding:8px;color:white;text-align:right">GST</th><th style="padding:8px;color:white;text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table><div style="text-align:right;margin-top:16px"><p><strong>Total: ${formatCurrency(inv.grandTotal)}</strong></p></div></body></html>`);
    w.document.close(); setTimeout(() => { w.print(); w.close(); }, 300);
  };

  // ── FULL SCREEN CREATE VIEW ──
  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => { if (confirm('Discard changes?')) { resetForm(); switchView('dashboard'); } }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={20} /></button>
              <div><h1 className="text-lg font-bold text-gray-900">New B2B Tax Invoice</h1><p className="text-xs text-gray-500">{getEffectiveBillNo()}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { if (confirm('Discard?')) { resetForm(); switchView('dashboard'); } }} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => saveInvoice('DRAFT')} className="px-4 py-2 bg-gray-600 text-white rounded-xl text-sm font-medium hover:bg-gray-700">Save Draft</button>
              <button onClick={() => saveInvoice('UNPAID')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm flex items-center gap-2"><FileText size={15} /> Save Invoice</button>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1"><label className="text-xs font-medium text-gray-700">Bill No.</label>
                  <div className="flex bg-gray-100 rounded-lg p-0.5"><button type="button" onClick={() => setBillMode('auto')} className={`px-2 py-0.5 rounded text-xs font-semibold ${billMode==='auto'?'bg-indigo-600 text-white':'text-gray-500'}`}>Auto</button><button type="button" onClick={() => setBillMode('manual')} className={`px-2 py-0.5 rounded text-xs font-semibold ${billMode==='manual'?'bg-indigo-600 text-white':'text-gray-500'}`}>Manual</button></div>
                </div>
                {billMode === 'auto' ? <input value={nextNo} readOnly className="w-full px-3 py-2.5 border border-gray-100 bg-gray-50 rounded-xl text-sm font-mono font-bold text-indigo-700" /> : <input value={manualBillNo} onChange={e => setManualBillNo(e.target.value)} placeholder="e.g. TALIB-01" className={`w-full px-3 py-2.5 border rounded-xl text-sm font-mono font-bold outline-none ${isDuplicateBillNo(manualBillNo)?'border-red-500 bg-red-50 text-red-700':'border-gray-200 text-indigo-700'}`} />}
              </div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Date *</label><input type="date" value={form.invoiceDate} onChange={e => setForm(f=>({...f,invoiceDate:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">GST Type</label><div className="flex gap-1 mt-1">{(['CGST_SGST','IGST'] as GSTType[]).map(t => <button key={t} type="button" onClick={() => setForm(f=>({...f,gstType:t}))} className={`flex-1 px-2 py-2.5 rounded-xl border text-xs font-medium ${form.gstType===t?'border-indigo-500 bg-indigo-50 text-indigo-700':'border-gray-200 text-gray-600'}`}>{t==='CGST_SGST'?'CGST+SGST':'IGST'}</button>)}</div></div>
            </div>
          </div>
          {/* Buyer */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-blue-700 uppercase mb-3">Buyer / Customer Details</p>
            <div className="grid grid-cols-2 gap-4">
              {/* Company Name — Searchable Autocomplete */}
              <div ref={custRef} className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">Company Name *</label>
                <div className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl bg-white transition-all ${custOpen ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'}`}>
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <input value={custSearch} onChange={e => { setCustSearch(e.target.value); setForm(f => ({ ...f, buyerName: e.target.value })); setCustOpen(true); if (!e.target.value) setForm(f => ({ ...f, buyerGST: '', billingAddress: '' })); }}
                    onFocus={() => setCustOpen(true)} placeholder="Search company, GST, phone..." className="flex-1 text-sm outline-none bg-transparent" />
                </div>
                {custOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                    {custResults.map(c => {
                      const idx = custSearch ? c.name.toLowerCase().indexOf(custSearch.toLowerCase()) : -1;
                      return (
                        <button key={c.id} type="button" onClick={() => selectCust(c.id)}
                          className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-indigo-50 transition-colors text-left border-b border-gray-50 last:border-0">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">{c.name.charAt(0)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {idx >= 0 && custSearch ? (<>{c.name.substring(0, idx)}<span className="bg-yellow-200 rounded px-0.5">{c.name.substring(idx, idx + custSearch.length)}</span>{c.name.substring(idx + custSearch.length)}</>) : c.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {c.gstNumber && <span className="text-xs text-gray-400 font-mono">{c.gstNumber}</span>}
                              {c.city && <span className="text-xs text-gray-400">📍 {c.city}</span>}
                              {c.phone && <span className="text-xs text-gray-400">📞 {c.phone}</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {custResults.length === 0 && <div className="px-3 py-3 text-center text-sm text-gray-500">No customers found</div>}
                    <button type="button" onClick={() => { setNewParty(p => ({ ...p, name: custSearch })); setShowCreateParty(true); setCustOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 text-green-600 hover:bg-green-50 font-medium text-sm">
                      <UserPlus size={14} /> {custSearch ? `+ Create "${custSearch}"` : '+ Create New Customer'}
                    </button>
                  </div>
                )}
              </div>
              {/* GST — auto-filled */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">GST Number / Tax ID</label>
                <input value={form.buyerGST} onChange={e => setForm(f=>({...f,buyerGST:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 bg-white font-mono" placeholder="29AABCS7890E1Z2" />
              </div>
              {/* Billing Address — auto-filled */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Billing Address *</label>
                <input value={form.billingAddress} onChange={e => { setForm(f=>({...f,billingAddress:e.target.value})); if (sameAsBilling) setForm(f=>({...f,shippingAddress:e.target.value})); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 bg-white" placeholder="Full billing address" />
              </div>
              {/* Shipping — manual with Same as Billing checkbox */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-700">Shipping Address</label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={sameAsBilling} onChange={e => { setSameAsBilling(e.target.checked); if (e.target.checked) setForm(f=>({...f,shippingAddress:f.billingAddress})); else setForm(f=>({...f,shippingAddress:''})); }}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600" />
                    <span className="text-xs text-gray-500 font-medium">Same as Billing</span>
                  </label>
                </div>
                <input value={form.shippingAddress} onChange={e => setForm(f=>({...f,shippingAddress:e.target.value}))} disabled={sameAsBilling}
                  className={`w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 ${sameAsBilling?'bg-gray-50 text-gray-500':'bg-white'}`} placeholder="Enter shipping address manually" />
              </div>
            </div>
          </div>
          {/* Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">Invoice Items</h3>
              <button type="button" onClick={() => setLineItems(r => [...r, emptyLine()])} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-600 font-semibold bg-indigo-50 rounded-lg hover:bg-indigo-100"><Plus size={14} /> Add Row</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{minWidth:'1000px'}}>
                <thead className="sticky top-0 z-20"><tr className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                  <th className="px-3 py-3 text-left font-semibold text-white text-xs uppercase" style={{width:'250px'}}>Item</th>
                  <th className="px-3 py-3 text-left font-semibold text-white text-xs uppercase" style={{width:'220px'}}>Description</th>
                  <th className="px-3 py-3 text-center font-semibold text-white text-xs uppercase" style={{width:'90px'}}>HSN</th>
                  <th className="px-3 py-3 text-center font-semibold text-white text-xs uppercase" style={{width:'80px'}}>Qty</th>
                  <th className="px-3 py-3 text-right font-semibold text-white text-xs uppercase" style={{width:'120px'}}>Unit Price</th>
                  <th className="px-3 py-3 text-center font-semibold text-white text-xs uppercase" style={{width:'75px'}}>Disc%</th>
                  <th className="px-3 py-3 text-center font-semibold text-white text-xs uppercase" style={{width:'80px'}}>GST%</th>
                  <th className="px-3 py-3 text-right font-semibold text-white text-xs uppercase" style={{width:'120px'}}>Amount</th>
                  <th className="px-2 py-3" style={{width:'40px'}}></th>
                </tr></thead>
                <tbody>{lineItems.map((l, rowIdx) => {
                  const c = calcLine(l); const isOpen = itemSearchOpen === l.id; const sv = itemSearchText[l.id] || '';
                  const fi = sv.trim() ? allItems.filter(it => it.name.toLowerCase().includes(sv.toLowerCase()) || it.sku.toLowerCase().includes(sv.toLowerCase())) : allItems.slice(0,8);
                  return (<tr key={l.id} className={`border-b border-gray-100 ${l.itemName ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-3 py-3" style={{position:'relative',overflow:'visible'}}>
                      <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-white ${isOpen?'border-indigo-500 ring-2 ring-indigo-100':'border-gray-200'}`}>
                        <Search size={14} className="text-gray-400 flex-shrink-0" />
                        <input value={l.itemName||sv} onChange={e=>{setItemSearchText(p=>({...p,[l.id]:e.target.value}));setItemSearchOpen(l.id);if(!e.target.value)updateLine(l.id,'itemName','');}} onFocus={()=>setItemSearchOpen(l.id)} placeholder="Search item..." className="flex-1 text-sm outline-none bg-transparent min-w-0 font-medium" />
                      </div>
                      {isOpen && <div className="absolute left-3 right-3 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-52 overflow-y-auto" style={{zIndex:60}}>
                        {fi.map(it => <button key={it.id} type="button" onClick={()=>{setLineItems(rows=>{const u=rows.map(r=>r.id===l.id?{...r,itemId:it.id,itemName:it.name,hsnCode:it.hsnCode,unitPrice:it.salesRate||it.purchaseRate,gstPercent:it.gstPercent,quantity:r.quantity||1}:r);if(rowIdx===rows.length-1)return[...u,emptyLine()];return u;});setItemSearchOpen(null);setItemSearchText(p=>({...p,[l.id]:''}));}}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-indigo-50 text-left border-b border-gray-50 last:border-0">
                          <div><p className="text-sm font-semibold text-gray-900 truncate">{it.name}</p><span className="text-xs text-gray-400 font-mono">{it.sku}</span></div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-2 ${it.currentStock<=0?'text-red-600 bg-red-50':it.currentStock<=it.minimumStock?'text-orange-600 bg-orange-50':'text-green-600 bg-green-50'}`}>{it.currentStock<=0?'Out':`Stk: ${it.currentStock}`}</span>
                        </button>)}
                        {fi.length===0&&<div className="px-3 py-3 text-center"><p className="text-sm text-gray-500 mb-2">No items found</p><button type="button" onClick={()=>{setCreateItemForRow(l.id);setNewItem(n=>({...n,name:sv}));setShowCreateItem(true);setItemSearchOpen(null);}} className="flex items-center gap-1.5 mx-auto text-sm text-green-600 hover:text-green-700 font-semibold"><Package size={14} /> + Create New Item</button></div>}
                        <button type="button" onClick={()=>{setCreateItemForRow(l.id);setNewItem(n=>({...n,name:sv}));setShowCreateItem(true);setItemSearchOpen(null);}} className="w-full flex items-center gap-2 px-3 py-2 border-t border-gray-100 text-green-600 hover:bg-green-50 font-medium text-sm"><Package size={14} /> + Create New Item</button>
                      </div>}
                    </td>
                    <td className="px-3 py-3"><input value={l.description} onChange={e=>updateLine(l.id,'description',e.target.value)} placeholder="Details..." className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400" /></td>
                    <td className="px-3 py-3"><input value={l.hsnCode} onChange={e=>updateLine(l.id,'hsnCode',e.target.value)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 font-mono text-center" /></td>
                    <td className="px-3 py-3"><input type="number" min={1} value={l.quantity||''} onChange={e=>updateLine(l.id,'quantity',Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 text-center font-bold" /></td>
                    <td className="px-3 py-3"><input type="number" min={0} value={l.unitPrice||''} onChange={e=>updateLine(l.id,'unitPrice',Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 text-right" /></td>
                    <td className="px-3 py-3"><input type="number" min={0} max={100} value={l.discount||''} onChange={e=>updateLine(l.id,'discount',Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-xl px-2 py-2.5 outline-none focus:border-indigo-400 text-center" /></td>
                    <td className="px-3 py-3"><select value={l.gstPercent} onChange={e=>updateLine(l.id,'gstPercent',Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-xl px-2 py-2.5 outline-none bg-white">{[0,5,12,18,28].map(g=><option key={g} value={g}>{g}%</option>)}</select></td>
                    <td className="px-3 py-3 text-right"><span className={`text-sm font-bold ${c.total>0?'text-indigo-700':'text-gray-400'}`}>{formatCurrency(c.total)}</span>{c.disc>0&&<div className="text-xs text-red-500 mt-0.5">-{formatCurrency(c.disc)}</div>}</td>
                    <td className="px-2 py-3 text-center">{lineItems.length>1&&<button type="button" onClick={()=>setLineItems(r=>r.filter(x=>x.id!==l.id))} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500"><X size={16} /></button>}</td>
                  </tr>);
                })}</tbody>
              </table>
            </div>
          </div>
          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Additional Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Payment Terms</label><select value={form.paymentTerms} onChange={e=>setForm(f=>({...f,paymentTerms:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none">{['Net 15','Net 30','Net 45','Net 60','Due on Receipt'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Bank / UPI</label><input value={form.bankDetails} onChange={e=>setForm(f=>({...f,bankDetails:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none" placeholder="A/C, IFSC, UPI..." /></div>
                <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Notes</label><input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Thank you..." /></div>
              </div>
            </div>
            <div><div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-2 sticky top-24">
              <h3 className="text-sm font-bold text-indigo-900 mb-2">Invoice Summary</h3>
              <div className="flex justify-between text-sm text-gray-600"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
              {totalDiscount>0&&<div className="flex justify-between text-sm text-red-600"><span>Discount:</span><span>-{formatCurrency(totalDiscount)}</span></div>}
              <div className="flex justify-between text-sm text-gray-600"><span>{form.gstType==='IGST'?'IGST':'CGST+SGST'}:</span><span>{formatCurrency(totalGST)}</span></div>
              <div className="border-t-2 border-indigo-200 pt-3 flex justify-between text-lg font-black text-indigo-900"><span>Grand Total:</span><span>{formatCurrency(grandTotal)}</span></div>
            </div></div>
          </div>
          {validationErrors.length>0&&<div className="bg-red-50 border border-red-200 rounded-2xl p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0"><X size={18} className="text-red-600" /></div><div className="flex-1"><p className="text-sm font-bold text-red-800">Please fix errors:</p><ul className="mt-2 space-y-1">{validationErrors.map((e,i)=><li key={i} className="text-xs text-red-700">• {e}</li>)}</ul></div><button onClick={()=>setValidationErrors([])} className="p-1 text-red-400 hover:text-red-600"><X size={14} /></button></div></div>}
          <div className="flex justify-end gap-3 pb-8">
            <button onClick={()=>{if(confirm('Discard?')){resetForm();switchView('dashboard');}}} className="px-6 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={()=>saveInvoice('DRAFT')} className="px-6 py-3 bg-gray-600 text-white rounded-xl text-sm font-medium hover:bg-gray-700">Save Draft</button>
            <button onClick={()=>saveInvoice('UNPAID')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-lg flex items-center gap-2"><FileText size={18} /> Save Invoice</button>
          </div>
        </div>

        {/* Create Item Modal */}
        {showCreateItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateItem(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-2"><Package size={18} className="text-indigo-600" /><h2 className="text-lg font-bold text-gray-900">Create New Item</h2></div>
                <button onClick={() => setShowCreateItem(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={20} /></button>
              </div>
              <div className="overflow-y-auto flex-1 p-5 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(['RAW_MATERIAL', 'FINISHED_GOODS'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setNewItem(n => ({ ...n, type: t }))}
                      className={`p-3 rounded-xl border-2 text-sm font-medium ${newItem.type === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>
                      {t === 'RAW_MATERIAL' ? '🧵 Raw Material' : '👔 Finished Goods'}
                    </button>
                  ))}
                </div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Item Name / SKU *</label><input value={newItem.name} onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder="e.g. Cotton Fabric White" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Category</label><select value={newItem.categoryId} onChange={e => setNewItem(n => ({ ...n, categoryId: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none"><option value="">Select</option>{categories.filter(c => c.status === 'ACTIVE').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Unit</label><select value={newItem.unitId} onChange={e => setNewItem(n => ({ ...n, unitId: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none"><option value="">Select</option>{units.filter(u => u.status === 'ACTIVE').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">GST %</label><select value={newItem.gstPercent} onChange={e => setNewItem(n => ({ ...n, gstPercent: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none">{[0,5,12,18,28].map(g => <option key={g} value={g}>{g}%</option>)}</select></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">HSN Code</label><input value={newItem.hsnCode} onChange={e => setNewItem(n => ({ ...n, hsnCode: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder="e.g. 5208" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Sales Rate (₹)</label><input type="number" value={newItem.salesRate||''} onChange={e => setNewItem(n => ({ ...n, salesRate: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Purchase Rate (₹)</label><input type="number" value={newItem.purchaseRate||''} onChange={e => setNewItem(n => ({ ...n, purchaseRate: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" /></div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
                <button onClick={() => setShowCreateItem(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={saveNewItem} disabled={!newItem.name} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"><Plus size={14} className="inline mr-1" />Save Item</button>
              </div>
            </div>
          </div>
        )}

        {/* Create Party Modal */}
        {showCreateParty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateParty(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-2"><UserPlus size={18} className="text-green-600" /><h2 className="text-lg font-bold text-gray-900">Create New Customer</h2></div>
                <button onClick={() => setShowCreateParty(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={20} /></button>
              </div>
              <div className="overflow-y-auto flex-1 p-5 space-y-4">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Party Type *</label>
                  <div className="grid grid-cols-3 gap-2">{(['CUSTOMER','VENDOR','CONTRACTOR'] as const).map(t => <button key={t} type="button" onClick={() => setNewParty(p=>({...p,type:t}))} className={`p-2 rounded-xl border-2 text-xs font-medium ${newParty.type===t?'border-indigo-500 bg-indigo-50 text-indigo-700':'border-gray-200 text-gray-600'}`}>{t==='CUSTOMER'?'Customer':t==='VENDOR'?'Vendor':'Contractor'}</button>)}</div>
                </div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Party Name *</label><input value={newParty.name} onChange={e => setNewParty(p=>({...p,name:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label><input value={newParty.phone} onChange={e => setNewParty(p=>({...p,phone:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Email</label><input value={newParty.email} onChange={e => setNewParty(p=>({...p,email:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">GST Number</label><input value={newParty.gstNumber} onChange={e => setNewParty(p=>({...p,gstNumber:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 font-mono" placeholder="27AABCT1234A1Z5" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Contact Person</label><input value={newParty.contactPerson} onChange={e => setNewParty(p=>({...p,contactPerson:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" /></div>
                  <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Address</label><input value={newParty.address} onChange={e => setNewParty(p=>({...p,address:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">City</label><input value={newParty.city} onChange={e => setNewParty(p=>({...p,city:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">State</label><input value={newParty.state} onChange={e => setNewParty(p=>({...p,state:e.target.value}))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" /></div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
                <button onClick={() => setShowCreateParty(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={saveNewParty} disabled={!newParty.name||!newParty.phone} className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50"><UserPlus size={14} className="inline mr-1" />Save Customer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── DASHBOARD VIEW ──
  return (
    <div className="p-6 space-y-6">
      {savedInvNo&&<div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between"><div className="flex items-center gap-3"><span className="text-2xl">✅</span><div><p className="text-sm font-bold text-green-800">Invoice Created: {savedInvNo}</p><p className="text-xs text-green-600">Saved successfully</p></div></div><button onClick={()=>setSavedInvNo('')} className="text-green-600 hover:text-green-700"><X size={16} /></button></div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{label:'Total Invoices',value:invoices.length,icon:'🧾',color:'bg-indigo-50'},{label:'Total Billed',value:formatCurrency(invoices.reduce((s,i)=>s+i.grandTotal,0)),icon:'💰',color:'bg-green-50'},{label:'Outstanding',value:formatCurrency(totalOutstanding),icon:'⏳',color:'bg-orange-50'},{label:'Collected',value:formatCurrency(totalPaid),icon:'✅',color:'bg-emerald-50'}].map(c=>(<div key={c.label} className={`rounded-2xl p-4 border border-gray-100 ${c.color}`}><div className="text-2xl mb-2">{c.icon}</div><p className="text-xl font-bold text-gray-900">{c.value}</p><p className="text-xs text-gray-500 mt-1">{c.label}</p></div>))}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-60 px-3 py-2.5 bg-white border border-gray-200 rounded-xl"><Search size={16} className="text-gray-400" /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="flex-1 text-sm outline-none" /></div>
        <div className="flex gap-1.5">{(['ALL','DRAFT','UNPAID','PARTIAL_PAID','PAID','OVERDUE'] as const).map(s=>(<button key={s} onClick={()=>setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filterStatus===s?'bg-indigo-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s==='ALL'?'All':s==='PARTIAL_PAID'?'Partial':s.charAt(0)+s.slice(1).toLowerCase()}</button>))}</div>
        <button onClick={()=>{resetForm();switchView('create');}} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm"><Plus size={16} /> New B2B Invoice</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full"><thead><tr className="bg-gray-50 border-b border-gray-100">
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice No.</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Buyer</th><th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th><th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Paid</th><th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
        </tr></thead><tbody className="divide-y divide-gray-50">{filtered.map(inv=>(<tr key={inv.id} className="hover:bg-gray-50/50">
          <td className="px-4 py-3 text-sm font-mono font-bold text-indigo-700">{inv.invoiceNo}</td><td className="px-4 py-3 text-sm text-gray-700">{formatDate(inv.invoiceDate)}</td><td className="px-4 py-3"><p className="text-sm font-medium text-gray-900">{inv.buyerName}</p>{inv.buyerGST&&<p className="text-xs text-gray-400 font-mono">{inv.buyerGST}</p>}</td><td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(inv.grandTotal)}</td><td className="px-4 py-3 text-right text-sm font-medium text-green-700">{formatCurrency(inv.paidAmount)}</td><td className="px-4 py-3 text-center"><span className={`text-xs px-2.5 py-1 rounded-full font-bold ${statusColors[inv.status]}`}>{inv.status==='PARTIAL_PAID'?'Partial':inv.status}</span></td><td className="px-4 py-3 text-sm text-gray-600">{inv.dueDate?formatDate(inv.dueDate):'—'}</td>
          <td className="px-4 py-3"><div className="flex items-center gap-1">
            <button onClick={()=>setModal({type:'viewB2B',data:inv})} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600" title="View"><Eye size={14} /></button>
            <button onClick={()=>printB2B(inv)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600" title="Print"><Printer size={14} /></button>
            <button onClick={()=>editInvoice(inv)} className="p-1.5 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600" title="Edit"><Edit2 size={14} /></button>
            <button onClick={()=>deleteInvoice(inv)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600" title="Delete"><Trash2 size={14} /></button>
            {inv.status!=='PAID'&&<button onClick={()=>{const a=prompt(`Payment for ${inv.invoiceNo}:`);if(a&&Number(a)>0){const np=inv.paidAmount+Number(a);updateInvoiceStatus(inv.id,np>=inv.grandTotal?'PAID':'PARTIAL_PAID',np);}}} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-semibold">+ Pay</button>}
          </div></td>
        </tr>))}</tbody></table>
        {filtered.length===0&&<div className="text-center py-16 text-gray-400"><FileText size={40} className="mx-auto mb-3 opacity-40" /><p className="font-medium">No B2B invoices yet</p></div>}
      </div>
      {/* View Modal */}
      {modal?.type === 'viewB2B' && viewInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">Invoice Details</h2><button onClick={() => setModal(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={20} /></button></div>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="flex items-start justify-between"><div><p className="text-xl font-black text-indigo-700 font-mono">{viewInv.invoiceNo}</p><p className="text-sm text-gray-500 mt-1">{formatDate(viewInv.invoiceDate)}</p></div><span className={`text-xs px-3 py-1.5 rounded-full font-bold ${statusColors[viewInv.status]}`}>{viewInv.status}</span></div>
              <div className="grid grid-cols-2 gap-3"><div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500 font-bold uppercase mb-1">From</p><p className="text-sm font-bold">{viewInv.sellerName}</p></div><div className="bg-blue-50 rounded-xl p-3"><p className="text-xs text-blue-600 font-bold uppercase mb-1">Bill To</p><p className="text-sm font-bold">{viewInv.buyerName}</p><p className="text-xs text-gray-500 mt-1">{viewInv.billingAddress}</p></div></div>
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden"><thead><tr className="bg-gray-50 text-xs"><th className="px-3 py-2 text-left">#</th><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Price</th><th className="px-3 py-2 text-right">Amount</th></tr></thead><tbody>{viewInv.items.map((l,i)=>{const c=calcLine(l);return <tr key={l.id} className="border-t border-gray-100"><td className="px-3 py-2 text-gray-400">{i+1}</td><td className="px-3 py-2 font-medium">{l.itemName||l.description}</td><td className="px-3 py-2 text-right">{l.quantity}</td><td className="px-3 py-2 text-right">{formatCurrency(l.unitPrice)}</td><td className="px-3 py-2 text-right font-bold text-indigo-700">{formatCurrency(c.total)}</td></tr>;})}</tbody></table>
              <div className="flex justify-between items-end"><button onClick={() => printB2B(viewInv)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"><Printer size={14} /> Print</button><div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 w-56"><div className="flex justify-between font-bold text-indigo-900"><span>Total:</span><span>{formatCurrency(viewInv.grandTotal)}</span></div>{viewInv.paidAmount>0&&<div className="flex justify-between text-sm text-green-700 mt-1"><span>Paid:</span><span>{formatCurrency(viewInv.paidAmount)}</span></div>}</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

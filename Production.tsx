import { useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/ui/Modal';
import { formatCurrency, generateId, formatDate, getStatusColor, getPriorityColor } from '../utils/helpers';
import { Plus, Search, Eye, X, Factory, Package, ArrowRight, Info, Printer, FileText, Download, Edit2, Trash2 } from 'lucide-react';
import type { JobWork, JobWorkItem, JobWorkFinishedGood, MaterialIn, MaterialInItem } from '../types';

type Tab = 'jobwork' | 'materialin';

export default function Production() {
  const { items, parties, units, jobWorks, materialIns, addJobWork, updateJobWork, deleteJobWork, addMaterialIn, updateMaterialIn, deleteMaterialIn, addStockMovement, updateItemStock, currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('jobwork');
  const [modal, setModal] = useState<{ type: string; data?: unknown } | null>(null);
  const [search, setSearch] = useState('');

  const contractors = parties.filter(p => p.type === 'CONTRACTOR' && p.status === 'ACTIVE');
  const rawMaterials = items.filter(i => i.type === 'RAW_MATERIAL' && i.status === 'ACTIVE');
  const finishedGoods = items.filter(i => i.type === 'FINISHED_GOODS' && i.status === 'ACTIVE');

  // ─── Helper: calculate previously received qty for a given JW + item ───
  const getPreviouslyReceived = (jobWorkId: string, itemId: string) => {
    return materialIns
      .filter(mi => mi.jobWorkId === jobWorkId)
      .reduce((sum, mi) => {
        const row = mi.items.find(x => x.itemId === itemId);
        return sum + (row?.receivedQty || 0);
      }, 0);
  };

  const getPreviouslyRejected = (jobWorkId: string, itemId: string) => {
    return materialIns
      .filter(mi => mi.jobWorkId === jobWorkId)
      .reduce((sum, mi) => {
        const row = mi.items.find(x => x.itemId === itemId);
        return sum + (row?.rejectedQty || 0);
      }, 0);
  };

  const getPreviouslyWasted = (jobWorkId: string, itemId: string) => {
    return materialIns
      .filter(mi => mi.jobWorkId === jobWorkId)
      .reduce((sum, mi) => {
        const row = mi.items.find(x => x.itemId === itemId);
        return sum + (row?.wastageQty || 0);
      }, 0);
  };

  // Total accounted = received + rejected + wastage (all reduce pending)
  const getTotalAccounted = (jobWorkId: string, itemId: string) => {
    return getPreviouslyReceived(jobWorkId, itemId) + getPreviouslyRejected(jobWorkId, itemId) + getPreviouslyWasted(jobWorkId, itemId);
  };

  // ─── Job Work Form ───
  const emptyJWForm = () => ({
    date: new Date().toISOString().split('T')[0],
    contractorId: '',
    priority: 'MEDIUM' as JobWork['priority'],
    expectedReturnDate: '',
    remarks: '',
    rawMaterials: [{ id: generateId(), itemId: '', availableStock: 0, issueQty: 0, unitId: '', rate: 0, amount: 0 }] as JobWorkItem[],
    finishedGoods: [{ id: generateId(), itemId: '', expectedQty: 0, productionCost: 0 }] as JobWorkFinishedGood[],
  });
  const [jwForm, setJwForm] = useState(emptyJWForm());

  // ─── Material In Form ───
  const [miForm, setMiForm] = useState({
    date: new Date().toISOString().split('T')[0],
    jobWorkId: '',
    remarks: '',
    items: [] as MaterialInItem[],
  });

  const nextJWNo = `JW-${new Date().getFullYear()}-${String(jobWorks.length + 1).padStart(3, '0')}`;
  const nextMINo = `MI-${new Date().getFullYear()}-${String(materialIns.length + 1).padStart(3, '0')}`;

  // Selected JW for MI form
  const selectedMIJobWork = jobWorks.find(j => j.id === miForm.jobWorkId);
  const selectedMIContractor = selectedMIJobWork ? parties.find(p => p.id === selectedMIJobWork.contractorId) : null;

  // ─── Edit JW state ───
  const [editJWId, setEditJWId] = useState('');
  const [editJWForm, setEditJWForm] = useState({
    priority: 'MEDIUM' as JobWork['priority'],
    expectedReturnDate: '',
    remarks: '',
    contractorId: '',
    rawMaterials: [] as JobWorkItem[],
    finishedGoods: [] as JobWorkFinishedGood[],
  });

  const openEditJW = (jw: JobWork) => {
    setEditJWId(jw.id);
    setEditJWForm({
      priority: jw.priority,
      expectedReturnDate: jw.expectedReturnDate,
      remarks: jw.remarks || '',
      contractorId: jw.contractorId,
      rawMaterials: jw.rawMaterials.map(rm => ({ ...rm })),
      finishedGoods: jw.finishedGoods.map(fg => ({ ...fg })),
    });
    setModal({ type: 'editJW' });
  };

  const updateEditRMRow = (id: string, field: keyof JobWorkItem, val: unknown) => {
    setEditJWForm(f => ({
      ...f,
      rawMaterials: f.rawMaterials.map(row => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: val };
        if (field === 'itemId') {
          const item = items.find(i => i.id === val);
          if (item) { updated.availableStock = item.currentStock; updated.unitId = item.unitId; updated.rate = item.purchaseRate; }
        }
        updated.amount = updated.issueQty * updated.rate;
        return updated;
      }),
    }));
  };

  const saveEditJW = () => {
    const jw = jobWorks.find(j => j.id === editJWId);
    if (!jw) return;
    const validRM = editJWForm.rawMaterials.filter(r => r.itemId && r.issueQty > 0);
    const validFG = editJWForm.finishedGoods.filter(fg => fg.itemId);

    // ──── STOCK VALIDATION: Block over-issue ────
    for (const rm of validRM) {
      const item = items.find(i => i.id === rm.itemId);
      if (!item) continue;
      const origRM = jw.rawMaterials.find(o => o.itemId === rm.itemId);
      const alreadyIssued = origRM?.issueQty || 0;
      const maxAllowed = item.currentStock + alreadyIssued;
      if (rm.issueQty > maxAllowed) {
        const unit = units.find(u => u.id === item.unitId);
        alert(
          `❌ Stock Limit Exceeded!\n\n` +
          `Item: ${item.name}\n` +
          `Available Stock: ${item.currentStock} ${unit?.symbol || ''}\n` +
          `Already Issued: ${alreadyIssued} ${unit?.symbol || ''}\n` +
          `Max Allowed: ${maxAllowed} ${unit?.symbol || ''}\n` +
          `New Issue Qty: ${rm.issueQty} ${unit?.symbol || ''}\n\n` +
          `Please enter quantity within stock limit.`
        );
        return;
      }
    }

    // ──── AUTO STATUS RECALCULATION ────
    // After updating FG quantities, recalculate using total accounted (received+rejected+wastage)
    let allFullyReceived = true;
    let anyReceived = false;

    validFG.forEach(fg => {
      const totalAccounted = materialIns
        .filter(m => m.jobWorkId === editJWId)
        .reduce((s, m) => {
          const mitem = m.items.find(x => x.itemId === fg.itemId);
          return s + (mitem?.receivedQty || 0) + (mitem?.rejectedQty || 0) + (mitem?.wastageQty || 0);
        }, 0);
      if (totalAccounted > 0) anyReceived = true;
      if (totalAccounted < fg.expectedQty) allFullyReceived = false;
    });

    let newStatus: JobWork['status'] = jw.status;
    if (validFG.length === 0) {
      // No FG defined — keep as is or OPEN
      newStatus = jw.status === 'COMPLETED' || jw.status === 'CLOSED' ? 'OPEN' : jw.status;
    } else if (allFullyReceived) {
      newStatus = 'COMPLETED';
    } else if (anyReceived) {
      // Balance > 0 and some received → reopen as PARTIAL_RECEIVED
      newStatus = 'PARTIAL_RECEIVED';
    } else {
      // Nothing received yet
      newStatus = jw.status === 'COMPLETED' || jw.status === 'CLOSED' ? 'OPEN' : jw.status;
    }

    const statusChanged = newStatus !== jw.status;
    const finalStatus = newStatus as string;
    const reopened = (jw.status === 'COMPLETED' || jw.status === 'CLOSED') && finalStatus !== 'COMPLETED' && finalStatus !== 'CLOSED';

    updateJobWork(editJWId, {
      priority: editJWForm.priority,
      expectedReturnDate: editJWForm.expectedReturnDate,
      remarks: editJWForm.remarks,
      contractorId: editJWForm.contractorId,
      rawMaterials: validRM,
      finishedGoods: validFG,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    setModal(null);

    if (reopened) {
      // Build a summary of the new balance
      const balanceSummary = validFG.map(fg => {
        const item = items.find(i => i.id === fg.itemId);
        const totalReceived = materialIns
          .filter(m => m.jobWorkId === editJWId)
          .reduce((s, m) => { const r = m.items.find(x => x.itemId === fg.itemId); return s + (r?.receivedQty || 0); }, 0);
        const bal = fg.expectedQty - totalReceived;
        return `  • ${item?.name || '—'}: ${totalReceived}/${fg.expectedQty} received → Balance: ${bal} PCS`;
      }).join('\n');

      alert(
        `🔄 Job Work Auto-Reopened!\n\n` +
        `${jw.jobWorkNo} status changed: ${jw.status.replace(/_/g, ' ')} → ${newStatus.replace(/_/g, ' ')}\n\n` +
        `Reason: New expected quantity exceeds total received.\n` +
        `Balance quantity detected — Job Work is now available in Material In dropdown.\n\n` +
        `Updated Balance:\n${balanceSummary}`
      );
    } else if (statusChanged) {
      alert(`Job Work ${jw.jobWorkNo} saved. Status: ${newStatus.replace(/_/g, ' ')}`);
    }
  };

  // ─── Edit MI state ───
  const [editMIId, setEditMIId] = useState('');
  const [editMIForm, setEditMIForm] = useState({
    date: '',
    remarks: '',
    items: [] as MaterialInItem[],
  });

  const openEditMI = (mi: MaterialIn) => {
    setEditMIId(mi.id);
    setEditMIForm({
      date: mi.date,
      remarks: mi.remarks || '',
      items: mi.items.map(mii => ({ ...mii })),
    });
    setModal({ type: 'editMI' });
  };

  const saveEditMI = () => {
    updateMaterialIn(editMIId, {
      date: editMIForm.date,
      remarks: editMIForm.remarks,
      items: editMIForm.items,
    });
    setModal(null);
  };

  // ─── Delete Handlers ───
  const handleDeleteJW = (jw: JobWork) => {
    const hasMI = materialIns.some(m => m.jobWorkId === jw.id);
    if (jw.status === 'COMPLETED' || jw.status === 'CLOSED') {
      if (!confirm(`⚠️ This Job Work is ${jw.status}. Are you sure you want to delete ${jw.jobWorkNo}? This cannot be undone.`)) return;
    } else if (hasMI) {
      if (!confirm(`⚠️ ${jw.jobWorkNo} has Material In entries linked. Deleting will also remove all linked MI records. Continue?`)) return;
      // Delete linked MI entries
      materialIns.filter(m => m.jobWorkId === jw.id).forEach(mi => deleteMaterialIn(mi.id));
    } else {
      if (!confirm(`Delete Job Work ${jw.jobWorkNo}? This cannot be undone.`)) return;
    }
    deleteJobWork(jw.id);
  };

  const handleDeleteMI = (mi: MaterialIn) => {
    const jw = jobWorks.find(j => j.id === mi.jobWorkId);
    if (!confirm(`Delete Material In ${mi.materialInNo}${jw ? ` (against ${jw.jobWorkNo})` : ''}? This cannot be undone.`)) return;
    deleteMaterialIn(mi.id);
  };

  // ─── Raw Material Row Update ───
  const updateRMRow = (id: string, field: keyof JobWorkItem, val: unknown) => {
    setJwForm(f => ({
      ...f,
      rawMaterials: f.rawMaterials.map(row => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: val };
        if (field === 'itemId') {
          const item = items.find(i => i.id === val);
          if (item) {
            updated.availableStock = item.currentStock;
            updated.unitId = item.unitId;
            updated.rate = item.purchaseRate;
          }
        }
        updated.amount = updated.issueQty * updated.rate;
        return updated;
      }),
    }));
  };

  const addRMRow = () => setJwForm(f => ({
    ...f,
    rawMaterials: [...f.rawMaterials, { id: generateId(), itemId: '', availableStock: 0, issueQty: 0, unitId: '', rate: 0, amount: 0 }]
  }));

  const removeRMRow = (id: string) => setJwForm(f => ({ ...f, rawMaterials: f.rawMaterials.filter(r => r.id !== id) }));

  const updateFGRow = (id: string, field: keyof JobWorkFinishedGood, val: unknown) => {
    setJwForm(f => ({
      ...f,
      finishedGoods: f.finishedGoods.map(row => row.id === id ? { ...row, [field]: val } : row),
    }));
  };

  const addFGRow = () => setJwForm(f => ({
    ...f,
    finishedGoods: [...f.finishedGoods, { id: generateId(), itemId: '', expectedQty: 0, productionCost: 0 }]
  }));

  // ─── Save Job Work ───
  const saveJobWork = () => {
    if (!jwForm.contractorId || !jwForm.expectedReturnDate) { alert('Contractor and expected return date required'); return; }
    const validRM = jwForm.rawMaterials.filter(r => r.itemId && r.issueQty > 0);
    if (validRM.length === 0) { alert('Add at least one raw material with issue quantity'); return; }

    // ──── STOCK VALIDATION: Block over-issue ────
    for (const rm of validRM) {
      const item = items.find(i => i.id === rm.itemId);
      if (item && rm.issueQty > item.currentStock) {
        const unit = units.find(u => u.id === item.unitId);
        alert(
          `❌ Stock Limit Exceeded!\n\n` +
          `Item: ${item.name}\n` +
          `Available Stock: ${item.currentStock} ${unit?.symbol || ''}\n` +
          `Issue Qty: ${rm.issueQty} ${unit?.symbol || ''}\n\n` +
          `Please enter quantity within stock limit.`
        );
        return;
      }
    }

    const jw: JobWork = {
      id: generateId(), jobWorkNo: nextJWNo, date: jwForm.date,
      contractorId: jwForm.contractorId, priority: jwForm.priority,
      expectedReturnDate: jwForm.expectedReturnDate, remarks: jwForm.remarks,
      rawMaterials: validRM, finishedGoods: jwForm.finishedGoods.filter(f => f.itemId),
      status: 'OPEN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };

    addJobWork(jw);

    // Deduct stock for issued raw materials
    validRM.forEach(rm => {
      const item = items.find(i => i.id === rm.itemId);
      if (item) {
        const newStock = Math.max(0, item.currentStock - rm.issueQty);
        updateItemStock(rm.itemId, newStock);
        addStockMovement({
          id: generateId(), itemId: rm.itemId, type: 'OUTWARD', quantity: rm.issueQty,
          previousStock: item.currentStock, newStock, reason: 'Job Work Issue',
          reference: nextJWNo, createdBy: currentUser.name, createdAt: new Date().toISOString()
        });
      }
    });

    setJwForm(emptyJWForm());
    // Show PDF preview instead of alert
    setModal({ type: 'pdfJW', data: jw });
  };

  // ─── Handle JW selection for Material In ───
  const handleMIJobWorkSelect = (jobWorkId: string) => {
    const jw = jobWorks.find(j => j.id === jobWorkId);
    if (!jw) {
      setMiForm(f => ({ ...f, jobWorkId: '', items: [] }));
      return;
    }

    // Build MI rows from finished goods with auto-calculated pending qty
    const miItems: MaterialInItem[] = jw.finishedGoods.map(fg => {
      const totalAccounted = getTotalAccounted(jw.id, fg.itemId);
      const balance = Math.max(0, fg.expectedQty - totalAccounted);
      return {
        id: generateId(),
        itemId: fg.itemId,
        pendingQty: balance,
        receivedQty: 0,
        rejectedQty: 0,
        wastageQty: 0,
      };
    }).filter(row => row.pendingQty > 0); // Only show items with remaining balance

    setMiForm(f => ({ ...f, jobWorkId, items: miItems }));
  };

  // ─── Save Material In ───
  const saveMaterialIn = () => {
    if (!miForm.jobWorkId) { alert('Select a Job Work'); return; }
    const jw = jobWorks.find(j => j.id === miForm.jobWorkId);
    if (!jw) return;

    const hasReceived = miForm.items.some(i => i.receivedQty > 0 || i.rejectedQty > 0 || i.wastageQty > 0);
    if (!hasReceived) { alert('Enter received, rejected or wastage quantity for at least one item'); return; }

    // Validate: cannot receive more than pending
    for (const mii of miForm.items) {
      if (mii.receivedQty > mii.pendingQty) {
        const item = items.find(i => i.id === mii.itemId);
        alert(`Cannot receive ${mii.receivedQty} for "${item?.name}" — only ${mii.pendingQty} pending`);
        return;
      }
    }

    const mi: MaterialIn = {
      id: generateId(), materialInNo: nextMINo, date: miForm.date,
      jobWorkId: miForm.jobWorkId, contractorId: jw.contractorId,
      items: miForm.items.filter(i => i.receivedQty > 0 || i.rejectedQty > 0 || i.wastageQty > 0),
      remarks: miForm.remarks,
      createdAt: new Date().toISOString()
    };

    addMaterialIn(mi);

    // Update finished goods stock (only good pieces go to inventory)
    mi.items.forEach(mii => {
      const item = items.find(i => i.id === mii.itemId);
      if (item && mii.receivedQty > 0) {
        const goodQty = mii.receivedQty - mii.rejectedQty;
        if (goodQty > 0) {
          const newStock = item.currentStock + goodQty;
          updateItemStock(mii.itemId, newStock);
          addStockMovement({
            id: generateId(), itemId: mii.itemId, type: 'INWARD', quantity: goodQty,
            previousStock: item.currentStock, newStock, reason: 'Material In (Good Pieces)',
            reference: nextMINo, createdBy: currentUser.name, createdAt: new Date().toISOString()
          });
        }
      }
    });

    // Determine new status: check total accounted (received+rejected+wastage) vs expected
    const allMIsIncludingCurrent = [...materialIns, mi];
    let allFullyAccounted = true;
    let anyAccounted = false;

    jw.finishedGoods.forEach(fg => {
      const totalAccounted = allMIsIncludingCurrent
        .filter(m => m.jobWorkId === jw.id)
        .reduce((s, m) => {
          const mitem = m.items.find(x => x.itemId === fg.itemId);
          return s + (mitem?.receivedQty || 0) + (mitem?.rejectedQty || 0) + (mitem?.wastageQty || 0);
        }, 0);
      if (totalAccounted > 0) anyAccounted = true;
      if (totalAccounted < fg.expectedQty) allFullyAccounted = false;
    });

    let newStatus = jw.status;
    if (allFullyAccounted) {
      newStatus = 'COMPLETED';
    } else if (anyAccounted) {
      newStatus = 'PARTIAL_RECEIVED';
    }

    updateJobWork(jw.id, { status: newStatus, updatedAt: new Date().toISOString() });

    const savedMI = { ...mi };
    setMiForm({ date: new Date().toISOString().split('T')[0], jobWorkId: '', remarks: '', items: [] });
    // Show PDF preview instead of alert
    setModal({ type: 'pdfMI', data: savedMI });
  };

  // ─── Filtered Job Works ───
  const filteredJW = jobWorks.filter(jw => {
    const contractor = parties.find(p => p.id === jw.contractorId);
    return jw.jobWorkNo.toLowerCase().includes(search.toLowerCase()) ||
      (contractor?.name || '').toLowerCase().includes(search.toLowerCase());
  });

  const viewJW = modal?.type === 'viewJW' ? (modal?.data as JobWork | undefined) : undefined;
  const viewContractor = viewJW ? parties.find(p => p.id === viewJW.contractorId) : undefined;

  // ─── Build Print HTML for JW ───
  const buildJWPrintHTML = (jw: JobWork) => {
    const contractor = parties.find(p => p.id === jw.contractorId);
    const totalRMValue = jw.rawMaterials.reduce((s, r) => s + r.amount, 0);
    const rmRows = jw.rawMaterials.map((rm, idx) => {
      const item = items.find(i => i.id === rm.itemId);
      const unit = units.find(u => u.id === rm.unitId);
      return `<tr>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;color:#6b7280">${idx + 1}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;font-weight:600;color:#111827">${item?.name || '—'}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:11px;font-family:monospace;color:#6b7280">${item?.sku || '—'}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;text-align:center;color:#4b5563">${unit?.symbol || '—'}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;text-align:right;font-weight:700;color:#111827">${rm.issueQty}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;text-align:right;color:#374151">${formatCurrency(rm.rate)}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;text-align:right;font-weight:700;color:#4338ca">${formatCurrency(rm.amount)}</td>
      </tr>`;
    }).join('');

    const fgRows = jw.finishedGoods.map((fg, idx) => {
      const item = items.find(i => i.id === fg.itemId);
      return `<tr>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;color:#6b7280">${idx + 1}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;font-weight:600;color:#111827">${item?.name || '—'}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:11px;font-family:monospace;color:#6b7280">${item?.sku || '—'}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;text-align:right;font-weight:700;color:#111827">${fg.expectedQty} PCS</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;text-align:right;color:#374151">${formatCurrency(fg.productionCost)}</td>
      </tr>`;
    }).join('');

    const priorityColor = jw.priority === 'URGENT' ? '#dc2626' : jw.priority === 'HIGH' ? '#ea580c' : jw.priority === 'MEDIUM' ? '#ca8a04' : '#16a34a';
    const statusColor = jw.status === 'COMPLETED' ? '#16a34a' : jw.status === 'IN_PROCESS' ? '#ca8a04' : '#3b82f6';
    const statusBg = jw.status === 'COMPLETED' ? '#dcfce7' : jw.status === 'IN_PROCESS' ? '#fef9c3' : '#dbeafe';

    return `<!DOCTYPE html><html><head><title>${jw.jobWorkNo} - Job Work Challan</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
      body{font-family:'Segoe UI',Inter,-apple-system,sans-serif;color:#1e293b;padding:32px;max-width:800px;margin:0 auto}
      table{border-collapse:collapse;width:100%}
      @media print{body{padding:16px;max-width:100%} @page{margin:12mm}}
    </style></head><body>

    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1e293b;padding-bottom:16px;margin-bottom:24px">
      <div>
        <h1 style="font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;margin-bottom:4px">JOB WORK OUT CHALLAN</h1>
        <p style="font-size:13px;color:#475569;font-weight:500">FabricFlow Clothing Co.</p>
        <p style="font-size:11px;color:#94a3b8">Industrial Area, Mumbai, MH · GST: 27AABFF1234G1Z5</p>
      </div>
      <div style="text-align:right">
        <p style="font-size:18px;font-weight:900;color:#4338ca;font-family:monospace">${jw.jobWorkNo}</p>
        <p style="font-size:12px;color:#475569;margin-top:2px">Date: ${formatDate(jw.date)}</p>
        <span style="display:inline-block;margin-top:4px;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700;color:${statusColor};background:${statusBg}">${jw.status.replace(/_/g, ' ')}</span>
      </div>
    </div>

    <!-- Contractor + Challan Info -->
    <div style="display:flex;gap:16px;margin-bottom:24px">
      <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
        <p style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Contractor Details</p>
        <p style="font-size:15px;font-weight:700;color:#0f172a">${contractor?.name || '—'}</p>
        <p style="font-size:12px;color:#475569;margin-top:2px">${contractor?.address || ''}</p>
        <p style="font-size:12px;color:#475569">${contractor?.city || ''}, ${contractor?.state || ''}</p>
        ${contractor?.phone ? `<p style="font-size:12px;color:#475569;margin-top:4px">📞 ${contractor.phone}</p>` : ''}
        ${contractor?.gstNumber ? `<p style="font-size:11px;color:#64748b;font-family:monospace;margin-top:2px">GST: ${contractor.gstNumber}</p>` : ''}
      </div>
      <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
        <p style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Challan Info</p>
        <table style="width:100%;border:none">
          <tr><td style="padding:4px 0;font-size:12px;color:#64748b;border:none">Priority:</td><td style="padding:4px 0;font-size:13px;font-weight:700;text-align:right;color:${priorityColor};border:none">${jw.priority}</td></tr>
          <tr><td style="padding:4px 0;font-size:12px;color:#64748b;border:none">Issue Date:</td><td style="padding:4px 0;font-size:13px;font-weight:600;text-align:right;color:#0f172a;border:none">${formatDate(jw.date)}</td></tr>
          <tr><td style="padding:4px 0;font-size:12px;color:#64748b;border:none">Expected Return:</td><td style="padding:4px 0;font-size:13px;font-weight:600;text-align:right;color:#0f172a;border:none">${formatDate(jw.expectedReturnDate)}</td></tr>
        </table>
      </div>
    </div>

    <!-- Raw Materials Table -->
    <p style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Raw Materials Issued</p>
    <table style="margin-bottom:24px">
      <thead>
        <tr style="background:#4338ca">
          <th style="border:1px solid #4338ca;padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:white">#</th>
          <th style="border:1px solid #4338ca;padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:white">Item Name</th>
          <th style="border:1px solid #4338ca;padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:white">SKU</th>
          <th style="border:1px solid #4338ca;padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:white">Unit</th>
          <th style="border:1px solid #4338ca;padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:white">Issue Qty</th>
          <th style="border:1px solid #4338ca;padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:white">Rate (₹)</th>
          <th style="border:1px solid #4338ca;padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:white">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${rmRows}
        <tr style="background:#f1f5f9">
          <td colspan="6" style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:13px;font-weight:700;color:#0f172a">Total Issue Value:</td>
          <td style="border:1px solid #d1d5db;padding:8px 12px;text-align:right;font-size:14px;font-weight:900;color:#4338ca">${formatCurrency(totalRMValue)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Finished Goods Table -->
    <p style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Expected Finished Goods Output</p>
    <table style="margin-bottom:24px">
      <thead>
        <tr style="background:#7c3aed">
          <th style="border:1px solid #7c3aed;padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:white">#</th>
          <th style="border:1px solid #7c3aed;padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:white">Finished Good</th>
          <th style="border:1px solid #7c3aed;padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:white">SKU</th>
          <th style="border:1px solid #7c3aed;padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:white">Expected Qty</th>
          <th style="border:1px solid #7c3aed;padding:8px 12px;text-align:right;font-size:11px;font-weight:700;color:white">Cost/Piece (₹)</th>
        </tr>
      </thead>
      <tbody>${fgRows}</tbody>
    </table>

    ${jw.remarks ? `
    <div style="margin-bottom:24px">
      <p style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Remarks</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px">
        <p style="font-size:13px;color:#475569">${jw.remarks}</p>
      </div>
    </div>` : ''}

    <!-- Signatures -->
    <div style="display:flex;gap:32px;margin-top:48px;padding-top:20px;border-top:1px solid #e2e8f0">
      <div style="flex:1;text-align:center"><div style="border-bottom:1px solid #9ca3af;height:40px;margin-bottom:6px"></div><p style="font-size:11px;color:#64748b;font-weight:500">Prepared By</p></div>
      <div style="flex:1;text-align:center"><div style="border-bottom:1px solid #9ca3af;height:40px;margin-bottom:6px"></div><p style="font-size:11px;color:#64748b;font-weight:500">Authorized By</p></div>
      <div style="flex:1;text-align:center"><div style="border-bottom:1px solid #9ca3af;height:40px;margin-bottom:6px"></div><p style="font-size:11px;color:#64748b;font-weight:500">Contractor Received</p></div>
    </div>

    <!-- Footer -->
    <div style="margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;text-align:center">
      <p style="font-size:10px;color:#94a3b8">This is a computer-generated document. Generated by FabricFlow ERP on ${new Date().toLocaleDateString('en-IN')}.</p>
    </div>

    </body></html>`;
  };

  // ─── Build Print HTML for MI ───
  const buildMIPrintHTML = (mi: MaterialIn) => {
    const jw = jobWorks.find(j => j.id === mi.jobWorkId);
    const contractor = parties.find(p => p.id === mi.contractorId);
    const allMIsForJW = materialIns.filter(m => m.jobWorkId === mi.jobWorkId);
    const allMIs = allMIsForJW.find(m => m.id === mi.id) ? allMIsForJW : [...allMIsForJW, mi];

    const miRows = mi.items.map((mii, idx) => {
      const item = items.find(i => i.id === mii.itemId);
      const fg = jw?.finishedGoods.find(f => f.itemId === mii.itemId);
      const issuedQty = fg?.expectedQty || 0;
      const totalRecAll = allMIs.reduce((s, m) => { const r = m.items.find(x => x.itemId === mii.itemId); return s + (r?.receivedQty || 0); }, 0);
      const balance = Math.max(0, issuedQty - totalRecAll);
      const balColor = balance <= 0 ? '#16a34a' : '#ea580c';
      const balBg = balance <= 0 ? '#dcfce7' : '#fff7ed';
      return `<tr>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;color:#6b7280">${idx + 1}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;font-weight:600;color:#111827">${item?.name || '—'}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:11px;font-family:monospace;color:#6b7280">${item?.sku || '—'}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;text-align:center;color:#374151">${issuedQty}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;text-align:center;font-weight:700;color:#16a34a">${mii.receivedQty}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;text-align:center;font-weight:700;color:#dc2626">${mii.rejectedQty}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;text-align:center;font-weight:700;color:#ca8a04">${mii.wastageQty}</td>
        <td style="border:1px solid #d1d5db;padding:8px 12px;font-size:13px;text-align:center;font-weight:900;color:${balColor};background:${balBg}">${balance} PCS</td>
      </tr>`;
    }).join('');

    const jwStatus = jw?.status?.replace(/_/g, ' ') || '—';
    const jwStatusColor = jw?.status === 'COMPLETED' ? '#16a34a' : '#ea580c';

    return `<!DOCTYPE html><html><head><title>${mi.materialInNo} - Material In Receipt</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
      body{font-family:'Segoe UI',Inter,-apple-system,sans-serif;color:#1e293b;padding:32px;max-width:800px;margin:0 auto}
      table{border-collapse:collapse;width:100%}
      @media print{body{padding:16px;max-width:100%} @page{margin:12mm}}
    </style></head><body>

    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1e293b;padding-bottom:16px;margin-bottom:24px">
      <div>
        <h1 style="font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;margin-bottom:4px">MATERIAL IN RECEIPT</h1>
        <p style="font-size:13px;color:#475569;font-weight:500">FabricFlow Clothing Co.</p>
        <p style="font-size:11px;color:#94a3b8">Industrial Area, Mumbai, MH · GST: 27AABFF1234G1Z5</p>
      </div>
      <div style="text-align:right">
        <p style="font-size:18px;font-weight:900;color:#16a34a;font-family:monospace">${mi.materialInNo}</p>
        <p style="font-size:12px;color:#475569;margin-top:2px">Date: ${formatDate(mi.date)}</p>
        <p style="font-size:12px;color:#475569;margin-top:2px">Against: <strong style="color:#4338ca">${jw?.jobWorkNo || '—'}</strong></p>
      </div>
    </div>

    <div style="display:flex;gap:16px;margin-bottom:24px">
      <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
        <p style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Contractor Details</p>
        <p style="font-size:15px;font-weight:700;color:#0f172a">${contractor?.name || '—'}</p>
        <p style="font-size:12px;color:#475569">${contractor?.city || ''}, ${contractor?.state || ''}</p>
        ${contractor?.phone ? `<p style="font-size:12px;color:#475569;margin-top:4px">📞 ${contractor.phone}</p>` : ''}
      </div>
      <div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px">
        <p style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Receipt Info</p>
        <table style="width:100%;border:none">
          <tr><td style="padding:4px 0;font-size:12px;color:#64748b;border:none">MI Date:</td><td style="padding:4px 0;font-size:13px;font-weight:600;text-align:right;color:#0f172a;border:none">${formatDate(mi.date)}</td></tr>
          <tr><td style="padding:4px 0;font-size:12px;color:#64748b;border:none">JW Date:</td><td style="padding:4px 0;font-size:13px;font-weight:600;text-align:right;color:#0f172a;border:none">${jw ? formatDate(jw.date) : '—'}</td></tr>
          <tr><td style="padding:4px 0;font-size:12px;color:#64748b;border:none">JW Status:</td><td style="padding:4px 0;font-size:13px;font-weight:700;text-align:right;color:${jwStatusColor};border:none">${jwStatus}</td></tr>
        </table>
      </div>
    </div>

    <p style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Goods Received Details</p>
    <table style="margin-bottom:24px">
      <thead>
        <tr style="background:#16a34a">
          <th style="border:1px solid #16a34a;padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:white">#</th>
          <th style="border:1px solid #16a34a;padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:white">Finished Good</th>
          <th style="border:1px solid #16a34a;padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:white">SKU</th>
          <th style="border:1px solid #16a34a;padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:white">Issued</th>
          <th style="border:1px solid #16a34a;padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:white">Received ✅</th>
          <th style="border:1px solid #16a34a;padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:white">Rejected ❌</th>
          <th style="border:1px solid #16a34a;padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:white">Wastage ⚠️</th>
          <th style="border:1px solid #16a34a;padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:white">Balance</th>
        </tr>
      </thead>
      <tbody>${miRows}</tbody>
    </table>

    ${mi.remarks ? `
    <div style="margin-bottom:24px">
      <p style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Remarks</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px">
        <p style="font-size:13px;color:#475569">${mi.remarks}</p>
      </div>
    </div>` : ''}

    <div style="display:flex;gap:32px;margin-top:48px;padding-top:20px;border-top:1px solid #e2e8f0">
      <div style="flex:1;text-align:center"><div style="border-bottom:1px solid #9ca3af;height:40px;margin-bottom:6px"></div><p style="font-size:11px;color:#64748b;font-weight:500">Received By</p></div>
      <div style="flex:1;text-align:center"><div style="border-bottom:1px solid #9ca3af;height:40px;margin-bottom:6px"></div><p style="font-size:11px;color:#64748b;font-weight:500">QC Checked By</p></div>
      <div style="flex:1;text-align:center"><div style="border-bottom:1px solid #9ca3af;height:40px;margin-bottom:6px"></div><p style="font-size:11px;color:#64748b;font-weight:500">Authorized By</p></div>
    </div>

    <div style="margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;text-align:center">
      <p style="font-size:10px;color:#94a3b8">This is a computer-generated document. Generated by FabricFlow ERP on ${new Date().toLocaleDateString('en-IN')}.</p>
    </div>

    </body></html>`;
  };

  // ─── Print Handler ───
  const handlePrint = (type: 'jw' | 'mi', data: JobWork | MaterialIn) => {
    if (type === 'jw') {
      setModal({ type: 'pdfJW', data });
    } else {
      setModal({ type: 'pdfMI', data });
    }
    setTimeout(() => {
      const html = type === 'jw' ? buildJWPrintHTML(data as JobWork) : buildMIPrintHTML(data as MaterialIn);
      const w = window.open('', '_blank', 'width=820,height=900');
      if (!w) return;
      w.document.write(html);
      w.document.close();
      setTimeout(() => { w.print(); w.close(); }, 300);
    }, 150);
  };

  // ─── Open JWs eligible for Material In ───
  const openJobWorks = jobWorks.filter(jw => {
    if (!['OPEN', 'IN_PROCESS', 'PARTIAL_RECEIVED'].includes(jw.status)) return false;
    // Check if there's still remaining balance
    return jw.finishedGoods.some(fg => {
      const totalAccounted = getTotalAccounted(jw.id, fg.itemId);
      return totalAccounted < fg.expectedQty;
    });
  });

  return (
    <div className="p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Job Works', value: jobWorks.length, icon: '📋', color: 'bg-indigo-50' },
          { label: 'In Process', value: jobWorks.filter(j => j.status === 'IN_PROCESS').length, icon: '🏭', color: 'bg-yellow-50' },
          { label: 'Completed', value: jobWorks.filter(j => j.status === 'COMPLETED').length, icon: '✅', color: 'bg-green-50' },
          { label: 'Pending Returns', value: jobWorks.filter(j => ['OPEN', 'IN_PROCESS', 'PARTIAL_RECEIVED'].includes(j.status)).length, icon: '⏳', color: 'bg-orange-50' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl p-4 border border-gray-100 ${card.color}`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'jobwork' as Tab, label: '📋 Job Work Out' },
          { id: 'materialin' as Tab, label: '📥 Material In' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ──────────── JOB WORK TAB ──────────── */}
      {activeTab === 'jobwork' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-xl">
              <Search size={16} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search job works..."
                className="flex-1 text-sm outline-none" />
            </div>
            <button onClick={() => { setJwForm(emptyJWForm()); setModal({ type: 'createJW' }); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm">
              <Plus size={16} /> New Job Work
            </button>
          </div>

          <div className="space-y-3">
            {filteredJW.map(jw => {
              const contractor = parties.find(p => p.id === jw.contractorId);
              const jwMIs = materialIns.filter(m => m.jobWorkId === jw.id);
              return (
                <div key={jw.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-indigo-100 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Factory size={18} className="text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm">{jw.jobWorkNo}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(jw.status)}`}>{jw.status.replace(/_/g, ' ')}</span>
                          <span className={`text-xs font-bold ${getPriorityColor(jw.priority)}`}>● {jw.priority}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">🏭 {contractor?.name} · 📅 Expected: {formatDate(jw.expectedReturnDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEditJW(jw)}
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 flex items-center gap-1">
                        <Edit2 size={12} /> Modify
                      </button>
                      <button onClick={() => setModal({ type: 'viewJW', data: jw })}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 flex items-center gap-1">
                        <Eye size={12} /> View
                      </button>
                      <button onClick={() => setModal({ type: 'pdfJW', data: jw })}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 flex items-center gap-1">
                        <FileText size={12} /> PDF
                      </button>
                      <button onClick={() => handleDeleteJW(jw)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 flex items-center gap-1">
                        <Trash2 size={12} /> Delete
                      </button>
                      {['OPEN', 'IN_PROCESS'].includes(jw.status) && (
                        <button onClick={() => updateJobWork(jw.id, { status: 'IN_PROCESS', updatedAt: new Date().toISOString() })}
                          className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-200">
                          Mark In Process
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">RAW MATERIALS ISSUED</p>
                      <div className="space-y-1">
                        {jw.rawMaterials.map(rm => {
                          const item = items.find(i => i.id === rm.itemId);
                          const unit = units.find(u => u.id === rm.unitId);
                          return (
                            <div key={rm.id} className="flex items-center justify-between text-xs bg-blue-50 rounded-lg px-2.5 py-1.5">
                              <span className="font-medium text-blue-900">{item?.name || '—'}</span>
                              <span className="text-blue-600 font-semibold">{rm.issueQty} {unit?.symbol}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">EXPECTED OUTPUT · RECEIVED</p>
                      <div className="space-y-1">
                        {jw.finishedGoods.map(fg => {
                          const item = items.find(i => i.id === fg.itemId);
                          const received = getPreviouslyReceived(jw.id, fg.itemId);
                          const rejected = getPreviouslyRejected(jw.id, fg.itemId);
                          const wastage = getPreviouslyWasted(jw.id, fg.itemId);
                          const totalAcc = received + rejected + wastage;
                          const balance = Math.max(0, fg.expectedQty - totalAcc);
                          const recPct = fg.expectedQty > 0 ? (received / fg.expectedQty) * 100 : 0;
                          const rejPct = fg.expectedQty > 0 ? (rejected / fg.expectedQty) * 100 : 0;
                          const wasPct = fg.expectedQty > 0 ? (wastage / fg.expectedQty) * 100 : 0;
                          return (
                            <div key={fg.id} className="bg-green-50 rounded-lg px-2.5 py-1.5">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-medium text-green-900">{item?.name || '—'}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-semibold">{received}/{fg.expectedQty} PCS</span>
                                  {rejected > 0 && <span className="text-red-500 font-bold text-xs">❌{rejected}</span>}
                                  {wastage > 0 && <span className="text-yellow-600 font-bold text-xs">⚠️{wastage}</span>}
                                  {balance > 0 && <span className="text-orange-600 font-bold">Bal: {balance}</span>}
                                </div>
                              </div>
                              {/* Segmented progress bar */}
                              <div className="w-full bg-gray-200 rounded-full h-1.5 flex overflow-hidden">
                                <div className="bg-green-500 h-1.5 transition-all" style={{ width: `${Math.min(100, recPct)}%` }} />
                                <div className="bg-red-400 h-1.5 transition-all" style={{ width: `${Math.min(100 - recPct, rejPct)}%` }} />
                                <div className="bg-yellow-400 h-1.5 transition-all" style={{ width: `${Math.min(100 - recPct - rejPct, wasPct)}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Material In History for this JW */}
                  {jwMIs.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-2">📥 MATERIAL IN HISTORY ({jwMIs.length} entries)</p>
                      <div className="flex gap-2 flex-wrap">
                        {jwMIs.map(mi => (
                          <button key={mi.id} onClick={() => setModal({ type: 'viewMI', data: mi })}
                            className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1">
                            {mi.materialInNo} · {formatDate(mi.date)}
                            <ArrowRight size={10} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {jw.remarks && <p className="mt-3 text-xs text-gray-500 italic">💬 {jw.remarks}</p>}
                </div>
              );
            })}
            {filteredJW.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Factory size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No job works found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────── MATERIAL IN TAB ──────────── */}
      {activeTab === 'materialin' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Material In Register</h3>
              <p className="text-xs text-gray-500 mt-0.5">{materialIns.length} entries · Against {new Set(materialIns.map(m => m.jobWorkId)).size} Job Works</p>
            </div>
            <button onClick={() => {
              setMiForm({ date: new Date().toISOString().split('T')[0], jobWorkId: '', remarks: '', items: [] });
              setModal({ type: 'createMI' });
            }}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-sm">
              <Plus size={16} /> New Material In
            </button>
          </div>

          {/* Material In Cards */}
          <div className="space-y-3">
            {materialIns.length === 0 && (
              <div className="text-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Package size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No material in entries yet</p>
                <p className="text-xs mt-1">Record received goods against Job Work Out</p>
              </div>
            )}

            {[...materialIns].reverse().map(mi => {
              const jw = jobWorks.find(j => j.id === mi.jobWorkId);
              const contractor = parties.find(p => p.id === mi.contractorId);
              return (
                <div key={mi.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-green-100 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-green-700 text-sm">{mi.materialInNo}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Received</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs font-medium text-indigo-600">Against {jw?.jobWorkNo || '—'}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        📅 {formatDate(mi.date)} · 🏭 {contractor?.name || '—'} · {contractor?.city || ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEditMI(mi)}
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 flex items-center gap-1">
                        <Edit2 size={12} /> Modify
                      </button>
                      <button onClick={() => setModal({ type: 'viewMI', data: mi })}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 flex items-center gap-1">
                        <Eye size={12} /> Details
                      </button>
                      <button onClick={() => handleDeleteMI(mi)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 flex items-center gap-1">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-3 py-2 text-left font-semibold text-gray-500">Finished Good</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-500">SKU</th>
                          <th className="px-3 py-2 text-center font-semibold text-green-600">Received ✅</th>
                          <th className="px-3 py-2 text-center font-semibold text-red-600">Rejected ❌</th>
                          <th className="px-3 py-2 text-center font-semibold text-yellow-600">Wastage ⚠️</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {mi.items.map(mii => {
                          const item = items.find(i => i.id === mii.itemId);
                          return (
                            <tr key={mii.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2.5 font-medium text-gray-900">{item?.name || '—'}</td>
                              <td className="px-3 py-2.5 font-mono text-gray-500">{item?.sku || '—'}</td>
                              <td className="px-3 py-2.5 text-center font-bold text-green-700">{mii.receivedQty}</td>
                              <td className="px-3 py-2.5 text-center font-bold text-red-600">{mii.rejectedQty}</td>
                              <td className="px-3 py-2.5 text-center font-bold text-yellow-600">{mii.wastageQty}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {mi.remarks && <p className="mt-3 text-xs text-gray-500 italic">💬 {mi.remarks}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────────── CREATE JOB WORK MODAL ──────────── */}
      <Modal isOpen={modal?.type === 'createJW'} onClose={() => setModal(null)} title="Create Job Work Out" size="2xl">
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">JW No.</label>
              <input value={nextJWNo} readOnly className="w-full px-3 py-2 border border-gray-100 bg-gray-50 rounded-xl text-sm text-gray-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" value={jwForm.date} onChange={e => setJwForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Contractor *</label>
              <select value={jwForm.contractorId} onChange={e => setJwForm(f => ({ ...f, contractorId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-indigo-400">
                <option value="">Select contractor...</option>
                {contractors.map(c => <option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select value={jwForm.priority} onChange={e => setJwForm(f => ({ ...f, priority: e.target.value as JobWork['priority'] }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-indigo-400">
                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expected Return *</label>
              <input type="date" value={jwForm.expectedReturnDate} onChange={e => setJwForm(f => ({ ...f, expectedReturnDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
              <input value={jwForm.remarks} onChange={e => setJwForm(f => ({ ...f, remarks: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder="Optional remarks..." />
            </div>
          </div>

          {/* Raw Materials Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-800">🧵 Raw Materials to Issue</label>
              <button onClick={addRMRow} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                <Plus size={14} /> Add Material
              </button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500 w-48">Item</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Available</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Issue Qty</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Unit</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Rate</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Amount</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {jwForm.rawMaterials.map(row => {
                    const unit = units.find(u => u.id === row.unitId);
                    const overLimit = row.itemId && row.issueQty > row.availableStock;
                    const balance = row.availableStock - row.issueQty;
                    return (
                      <tr key={row.id} className={`border-b border-gray-100 ${overLimit ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-2.5">
                          <select value={row.itemId} onChange={e => updateRMRow(row.id, 'itemId', e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 bg-white">
                            <option value="">Select item...</option>
                            {rawMaterials.map(i => <option key={i.id} value={i.id}>{i.name} (Stk: {i.currentStock})</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`font-bold ${row.availableStock <= 0 ? 'text-red-600' : 'text-green-700'}`}>{row.availableStock}</span>
                          <span className="text-gray-400 text-xs ml-0.5">{unit?.symbol}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <input type="number" min={0} value={row.issueQty || ''}
                            onChange={e => updateRMRow(row.id, 'issueQty', Number(e.target.value))}
                            className={`w-20 text-sm rounded-lg px-2 py-1.5 outline-none text-right font-bold ${overLimit ? 'border-2 border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200' : 'border border-gray-200 focus:border-indigo-400 text-gray-900'}`} />
                          {overLimit && (
                            <div className="mt-1">
                              <span className="text-xs font-bold text-red-600">❌ Exceeds stock!</span>
                            </div>
                          )}
                          {row.itemId && row.issueQty > 0 && !overLimit && (
                            <div className="mt-1">
                              <span className="text-xs text-green-600 font-medium">Bal: {balance} {unit?.symbol}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center text-gray-500">{unit?.symbol || '—'}</td>
                        <td className="px-3 py-2.5">
                          <input type="number" min={0} value={row.rate || ''}
                            onChange={e => updateRMRow(row.id, 'rate', Number(e.target.value))}
                            className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-right" />
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-indigo-700">{formatCurrency(row.amount)}</td>
                        <td className="px-3 py-2.5">
                          <button onClick={() => removeRMRow(row.id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><X size={14} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Stock Warning Banner */}
            {jwForm.rawMaterials.some(r => r.itemId && r.issueQty > r.availableStock) && (
              <div className="mt-3 bg-red-50 border border-red-300 rounded-xl p-3 flex items-start gap-2">
                <span className="text-red-600 text-lg flex-shrink-0">🚫</span>
                <div>
                  <p className="text-sm font-bold text-red-800">Stock Limit Exceeded — Cannot Save</p>
                  <p className="text-xs text-red-600 mt-0.5">One or more items have issue quantity exceeding available stock. Please reduce the quantity to save.</p>
                  <div className="mt-2 space-y-1">
                    {jwForm.rawMaterials.filter(r => r.itemId && r.issueQty > r.availableStock).map(r => {
                      const item = items.find(i => i.id === r.itemId);
                      const unit = units.find(u => u.id === r.unitId);
                      return (
                        <div key={r.id} className="text-xs bg-red-100 rounded-lg px-3 py-1.5 flex items-center justify-between">
                          <span className="font-semibold text-red-900">{item?.name}</span>
                          <span className="text-red-700">Available: <strong>{r.availableStock} {unit?.symbol}</strong> · Entered: <strong>{r.issueQty} {unit?.symbol}</strong> · Over by: <strong className="text-red-900">{r.issueQty - r.availableStock} {unit?.symbol}</strong></span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <div className="text-right mt-2 text-sm font-bold text-gray-700">
              Total Issue Value: {formatCurrency(jwForm.rawMaterials.reduce((s, r) => s + r.amount, 0))}
            </div>
          </div>

          {/* Finished Goods Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-800">👔 Expected Finished Goods</label>
              <button onClick={addFGRow} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                <Plus size={14} /> Add Finished Good
              </button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Finished Good</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-500">Expected Qty</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Production Cost</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {jwForm.finishedGoods.map(row => (
                    <tr key={row.id} className="border-b border-gray-100">
                      <td className="px-3 py-2.5">
                        <select value={row.itemId} onChange={e => updateFGRow(row.id, 'itemId', e.target.value)}
                          className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 bg-white">
                          <option value="">Select finished good...</option>
                          {finishedGoods.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2.5">
                        <input type="number" min={0} value={row.expectedQty || ''}
                          onChange={e => updateFGRow(row.id, 'expectedQty', Number(e.target.value))}
                          className="w-24 mx-auto block text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-right" />
                      </td>
                      <td className="px-3 py-2.5">
                        <input type="number" min={0} value={row.productionCost || ''}
                          onChange={e => updateFGRow(row.id, 'productionCost', Number(e.target.value))}
                          className="w-24 ml-auto block text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-right" />
                      </td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => setJwForm(f => ({ ...f, finishedGoods: f.finishedGoods.filter(x => x.id !== row.id) }))}
                          className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><X size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={saveJobWork}
              disabled={jwForm.rawMaterials.some(r => r.itemId && r.issueQty > r.availableStock)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600">
              <Factory size={15} /> Create Job Work
            </button>
          </div>
        </div>
      </Modal>

      {/* ──────────── CREATE MATERIAL IN MODAL ──────────── */}
      <Modal isOpen={modal?.type === 'createMI'} onClose={() => setModal(null)} title="Record Material In" size="2xl">
        <div className="space-y-5">
          {/* Header Fields */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Material In No.</label>
              <input value={nextMINo} readOnly className="w-full px-3 py-2.5 border border-gray-100 bg-gray-50 rounded-xl text-sm font-mono text-green-700 font-bold" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Material In Date *</label>
              <input type="date" value={miForm.date} onChange={e => setMiForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Job Work Out No. *</label>
              <select value={miForm.jobWorkId} onChange={e => handleMIJobWorkSelect(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                <option value="">Select Job Work Out...</option>
                {openJobWorks.map(jw => {
                  const c = parties.find(p => p.id === jw.contractorId);
                  return <option key={jw.id} value={jw.id}>{jw.jobWorkNo} — {c?.name}</option>;
                })}
              </select>
            </div>
          </div>

          {/* Auto-Fetched Details */}
          {selectedMIJobWork && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Auto-Fetched from {selectedMIJobWork.jobWorkNo}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/80 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Contractor Name</p>
                  <p className="text-sm font-bold text-gray-900">{selectedMIContractor?.name || '—'}</p>
                  <p className="text-xs text-gray-400">{selectedMIContractor?.city}, {selectedMIContractor?.state}</p>
                </div>
                <div className="bg-white/80 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">JW Date</p>
                  <p className="text-sm font-bold text-gray-900">{formatDate(selectedMIJobWork.date)}</p>
                </div>
                <div className="bg-white/80 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Priority</p>
                  <p className={`text-sm font-bold ${getPriorityColor(selectedMIJobWork.priority)}`}>● {selectedMIJobWork.priority}</p>
                </div>
                <div className="bg-white/80 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Status</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(selectedMIJobWork.status)}`}>{selectedMIJobWork.status.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* Issued Raw Materials Summary */}
              <div className="mt-3 pt-3 border-t border-indigo-200">
                <p className="text-xs font-semibold text-indigo-700 mb-2">🧵 Issued Raw Materials</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedMIJobWork.rawMaterials.map(rm => {
                    const item = items.find(i => i.id === rm.itemId);
                    const unit = units.find(u => u.id === rm.unitId);
                    return (
                      <div key={rm.id} className="bg-white/70 rounded-lg px-3 py-2 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-900">{item?.name || '—'}</p>
                          <p className="text-xs text-gray-400 font-mono">{item?.sku}</p>
                        </div>
                        <span className="text-xs font-bold text-blue-700">{rm.issueQty} {unit?.symbol}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Finished Goods Receipt Table */}
          {miForm.items.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-800">👔 Finished Goods Receipt</label>
                <span className="text-xs text-gray-500">Enter quantities for received, rejected, and wastage</span>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs">
                      <th className="px-4 py-3 text-left font-semibold text-gray-500">Finished Good</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-500">SKU</th>
                      <th className="px-4 py-3 text-center font-semibold text-blue-600">Issued Qty</th>
                      <th className="px-4 py-3 text-center font-semibold text-purple-600">Prev Received</th>
                      <th className="px-4 py-3 text-center font-semibold text-orange-700 bg-orange-50">Pending (Balance)</th>
                      <th className="px-4 py-3 text-center font-semibold text-green-700 bg-green-50">Receive Now ✅</th>
                      <th className="px-4 py-3 text-center font-semibold text-red-600 bg-red-50">Rejected ❌</th>
                      <th className="px-4 py-3 text-center font-semibold text-yellow-600 bg-yellow-50">Wastage ⚠️</th>
                    </tr>
                  </thead>
                  <tbody>
                    {miForm.items.map(mii => {
                      const item = items.find(i => i.id === mii.itemId);
                      const fg = selectedMIJobWork?.finishedGoods.find(f => f.itemId === mii.itemId);
                      const issuedQty = fg?.expectedQty || 0;
                      const prevReceived = issuedQty - mii.pendingQty;
                      // Live pending = original pending - all entered quantities
                      const totalEntered = (mii.receivedQty || 0) + (mii.rejectedQty || 0) + (mii.wastageQty || 0);
                      const livePending = Math.max(0, mii.pendingQty - totalEntered);
                      const isOverEntry = totalEntered > mii.pendingQty;
                      const isFullyDone = livePending === 0 && totalEntered > 0;
                      return (
                        <tr key={mii.id} className={`border-b border-gray-100 ${isOverEntry ? 'bg-red-50' : 'hover:bg-gray-50/50'}`}>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-gray-900">{item?.name || '—'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item?.sku || '—'}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-bold text-blue-700">{issuedQty}</span>
                            <span className="text-xs text-gray-400 ml-1">PCS</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-bold text-purple-700">{prevReceived}</span>
                            <span className="text-xs text-gray-400 ml-1">PCS</span>
                          </td>
                          <td className="px-4 py-3 text-center bg-orange-50/50">
                            <span className={`text-lg font-black ${isOverEntry ? 'text-red-600' : isFullyDone ? 'text-green-600' : livePending > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                              {isOverEntry ? '⚠️' : ''} {livePending}
                            </span>
                            <span className="text-xs text-gray-400 ml-1">PCS</span>
                            {isOverEntry && <p className="text-xs text-red-600 font-bold mt-0.5">Exceeds by {totalEntered - mii.pendingQty}</p>}
                            {isFullyDone && <p className="text-xs text-green-600 font-bold mt-0.5">✅ Complete</p>}
                          </td>
                          <td className="px-4 py-3 bg-green-50/50">
                            <input type="number" min={0} value={mii.receivedQty || ''}
                              onChange={e => {
                                const val = Math.max(0, Number(e.target.value));
                                setMiForm(f => ({ ...f, items: f.items.map(x => x.id === mii.id ? { ...x, receivedQty: val } : x) }));
                              }}
                              placeholder="0"
                              className={`w-20 mx-auto block text-sm border-2 rounded-lg px-2 py-2 outline-none text-center font-bold bg-white ${isOverEntry ? 'border-red-400 text-red-700 ring-2 ring-red-100' : 'border-green-300 text-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-100'}`} />
                          </td>
                          <td className="px-4 py-3 bg-red-50/50">
                            <input type="number" min={0} value={mii.rejectedQty || ''}
                              onChange={e => {
                                const val = Math.max(0, Number(e.target.value));
                                setMiForm(f => ({ ...f, items: f.items.map(x => x.id === mii.id ? { ...x, rejectedQty: val } : x) }));
                              }}
                              placeholder="0"
                              className={`w-20 mx-auto block text-sm border-2 rounded-lg px-2 py-2 outline-none text-center font-bold bg-white ${isOverEntry ? 'border-red-400 text-red-700' : 'border-red-300 text-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-100'}`} />
                          </td>
                          <td className="px-4 py-3 bg-yellow-50/50">
                            <input type="number" min={0} value={mii.wastageQty || ''}
                              onChange={e => {
                                const val = Math.max(0, Number(e.target.value));
                                setMiForm(f => ({ ...f, items: f.items.map(x => x.id === mii.id ? { ...x, wastageQty: val } : x) }));
                              }}
                              placeholder="0"
                              className={`w-20 mx-auto block text-sm border-2 rounded-lg px-2 py-2 outline-none text-center font-bold bg-white ${isOverEntry ? 'border-red-400 text-red-700' : 'border-yellow-300 text-yellow-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100'}`} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Balance Summary */}
              <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-xs font-bold text-indigo-700 uppercase mb-2">📊 After This Entry — Balance Summary</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {miForm.items.map(mii => {
                    const item = items.find(i => i.id === mii.itemId);
                    const totalE = (mii.receivedQty || 0) + (mii.rejectedQty || 0) + (mii.wastageQty || 0);
                    const remainingAfter = mii.pendingQty - totalE;
                    return (
                      <div key={mii.id} className={`rounded-lg px-3 py-2 border ${remainingAfter <= 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                        <p className="text-xs font-medium text-gray-900">{item?.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">Remaining Balance:</span>
                          <span className={`text-sm font-black ${remainingAfter <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                            {Math.max(0, remainingAfter)} PCS
                          </span>
                        </div>
                        {remainingAfter <= 0 && <p className="text-xs text-green-600 font-semibold mt-0.5">✅ Fully received</p>}
                        {remainingAfter > 0 && <p className="text-xs text-orange-600 font-semibold mt-0.5">⏳ Will carry forward to next MI</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* No pending items message */}
          {miForm.jobWorkId && miForm.items.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <span className="text-4xl mb-3 block">✅</span>
              <p className="font-bold text-green-800">All goods already received!</p>
              <p className="text-sm text-green-600 mt-1">There's no pending balance against this Job Work.</p>
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
            <textarea value={miForm.remarks} onChange={e => setMiForm(f => ({ ...f, remarks: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
              placeholder="E.g. Partial delivery, remaining 25 pcs pending..." />
          </div>

          {/* Over-entry Warning */}
          {miForm.items.some(mii => ((mii.receivedQty||0) + (mii.rejectedQty||0) + (mii.wastageQty||0)) > mii.pendingQty) && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-start gap-2">
              <span className="text-red-600 text-lg flex-shrink-0">🚫</span>
              <div>
                <p className="text-sm font-bold text-red-800">Quantity exceeds available balance</p>
                <p className="text-xs text-red-600 mt-0.5">Receive + Rejected + Wastage cannot exceed Pending quantity. Please correct the values.</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
            <button onClick={saveMaterialIn}
              disabled={!miForm.jobWorkId || miForm.items.length === 0 || miForm.items.some(mii => ((mii.receivedQty||0) + (mii.rejectedQty||0) + (mii.wastageQty||0)) > mii.pendingQty)}
              className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Package size={15} /> Save Material In
            </button>
          </div>
        </div>
      </Modal>

      {/* ──────────── VIEW MATERIAL IN MODAL ──────────── */}
      <Modal isOpen={modal?.type === 'viewMI'} onClose={() => setModal(null)} title="Material In Details" size="xl">
        {(() => {
          if (modal?.type !== 'viewMI') return null;
          const mi = modal?.data as MaterialIn | undefined;
          if (!mi) return null;
          const jw = jobWorks.find(j => j.id === mi.jobWorkId);
          const contractor = parties.find(p => p.id === mi.contractorId);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ['MI No.', mi.materialInNo], ['MI Date', formatDate(mi.date)],
                  ['Job Work', jw?.jobWorkNo || '—'], ['Contractor', contractor?.name || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">{l}</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs">
                      <th className="px-4 py-3 text-left font-semibold text-gray-500">Finished Good</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-500">SKU</th>
                      <th className="px-4 py-3 text-center font-semibold text-blue-600">Issued</th>
                      <th className="px-4 py-3 text-center font-semibold text-green-600">Received</th>
                      <th className="px-4 py-3 text-center font-semibold text-red-600">Rejected</th>
                      <th className="px-4 py-3 text-center font-semibold text-yellow-600">Wastage</th>
                      <th className="px-4 py-3 text-center font-semibold text-orange-600">Total Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mi.items.map(mii => {
                      const item = items.find(i => i.id === mii.itemId);
                      const fg = jw?.finishedGoods.find(f => f.itemId === mii.itemId);
                      const issuedQty = fg?.expectedQty || 0;
                      const totalAcc = getTotalAccounted(mi.jobWorkId, mii.itemId);
                      const totalBalance = Math.max(0, issuedQty - totalAcc);
                      return (
                        <tr key={mii.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{item?.name || '—'}</td>
                          <td className="px-4 py-3 text-xs font-mono text-gray-500">{item?.sku || '—'}</td>
                          <td className="px-4 py-3 text-center font-bold text-blue-700">{issuedQty}</td>
                          <td className="px-4 py-3 text-center font-bold text-green-700">{mii.receivedQty}</td>
                          <td className="px-4 py-3 text-center font-bold text-red-600">{mii.rejectedQty}</td>
                          <td className="px-4 py-3 text-center font-bold text-yellow-600">{mii.wastageQty}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-black ${totalBalance <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                              {Math.max(0, totalBalance)} PCS
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {mi.remarks && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Remarks</p>
                  <p className="text-sm text-gray-700 mt-0.5">{mi.remarks}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => setModal({ type: 'pdfMI', data: mi })}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-sm">
                  <FileText size={15} /> View PDF / Receipt
                </button>
                <button onClick={() => handlePrint('mi', mi)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
                  <Printer size={15} /> Print
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ──────────── VIEW JOB WORK MODAL ──────────── */}
      <Modal isOpen={modal?.type === 'viewJW'} onClose={() => setModal(null)} title="Job Work Details" size="xl">
        {viewJW && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['JW No.', viewJW.jobWorkNo], ['Date', formatDate(viewJW.date)],
                ['Contractor', viewContractor?.name || '—'], ['Status', viewJW.status.replace(/_/g, ' ')],
                ['Priority', viewJW.priority], ['Expected Return', formatDate(viewJW.expectedReturnDate)],
              ].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{l}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{v}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Raw Materials Issued</h4>
              <div className="space-y-1">
                {viewJW.rawMaterials.map(rm => {
                  const item = items.find(i => i.id === rm.itemId);
                  const unit = units.find(u => u.id === rm.unitId);
                  return (
                    <div key={rm.id} className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2 text-sm">
                      <span className="font-medium text-blue-900">{item?.name || '—'} ({item?.sku})</span>
                      <div className="flex items-center gap-4">
                        <span className="text-blue-600">{rm.issueQty} {unit?.symbol}</span>
                        <span className="text-blue-700 font-semibold">{formatCurrency(rm.amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Finished Goods — Issued vs Received</h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs">
                      <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Item</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-gray-500">SKU</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-blue-600">Issued</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-green-600">Received</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-red-600">Rejected</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-yellow-600">Wastage</th>
                      <th className="px-3 py-2.5 text-center font-semibold text-orange-600">Balance</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Cost/pc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {viewJW.finishedGoods.map(fg => {
                      const item = items.find(i => i.id === fg.itemId);
                      const received = getPreviouslyReceived(viewJW.id, fg.itemId);
                      const rejected = getPreviouslyRejected(viewJW.id, fg.itemId);
                      const wastage = getPreviouslyWasted(viewJW.id, fg.itemId);
                      const totalAcc = received + rejected + wastage;
                      const balance = Math.max(0, fg.expectedQty - totalAcc);
                      const pct = fg.expectedQty > 0 ? (totalAcc / fg.expectedQty * 100) : 0;
                      return (
                        <tr key={fg.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 font-medium text-gray-900">{item?.name || '—'}</td>
                          <td className="px-3 py-2.5 text-xs font-mono text-gray-500">{item?.sku}</td>
                          <td className="px-3 py-2.5 text-center font-bold text-blue-700">{fg.expectedQty}</td>
                          <td className="px-3 py-2.5 text-center font-bold text-green-700">{received}</td>
                          <td className="px-3 py-2.5 text-center font-bold text-red-600">{rejected}</td>
                          <td className="px-3 py-2.5 text-center font-bold text-yellow-600">{wastage}</td>
                          <td className="px-3 py-2.5 text-center">
                            <div>
                              <span className={`font-black ${balance <= 0 ? 'text-green-600' : 'text-orange-600'}`}>{Math.max(0, balance)}</span>
                              <div className="w-16 mx-auto bg-gray-200 rounded-full h-1.5 mt-1">
                                <div className={`h-1.5 rounded-full ${pct >= 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                                  style={{ width: `${Math.min(100, pct)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-700">{formatCurrency(fg.productionCost)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {viewJW.remarks && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Remarks</p>
                <p className="text-sm text-gray-700 mt-0.5">{viewJW.remarks}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <button onClick={() => { if (viewJW) setModal({ type: 'pdfJW', data: viewJW }); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm">
                <FileText size={15} /> View PDF / Challan
              </button>
              <button onClick={() => { if (viewJW) handlePrint('jw', viewJW); }}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
                <Printer size={15} /> Print
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ──────────── JW PDF PREVIEW MODAL ──────────── */}
      <Modal isOpen={modal?.type === 'pdfJW'} onClose={() => setModal(null)} title="" size="xl">
        {(() => {
          if (modal?.type !== 'pdfJW') return null;
          const jw = modal?.data as JobWork | undefined;
          if (!jw) return null;
          const contractor = parties.find(p => p.id === jw.contractorId);
          const totalRMValue = jw.rawMaterials.reduce((s, r) => s + r.amount, 0);
          return (
            <div>
              {/* Print / Download Buttons */}
              <div className="flex items-center justify-between mb-4 no-print">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-xl">✅</span>
                  <span className="text-sm font-semibold text-green-700">Job Work Challan Generated Successfully</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handlePrint('jw', jw)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm">
                    <Printer size={14} /> Print Challan
                  </button>
                  <button onClick={() => handlePrint('jw', jw)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
                    <Download size={14} /> Download PDF
                  </button>
                  <button onClick={() => setModal(null)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">
                    Close
                  </button>
                </div>
              </div>

              {/* PDF Content */}
              <div id="pdf-jw-content" className="bg-white border border-gray-200 rounded-xl p-8 shadow-inner">
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">JOB WORK OUT CHALLAN</h1>
                    <p className="text-sm text-gray-600 mt-1">FabricFlow Clothing Co.</p>
                    <p className="text-xs text-gray-400">Industrial Area, Mumbai, MH · GST: 27AABFF1234G1Z5</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-700 font-mono">{jw.jobWorkNo}</p>
                    <p className="text-sm text-gray-600">Date: {formatDate(jw.date)}</p>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold mt-1 inline-block ${getStatusColor(jw.status)}`}>{jw.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {/* Contractor Details */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contractor Details</p>
                    <p className="text-base font-bold text-gray-900">{contractor?.name || '—'}</p>
                    <p className="text-sm text-gray-600">{contractor?.address}</p>
                    <p className="text-sm text-gray-600">{contractor?.city}, {contractor?.state}</p>
                    {contractor?.phone && <p className="text-sm text-gray-600">📞 {contractor.phone}</p>}
                    {contractor?.gstNumber && <p className="text-sm text-gray-500 font-mono">GST: {contractor.gstNumber}</p>}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Challan Info</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Priority:</span><span className={`font-bold ${getPriorityColor(jw.priority)}`}>{jw.priority}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Issue Date:</span><span className="font-medium text-gray-900">{formatDate(jw.date)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Expected Return:</span><span className="font-medium text-gray-900">{formatDate(jw.expectedReturnDate)}</span></div>
                    </div>
                  </div>
                </div>

                {/* Raw Materials Table */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Raw Materials Issued</p>
                  <table className="w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-700">#</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-700">Item Name</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-700">SKU</th>
                        <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-700">Unit</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-gray-700">Issue Qty</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-gray-700">Rate (₹)</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-gray-700">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jw.rawMaterials.map((rm, idx) => {
                        const item = items.find(i => i.id === rm.itemId);
                        const unit = units.find(u => u.id === rm.unitId);
                        return (
                          <tr key={rm.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-3 py-2 text-xs text-gray-500">{idx + 1}</td>
                            <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900">{item?.name || '—'}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs font-mono text-gray-500">{item?.sku || '—'}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-xs text-gray-600">{unit?.symbol || '—'}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-gray-900">{rm.issueQty}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-sm text-gray-700">{formatCurrency(rm.rate)}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-indigo-700">{formatCurrency(rm.amount)}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-100">
                        <td colSpan={6} className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-gray-900">Total Issue Value:</td>
                        <td className="border border-gray-300 px-3 py-2 text-right text-sm font-black text-indigo-800">{formatCurrency(totalRMValue)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Expected Finished Goods */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Expected Finished Goods Output</p>
                  <table className="w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-700">#</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-700">Finished Good</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-700">SKU</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-gray-700">Expected Qty</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-gray-700">Cost/Piece (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jw.finishedGoods.map((fg, idx) => {
                        const item = items.find(i => i.id === fg.itemId);
                        return (
                          <tr key={fg.id}>
                            <td className="border border-gray-300 px-3 py-2 text-xs text-gray-500">{idx + 1}</td>
                            <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900">{item?.name || '—'}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs font-mono text-gray-500">{item?.sku || '—'}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-gray-900">{fg.expectedQty} PCS</td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-sm text-gray-700">{formatCurrency(fg.productionCost)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Remarks */}
                {jw.remarks && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Remarks</p>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{jw.remarks}</p>
                  </div>
                )}

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-8 mt-10 pt-6 border-t border-gray-300">
                  {['Prepared By', 'Authorized By', 'Contractor Received'].map(label => (
                    <div key={label} className="text-center">
                      <div className="border-b border-gray-400 mb-2 h-10" />
                      <p className="text-xs font-medium text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-3 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-400">This is a computer-generated document. Generated by FabricFlow ERP on {new Date().toLocaleDateString('en-IN')}.</p>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ──────────── MI PDF PREVIEW MODAL ──────────── */}
      <Modal isOpen={modal?.type === 'pdfMI'} onClose={() => setModal(null)} title="" size="xl">
        {(() => {
          if (modal?.type !== 'pdfMI') return null;
          const mi = modal?.data as MaterialIn | undefined;
          if (!mi) return null;
          const jw = jobWorks.find(j => j.id === mi.jobWorkId);
          const contractor = parties.find(p => p.id === mi.contractorId);
          // Recalculate balances after this MI
          const allMIsForJW = materialIns.filter(m => m.jobWorkId === mi.jobWorkId);
          // If the MI is the freshly created one it might not be in the store yet, include it
          const allMIs = allMIsForJW.find(m => m.id === mi.id) ? allMIsForJW : [...allMIsForJW, mi];

          return (
            <div>
              {/* Buttons */}
              <div className="flex items-center justify-between mb-4 no-print">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-xl">✅</span>
                  <span className="text-sm font-semibold text-green-700">Material In Receipt Generated Successfully</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handlePrint('mi', mi)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-sm">
                    <Printer size={14} /> Print Receipt
                  </button>
                  <button onClick={() => handlePrint('mi', mi)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
                    <Download size={14} /> Download PDF
                  </button>
                  <button onClick={() => setModal(null)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">
                    Close
                  </button>
                </div>
              </div>

              {/* PDF Content */}
              <div id="pdf-mi-content" className="bg-white border border-gray-200 rounded-xl p-8 shadow-inner">
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">MATERIAL IN RECEIPT</h1>
                    <p className="text-sm text-gray-600 mt-1">FabricFlow Clothing Co.</p>
                    <p className="text-xs text-gray-400">Industrial Area, Mumbai, MH · GST: 27AABFF1234G1Z5</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-green-700 font-mono">{mi.materialInNo}</p>
                    <p className="text-sm text-gray-600">Date: {formatDate(mi.date)}</p>
                    <p className="text-sm text-gray-500 mt-1">Against: <span className="font-bold text-indigo-700">{jw?.jobWorkNo || '—'}</span></p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contractor Details</p>
                    <p className="text-base font-bold text-gray-900">{contractor?.name || '—'}</p>
                    <p className="text-sm text-gray-600">{contractor?.city}, {contractor?.state}</p>
                    {contractor?.phone && <p className="text-sm text-gray-600">📞 {contractor.phone}</p>}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Receipt Info</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">MI Date:</span><span className="font-medium">{formatDate(mi.date)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">JW Date:</span><span className="font-medium">{jw ? formatDate(jw.date) : '—'}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">JW Status:</span><span className={`font-bold ${jw?.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>{jw?.status?.replace(/_/g, ' ') || '—'}</span></div>
                    </div>
                  </div>
                </div>

                {/* Receipt Table */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Goods Received Details</p>
                  <table className="w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-700">#</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-700">Finished Good</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-700">SKU</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-gray-700">Issued</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-green-700">Received</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-red-600">Rejected</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-yellow-600">Wastage</th>
                        <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-orange-600">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mi.items.map((mii, idx) => {
                        const item = items.find(i => i.id === mii.itemId);
                        const fg = jw?.finishedGoods.find(f => f.itemId === mii.itemId);
                        const issuedQty = fg?.expectedQty || 0;
                        const totalReceivedAll = allMIs.reduce((s, m) => {
                          const row = m.items.find(x => x.itemId === mii.itemId);
                          return s + (row?.receivedQty || 0);
                        }, 0);
                        const balance = Math.max(0, issuedQty - totalReceivedAll);
                        return (
                          <tr key={mii.id}>
                            <td className="border border-gray-300 px-3 py-2 text-xs text-gray-500">{idx + 1}</td>
                            <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900">{item?.name || '—'}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs font-mono text-gray-500">{item?.sku || '—'}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-sm text-gray-700">{issuedQty}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-green-700">{mii.receivedQty}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-red-600">{mii.rejectedQty}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-sm font-bold text-yellow-600">{mii.wastageQty}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-sm font-black text-orange-600">{balance} PCS</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Remarks */}
                {mi.remarks && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Remarks</p>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{mi.remarks}</p>
                  </div>
                )}

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-8 mt-10 pt-6 border-t border-gray-300">
                  {['Received By', 'QC Checked By', 'Authorized By'].map(label => (
                    <div key={label} className="text-center">
                      <div className="border-b border-gray-400 mb-2 h-10" />
                      <p className="text-xs font-medium text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-3 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-400">This is a computer-generated document. Generated by FabricFlow ERP on {new Date().toLocaleDateString('en-IN')}.</p>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ──────────── EDIT JOB WORK MODAL ──────────── */}
      <Modal isOpen={modal?.type === 'editJW'} onClose={() => setModal(null)} title="Modify Job Work" size="2xl">
        {(() => {
          if (modal?.type !== 'editJW') return null;
          const origJW = jobWorks.find(j => j.id === editJWId);
          if (!origJW) return null;
          const hasReceivedMI = materialIns.some(m => m.jobWorkId === editJWId);
          return (
            <div className="space-y-5">
              {/* Warning if has MI entries */}
              {hasReceivedMI && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <span className="text-amber-600 text-lg">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Material already received against this Job Work</p>
                    <p className="text-xs text-amber-600 mt-0.5">Cannot reduce issued qty below received qty. Cannot delete items that have been received.</p>
                  </div>
                </div>
              )}

              {/* Header Info */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900 font-mono">{origJW.jobWorkNo}</p>
                  <p className="text-xs text-gray-500">Created: {formatDate(origJW.date)}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${getStatusColor(origJW.status)}`}>{origJW.status.replace(/_/g, ' ')}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contractor</label>
                  <select value={editJWForm.contractorId} onChange={e => setEditJWForm(f => ({ ...f, contractorId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-indigo-400">
                    {contractors.map(c => <option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select value={editJWForm.priority} onChange={e => setEditJWForm(f => ({ ...f, priority: e.target.value as JobWork['priority'] }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-indigo-400">
                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expected Return</label>
                  <input type="date" value={editJWForm.expectedReturnDate} onChange={e => setEditJWForm(f => ({ ...f, expectedReturnDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
                </div>
                <div className="col-span-2 md:col-span-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                  <input value={editJWForm.remarks} onChange={e => setEditJWForm(f => ({ ...f, remarks: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
                </div>
              </div>

              {/* Edit RM Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-800">🧵 Raw Materials</label>
                  <button onClick={() => setEditJWForm(f => ({ ...f, rawMaterials: [...f.rawMaterials, { id: generateId(), itemId: '', availableStock: 0, issueQty: 0, unitId: '', rate: 0, amount: 0 }] }))}
                    className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700">
                    <Plus size={14} /> Add Row
                  </button>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2 text-left font-semibold text-gray-500 w-48">Item</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-500">Issue Qty</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-500">Unit</th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-500">Rate</th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-500">Amount</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editJWForm.rawMaterials.map(row => {
                        const unit = units.find(u => u.id === row.unitId);
                        const item = items.find(i => i.id === row.itemId);
                        const origRM = origJW ? origJW.rawMaterials.find(o => o.itemId === row.itemId) : null;
                        const alreadyIssued = origRM?.issueQty || 0;
                        const maxAllowed = (item?.currentStock || 0) + alreadyIssued;
                        const overLimit = row.itemId && row.issueQty > maxAllowed;
                        return (
                          <tr key={row.id} className={`border-b border-gray-100 ${overLimit ? 'bg-red-50' : ''}`}>
                            <td className="px-3 py-2">
                              <select value={row.itemId} onChange={e => updateEditRMRow(row.id, 'itemId', e.target.value)}
                                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-indigo-400">
                                <option value="">Select...</option>
                                {rawMaterials.map(i => <option key={i.id} value={i.id}>{i.name} (Stk: {i.currentStock})</option>)}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input type="number" min={0} value={row.issueQty || ''} onChange={e => updateEditRMRow(row.id, 'issueQty', Number(e.target.value))}
                                className={`w-20 mx-auto block text-sm rounded-lg px-2 py-1.5 outline-none text-right font-bold ${overLimit ? 'border-2 border-red-500 bg-red-50 text-red-700' : 'border border-gray-200 focus:border-indigo-400 text-gray-900'}`} />
                              {overLimit && <p className="text-xs text-red-600 font-bold mt-0.5 text-center">❌ Max: {maxAllowed}</p>}
                              {row.itemId && row.issueQty > 0 && !overLimit && <p className="text-xs text-green-600 font-medium mt-0.5 text-center">✓ OK</p>}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-500">{unit?.symbol || '—'}</td>
                            <td className="px-3 py-2">
                              <input type="number" min={0} value={row.rate || ''} onChange={e => updateEditRMRow(row.id, 'rate', Number(e.target.value))}
                                className="w-24 ml-auto block text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-right" />
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-indigo-700">{formatCurrency(row.issueQty * row.rate)}</td>
                            <td className="px-3 py-2">
                              <button onClick={() => setEditJWForm(f => ({ ...f, rawMaterials: f.rawMaterials.filter(r => r.id !== row.id) }))}
                                className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><X size={14} /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit FG Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-800">👔 Expected Finished Goods</label>
                  <button onClick={() => setEditJWForm(f => ({ ...f, finishedGoods: [...f.finishedGoods, { id: generateId(), itemId: '', expectedQty: 0, productionCost: 0 }] }))}
                    className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700">
                    <Plus size={14} /> Add Row
                  </button>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2 text-left font-semibold text-gray-500">Finished Good</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-500">Expected Qty</th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-500">Cost/Piece</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editJWForm.finishedGoods.map(row => (
                        <tr key={row.id} className="border-b border-gray-100">
                          <td className="px-3 py-2">
                            <select value={row.itemId} onChange={e => setEditJWForm(f => ({ ...f, finishedGoods: f.finishedGoods.map(fg => fg.id === row.id ? { ...fg, itemId: e.target.value } : fg) }))}
                              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-indigo-400">
                              <option value="">Select...</option>
                              {finishedGoods.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" min={0} value={row.expectedQty || ''} onChange={e => setEditJWForm(f => ({ ...f, finishedGoods: f.finishedGoods.map(fg => fg.id === row.id ? { ...fg, expectedQty: Number(e.target.value) } : fg) }))}
                              className="w-24 mx-auto block text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-right" />
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" min={0} value={row.productionCost || ''} onChange={e => setEditJWForm(f => ({ ...f, finishedGoods: f.finishedGoods.map(fg => fg.id === row.id ? { ...fg, productionCost: Number(e.target.value) } : fg) }))}
                              className="w-24 ml-auto block text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 text-right" />
                          </td>
                          <td className="px-3 py-2">
                            <button onClick={() => setEditJWForm(f => ({ ...f, finishedGoods: f.finishedGoods.filter(fg => fg.id !== row.id) }))}
                              className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><X size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock warning for edit */}
              {editJWForm.rawMaterials.some(r => {
                if (!r.itemId) return false;
                const itm = items.find(i => i.id === r.itemId);
                const orig = origJW?.rawMaterials.find(o => o.itemId === r.itemId);
                const max = (itm?.currentStock || 0) + (orig?.issueQty || 0);
                return r.issueQty > max;
              }) && (
                <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-start gap-2">
                  <span className="text-red-600 text-lg flex-shrink-0">🚫</span>
                  <div>
                    <p className="text-sm font-bold text-red-800">Stock Limit Exceeded — Cannot Save</p>
                    <p className="text-xs text-red-600 mt-0.5">Reduce issue quantity to within available stock limit.</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={saveEditJW}
                  disabled={editJWForm.rawMaterials.some(r => {
                    if (!r.itemId) return false;
                    const itm = items.find(i => i.id === r.itemId);
                    const orig = origJW?.rawMaterials.find(o => o.itemId === r.itemId);
                    return r.issueQty > (itm?.currentStock || 0) + (orig?.issueQty || 0);
                  })}
                  className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Edit2 size={14} /> Save Changes
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ──────────── EDIT MATERIAL IN MODAL ──────────── */}
      <Modal isOpen={modal?.type === 'editMI'} onClose={() => setModal(null)} title="Modify Material In" size="xl">
        {(() => {
          if (modal?.type !== 'editMI') return null;
          const origMI = materialIns.find(m => m.id === editMIId);
          if (!origMI) return null;
          const jw = jobWorks.find(j => j.id === origMI.jobWorkId);
          const contractor = parties.find(p => p.id === origMI.contractorId);
          return (
            <div className="space-y-5">
              {/* Header Info */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-green-800 font-mono">{origMI.materialInNo}</p>
                  <p className="text-xs text-green-600">Against: <strong>{jw?.jobWorkNo}</strong> · 🏭 {contractor?.name}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Received</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={editMIForm.date} onChange={e => setEditMIForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                  <input value={editMIForm.remarks} onChange={e => setEditMIForm(f => ({ ...f, remarks: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400" placeholder="Update remarks..." />
                </div>
              </div>

              {/* Edit Items Table */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Received Items</label>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs">
                        <th className="px-4 py-3 text-left font-semibold text-gray-500">Finished Good</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500">SKU</th>
                        <th className="px-4 py-3 text-center font-semibold text-green-700">Received ✅</th>
                        <th className="px-4 py-3 text-center font-semibold text-red-600">Rejected ❌</th>
                        <th className="px-4 py-3 text-center font-semibold text-yellow-600">Wastage ⚠️</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editMIForm.items.map(mii => {
                        const item = items.find(i => i.id === mii.itemId);
                        return (
                          <tr key={mii.id} className="border-b border-gray-100">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item?.name || '—'}</td>
                            <td className="px-4 py-3 text-xs font-mono text-gray-500">{item?.sku || '—'}</td>
                            <td className="px-4 py-3">
                              <input type="number" min={0} value={mii.receivedQty || ''} onChange={e => setEditMIForm(f => ({ ...f, items: f.items.map(x => x.id === mii.id ? { ...x, receivedQty: Number(e.target.value) } : x) }))}
                                className="w-20 mx-auto block text-sm border-2 border-green-300 rounded-lg px-2 py-1.5 outline-none focus:border-green-500 text-center font-bold text-green-800 bg-green-50" />
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" min={0} value={mii.rejectedQty || ''} onChange={e => setEditMIForm(f => ({ ...f, items: f.items.map(x => x.id === mii.id ? { ...x, rejectedQty: Number(e.target.value) } : x) }))}
                                className="w-20 mx-auto block text-sm border-2 border-red-300 rounded-lg px-2 py-1.5 outline-none focus:border-red-500 text-center font-bold text-red-700 bg-red-50" />
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" min={0} value={mii.wastageQty || ''} onChange={e => setEditMIForm(f => ({ ...f, items: f.items.map(x => x.id === mii.id ? { ...x, wastageQty: Number(e.target.value) } : x) }))}
                                className="w-20 mx-auto block text-sm border-2 border-yellow-300 rounded-lg px-2 py-1.5 outline-none focus:border-yellow-500 text-center font-bold text-yellow-700 bg-yellow-50" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={saveEditMI} className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 shadow-sm flex items-center gap-2">
                  <Edit2 size={14} /> Save Changes
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

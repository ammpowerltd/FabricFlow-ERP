import { create } from 'zustand';
import type {
  Item, Party, Category, Unit, Warehouse, Purchase, JobWork, MaterialIn,
  Sale, Expense, Notification, User, StockMovement, AuditLog
} from '../types';
import { generateSampleData } from './sampleData';

interface ERPState {
  // Auth
  currentUser: User;
  
  // Master Data
  items: Item[];
  parties: Party[];
  categories: Category[];
  units: Unit[];
  warehouses: Warehouse[];

  // Transactions
  purchases: Purchase[];
  jobWorks: JobWork[];
  materialIns: MaterialIn[];
  sales: Sale[];
  expenses: Expense[];
  stockMovements: StockMovement[];
  auditLogs: AuditLog[];
  notifications: Notification[];

  // UI State
  sidebarCollapsed: boolean;
  darkMode: boolean;
  activeModule: string;
  globalSearch: string;

  // Actions - Items
  addItem: (item: Item) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;

  // Actions - Parties
  addParty: (party: Party) => void;
  updateParty: (id: string, party: Partial<Party>) => void;

  // Actions - Categories
  addCategory: (cat: Category) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;

  // Actions - Units
  addUnit: (unit: Unit) => void;
  updateUnit: (id: string, unit: Partial<Unit>) => void;

  // Actions - Warehouses
  addWarehouse: (w: Warehouse) => void;

  // Actions - Purchases
  addPurchase: (p: Purchase) => void;
  updatePurchase: (id: string, p: Partial<Purchase>) => void;

  // Actions - JobWorks
  addJobWork: (jw: JobWork) => void;
  updateJobWork: (id: string, jw: Partial<JobWork>) => void;
  deleteJobWork: (id: string) => void;

  // Actions - MaterialIn
  addMaterialIn: (mi: MaterialIn) => void;
  updateMaterialIn: (id: string, mi: Partial<MaterialIn>) => void;
  deleteMaterialIn: (id: string) => void;

  // Actions - Sales
  addSale: (s: Sale) => void;
  updateSale: (id: string, s: Partial<Sale>) => void;
  deleteSale: (id: string) => void;

  // Actions - Expenses
  addExpense: (e: Expense) => void;

  // Actions - Stock
  addStockMovement: (sm: StockMovement) => void;
  updateItemStock: (itemId: string, newStock: number) => void;

  // Actions - Audit
  addAuditLog: (log: AuditLog) => void;

  // Actions - Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Actions - UI
  setSidebarCollapsed: (val: boolean) => void;
  setDarkMode: (val: boolean) => void;
  setActiveModule: (module: string) => void;
  setGlobalSearch: (val: string) => void;
}

const sampleData = generateSampleData();

export const useStore = create<ERPState>((set) => ({
  currentUser: sampleData.currentUser,
  items: sampleData.items,
  parties: sampleData.parties,
  categories: sampleData.categories,
  units: sampleData.units,
  warehouses: sampleData.warehouses,
  purchases: sampleData.purchases,
  jobWorks: sampleData.jobWorks,
  materialIns: sampleData.materialIns,
  sales: sampleData.sales,
  expenses: sampleData.expenses,
  stockMovements: sampleData.stockMovements,
  auditLogs: sampleData.auditLogs,
  notifications: sampleData.notifications,
  sidebarCollapsed: false,
  darkMode: false,
  activeModule: 'dashboard',
  globalSearch: '',

  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  updateItem: (id, item) => set((s) => ({ items: s.items.map(i => i.id === id ? { ...i, ...item } : i) })),
  deleteItem: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),

  addParty: (party) => set((s) => ({ parties: [...s.parties, party] })),
  updateParty: (id, party) => set((s) => ({ parties: s.parties.map(p => p.id === id ? { ...p, ...party } : p) })),

  addCategory: (cat) => set((s) => ({ categories: [...s.categories, cat] })),
  updateCategory: (id, cat) => set((s) => ({ categories: s.categories.map(c => c.id === id ? { ...c, ...cat } : c) })),

  addUnit: (unit) => set((s) => ({ units: [...s.units, unit] })),
  updateUnit: (id, unit) => set((s) => ({ units: s.units.map(u => u.id === id ? { ...u, ...unit } : u) })),

  addWarehouse: (w) => set((s) => ({ warehouses: [...s.warehouses, w] })),

  addPurchase: (p) => set((s) => ({ purchases: [...s.purchases, p] })),
  updatePurchase: (id, p) => set((s) => ({ purchases: s.purchases.map(x => x.id === id ? { ...x, ...p } : x) })),

  addJobWork: (jw) => set((s) => ({ jobWorks: [...s.jobWorks, jw] })),
  updateJobWork: (id, jw) => set((s) => ({ jobWorks: s.jobWorks.map(x => x.id === id ? { ...x, ...jw } : x) })),
  deleteJobWork: (id) => set((s) => ({ jobWorks: s.jobWorks.filter(x => x.id !== id) })),

  addMaterialIn: (mi) => set((s) => ({ materialIns: [...s.materialIns, mi] })),
  updateMaterialIn: (id, mi) => set((s) => ({ materialIns: s.materialIns.map(x => x.id === id ? { ...x, ...mi } : x) })),
  deleteMaterialIn: (id) => set((s) => ({ materialIns: s.materialIns.filter(x => x.id !== id) })),

  addSale: (sale) => set((s) => ({ sales: [...s.sales, sale] })),
  updateSale: (id, sale) => set((s) => ({ sales: s.sales.map(x => x.id === id ? { ...x, ...sale } : x) })),
  deleteSale: (id) => set((s) => ({ sales: s.sales.filter(x => x.id !== id) })),

  addExpense: (e) => set((s) => ({ expenses: [...s.expenses, e] })),

  addStockMovement: (sm) => set((s) => ({ stockMovements: [...s.stockMovements, sm] })),
  updateItemStock: (itemId, newStock) => set((s) => ({
    items: s.items.map(i => i.id === itemId ? { ...i, currentStock: newStock } : i)
  })),

  addAuditLog: (log) => set((s) => ({ auditLogs: [log, ...s.auditLogs] })),

  markNotificationRead: (id) => set((s) => ({
    notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
  })),
  markAllNotificationsRead: () => set((s) => ({
    notifications: s.notifications.map(n => ({ ...n, isRead: true }))
  })),

  setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),
  setDarkMode: (val) => set({ darkMode: val }),
  setActiveModule: (module) => set({ activeModule: module }),
  setGlobalSearch: (val) => set({ globalSearch: val }),
}));

export type ItemType = 'RAW_MATERIAL' | 'FINISHED_GOODS';
export type PartyType = 'CUSTOMER' | 'VENDOR' | 'CONTRACTOR' | 'COURIER_PARTNER' | 'COURIER_AGGREGATOR' | 'PLATFORM';
export type JobWorkStatus = 'OPEN' | 'IN_PROCESS' | 'PARTIAL_RECEIVED' | 'COMPLETED' | 'CLOSED';
export type UserRole = 'ADMIN' | 'PURCHASE_MANAGER' | 'PRODUCTION_MANAGER' | 'INVENTORY_MANAGER' | 'ACCOUNTANT' | 'DISPATCH_TEAM' | 'SALES_TEAM';
export type GSTType = 'IGST' | 'CGST_SGST' | 'EXEMPT';

export interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: 'CREATE' | 'EDIT' | 'DELETE' | 'STATUS_CHANGE';
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  modifiedBy: string;
  modifiedAt: string;
  ipAddress?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  type: ItemType;
  categoryId: string;
  unitId: string;
  gstPercent: number;
  hsnCode: string;
  barcode?: string;
  purchaseRate: number;
  salesRate: number;
  minimumStock: number;
  openingStock: number;
  currentStock: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Party {
  id: string;
  name: string;
  type: PartyType;
  gstNumber?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  contactPerson?: string;
  bankAccount?: string;
  ifsc?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'INWARD' | 'OUTWARD' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string;
  warehouseId?: string;
  createdBy: string;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  itemId: string;
  quantity: number;
  rate: number;
  gstPercent: number;
  amount: number;
  gstAmount: number;
  totalAmount: number;
}

export interface Purchase {
  id: string;
  billNo: string;
  date: string;
  partyId: string;
  gstType: GSTType;
  items: PurchaseItem[];
  subtotal: number;
  totalGST: number;
  grandTotal: number;
  status: 'ACTIVE' | 'CANCELLED';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobWorkItem {
  id: string;
  itemId: string;
  availableStock: number;
  issueQty: number;
  unitId: string;
  rate: number;
  amount: number;
}

export interface JobWorkFinishedGood {
  id: string;
  itemId: string;
  expectedQty: number;
  productionCost: number;
}

export interface JobWork {
  id: string;
  jobWorkNo: string;
  date: string;
  contractorId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  expectedReturnDate: string;
  remarks?: string;
  rawMaterials: JobWorkItem[];
  finishedGoods: JobWorkFinishedGood[];
  status: JobWorkStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialInItem {
  id: string;
  itemId: string;
  pendingQty: number;
  receivedQty: number;
  rejectedQty: number;
  wastageQty: number;
}

export interface MaterialIn {
  id: string;
  materialInNo: string;
  date: string;
  jobWorkId: string;
  contractorId: string;
  items: MaterialInItem[];
  remarks?: string;
  createdAt: string;
}

export interface SalesItem {
  id: string;
  itemId: string;
  quantity: number;
  rate: number;
  gstPercent: number;
  amount: number;
  gstAmount: number;
  totalAmount: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  partyId: string;
  gstType: GSTType;
  items: SalesItem[];
  subtotal: number;
  totalGST: number;
  grandTotal: number;
  status: 'ACTIVE' | 'CANCELLED' | 'RETURNED';
  dispatchStatus: 'PENDING' | 'DISPATCHED' | 'DELIVERED' | 'RTO' | 'CUSTOMER_RETURN';
  courierPartnerId?: string;
  trackingId?: string;
  platform?: string;
  remarks?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  partyId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'LOW_STOCK' | 'PENDING_JOB' | 'DELAYED_RETURN' | 'DISPATCH' | 'PAYMENT';
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: string;
}

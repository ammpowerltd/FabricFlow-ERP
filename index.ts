// User & Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  mobile: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

// Master Types (Used in Masters Module)
export interface MasterRecord {
  id: string;
  [key: string]: any;
}

export interface PartyMaster extends MasterRecord {
  partyCode: string;
  partyName: string;
  legalName: string;
  partyType: 'Customer' | 'Supplier' | 'Job Worker' | 'Transporter' | 'Contractor';
  gstin: string;
  pan: string;
  contactPerson: string;
  mobile: string;
  email: string;
  city: string;
  state: string;
  creditLimit: number;
  creditDays: number;
  isActive: boolean;
}

export interface ItemMaster extends MasterRecord {
  itemCode: string;
  itemName: string;
  shortName: string;
  category: string;
  itemType: 'Raw Material' | 'Semi Finished' | 'Finished Goods' | 'Consumable' | 'Service';
  hsn: string;
  brand: string;
  sku: string;
  primaryUnit: string;
  purchaseRate: number;
  sellingRate: number;
  mrp: number;
  gstPercent: number;
  reorderLevel: number;
  isActive: boolean;
}

// App Data Types (Used in Job Work, Orders, etc.)
export interface Item {
  id: string;
  itemCode: string;
  sku: string;
  barcode: string;
  name: string;
  shortName: string;
  type: 'Raw Material' | 'Finished Good' | 'Packaging' | 'Consumable';
  category: string;
  brand: string;
  collection: string;
  gender: string;
  size: string;
  color: string;
  fit: string;
  fabric: string;
  hsn: string;
  gstPercent: number;
  unit: string;
  purchaseRate: number;
  costPrice: number;
  mrp: number;
  wholesalePrice: number;
  onlinePrice: number;
  reorderLevel: number;
  reorderQty: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  images: string[];
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
}

export interface Party {
  id: string;
  partyCode: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  partyType: string[];
  gstin: string;
  pan: string;
  billingAddress: Address;
  shippingAddresses: Address[];
  creditLimit: number;
  creditDays: number;
  openingBalance: number;
  outstandingBalance: number;
  bankDetails: BankDetails;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping';
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface BankDetails {
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branch: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  manager: string;
  isActive: boolean;
}

export interface CategoryMaster extends MasterRecord {
  categoryCode: string;
  categoryName: string;
  parentCategory: string;
  description: string;
  isActive: boolean;
}

export interface UnitMaster extends MasterRecord {
  unitCode: string;
  unitName: string;
  shortName: string;
  decimalAllowed: boolean;
  isActive: boolean;
}

export interface TaxMaster extends MasterRecord {
  taxCode: string;
  taxName: string;
  taxType: 'GST' | 'IGST' | 'CGST' | 'SGST' | 'TDS' | 'TCS';
  taxPercent: number;
  isActive: boolean;
}

export interface CourierMaster extends MasterRecord {
  courierCode: string;
  courierName: string;
  courierType: 'Domestic' | 'International' | 'Local';
  contactPerson: string;
  mobile: string;
  trackingUrl: string;
  codAvailable: boolean;
  isActive: boolean;
}

export interface AggregatorMaster extends MasterRecord {
  aggregatorCode: string;
  aggregatorName: string;
  contactPerson: string;
  mobile: string;
  apiKey: string;
  isActive: boolean;
}

export interface PlatformMaster extends MasterRecord {
  platformCode: string;
  platformName: string;
  platformType: 'Marketplace' | 'Website' | 'Retail' | 'Wholesale';
  apiKey: string;
  feesPercent: number;
  isActive: boolean;
}

export interface PaymentTermsMaster extends MasterRecord {
  termName: string;
  dueDays: number;
  advancePercent: number;
  description: string;
  isActive: boolean;
}

export interface BankMaster extends MasterRecord {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountType: 'Savings' | 'Current';
  upiId: string;
  isActive: boolean;
}

export interface BOMMaster extends MasterRecord {
  bomCode: string;
  bomName: string;
  productName: string;
  productSku: string;
  version: string;
  totalCost: number;
  isActive: boolean;
}

export interface ExpenseMaster extends MasterRecord {
  expenseCode: string;
  expenseName: string;
  category: string;
  accountingGroup: string;
  isActive: boolean;
}

export interface DocNumberingMaster extends MasterRecord {
  docType: string;
  prefix: string;
  suffix: string;
  startNumber: number;
  currentNumber: number;
  autoResetYearly: boolean;
  isActive: boolean;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping';
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface BankDetails {
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branch: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  manager: string;
  isActive: boolean;
}

// Purchase Types
export interface PurchaseInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  vendorId: string;
  vendorName: string;
  grnNo: string;
  items: PurchaseItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
  status: 'Draft' | 'Posted' | 'Cancelled';
  createdBy: string;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  hsn: string;
  qty: number;
  rate: number;
  gstPercent: number;
  taxable: number;
  gstAmount: number;
  amount: number;
  warehouse: string;
}

// Production Types
export interface JobWork {
  id: string;
  jobWorkNo: string;
  date: string;
  contractorId: string;
  contractorName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  expectedReturnDate: string;
  status: 'Draft' | 'In Process' | 'Completed' | 'Overdue' | 'Cancelled';
  rawMaterials: JobWorkMaterial[];
  expectedOutputs: JobWorkOutput[];
  remarks: string;
  createdBy: string;
  createdAt: string;
  totalAccepted: number;
  totalRejected: number;
  totalReceived: number;
  pendingQty: number;
}

export interface ContractorDetails {
  contactPerson: string;
  mobile: string;
  gstNo: string;
  address: string;
  paymentTerms: string;
  rateType: string;
}

export interface JobWorkMaterial {
  itemId: string;
  itemName: string;
  availableStock: number;
  issueQty: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface JobWorkOutput {
  itemId: string;
  itemName: string;
  expectedQty: number;
  productionCost: number;
  totalAccepted: number;
  totalRejected: number;
  totalReceived: number;
  pendingQty: number;
}

export interface LabourCharge {
  operation: string;
  rate: number;
  qty: number;
  amount: number;
}

export interface WastageRule {
  material: string;
  allowedPercent: number;
  actualPercent: number;
}

export interface ProductionCost {
  materialCost: number;
  labourCost: number;
  transport: number;
  packing: number;
  other: number;
  totalAmount: number;
  costPerPiece: number;
}

export interface MaterialIn {
  id: string;
  materialInNo: string;
  grnNo: string;
  challanNo: string;
  date: string;
  jobWorkId: string;
  jobWorkNo: string;
  contractorName: string;
  warehouse: string;
  receivedBy: string;
  remarks: string;
  receivedItems: MaterialInItem[];
  consumptionItems: MaterialConsumption[];
  qcDetails: QCDetails;
  costingDetails: CostingDetails;
  status: 'Partial Received' | 'Completed' | 'QC Hold';
  createdBy: string;
  createdAt: string;
}

export interface MaterialInItem {
  itemId: string;
  itemName: string;
  sku: string;
  orderedQty: number;
  prevReceivedQty: number;
  receivedQty: number;
  rejectedQty: number;
  acceptedQty: number;
  balanceQty: number;
}

export interface MaterialConsumption {
  material: string;
  issuedQty: number;
  consumedQty: number;
  returnedQty: number;
  wastageQty: number;
}

export interface QCDetails {
  totalChecked: number;
  passedQty: number;
  rejectedQty: number;
  reworkQty: number;
  status: 'Pending' | 'Passed' | 'Failed' | 'Partial Pass';
  reasons: string[];
}

export interface CostingDetails {
  materialCost: number;
  labourCost: number;
  transport: number;
  packing: number;
  otherCharges: number;
  totalCost: number;
  actualCostPerUnit: number;
}

export interface MaterialIn {
  id: string;
  materialInNo: string;
  date: string;
  jobWorkId: string;
  jobWorkNo: string;
  contractorName: string;
  receivedItems: MaterialInItem[];
  remarks: string;
  createdBy: string;
  createdAt: string;
}

export interface MaterialInItem {
  itemId: string;
  itemName: string;
  sku: string;
  expectedQty: number;
  prevReceivedQty: number;
  pendingQty: number;
  receiveNowQty: number;
  acceptedQty: number;
  rejectedQty: number;
  wastageQty: number;
  rejectionReasons: string[];
}

// Sales Types
export interface SalesInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  customerId: string;
  customerName: string;
  customerGstin: string;
  poNo: string;
  channel: 'B2B' | 'B2C';
  platform?: string;
  items: SalesItem[];
  subtotal: number;
  discount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  total: number;
  status: 'Draft' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled' | 'Returned';
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  paymentTerms: string;
  createdBy: string;
  createdAt: string;
}

export interface SalesItem {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  hsn: string;
  qty: number;
  rate: number;
  discount: number;
  gstPercent: number;
  taxable: number;
  gstAmount: number;
  amount: number;
  warehouse: string;
}

// Order Tracking & COD Types
export interface Order {
  id: string;
  orderNo: string;
  invoiceNo?: string;
  date: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  channel: 'B2B' | 'B2C';
  platform?: string;
  paymentType: 'Prepaid' | 'COD';
  paymentStatus: 'Matched' | 'Mismatch' | 'Pending' | 'Collected' | 'Remitted' | 'Reconciled';
  amount: number;
  codAmount: number;
  status: string;
  awbNo: string;
  courierName: string;
  aggregator: string;
  trackingUrl: string;
  items: OrderItem[];
  timeline: OrderTimeline[];
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  itemId: string;
  itemName: string;
  sku: string;
  color: string;
  size: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  location: string;
  remarks: string;
}

export interface CODSettlement {
  id: string;
  batchNo: string;
  settlementDate: string;
  aggregator: string;
  courierName: string;
  totalCodAmount: number;
  totalCharges: number;
  totalRtoCharges: number;
  totalAdjustments: number;
  totalReceived: number;
  netReceived: number;
  status: 'Pending' | 'Partially Settled' | 'Settled' | 'Disputed';
  orders: CODOrder[];
  createdBy: string;
  createdAt: string;
}

export interface CODOrder {
  orderId: string;
  orderNo: string;
  awbNo: string;
  codAmount: number;
  courierCharges: number;
  rtoCharges: number;
  adjustments: number;
  receivedAmount: number;
  settlementDate?: string;
  refNo?: string;
  isSettled: boolean;
  remarks: string;
}

// Accounts Types
export interface Ledger {
  id: string;
  name: string;
  group: string;
  openingBalance: number;
  currentBalance: number;
  type: 'Debit' | 'Credit';
}

export interface Voucher {
  id: string;
  voucherNo: string;
  voucherType: 'Payment' | 'Receipt' | 'Journal' | 'Contra' | 'Debit Note' | 'Credit Note';
  date: string;
  particulars: string;
  debitLedger: string;
  creditLedger: string;
  amount: number;
  narration: string;
  createdBy: string;
  createdAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalRevenue: number;
  grossProfit: number;
  netProfit: number;
  ordersCount: number;
  revenueGrowth: number;
  profitGrowth: number;
  ordersGrowth: number;
  channelSales: ChannelSales[];
  topProducts: TopProduct[];
  salesTrend: SalesTrend[];
  inventoryStats: InventoryStats;
  productionStats: ProductionStats;
  logisticsStats: LogisticsStats;
  codStats: CODStats;
  financeStats: FinanceStats;
}

export interface ChannelSales {
  channel: string;
  amount: number;
  orders: number;
}

export interface TopProduct {
  sku: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface SalesTrend {
  date: string;
  b2b: number;
  b2c: number;
  total: number;
}

export interface InventoryStats {
  totalValue: number;
  rawMaterialValue: number;
  finishedGoodsValue: number;
  lowStockItems: number;
  stockMovements: { date: string; in: number; out: number }[];
}

export interface ProductionStats {
  inProcess: number;
  completed: number;
  pending: number;
  delayedJobs: number;
  productionValueTrend: { date: string; value: number }[];
}

export interface LogisticsStats {
  delivered: number;
  inTransit: number;
  rto: number;
  pending: number;
  pendingDispatches: number;
}

export interface CODStats {
  totalCOD: number;
  collected: number;
  pending: number;
  overdue: number;
  aggregatorSettlement: { name: string; pending: number; completed: number }[];
}

export interface FinanceStats {
  cashBalance: number;
  bankBalance: number;
  totalReceivables: number;
  totalPayables: number;
  gstPayable: number;
}

// AI Manager Types
export interface AIQuery {
  id: string;
  query: string;
  response: string;
  actions: AIAction[];
  timestamp: string;
}

export interface AIAction {
  type: 'query' | 'update' | 'create' | 'report' | 'alert';
  description: string;
  status: 'success' | 'error' | 'pending';
}

export interface AIAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  module: string;
  timestamp: string;
  isRead: boolean;
  actions?: { label: string; action: string }[];
}

// Audit Log
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  table: string;
  recordId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  oldValue: any;
  newValue: any;
}

// Upload Types
export interface UploadHistory {
  id: string;
  uploadId: string;
  fileName: string;
  uploadType: 'Status Update' | 'COD Settlement' | 'Combined';
  uploadedBy: string;
  uploadedAt: string;
  totalRecords: number;
  validRecords: number;
  warningRecords: number;
  errorRecords: number;
  status: 'Completed' | 'Failed' | 'Rolled Back';
  errors: UploadError[];
}

export interface UploadError {
  row: number;
  orderNo: string;
  message: string;
  type: 'Error' | 'Warning';
}

import type { User, Item, Party, Warehouse, JobWork, SalesInvoice, Order, CODSettlement, DashboardStats, Ledger, Voucher, AIAlert, PartyMaster, ItemMaster, CategoryMaster, UnitMaster, TaxMaster, CourierMaster, AggregatorMaster, PlatformMaster } from '../types';

// Current User
export const currentUser: User = {
  id: 'USR001',
  username: 'admin',
  email: 'admin@fabricflow.in',
  fullName: 'Rajesh Kumar',
  mobile: '+91 98765 43210',
  role: 'Super Admin',
  isActive: true,
  createdAt: '2024-01-01',
};

// Items
export const items: Item[] = [
  { id: 'ITM001', itemCode: 'RM-COT-WHT', sku: 'RM-COT-WHT', barcode: '8901234567001', name: 'Cotton White Fabric', shortName: 'Cotton Wht', type: 'Raw Material', category: 'Fabric', brand: '', collection: '', gender: '', size: '', color: 'White', fit: '', fabric: 'Cotton', hsn: '5208', gstPercent: 5, unit: 'Meter', purchaseRate: 120, costPrice: 120, mrp: 0, wholesalePrice: 0, onlinePrice: 0, reorderLevel: 100, reorderQty: 500, currentStock: 450, reservedStock: 0, availableStock: 450, images: [], createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'ITM002', itemCode: 'RM-COT-GRY', sku: 'RM-COT-GRY', barcode: '8901234567002', name: 'Cotton Grey Fabric', shortName: 'Cotton Gry', type: 'Raw Material', category: 'Fabric', brand: '', collection: '', gender: '', size: '', color: 'Grey', fit: '', fabric: 'Cotton', hsn: '5208', gstPercent: 5, unit: 'Meter', purchaseRate: 130, costPrice: 130, mrp: 0, wholesalePrice: 0, onlinePrice: 0, reorderLevel: 100, reorderQty: 500, currentStock: 45, reservedStock: 0, availableStock: 45, images: [], createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'ITM003', itemCode: 'RM-COT-BLK', sku: 'RM-COT-BLK', barcode: '8901234567003', name: 'Cotton Black Fabric', shortName: 'Cotton Blk', type: 'Raw Material', category: 'Fabric', brand: '', collection: '', gender: '', size: '', color: 'Black', fit: '', fabric: 'Cotton', hsn: '5208', gstPercent: 5, unit: 'Meter', purchaseRate: 125, costPrice: 125, mrp: 0, wholesalePrice: 0, onlinePrice: 0, reorderLevel: 100, reorderQty: 500, currentStock: 280, reservedStock: 0, availableStock: 280, images: [], createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'ITM004', itemCode: 'FG-PL-WHT-S', sku: 'FG-PL-WHT-S', barcode: '8901234567010', name: 'Classic Polo T-Shirt White Small', shortName: 'Polo W S', type: 'Finished Good', category: 'T-Shirts', brand: 'FabricFlow', collection: 'Classic', gender: 'Men', size: 'S', color: 'White', fit: 'Regular', fabric: 'Cotton', hsn: '6105', gstPercent: 5, unit: 'Pcs', purchaseRate: 250, costPrice: 280, mrp: 899, wholesalePrice: 450, onlinePrice: 699, reorderLevel: 50, reorderQty: 200, currentStock: 120, reservedStock: 20, availableStock: 100, images: [], createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'ITM005', itemCode: 'FG-PL-WHT-M', sku: 'FG-PL-WHT-M', barcode: '8901234567011', name: 'Classic Polo T-Shirt White Medium', shortName: 'Polo W M', type: 'Finished Good', category: 'T-Shirts', brand: 'FabricFlow', collection: 'Classic', gender: 'Men', size: 'M', color: 'White', fit: 'Regular', fabric: 'Cotton', hsn: '6105', gstPercent: 5, unit: 'Pcs', purchaseRate: 250, costPrice: 280, mrp: 899, wholesalePrice: 450, onlinePrice: 699, reorderLevel: 50, reorderQty: 200, currentStock: 95, reservedStock: 10, availableStock: 85, images: [], createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'ITM006', itemCode: 'FG-PL-WHT-L', sku: 'FG-PL-WHT-L', barcode: '8901234567012', name: 'Classic Polo T-Shirt White Large', shortName: 'Polo W L', type: 'Finished Good', category: 'T-Shirts', brand: 'FabricFlow', collection: 'Classic', gender: 'Men', size: 'L', color: 'White', fit: 'Regular', fabric: 'Cotton', hsn: '6105', gstPercent: 5, unit: 'Pcs', purchaseRate: 250, costPrice: 280, mrp: 899, wholesalePrice: 450, onlinePrice: 699, reorderLevel: 50, reorderQty: 200, currentStock: 30, reservedStock: 0, availableStock: 30, images: [], createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'ITM007', itemCode: 'FG-PL-BLK-S', sku: 'FG-PL-BLK-S', barcode: '8901234567020', name: 'Classic Polo T-Shirt Black Small', shortName: 'Polo Blk S', type: 'Finished Good', category: 'T-Shirts', brand: 'FabricFlow', collection: 'Classic', gender: 'Men', size: 'S', color: 'Black', fit: 'Regular', fabric: 'Cotton', hsn: '6105', gstPercent: 5, unit: 'Pcs', purchaseRate: 250, costPrice: 280, mrp: 899, wholesalePrice: 450, onlinePrice: 699, reorderLevel: 50, reorderQty: 200, currentStock: 85, reservedStock: 5, availableStock: 80, images: [], createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'ITM008', itemCode: 'FG-PL-BLK-M', sku: 'FG-PL-BLK-M', barcode: '8901234567021', name: 'Classic Polo T-Shirt Black Medium', shortName: 'Polo Blk M', type: 'Finished Good', category: 'T-Shirts', brand: 'FabricFlow', collection: 'Classic', gender: 'Men', size: 'M', color: 'Black', fit: 'Regular', fabric: 'Cotton', hsn: '6105', gstPercent: 5, unit: 'Pcs', purchaseRate: 250, costPrice: 280, mrp: 899, wholesalePrice: 450, onlinePrice: 699, reorderLevel: 50, reorderQty: 200, currentStock: 150, reservedStock: 0, availableStock: 150, images: [], createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'ITM009', itemCode: 'FG-VN-GRY-L', sku: 'FG-VN-GRY-L', barcode: '8901234567030', name: 'V-Neck T-Shirt Grey Large', shortName: 'VN Gry L', type: 'Finished Good', category: 'T-Shirts', brand: 'FabricFlow', collection: 'Urban', gender: 'Men', size: 'L', color: 'Grey', fit: 'Slim', fabric: 'Cotton Blend', hsn: '6105', gstPercent: 5, unit: 'Pcs', purchaseRate: 200, costPrice: 240, mrp: 799, wholesalePrice: 400, onlinePrice: 599, reorderLevel: 30, reorderQty: 150, currentStock: 12, reservedStock: 0, availableStock: 12, images: [], createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'ITM010', itemCode: 'FG-KRT-BLU-L', sku: 'FG-KRT-BLU-L', barcode: '8901234567040', name: 'Kurta Blue Large', shortName: 'Kurta Bl L', type: 'Finished Good', category: 'Kurtas', brand: 'FabricFlow', collection: 'Ethnic', gender: 'Men', size: 'L', color: 'Blue', fit: 'Regular', fabric: 'Cotton', hsn: '6203', gstPercent: 5, unit: 'Pcs', purchaseRate: 350, costPrice: 400, mrp: 1299, wholesalePrice: 650, onlinePrice: 999, reorderLevel: 20, reorderQty: 100, currentStock: 45, reservedStock: 0, availableStock: 45, images: [], createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
];

// Parties
export const parties: Party[] = [
  { id: 'PTY001', partyCode: 'VND001', companyName: 'Premium Textiles Pvt Ltd', contactPerson: 'Amit Sharma', mobile: '+91 98111 22233', email: 'amit@premiumtextiles.com', partyType: ['Vendor'], gstin: '07AABCP1234F1Z5', pan: 'AABCP1234F', billingAddress: { id: 'ADD001', type: 'billing', addressLine1: '123 Textile Market', addressLine2: 'Sector 62', city: 'Gurugram', state: 'Haryana', pincode: '122001', country: 'India' }, shippingAddresses: [], creditLimit: 500000, creditDays: 30, openingBalance: 125000, outstandingBalance: 87500, bankDetails: { bankName: 'HDFC Bank', accountNo: '50100012345678', ifscCode: 'HDFC0001234', branch: 'Sector 62' }, isActive: true, createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'PTY002', partyCode: 'CTR001', companyName: 'Star Stitching Works', contactPerson: 'Ramesh Kumar', mobile: '+91 98777 88899', email: 'ramesh@starstitching.in', partyType: ['Contractor'], gstin: '09AABCS5678G1Z2', pan: 'AABCS5678G', billingAddress: { id: 'ADD002', type: 'billing', addressLine1: '456 Industrial Area', addressLine2: 'Phase 5', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', country: 'India' }, shippingAddresses: [], creditLimit: 200000, creditDays: 15, openingBalance: 45000, outstandingBalance: 32000, bankDetails: { bankName: 'SBI', accountNo: '30100098765432', ifscCode: 'SBIN0005678', branch: 'Phase 5' }, isActive: true, createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'PTY003', partyCode: 'CST001', companyName: 'Fashion Hub Retail', contactPerson: 'Priya Patel', mobile: '+91 99666 55544', email: 'priya@fashionhub.com', partyType: ['Customer'], gstin: '24AABCF9012H1Z8', pan: 'AABCF9012H', billingAddress: { id: 'ADD003', type: 'billing', addressLine1: '789 Mall Road', addressLine2: 'Anand Vihar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380001', country: 'India' }, shippingAddresses: [], creditLimit: 1000000, creditDays: 45, openingBalance: 350000, outstandingBalance: 285000, bankDetails: { bankName: 'ICICI Bank', accountNo: '60100011223344', ifscCode: 'ICIC0009012', branch: 'Anand Vihar' }, isActive: true, createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'PTY004', partyCode: 'CST002', companyName: 'Style Street Outlet', contactPerson: 'Vikram Singh', mobile: '+91 98555 44433', email: 'vikram@stylestreet.in', partyType: ['Customer'], gstin: '06AABCS3456J1Z4', pan: 'AABCS3456J', billingAddress: { id: 'ADD004', type: 'billing', addressLine1: '321 Shopping Complex', addressLine2: 'MG Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', country: 'India' }, shippingAddresses: [], creditLimit: 750000, creditDays: 30, openingBalance: 180000, outstandingBalance: 125000, bankDetails: { bankName: 'Axis Bank', accountNo: '90100055667788', ifscCode: 'UTIB0003456', branch: 'MG Road' }, isActive: true, createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'PTY005', partyCode: 'CR001', companyName: 'Express Logistics', contactPerson: 'Deepak Verma', mobile: '+91 97444 33322', email: 'deepak@expresslog.com', partyType: ['Courier'], gstin: '07AABCE7890K1Z1', pan: 'AABCE7890K', billingAddress: { id: 'ADD005', type: 'billing', addressLine1: 'Hub 1, Transport Nagar', addressLine2: '', city: 'Delhi', state: 'Delhi', pincode: '110020', country: 'India' }, shippingAddresses: [], creditLimit: 0, creditDays: 0, openingBalance: 0, outstandingBalance: 0, bankDetails: { bankName: 'Kotak Mahindra', accountNo: '50100077889900', ifscCode: 'KKBK0007890', branch: 'Delhi' }, isActive: true, createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
  { id: 'PTY006', partyCode: 'AGG001', companyName: 'Shiprocket Aggregator', contactPerson: 'Neha Gupta', mobile: '+91 96333 22211', email: 'neha@shiprocket.in', partyType: ['Aggregator'], gstin: '27AABCS1234L1Z5', pan: 'AABCS1234L', billingAddress: { id: 'ADD006', type: 'billing', addressLine1: 'Tech Park, Hinjewadi', addressLine2: '', city: 'Pune', state: 'Maharashtra', pincode: '411057', country: 'India' }, shippingAddresses: [], creditLimit: 0, creditDays: 0, openingBalance: 0, outstandingBalance: 0, bankDetails: { bankName: 'HDFC Bank', accountNo: '50100011122233', ifscCode: 'HDFC0011122', branch: 'Hinjewadi' }, isActive: true, createdBy: 'admin', createdAt: '2024-01-01', modifiedBy: 'admin', modifiedAt: '2024-01-01' },
];

// Warehouses
export const warehouses: Warehouse[] = [
  { id: 'WH001', code: 'MUM-01', name: 'Mumbai Main Warehouse', address: 'Plot 123, Andheri Industrial Area, Mumbai - 400058', manager: 'Suresh Patil', isActive: true },
  { id: 'WH002', code: 'DEL-01', name: 'Delhi Distribution Center', address: 'Building A, Sector 24, Noida - 201301', manager: 'Arun Kumar', isActive: true },
  { id: 'WH003', code: 'BLR-01', name: 'Bangalore Hub', address: '3rd Floor, Peenya Industrial Area, Bangalore - 560058', manager: 'Rajesh Gowda', isActive: true },
];

// Job Works
export const jobWorks: JobWork[] = [
  {
    id: 'JW001', jobWorkNo: 'JW-101', date: '2024-12-10', contractorId: 'PTY002', contractorName: 'Star Stitching Works',
    priority: 'High', expectedReturnDate: '2024-12-20', status: 'In Process',
    rawMaterials: [
      { itemId: 'ITM001', itemName: 'Cotton White Fabric', availableStock: 450, issueQty: 200, unit: 'Meter', rate: 120, amount: 24000 },
      { itemId: 'ITM003', itemName: 'Cotton Black Fabric', availableStock: 280, issueQty: 150, unit: 'Meter', rate: 125, amount: 18750 },
    ],
    expectedOutputs: [
      { itemId: 'ITM004', itemName: 'Classic Polo White S', expectedQty: 100, productionCost: 280, totalAccepted: 0, totalRejected: 0, totalReceived: 0, pendingQty: 100 },
      { itemId: 'ITM005', itemName: 'Classic Polo White M', expectedQty: 80, productionCost: 280, totalAccepted: 0, totalRejected: 0, totalReceived: 0, pendingQty: 80 },
      { itemId: 'ITM007', itemName: 'Classic Polo Black S', expectedQty: 60, productionCost: 280, totalAccepted: 0, totalRejected: 0, totalReceived: 0, pendingQty: 60 },
      { itemId: 'ITM008', itemName: 'Classic Polo Black M', expectedQty: 70, productionCost: 280, totalAccepted: 0, totalRejected: 0, totalReceived: 0, pendingQty: 70 },
    ],
    remarks: 'Priority order for Fashion Hub', createdBy: 'admin', createdAt: '2024-12-10',
    totalAccepted: 0, totalRejected: 0, totalReceived: 0, pendingQty: 310,
  },
  {
    id: 'JW002', jobWorkNo: 'JW-102', date: '2024-12-12', contractorId: 'PTY002', contractorName: 'Star Stitching Works',
    priority: 'Medium', expectedReturnDate: '2024-12-25', status: 'In Process',
    rawMaterials: [
      { itemId: 'ITM002', itemName: 'Cotton Grey Fabric', availableStock: 45, issueQty: 100, unit: 'Meter', rate: 130, amount: 13000 },
    ],
    expectedOutputs: [
      { itemId: 'ITM009', itemName: 'V-Neck Grey L', expectedQty: 80, productionCost: 240, totalAccepted: 0, totalRejected: 0, totalReceived: 0, pendingQty: 80 },
    ],
    remarks: 'Regular production batch', createdBy: 'admin', createdAt: '2024-12-12',
    totalAccepted: 0, totalRejected: 0, totalReceived: 0, pendingQty: 80,
  },
  {
    id: 'JW003', jobWorkNo: 'JW-100', date: '2024-11-01', contractorId: 'PTY002', contractorName: 'Star Stitching Works',
    priority: 'Urgent', expectedReturnDate: '2024-11-10', status: 'Overdue',
    rawMaterials: [
      { itemId: 'ITM001', itemName: 'Cotton White Fabric', availableStock: 450, issueQty: 100, unit: 'Meter', rate: 120, amount: 12000 },
    ],
    expectedOutputs: [
      { itemId: 'ITM010', itemName: 'Kurta Blue L', expectedQty: 60, productionCost: 400, totalAccepted: 50, totalRejected: 5, totalReceived: 55, pendingQty: 5 },
    ],
    remarks: 'Urgent order overdue', createdBy: 'admin', createdAt: '2024-11-01',
    totalAccepted: 50, totalRejected: 5, totalReceived: 55, pendingQty: 5,
  },
  {
    id: 'JW004', jobWorkNo: 'JW-099', date: '2024-10-01', contractorId: 'PTY002', contractorName: 'Star Stitching Works',
    priority: 'Low', expectedReturnDate: '2024-10-15', status: 'Completed',
    rawMaterials: [
      { itemId: 'ITM001', itemName: 'Cotton White Fabric', availableStock: 450, issueQty: 50, unit: 'Meter', rate: 120, amount: 6000 },
    ],
    expectedOutputs: [
      { itemId: 'ITM004', itemName: 'Classic Polo White S', expectedQty: 50, productionCost: 280, totalAccepted: 48, totalRejected: 2, totalReceived: 50, pendingQty: 0 },
    ],
    remarks: 'Completed order', createdBy: 'admin', createdAt: '2024-10-01',
    totalAccepted: 48, totalRejected: 2, totalReceived: 50, pendingQty: 0,
  },
];

// Sales Invoices
export const salesInvoices: SalesInvoice[] = [
  {
    id: 'INV001', invoiceNo: 'B2B-INV-001', invoiceDate: '2024-12-15', customerId: 'PTY003', customerName: 'Fashion Hub Retail', customerGstin: '24AABCF9012H1Z8', poNo: 'PO-FH-2024-156',
    channel: 'B2B', items: [
      { id: 'SIT001', itemId: 'ITM004', itemName: 'Classic Polo White S', sku: 'FG-PL-WHT-S', hsn: '6105', qty: 50, rate: 450, discount: 0, gstPercent: 5, taxable: 22500, gstAmount: 1125, amount: 23625, warehouse: 'MUM-01' },
      { id: 'SIT002', itemId: 'ITM005', itemName: 'Classic Polo White M', sku: 'FG-PL-WHT-M', hsn: '6105', qty: 40, rate: 450, discount: 0, gstPercent: 5, taxable: 18000, gstAmount: 900, amount: 18900, warehouse: 'MUM-01' },
    ],
    subtotal: 40500, discount: 0, taxable: 40500, cgst: 1012.5, sgst: 1012.5, igst: 0, roundOff: 0, total: 42525, status: 'Dispatched', paymentStatus: 'Unpaid', paymentTerms: '45 Days', createdBy: 'admin', createdAt: '2024-12-15',
  },
  {
    id: 'INV002', invoiceNo: 'B2B-INV-002', invoiceDate: '2024-12-18', customerId: 'PTY004', customerName: 'Style Street Outlet', customerGstin: '06AABCS3456J1Z4', poNo: 'PO-SS-2024-089',
    channel: 'B2B', items: [
      { id: 'SIT003', itemId: 'ITM007', itemName: 'Classic Polo Black S', sku: 'FG-PL-BLK-S', hsn: '6105', qty: 30, rate: 450, discount: 2, gstPercent: 5, taxable: 13230, gstAmount: 661.5, amount: 13891.5, warehouse: 'MUM-01' },
      { id: 'SIT004', itemId: 'ITM010', itemName: 'Kurta Blue L', sku: 'FG-KRT-BLU-L', hsn: '6203', qty: 20, rate: 650, discount: 0, gstPercent: 5, taxable: 13000, gstAmount: 650, amount: 13650, warehouse: 'MUM-01' },
    ],
    subtotal: 26230, discount: 265, taxable: 26230, cgst: 655.75, sgst: 655.75, igst: 0, roundOff: 0.5, total: 27542, status: 'Confirmed', paymentStatus: 'Partial', paymentTerms: '30 Days', createdBy: 'admin', createdAt: '2024-12-18',
  },
];

// Orders
export const orders: Order[] = [
  {
    id: 'ORD001', orderNo: 'B2C-SHP-1001', date: '2024-12-20', customerName: 'Amit Singh', customerMobile: '98765 43211', customerEmail: 'amit@example.com', platform: 'Shopify', channel: 'B2C', paymentType: 'Prepaid', paymentStatus: 'Matched',
    amount: 1398, codAmount: 0, status: 'Delivered', awbNo: 'EXP123456789', courierName: 'Express Logistics', aggregator: 'Shiprocket', trackingUrl: 'https://track.expresslog.com/EXP123456789',
    items: [{ itemId: 'ITM005', itemName: 'Classic Polo White M', sku: 'FG-PL-WHT-M', color: 'White', size: 'M', qty: 2, rate: 699, amount: 1398 }],
    timeline: [
      { status: 'Order Placed', timestamp: '2024-12-20 10:30', location: 'Online', remarks: 'Order received from Shopify' },
      { status: 'Confirmed', timestamp: '2024-12-20 11:00', location: 'MUM-01', remarks: 'Stock available' },
      { status: 'Packed', timestamp: '2024-12-20 15:30', location: 'MUM-01', remarks: 'Packed with care' },
      { status: 'Dispatched', timestamp: '2024-12-21 09:00', location: 'MUM-01', remarks: 'Handed to Express Logistics' },
      { status: 'In Transit', timestamp: '2024-12-21 18:00', location: 'Mumbai Hub', remarks: '' },
      { status: 'Out for Delivery', timestamp: '2024-12-22 08:30', location: 'Delhi', remarks: '' },
      { status: 'Delivered', timestamp: '2024-12-22 14:22', location: 'Delhi', remarks: 'Delivered to customer' },
    ],
    shippingAddress: { id: 'SH001', type: 'shipping', addressLine1: '456, Sector 15', addressLine2: 'Near Park', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India' },
    createdAt: '2024-12-20', updatedAt: '2024-12-22',
  },
  {
    id: 'ORD002', orderNo: 'B2C-SHP-1002', date: '2024-12-23', customerName: 'Priya Patel', customerMobile: '99887 76655', customerEmail: 'priya@example.com', platform: 'Shopify', channel: 'B2C', paymentType: 'COD', paymentStatus: 'Pending',
    amount: 899, codAmount: 899, status: 'In Transit', awbNo: 'EXP987654321', courierName: 'Express Logistics', aggregator: 'Shiprocket', trackingUrl: 'https://track.expresslog.com/EXP987654321',
    items: [{ itemId: 'ITM008', itemName: 'Classic Polo Black M', sku: 'FG-PL-BLK-M', color: 'Black', size: 'M', qty: 1, rate: 899, amount: 899 }],
    timeline: [
      { status: 'Order Placed', timestamp: '2024-12-23 09:15', location: 'Online', remarks: 'COD Order from Shopify' },
      { status: 'Confirmed', timestamp: '2024-12-23 09:45', location: 'MUM-01', remarks: 'Stock available' },
      { status: 'Packed', timestamp: '2024-12-23 14:00', location: 'MUM-01', remarks: '' },
      { status: 'Dispatched', timestamp: '2024-12-24 08:30', location: 'MUM-01', remarks: '' },
      { status: 'In Transit', timestamp: '2024-12-24 19:00', location: 'Mumbai Hub', remarks: '' },
    ],
    shippingAddress: { id: 'SH002', type: 'shipping', addressLine1: '789 Park Street', addressLine2: 'Flat 3B', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
    createdAt: '2024-12-23', updatedAt: '2024-12-24',
  },
  {
    id: 'ORD003', orderNo: 'B2C-AMZ-2001', date: '2024-12-24', customerName: 'Rahul Kumar', customerMobile: '97654 32100', customerEmail: 'rahul@example.com', platform: 'Amazon', channel: 'B2C', paymentType: 'Prepaid', paymentStatus: 'Matched',
    amount: 2697, codAmount: 0, status: 'Pending Dispatch', awbNo: '', courierName: '', aggregator: '', trackingUrl: '',
    items: [
      { itemId: 'ITM004', itemName: 'Classic Polo White S', sku: 'FG-PL-WHT-S', color: 'White', size: 'S', qty: 2, rate: 699, amount: 1398 },
      { itemId: 'ITM007', itemName: 'Classic Polo Black S', sku: 'FG-PL-BLK-S', color: 'Black', size: 'S', qty: 1, rate: 899, amount: 899 },
      { itemId: 'ITM010', itemName: 'Kurta Blue L', sku: 'FG-KRT-BLU-L', color: 'Blue', size: 'L', qty: 1, rate: 999, amount: 999 },
    ],
    timeline: [
      { status: 'Order Placed', timestamp: '2024-12-24 11:30', location: 'Online', remarks: 'Amazon Order' },
      { status: 'Confirmed', timestamp: '2024-12-24 12:00', location: 'MUM-01', remarks: 'Stock allocated' },
    ],
    shippingAddress: { id: 'SH003', type: 'shipping', addressLine1: '12, Gandhi Nagar', addressLine2: '', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', country: 'India' },
    createdAt: '2024-12-24', updatedAt: '2024-12-24',
  },
  {
    id: 'ORD004', orderNo: 'B2C-FLP-3001', date: '2024-12-18', customerName: 'Sneha Reddy', customerMobile: '96543 21098', customerEmail: 'sneha@example.com', platform: 'Flipkart', channel: 'B2C', paymentType: 'COD', paymentStatus: 'Pending',
    amount: 1299, codAmount: 1299, status: 'RTO', awbNo: 'DEL555666777', courierName: 'Delhivery', aggregator: 'Delhivery', trackingUrl: 'https://track.delhivery.com/DEL555666777',
    items: [{ itemId: 'ITM009', itemName: 'V-Neck Grey L', sku: 'FG-VN-GRY-L', color: 'Grey', size: 'L', qty: 1, rate: 599, amount: 599 }],
    timeline: [
      { status: 'Order Placed', timestamp: '2024-12-18 14:00', location: 'Online', remarks: 'Flipkart Order' },
      { status: 'Dispatched', timestamp: '2024-12-19 10:00', location: 'MUM-01', remarks: '' },
      { status: 'In Transit', timestamp: '2024-12-20 08:00', location: 'Pune Hub', remarks: '' },
      { status: 'Out for Delivery', timestamp: '2024-12-21 09:00', location: 'Hyderabad', remarks: '' },
      { status: 'RTO', timestamp: '2024-12-21 18:00', location: 'Hyderabad', remarks: 'Customer not available, refused delivery' },
    ],
    shippingAddress: { id: 'SH004', type: 'shipping', addressLine1: '55, Jubilee Hills', addressLine2: '', city: 'Hyderabad', state: 'Telangana', pincode: '500033', country: 'India' },
    createdAt: '2024-12-18', updatedAt: '2024-12-21',
  },
];

// COD Settlements
export const codSettlements: CODSettlement[] = [
  {
    id: 'CST001', batchNo: 'COD-BATCH-001', settlementDate: '2024-12-22', aggregator: 'Shiprocket', courierName: 'Express Logistics',
    totalCodAmount: 15000, totalCharges: 750, totalRtoCharges: 0, totalAdjustments: 0, totalReceived: 12500, netReceived: 11750,
    status: 'Partially Settled', createdBy: 'admin', createdAt: '2024-12-22',
    orders: [
      { orderId: 'ORD002', orderNo: 'B2C-SHP-1002', awbNo: 'EXP987654321', codAmount: 899, courierCharges: 50, rtoCharges: 0, adjustments: 0, receivedAmount: 0, remarks: 'Pending delivery', isSettled: false },
    ],
  },
];

// Ledgers
export const ledgers: Ledger[] = [
  { id: 'LED001', name: 'Cash in Hand', group: 'Cash', openingBalance: 125000, currentBalance: 185000, type: 'Debit' },
  { id: 'LED002', name: 'HDFC Bank Current A/c', group: 'Bank', openingBalance: 450000, currentBalance: 685000, type: 'Debit' },
  { id: 'LED003', name: 'SBI Bank A/c', group: 'Bank', openingBalance: 200000, currentBalance: 156000, type: 'Debit' },
  { id: 'LED004', name: 'Fashion Hub Retail', group: 'Sundry Debtors', openingBalance: 350000, currentBalance: 285000, type: 'Debit' },
  { id: 'LED005', name: 'Style Street Outlet', group: 'Sundry Debtors', openingBalance: 180000, currentBalance: 125000, type: 'Debit' },
  { id: 'LED006', name: 'Premium Textiles Pvt Ltd', group: 'Sundry Creditors', openingBalance: 125000, currentBalance: 87500, type: 'Credit' },
  { id: 'LED007', name: 'Star Stitching Works', group: 'Sundry Creditors', openingBalance: 45000, currentBalance: 32000, type: 'Credit' },
  { id: 'LED008', name: 'Sales Account', group: 'Income', openingBalance: 0, currentBalance: 1250000, type: 'Credit' },
  { id: 'LED009', name: 'Purchase Account', group: 'Expense', openingBalance: 0, currentBalance: 750000, type: 'Debit' },
  { id: 'LED010', name: 'GST Output CGST', group: 'Duties & Taxes', openingBalance: 0, currentBalance: 62500, type: 'Credit' },
  { id: 'LED011', name: 'GST Output SGST', group: 'Duties & Taxes', openingBalance: 0, currentBalance: 62500, type: 'Credit' },
  { id: 'LED012', name: 'GST Input CGST', group: 'Duties & Taxes', openingBalance: 0, currentBalance: 37500, type: 'Debit' },
  { id: 'LED013', name: 'GST Input SGST', group: 'Duties & Taxes', openingBalance: 0, currentBalance: 37500, type: 'Debit' },
];

// Vouchers
export const vouchers: Voucher[] = [
  { id: 'VCH001', voucherNo: 'PAY-001', voucherType: 'Payment', date: '2024-12-20', particulars: 'Payment to Premium Textiles', debitLedger: 'Premium Textiles Pvt Ltd', creditLedger: 'HDFC Bank Current A/c', amount: 37500, narration: 'Against Invoice PTI-0456', createdBy: 'admin', createdAt: '2024-12-20' },
  { id: 'VCH002', voucherNo: 'RCT-001', voucherType: 'Receipt', date: '2024-12-22', particulars: 'Receipt from Fashion Hub', debitLedger: 'HDFC Bank Current A/c', creditLedger: 'Fashion Hub Retail', amount: 42525, narration: 'Payment against INV-B2B-001', createdBy: 'admin', createdAt: '2024-12-22' },
  { id: 'VCH003', voucherNo: 'JNL-001', voucherType: 'Journal', date: '2024-12-23', particulars: 'GST Adjustment', debitLedger: 'GST Output CGST', creditLedger: 'GST Input CGST', amount: 25000, narration: 'Monthly GST Settlement', createdBy: 'admin', createdAt: '2024-12-23' },
];

// Dashboard Stats
export const dashboardStats: DashboardStats = {
  totalRevenue: 1250000,
  grossProfit: 425000,
  netProfit: 285000,
  ordersCount: 1245,
  revenueGrowth: 12.5,
  profitGrowth: 8.3,
  ordersGrowth: 15.2,
  channelSales: [
    { channel: 'B2B Wholesale', amount: 750000, orders: 45 },
    { channel: 'Shopify', amount: 320000, orders: 385 },
    { channel: 'Amazon', amount: 125000, orders: 290 },
    { channel: 'Flipkart', amount: 55000, orders: 525 },
  ],
  topProducts: [
    { sku: 'FG-PL-WHT-M', name: 'Classic Polo White M', quantity: 245, revenue: 171255 },
    { sku: 'FG-PL-BLK-M', name: 'Classic Polo Black M', quantity: 198, revenue: 138402 },
    { sku: 'FG-PL-WHT-L', name: 'Classic Polo White L', quantity: 156, revenue: 109044 },
    { sku: 'FG-PL-BLK-S', name: 'Classic Polo Black S', quantity: 134, revenue: 93766 },
    { sku: 'FG-KRT-BLU-L', name: 'Kurta Blue L', quantity: 89, revenue: 78911 },
    { sku: 'FG-VN-GRY-L', name: 'V-Neck Grey L', quantity: 76, revenue: 60724 },
    { sku: 'FG-PL-WHT-S', name: 'Classic Polo White S', quantity: 67, revenue: 46833 },
    { sku: 'FG-PL-BLK-L', name: 'Classic Polo Black L', quantity: 54, revenue: 37746 },
    { sku: 'FG-PL-GRY-M', name: 'Classic Polo Grey M', quantity: 43, revenue: 30057 },
    { sku: 'FG-KRT-WHT-L', name: 'Kurta White L', quantity: 32, revenue: 31968 },
  ],
  salesTrend: [
    { date: 'Dec 18', b2b: 125000, b2c: 85000, total: 210000 },
    { date: 'Dec 19', b2b: 98000, b2c: 112000, total: 210000 },
    { date: 'Dec 20', b2b: 145000, b2c: 95000, total: 240000 },
    { date: 'Dec 21', b2b: 110000, b2c: 135000, total: 245000 },
    { date: 'Dec 22', b2b: 88000, b2c: 156000, total: 244000 },
    { date: 'Dec 23', b2b: 95000, b2c: 178000, total: 273000 },
    { date: 'Dec 24', b2b: 168000, b2c: 142000, total: 310000 },
  ],
  inventoryStats: {
    totalValue: 485000,
    rawMaterialValue: 125000,
    finishedGoodsValue: 360000,
    lowStockItems: 3,
    stockMovements: [
      { date: 'Dec 18', in: 250, out: 180 },
      { date: 'Dec 19', in: 0, out: 220 },
      { date: 'Dec 20', in: 350, out: 290 },
      { date: 'Dec 21', in: 100, out: 150 },
      { date: 'Dec 22', in: 200, out: 310 },
      { date: 'Dec 23', in: 0, out: 185 },
      { date: 'Dec 24', in: 400, out: 240 },
    ],
  },
  productionStats: {
    inProcess: 2,
    completed: 15,
    pending: 5,
    delayedJobs: 1,
    productionValueTrend: [
      { date: 'Dec 18', value: 45000 },
      { date: 'Dec 19', value: 38000 },
      { date: 'Dec 20', value: 52000 },
      { date: 'Dec 21', value: 41000 },
      { date: 'Dec 22', value: 55000 },
      { date: 'Dec 23', value: 48000 },
      { date: 'Dec 24', value: 62000 },
    ],
  },
  logisticsStats: {
    delivered: 485,
    inTransit: 125,
    rto: 18,
    pending: 32,
    pendingDispatches: 48,
  },
  codStats: {
    totalCOD: 425000,
    collected: 285000,
    pending: 125000,
    overdue: 15000,
    aggregatorSettlement: [
      { name: 'Express Logistics', pending: 85000, completed: 195000 },
      { name: 'Delhivery', pending: 25000, completed: 65000 },
      { name: 'Shiprocket', pending: 15000, completed: 40000 },
    ],
  },
  financeStats: {
    cashBalance: 185000,
    bankBalance: 841000,
    totalReceivables: 410000,
    totalPayables: 119500,
    gstPayable: 50000,
  },
};

// AI Alerts
export const aiAlerts: AIAlert[] = [
  { id: 'ALT001', type: 'warning', title: 'Low Stock Alert', message: 'Cotton Grey Fabric has fallen below reorder level (45 MTR left). Suggested purchase order attached.', module: 'Inventory', timestamp: '2024-12-24 09:15', isRead: false, actions: [{ label: 'Create PO', action: 'create_po' }] },
  { id: 'ALT002', type: 'critical', title: 'Production Delay', message: 'Job Work #JW-101 is 4 days overdue from Star Stitching Works. Expected return was Dec 20.', module: 'Production', timestamp: '2024-12-24 08:30', isRead: false, actions: [{ label: 'Contact Contractor', action: 'contact' }] },
  { id: 'ALT003', type: 'info', title: 'COD Settlement Pending', message: 'COD pending amount exceeded ₹1.25 Lakhs. Recommend initiating settlement with Express Logistics.', module: 'COD Recovery', timestamp: '2024-12-23 16:45', isRead: true, actions: [{ label: 'Initiate Settlement', action: 'settlement' }] },
  { id: 'ALT004', type: 'warning', title: 'Sales Anomaly Detected', message: 'Orders from Flipkart dropped 40% in last 3 days compared to rolling average.', module: 'Sales', timestamp: '2024-12-23 10:00', isRead: true },
  { id: 'ALT005', type: 'info', title: 'Top Performer', message: 'Classic Polo Black Medium is your best-selling product with 198 units sold this month.', module: 'Analytics', timestamp: '2024-12-22 14:30', isRead: true },
];

// Master Data
export const partyMasters: PartyMaster[] = [
  { id: 'P001', partyCode: 'CUST-001', partyName: 'Fashion Hub Retail', legalName: 'Fashion Hub Retail Pvt Ltd', partyType: 'Customer', gstin: '24AABCF9012H1Z8', pan: 'AABCF9012H', contactPerson: 'Priya Patel', mobile: '9966655544', email: 'priya@fashionhub.com', city: 'Ahmedabad', state: 'Gujarat', creditLimit: 1000000, creditDays: 45, isActive: true },
  { id: 'P002', partyCode: 'SUPP-001', partyName: 'Premium Textiles', legalName: 'Premium Textiles Pvt Ltd', partyType: 'Supplier', gstin: '07AABCP1234F1Z5', pan: 'AABCP1234F', contactPerson: 'Amit Sharma', mobile: '9811122233', email: 'amit@premiumtextiles.com', city: 'Gurugram', state: 'Haryana', creditLimit: 500000, creditDays: 30, isActive: true },
  { id: 'P003', partyCode: 'JOB-001', partyName: 'Star Stitching Works', legalName: 'Star Stitching Works', partyType: 'Job Worker', gstin: '09AABCS5678G1Z2', pan: 'AABCS5678G', contactPerson: 'Ramesh Kumar', mobile: '9877788899', email: 'ramesh@starstitching.in', city: 'Noida', state: 'Uttar Pradesh', creditLimit: 200000, creditDays: 15, isActive: true },
];

export const itemMasters: ItemMaster[] = [
  { id: 'I001', itemCode: 'RM-COT-WHT', itemName: 'Cotton White Fabric', shortName: 'Cotton Wht', category: 'Fabric', itemType: 'Raw Material', hsn: '5208', brand: 'Local', sku: 'RM-COT-WHT-001', primaryUnit: 'Meter', purchaseRate: 120, sellingRate: 0, mrp: 0, gstPercent: 5, reorderLevel: 100, isActive: true },
  { id: 'I002', itemCode: 'FG-PL-WHT-M', itemName: 'Classic Polo T-Shirt White Medium', shortName: 'Polo W M', category: 'T-Shirts', itemType: 'Finished Goods', hsn: '6105', brand: 'FabricFlow', sku: 'FG-PL-WHT-M', primaryUnit: 'Pcs', purchaseRate: 250, sellingRate: 699, mrp: 899, gstPercent: 5, reorderLevel: 50, isActive: true },
];

export const categoryMasters: CategoryMaster[] = [
  { id: 'C001', categoryCode: 'CAT-FAB', categoryName: 'Fabric', parentCategory: 'Raw Material', description: 'All types of fabrics', isActive: true },
  { id: 'C002', categoryCode: 'CAT-TSH', categoryName: 'T-Shirts', parentCategory: 'Finished Goods', description: 'All types of t-shirts', isActive: true },
];

export const unitMasters: UnitMaster[] = [
  { id: 'U001', unitCode: 'MTR', unitName: 'Meter', shortName: 'Mtr', decimalAllowed: true, isActive: true },
  { id: 'U002', unitCode: 'PCS', unitName: 'Pieces', shortName: 'Pcs', decimalAllowed: false, isActive: true },
  { id: 'U003', unitCode: 'KG', unitName: 'Kilogram', shortName: 'Kg', decimalAllowed: true, isActive: true },
];

export const taxMasters: TaxMaster[] = [
  { id: 'T001', taxCode: 'GST-5', taxName: 'GST 5%', taxType: 'GST', taxPercent: 5, isActive: true },
  { id: 'T002', taxCode: 'GST-12', taxName: 'GST 12%', taxType: 'GST', taxPercent: 12, isActive: true },
  { id: 'T003', taxCode: 'GST-18', taxName: 'GST 18%', taxType: 'GST', taxPercent: 18, isActive: true },
];

export const courierMasters: CourierMaster[] = [
  { id: 'CR001', courierCode: 'DEL', courierName: 'Delhivery', courierType: 'Domestic', contactPerson: 'Support', mobile: '1800123456', trackingUrl: 'https://www.delhivery.com/track', codAvailable: true, isActive: true },
  { id: 'CR002', courierCode: 'BLD', courierName: 'BlueDart', courierType: 'Domestic', contactPerson: 'Support', mobile: '1800666333', trackingUrl: 'https://www.bluedart.com', codAvailable: true, isActive: true },
];

export const aggregatorMasters: AggregatorMaster[] = [
  { id: 'A001', aggregatorCode: 'SR', aggregatorName: 'Shiprocket', contactPerson: 'Account Manager', mobile: '9999999999', apiKey: 'sk_test_...', isActive: true },
  { id: 'A002', aggregatorCode: 'NP', aggregatorName: 'NimbusPost', contactPerson: 'Support', mobile: '8888888888', apiKey: 'np_key_...', isActive: true },
];

export const platformMasters: PlatformMaster[] = [
  { id: 'PL001', platformCode: 'AMZ', platformName: 'Amazon', platformType: 'Marketplace', apiKey: 'amz_key_...', feesPercent: 15, isActive: true },
  { id: 'PL002', platformCode: 'SHP', platformName: 'Shopify', platformType: 'Website', apiKey: 'shp_key_...', feesPercent: 2, isActive: true },
];

import type { Item, Party, Category, Unit, Warehouse, Purchase, JobWork, MaterialIn, Sale, Expense, StockMovement, AuditLog, Notification, User } from '../types';

export function generateSampleData() {
  const currentUser: User = {
    id: 'u1', name: 'Arjun Sharma', email: 'admin@fabricflow.com',
    role: 'ADMIN', status: 'ACTIVE', lastLogin: new Date().toISOString()
  };

  const categories: Category[] = [
    { id: 'cat1', name: 'Fabric', description: 'Raw fabric materials', status: 'ACTIVE' },
    { id: 'cat2', name: 'Trims & Accessories', description: 'Buttons, zippers, labels', status: 'ACTIVE' },
    { id: 'cat3', name: 'Packaging', description: 'Packing materials', status: 'ACTIVE' },
    { id: 'cat4', name: 'Tops', description: 'T-shirts, shirts, blouses', status: 'ACTIVE' },
    { id: 'cat5', name: 'Bottoms', description: 'Jeans, trousers, skirts', status: 'ACTIVE' },
    { id: 'cat6', name: 'Outerwear', description: 'Jackets, coats', status: 'ACTIVE' },
  ];

  const units: Unit[] = [
    { id: 'u1', name: 'Meter', symbol: 'MTR', status: 'ACTIVE' },
    { id: 'u2', name: 'Piece', symbol: 'PCS', status: 'ACTIVE' },
    { id: 'u3', name: 'Kilogram', symbol: 'KG', status: 'ACTIVE' },
    { id: 'u4', name: 'Set', symbol: 'SET', status: 'ACTIVE' },
    { id: 'u5', name: 'Dozen', symbol: 'DOZ', status: 'ACTIVE' },
    { id: 'u6', name: 'Box', symbol: 'BOX', status: 'ACTIVE' },
  ];

  const warehouses: Warehouse[] = [
    { id: 'wh1', name: 'Main Warehouse', location: 'Mumbai, MH', status: 'ACTIVE' },
    { id: 'wh2', name: 'Production Store', location: 'Mumbai, MH', status: 'ACTIVE' },
    { id: 'wh3', name: 'Dispatch Hub', location: 'Delhi, DL', status: 'ACTIVE' },
  ];

  const items: Item[] = [
    // Raw Materials
    { id: 'i1', sku: 'RM-FAB-001', name: 'Cotton Fabric - White', type: 'RAW_MATERIAL', categoryId: 'cat1', unitId: 'u1', gstPercent: 5, hsnCode: '5208', barcode: '8901234567890', purchaseRate: 120, salesRate: 0, minimumStock: 100, openingStock: 500, currentStock: 342, status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
    { id: 'i2', sku: 'RM-FAB-002', name: 'Denim Fabric - Blue', type: 'RAW_MATERIAL', categoryId: 'cat1', unitId: 'u1', gstPercent: 5, hsnCode: '5209', barcode: '8901234567891', purchaseRate: 280, salesRate: 0, minimumStock: 50, openingStock: 300, currentStock: 187, status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
    { id: 'i3', sku: 'RM-FAB-003', name: 'Polyester Fabric - Black', type: 'RAW_MATERIAL', categoryId: 'cat1', unitId: 'u1', gstPercent: 12, hsnCode: '5407', barcode: '8901234567892', purchaseRate: 95, salesRate: 0, minimumStock: 80, openingStock: 200, currentStock: 45, status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
    { id: 'i4', sku: 'RM-TRM-001', name: 'Metal Buttons - Silver', type: 'RAW_MATERIAL', categoryId: 'cat2', unitId: 'u2', gstPercent: 18, hsnCode: '9606', barcode: '8901234567893', purchaseRate: 2.5, salesRate: 0, minimumStock: 1000, openingStock: 5000, currentStock: 3200, status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
    { id: 'i5', sku: 'RM-TRM-002', name: 'YKK Zipper - 12 inch', type: 'RAW_MATERIAL', categoryId: 'cat2', unitId: 'u2', gstPercent: 12, hsnCode: '9607', barcode: '8901234567894', purchaseRate: 18, salesRate: 0, minimumStock: 500, openingStock: 2000, currentStock: 890, status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
    { id: 'i6', sku: 'RM-TRM-003', name: 'Brand Labels - Woven', type: 'RAW_MATERIAL', categoryId: 'cat2', unitId: 'u2', gstPercent: 12, hsnCode: '5807', barcode: '8901234567895', purchaseRate: 3.5, salesRate: 0, minimumStock: 2000, openingStock: 8000, currentStock: 6500, status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
    { id: 'i7', sku: 'RM-TRM-004', name: 'Sewing Thread - White', type: 'RAW_MATERIAL', categoryId: 'cat2', unitId: 'u3', gstPercent: 12, hsnCode: '5204', barcode: '8901234567896', purchaseRate: 450, salesRate: 0, minimumStock: 20, openingStock: 100, currentStock: 18, status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
    { id: 'i8', sku: 'RM-PKG-001', name: 'Polybag - M Size', type: 'RAW_MATERIAL', categoryId: 'cat3', unitId: 'u2', gstPercent: 18, hsnCode: '3923', barcode: '8901234567897', purchaseRate: 1.2, salesRate: 0, minimumStock: 2000, openingStock: 10000, currentStock: 7800, status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },

    // Finished Goods
    { id: 'i9', sku: 'FG-TOP-001', name: 'Classic White T-Shirt', type: 'FINISHED_GOODS', categoryId: 'cat4', unitId: 'u2', gstPercent: 12, hsnCode: '6109', barcode: '8901234568001', purchaseRate: 0, salesRate: 499, minimumStock: 50, openingStock: 200, currentStock: 145, status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
    { id: 'i10', sku: 'FG-BOT-001', name: 'Slim Fit Blue Jeans', type: 'FINISHED_GOODS', categoryId: 'cat5', unitId: 'u2', gstPercent: 12, hsnCode: '6203', barcode: '8901234568002', purchaseRate: 0, salesRate: 1299, minimumStock: 30, openingStock: 150, currentStock: 89, status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
    { id: 'i11', sku: 'FG-TOP-002', name: 'Polo Neck Shirt - Black', type: 'FINISHED_GOODS', categoryId: 'cat4', unitId: 'u2', gstPercent: 12, hsnCode: '6105', barcode: '8901234568003', purchaseRate: 0, salesRate: 799, minimumStock: 40, openingStock: 180, currentStock: 122, status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
    { id: 'i12', sku: 'FG-OUT-001', name: 'Bomber Jacket - Navy', type: 'FINISHED_GOODS', categoryId: 'cat6', unitId: 'u2', gstPercent: 12, hsnCode: '6201', barcode: '8901234568004', purchaseRate: 0, salesRate: 2499, minimumStock: 20, openingStock: 80, currentStock: 28, status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
    { id: 'i13', sku: 'FG-BOT-002', name: 'Cargo Trousers - Khaki', type: 'FINISHED_GOODS', categoryId: 'cat5', unitId: 'u2', gstPercent: 12, hsnCode: '6203', barcode: '8901234568005', purchaseRate: 0, salesRate: 1099, minimumStock: 25, openingStock: 120, currentStock: 67, status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
  ];

  const parties: Party[] = [
    // Vendors
    { id: 'p1', name: 'Textile Hub Mumbai', type: 'VENDOR', gstNumber: '27AABCT1234A1Z5', phone: '9876543210', email: 'info@textilehub.com', address: '45, Bhuleshwar Market', city: 'Mumbai', state: 'Maharashtra', pincode: '400002', contactPerson: 'Rajesh Shah', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'p2', name: 'Delhi Fabric House', type: 'VENDOR', gstNumber: '07AABDF5678B1Z3', phone: '9811223344', email: 'sales@delhifabric.com', address: '12, Gandhi Nagar', city: 'Delhi', state: 'Delhi', pincode: '110031', contactPerson: 'Suresh Kumar', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'p3', name: 'Trim World', type: 'VENDOR', gstNumber: '27AABTT9012C1Z1', phone: '9922334455', email: 'info@trimworld.in', address: '78, Dharavi Industrial Area', city: 'Mumbai', state: 'Maharashtra', pincode: '400017', contactPerson: 'Anil Mehta', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z' },

    // Contractors
    { id: 'p4', name: 'Star Stitching Unit', type: 'CONTRACTOR', phone: '9833445566', email: 'star@stitching.in', address: '23, MIDC Andheri', city: 'Mumbai', state: 'Maharashtra', contactPerson: 'Manoj Patil', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'p5', name: 'Fashion Makers Pvt Ltd', type: 'CONTRACTOR', gstNumber: '27AABFM3456D1Z9', phone: '9844556677', email: 'production@fashionmakers.com', address: '67, Goregaon Industrial Zone', city: 'Mumbai', state: 'Maharashtra', contactPerson: 'Pradeep Yadav', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z' },

    // Customers
    { id: 'p6', name: 'StyleZone Retail', type: 'CUSTOMER', gstNumber: '29AABCS7890E1Z2', phone: '9855667788', email: 'purchase@stylezone.in', address: '34, Commercial Street', city: 'Bangalore', state: 'Karnataka', contactPerson: 'Vivek Nair', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'p7', name: 'Fashion Forward Stores', type: 'CUSTOMER', gstNumber: '06AABFF2345F1Z5', phone: '9866778899', email: 'buying@fashionforward.com', address: '89, Cyber City', city: 'Gurugram', state: 'Haryana', contactPerson: 'Deepika Singh', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z' },

    // Courier Partners
    { id: 'p8', name: 'Shiprocket', type: 'COURIER_AGGREGATOR', phone: '1800123456', email: 'support@shiprocket.in', address: 'B-6, Sector 63', city: 'Noida', state: 'Uttar Pradesh', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'p9', name: 'BlueDart Express', type: 'COURIER_PARTNER', phone: '1860233434', email: 'ops@bluedart.com', address: 'Mumbai International Airport', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z' },

    // Platforms
    { id: 'p10', name: 'Amazon India', type: 'PLATFORM', phone: '18001030000', email: 'seller@amazon.in', address: 'Amazon Campus', city: 'Bangalore', state: 'Karnataka', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'p11', name: 'Myntra', type: 'PLATFORM', phone: '18002089898', email: 'seller@myntra.com', address: 'Myntra HQ', city: 'Bangalore', state: 'Karnataka', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'p12', name: 'Flipkart', type: 'PLATFORM', phone: '18002089898', email: 'seller@flipkart.com', address: 'Embassy Tech Village', city: 'Bangalore', state: 'Karnataka', status: 'ACTIVE', createdAt: '2024-01-01T00:00:00Z' },
  ];

  const purchases: Purchase[] = [
    {
      id: 'pur1', billNo: 'BILL-2024-001', date: '2024-12-01', partyId: 'p1',
      gstType: 'CGST_SGST',
      items: [
        { id: 'pi1', itemId: 'i1', quantity: 200, rate: 120, gstPercent: 5, amount: 24000, gstAmount: 1200, totalAmount: 25200 },
        { id: 'pi2', itemId: 'i2', quantity: 100, rate: 280, gstPercent: 5, amount: 28000, gstAmount: 1400, totalAmount: 29400 },
      ],
      subtotal: 52000, totalGST: 2600, grandTotal: 54600, status: 'ACTIVE',
      createdAt: '2024-12-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z'
    },
    {
      id: 'pur2', billNo: 'BILL-2024-002', date: '2024-12-05', partyId: 'p3',
      gstType: 'CGST_SGST',
      items: [
        { id: 'pi3', itemId: 'i4', quantity: 2000, rate: 2.5, gstPercent: 18, amount: 5000, gstAmount: 900, totalAmount: 5900 },
        { id: 'pi4', itemId: 'i5', quantity: 500, rate: 18, gstPercent: 12, amount: 9000, gstAmount: 1080, totalAmount: 10080 },
      ],
      subtotal: 14000, totalGST: 1980, grandTotal: 15980, status: 'ACTIVE',
      createdAt: '2024-12-05T11:00:00Z', updatedAt: '2024-12-05T11:00:00Z'
    },
    {
      id: 'pur3', billNo: 'BILL-2024-003', date: '2024-12-10', partyId: 'p2',
      gstType: 'IGST',
      items: [
        { id: 'pi5', itemId: 'i3', quantity: 150, rate: 95, gstPercent: 12, amount: 14250, gstAmount: 1710, totalAmount: 15960 },
      ],
      subtotal: 14250, totalGST: 1710, grandTotal: 15960, status: 'ACTIVE',
      createdAt: '2024-12-10T09:00:00Z', updatedAt: '2024-12-10T09:00:00Z'
    },
    {
      id: 'pur4', billNo: 'BILL-2025-001', date: '2025-01-03', partyId: 'p1',
      gstType: 'CGST_SGST',
      items: [
        { id: 'pi6', itemId: 'i1', quantity: 300, rate: 115, gstPercent: 5, amount: 34500, gstAmount: 1725, totalAmount: 36225 },
      ],
      subtotal: 34500, totalGST: 1725, grandTotal: 36225, status: 'ACTIVE',
      createdAt: '2025-01-03T10:00:00Z', updatedAt: '2025-01-03T10:00:00Z'
    },
  ];

  const jobWorks: JobWork[] = [
    {
      id: 'jw1', jobWorkNo: 'JW-2024-001', date: '2024-12-02', contractorId: 'p4',
      priority: 'HIGH', expectedReturnDate: '2024-12-20',
      remarks: 'Rush order for festive season',
      rawMaterials: [
        { id: 'jwi1', itemId: 'i1', availableStock: 342, issueQty: 80, unitId: 'u1', rate: 120, amount: 9600 },
        { id: 'jwi2', itemId: 'i4', availableStock: 3200, issueQty: 400, unitId: 'u2', rate: 2.5, amount: 1000 },
        { id: 'jwi3', itemId: 'i6', availableStock: 6500, issueQty: 200, unitId: 'u2', rate: 3.5, amount: 700 },
      ],
      finishedGoods: [
        { id: 'jwfg1', itemId: 'i9', expectedQty: 100, productionCost: 112 },
      ],
      status: 'COMPLETED', createdAt: '2024-12-02T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z'
    },
    {
      id: 'jw2', jobWorkNo: 'JW-2024-002', date: '2024-12-08', contractorId: 'p5',
      priority: 'MEDIUM', expectedReturnDate: '2024-12-28',
      remarks: 'Denim collection batch',
      rawMaterials: [
        { id: 'jwi4', itemId: 'i2', availableStock: 187, issueQty: 60, unitId: 'u1', rate: 280, amount: 16800 },
        { id: 'jwi5', itemId: 'i5', availableStock: 890, issueQty: 120, unitId: 'u2', rate: 18, amount: 2160 },
        { id: 'jwi6', itemId: 'i4', availableStock: 2800, issueQty: 240, unitId: 'u2', rate: 2.5, amount: 600 },
      ],
      finishedGoods: [
        { id: 'jwfg2', itemId: 'i10', expectedQty: 60, productionCost: 328 },
      ],
      status: 'PARTIAL_RECEIVED', createdAt: '2024-12-08T10:00:00Z', updatedAt: '2024-12-25T10:00:00Z'
    },
    {
      id: 'jw3', jobWorkNo: 'JW-2025-001', date: '2025-01-05', contractorId: 'p4',
      priority: 'URGENT', expectedReturnDate: '2025-01-20',
      remarks: 'New year collection',
      rawMaterials: [
        { id: 'jwi7', itemId: 'i3', availableStock: 45, issueQty: 40, unitId: 'u1', rate: 95, amount: 3800 },
        { id: 'jwi8', itemId: 'i7', availableStock: 18, issueQty: 10, unitId: 'u3', rate: 450, amount: 4500 },
      ],
      finishedGoods: [
        { id: 'jwfg3', itemId: 'i11', expectedQty: 80, productionCost: 103 },
      ],
      status: 'IN_PROCESS', createdAt: '2025-01-05T10:00:00Z', updatedAt: '2025-01-05T10:00:00Z'
    },
  ];

  const materialIns: MaterialIn[] = [
    {
      id: 'mi1', materialInNo: 'MI-2024-001', date: '2024-12-20', jobWorkId: 'jw1', contractorId: 'p4',
      items: [{ id: 'mii1', itemId: 'i9', pendingQty: 100, receivedQty: 100, rejectedQty: 2, wastageQty: 0 }],
      remarks: 'All received, 2 pieces rejected for QC failure',
      createdAt: '2024-12-20T14:00:00Z'
    },
    {
      id: 'mi2', materialInNo: 'MI-2024-002', date: '2024-12-25', jobWorkId: 'jw2', contractorId: 'p5',
      items: [{ id: 'mii2', itemId: 'i10', pendingQty: 60, receivedQty: 35, rejectedQty: 1, wastageQty: 0 }],
      remarks: 'Partial delivery, remaining 25 pcs pending',
      createdAt: '2024-12-25T14:00:00Z'
    },
  ];

  const sales: Sale[] = [
    {
      id: 's1', invoiceNo: 'INV-2024-001', date: '2024-12-10', partyId: 'p6',
      gstType: 'IGST',
      items: [
        { id: 'si1', itemId: 'i9', quantity: 50, rate: 499, gstPercent: 12, amount: 24950, gstAmount: 2994, totalAmount: 27944 },
        { id: 'si2', itemId: 'i11', quantity: 30, rate: 799, gstPercent: 12, amount: 23970, gstAmount: 2876.4, totalAmount: 26846.4 },
      ],
      subtotal: 48920, totalGST: 5870.4, grandTotal: 54790.4,
      status: 'ACTIVE', dispatchStatus: 'DELIVERED',
      courierPartnerId: 'p9', trackingId: 'BD123456789IN', platform: 'B2B',
      createdAt: '2024-12-10T10:00:00Z'
    },
    {
      id: 's2', invoiceNo: 'INV-2024-002', date: '2024-12-15', partyId: 'p10',
      gstType: 'IGST',
      items: [
        { id: 'si3', itemId: 'i10', quantity: 20, rate: 1299, gstPercent: 12, amount: 25980, gstAmount: 3117.6, totalAmount: 29097.6 },
        { id: 'si4', itemId: 'i12', quantity: 10, rate: 2499, gstPercent: 12, amount: 24990, gstAmount: 2998.8, totalAmount: 27988.8 },
      ],
      subtotal: 50970, totalGST: 6116.4, grandTotal: 57086.4,
      status: 'ACTIVE', dispatchStatus: 'DELIVERED',
      platform: 'Amazon', trackingId: 'AMZN987654321',
      createdAt: '2024-12-15T10:00:00Z'
    },
    {
      id: 's3', invoiceNo: 'INV-2024-003', date: '2024-12-22', partyId: 'p11',
      gstType: 'IGST',
      items: [
        { id: 'si5', itemId: 'i9', quantity: 40, rate: 599, gstPercent: 12, amount: 23960, gstAmount: 2875.2, totalAmount: 26835.2 },
        { id: 'si6', itemId: 'i13', quantity: 25, rate: 1199, gstPercent: 12, amount: 29975, gstAmount: 3597, totalAmount: 33572 },
      ],
      subtotal: 53935, totalGST: 6472.2, grandTotal: 60407.2,
      status: 'ACTIVE', dispatchStatus: 'DISPATCHED',
      platform: 'Myntra', trackingId: 'MNTR445566778',
      createdAt: '2024-12-22T10:00:00Z'
    },
    {
      id: 's4', invoiceNo: 'INV-2025-001', date: '2025-01-08', partyId: 'p7',
      gstType: 'IGST',
      items: [
        { id: 'si7', itemId: 'i12', quantity: 15, rate: 2499, gstPercent: 12, amount: 37485, gstAmount: 4498.2, totalAmount: 41983.2 },
      ],
      subtotal: 37485, totalGST: 4498.2, grandTotal: 41983.2,
      status: 'ACTIVE', dispatchStatus: 'PENDING', platform: 'B2B',
      createdAt: '2025-01-08T10:00:00Z'
    },
    {
      id: 's5', invoiceNo: 'INV-2025-002', date: '2025-01-10', partyId: 'p12',
      gstType: 'IGST',
      items: [
        { id: 'si8', itemId: 'i10', quantity: 30, rate: 1399, gstPercent: 12, amount: 41970, gstAmount: 5036.4, totalAmount: 47006.4 },
        { id: 'si9', itemId: 'i11', quantity: 20, rate: 899, gstPercent: 12, amount: 17980, gstAmount: 2157.6, totalAmount: 20137.6 },
      ],
      subtotal: 59950, totalGST: 7194, grandTotal: 67144,
      status: 'ACTIVE', dispatchStatus: 'DISPATCHED',
      platform: 'Flipkart', trackingId: 'FK778899001',
      createdAt: '2025-01-10T10:00:00Z'
    },
  ];

  const expenses: Expense[] = [
    { id: 'ex1', date: '2024-12-01', category: 'Rent', description: 'Factory rent December', amount: 35000, createdAt: '2024-12-01T00:00:00Z' },
    { id: 'ex2', date: '2024-12-05', category: 'Electricity', description: 'Power bill December', amount: 12500, createdAt: '2024-12-05T00:00:00Z' },
    { id: 'ex3', date: '2024-12-10', category: 'Transport', description: 'Material transport', amount: 4500, createdAt: '2024-12-10T00:00:00Z' },
    { id: 'ex4', date: '2024-12-15', category: 'Salary', description: 'Staff salary', amount: 85000, createdAt: '2024-12-15T00:00:00Z' },
    { id: 'ex5', date: '2025-01-01', category: 'Rent', description: 'Factory rent January', amount: 35000, createdAt: '2025-01-01T00:00:00Z' },
  ];

  const stockMovements: StockMovement[] = [
    { id: 'sm1', itemId: 'i1', type: 'INWARD', quantity: 200, previousStock: 142, newStock: 342, reason: 'Purchase', reference: 'BILL-2024-001', createdBy: 'Arjun Sharma', createdAt: '2024-12-01T10:30:00Z' },
    { id: 'sm2', itemId: 'i9', type: 'OUTWARD', quantity: 50, previousStock: 195, newStock: 145, reason: 'Sales', reference: 'INV-2024-001', createdBy: 'Arjun Sharma', createdAt: '2024-12-10T11:00:00Z' },
    { id: 'sm3', itemId: 'i2', type: 'OUTWARD', quantity: 60, previousStock: 247, newStock: 187, reason: 'Job Work Issue', reference: 'JW-2024-002', createdBy: 'Arjun Sharma', createdAt: '2024-12-08T10:30:00Z' },
    { id: 'sm4', itemId: 'i3', type: 'ADJUSTMENT', quantity: -5, previousStock: 50, newStock: 45, reason: 'Damage Entry', reference: 'ADJ-001', createdBy: 'Arjun Sharma', createdAt: '2024-12-12T14:00:00Z' },
  ];

  const auditLogs: AuditLog[] = [
    { id: 'al1', entity: 'Item', entityId: 'i1', action: 'EDIT', oldValue: { purchaseRate: 110 }, newValue: { purchaseRate: 120 }, modifiedBy: 'Arjun Sharma', modifiedAt: '2024-12-01T09:00:00Z', ipAddress: '192.168.1.100' },
    { id: 'al2', entity: 'Purchase', entityId: 'pur1', action: 'CREATE', newValue: { billNo: 'BILL-2024-001' }, modifiedBy: 'Arjun Sharma', modifiedAt: '2024-12-01T10:00:00Z', ipAddress: '192.168.1.100' },
    { id: 'al3', entity: 'Party', entityId: 'p1', action: 'EDIT', oldValue: { phone: '9876543211' }, newValue: { phone: '9876543210' }, modifiedBy: 'Arjun Sharma', modifiedAt: '2024-12-02T10:00:00Z', ipAddress: '192.168.1.101' },
    { id: 'al4', entity: 'JobWork', entityId: 'jw1', action: 'STATUS_CHANGE', oldValue: { status: 'IN_PROCESS' }, newValue: { status: 'COMPLETED' }, modifiedBy: 'Arjun Sharma', modifiedAt: '2024-12-20T10:00:00Z', ipAddress: '192.168.1.100' },
  ];

  const notifications: Notification[] = [
    { id: 'n1', type: 'LOW_STOCK', message: 'Polyester Fabric - Black is below minimum stock (45 < 80)', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString(), link: 'inventory' },
    { id: 'n2', type: 'LOW_STOCK', message: 'Sewing Thread - White is below minimum stock (18 < 20)', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString(), link: 'inventory' },
    { id: 'n3', type: 'PENDING_JOB', message: 'Job Work JW-2025-001 is IN PROCESS since 5 days', isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString(), link: 'production' },
    { id: 'n4', type: 'DELAYED_RETURN', message: 'JW-2024-002 partial return pending from Fashion Makers', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString(), link: 'production' },
    { id: 'n5', type: 'DISPATCH', message: 'Invoice INV-2025-001 dispatch pending for Fashion Forward Stores', isRead: false, createdAt: new Date(Date.now() - 43200000).toISOString(), link: 'sales' },
    { id: 'n6', type: 'LOW_STOCK', message: 'Bomber Jacket - Navy is approaching minimum stock (28 vs 20)', isRead: true, createdAt: new Date(Date.now() - 259200000).toISOString(), link: 'inventory' },
  ];

  return {
    currentUser, categories, units, warehouses, items, parties,
    purchases, jobWorks, materialIns, sales, expenses,
    stockMovements, auditLogs, notifications
  };
}

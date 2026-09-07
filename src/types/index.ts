export type BusinessType = 'shop' | 'pharmacy' | 'other' | 'wholesale' | 'retail';

export type UserRole = 'admin' | 'manager' | 'cashier';

export interface User {
  id: string;
  name: string;
  username?: string;
  role: UserRole;
  phone?: string;
  email?: string;
  pin?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  type: BusinessType;
  currency: string;
  phone: string;
  address: string;
  receiptHeader?: string;
  receiptFooter?: string;
  taxRate?: number; // percentage, e.g. 0 or 12
  isConfigured?: boolean;
}

export interface ProductBatch {
  id: string;
  productId: string;
  batchNumber: string; // Seriya raqami
  expiryDate: string; // YYYY-MM-DD
  quantity: number;
  purchasePrice: number;
  receivedDate: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  sku: string;
  category: string;
  unit: string; // dona, quti, flakon, ampula, kg, litr, m, pachka
  purchasePrice: number; // Tan narx
  sellingPrice: number; // Sotish narxi
  minStock: number; // Kam qolgan chegara
  currentStock: number; // Real-time qoldiq
  supplierId?: string;
  supplierName?: string;
  description?: string;
  manufacturer?: string; // Ishlab chiqaruvchi (Dorixona uchun)
  dosage?: string; // Dozasi / shakli (Dorixona uchun)
  country?: string;
  imageUrl?: string;
  batches?: ProductBatch[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  purchasePrice: number;
  totalCost: number; // quantity * purchasePrice
  batchNumber?: string; // Partiya seriyasi
  expiryDate?: string; // Yaroqlilik muddati
}

export interface Purchase {
  id: string;
  invoiceNumber: string; // Hujjat / Faktura raqami
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'debt';
  date: string;
  createdById: string;
  createdByName: string;
  notes?: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  unit: string;
  quantity: number;
  sellingPrice: number;
  purchasePrice: number; // Tan narxi (COGS hisoblash uchun)
  totalAmount: number; // quantity * sellingPrice
  totalCost: number; // quantity * purchasePrice
  profit: number; // totalAmount - totalCost
  batchNumber?: string;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  customerId?: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  totalCost: number; // Jami tan narx
  costAmount?: number; // Alias for totalCost
  profit: number; // Jami foyda
  paymentMethod: 'cash' | 'card' | 'transfer' | 'debt';
  paidAmount: number;
  debtAmount: number; // Agar nasiya bo'lsa
  date: string;
  createdById: string;
  createdByName: string;
  status: 'completed' | 'refunded' | 'partially_refunded';
}

export interface Expense {
  id: string;
  name?: string;
  title?: string;
  category: string;
  amount: number;
  date: string;
  createdById: string;
  createdByName: string;
  note?: string;
  notes?: string;
}

export interface ReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  cost: number;
}

export interface ReturnRecord {
  id: string;
  type: 'customer_return' | 'supplier_return'; // Mijoz qaytarishi yoki yetkazib beruvchiga qaytarish
  referenceId: string; // Sale ID or Purchase ID
  referenceNumber: string; // Receipt or Invoice number
  partyName: string; // Customer name or Supplier name
  items: ReturnItem[];
  totalAmount: number;
  reason: string;
  date: string;
  createdById: string;
  createdByName: string;
}

export interface CustomerReturn {
  id: string;
  saleId?: string;
  productId: string;
  productName: string;
  quantity: number;
  refundAmount: number;
  reason: string;
  date: string;
  createdById: string;
  createdByName: string;
}

export interface SupplierReturn {
  id: string;
  purchaseId?: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
  reason: string;
  date: string;
  createdById: string;
  createdByName: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  totalPurchases: number;
  totalSpent: number;
  currentDebt: number; // Nasiya qoldig'i
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  contactPerson?: string;
  totalPurchases: number;
  totalSupplied?: number;
  currentDebt: number; // Yetkazib beruvchiga qarzimiz
  address?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  type: 'customer_payment' | 'supplier_payment';
  partyId: string;
  partyName: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  date: string;
  note?: string;
  createdById: string;
  createdByName: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType?: string;
  entityName?: string;
  module?: string;
  details: string;
  userId?: string;
  userName: string;
  timestamp: string;
}

export interface OnlineProductResult {
  found: boolean;
  name: string;
  barcode: string;
  sku?: string;
  brand?: string;
  manufacturer?: string;
  category?: string;
  description?: string;
  unit?: string;
  imageUrl?: string;
  dosage?: string;
  estimatedPurchasePrice?: number;
  estimatedSellingPrice?: number;
  country?: string;
  source: string;
}

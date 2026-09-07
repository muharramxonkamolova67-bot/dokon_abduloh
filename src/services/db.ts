import {
  AuditLog,
  BusinessProfile,
  Customer,
  Expense,
  PaymentTransaction,
  Product,
  Purchase,
  ReturnRecord,
  Sale,
  Supplier,
  User,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'bms_profile',
  USERS: 'bms_users',
  CURRENT_USER: 'bms_current_user',
  PRODUCTS: 'bms_products',
  PURCHASES: 'bms_purchases',
  SALES: 'bms_sales',
  EXPENSES: 'bms_expenses',
  CUSTOMERS: 'bms_customers',
  SUPPLIERS: 'bms_suppliers',
  RETURNS: 'bms_returns',
  PAYMENTS: 'bms_payments',
  AUDIT_LOGS: 'bms_audit_logs',
};

// Default seed data for immediate production-like trial
const DEFAULT_PROFILE: BusinessProfile = {
  id: 'biz_01',
  name: 'Grand Pharm & Market',
  type: 'pharmacy',
  currency: "so'm",
  phone: '+998 (90) 123-45-67',
  address: 'Toshkent sh., Amir Temur shoh ko‘chasi, 42-uy',
  receiptHeader: 'Grand Pharm & Market — Savdo va Dorixona Tizimi',
  receiptFooter: 'Xaridingiz uchun rahmat! Salomat bo‘ling!',
  taxRate: 0,
  isConfigured: true,
};

const DEFAULT_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'Dilshod Rahimov (Admin)',
    role: 'admin',
    phone: '+998 90 999 11 22',
    isActive: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'user_manager',
    name: 'Malika Karimova (Menejer)',
    role: 'manager',
    phone: '+998 93 555 44 33',
    isActive: true,
    createdAt: '2026-01-05T09:00:00.000Z',
  },
  {
    id: 'user_cashier',
    name: 'Anvar Zokirov (Kassir)',
    role: 'cashier',
    phone: '+998 97 777 88 99',
    isActive: true,
    createdAt: '2026-01-10T08:30:00.000Z',
  },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_01',
    name: 'Nobel Pharmsanoat QK',
    phone: '+998 71 200 00 11',
    contactPerson: 'Rustam aka',
    totalPurchases: 45000000,
    currentDebt: 5000000,
    address: 'Toshkent, Shayxontohur tumani',
    createdAt: '2026-01-01',
  },
  {
    id: 'sup_02',
    name: 'Jurabek Laboratories',
    phone: '+998 71 255 12 34',
    contactPerson: 'Sardorbek',
    totalPurchases: 32000000,
    currentDebt: 0,
    address: 'Toshkent, Yunusobod tumani',
    createdAt: '2026-01-02',
  },
  {
    id: 'sup_03',
    name: 'Coca-Cola Bottlers Uzbekistan',
    phone: '+998 71 140 14 00',
    contactPerson: 'Erkin aka',
    totalPurchases: 18500000,
    currentDebt: 1200000,
    address: 'Toshkent, Sergeli tumani',
    createdAt: '2026-01-03',
  },
  {
    id: 'sup_04',
    name: 'Nestle Central Asia LLC',
    phone: '+998 71 120 70 80',
    contactPerson: 'Bobur Mirzayev',
    totalPurchases: 22000000,
    currentDebt: 0,
    address: 'Toshkent, Mirobod tumani',
    createdAt: '2026-01-04',
  },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust_01',
    name: 'Umumiy xaridor (Oddiy)',
    phone: '+998 90 000 00 00',
    totalPurchases: 142,
    totalSpent: 4850000,
    currentDebt: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'cust_02',
    name: 'Akmal Karimov (Doimiy mijoz)',
    phone: '+998 90 111 22 33',
    address: 'Chilonzor 7-mavze, 12-uy',
    totalPurchases: 18,
    totalSpent: 1850000,
    currentDebt: 250000,
    notes: 'Har oy dorilar xarid qiladi',
    createdAt: '2026-01-10',
  },
  {
    id: 'cust_03',
    name: 'Ziyoda Alimova',
    phone: '+998 93 333 44 55',
    address: 'Yakkasaroy, Shota Rustaveli',
    totalPurchases: 9,
    totalSpent: 920000,
    currentDebt: 0,
    createdAt: '2026-01-15',
  },
  {
    id: 'cust_04',
    name: 'Bekzod Toshmatov (Doktor)',
    phone: '+998 97 444 55 66',
    address: 'Shifoxona N1',
    totalPurchases: 25,
    totalSpent: 3400000,
    currentDebt: 500000,
    createdAt: '2026-01-18',
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_01',
    name: 'Paracetamol 500mg',
    barcode: '4780001230018',
    sku: 'MED-PAR-500',
    category: 'Dorilar (Analgetik)',
    unit: 'quti',
    purchasePrice: 6500,
    sellingPrice: 9500,
    minStock: 20,
    currentStock: 85,
    supplierId: 'sup_01',
    supplierName: 'Nobel Pharmsanoat QK',
    manufacturer: 'Nobel Pharmsanoat',
    dosage: '500 mg, 10 tabletka',
    description: 'Isitma tushiruvchi va og‘riqsizlantiruvchi dori vositasi',
    batches: [
      {
        id: 'b_01',
        productId: 'prod_01',
        batchNumber: 'NB-2025-09',
        expiryDate: '2027-05-15',
        quantity: 85,
        purchasePrice: 6500,
        receivedDate: '2026-01-15',
      },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'prod_02',
    name: 'Amoksitsillin 500mg',
    barcode: '4780001230025',
    sku: 'MED-AMX-500',
    category: 'Antibiotiklar',
    unit: 'quti',
    purchasePrice: 14000,
    sellingPrice: 21000,
    minStock: 15,
    currentStock: 42,
    supplierId: 'sup_02',
    supplierName: 'Jurabek Laboratories',
    manufacturer: 'Jurabek Lab JV',
    dosage: '500 mg, 20 kapsula',
    description: 'Keng ta’sirli antibakterial vosita',
    batches: [
      {
        id: 'b_02',
        productId: 'prod_02',
        batchNumber: 'JB-8841',
        expiryDate: '2026-11-20',
        quantity: 42,
        purchasePrice: 14000,
        receivedDate: '2026-01-12',
      },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'prod_03',
    name: 'No-Shpa 40mg',
    barcode: '4601669002233',
    sku: 'MED-NOS-040',
    category: 'Spazmolitiklar',
    unit: 'quti',
    purchasePrice: 22000,
    sellingPrice: 31000,
    minStock: 10,
    currentStock: 18,
    supplierId: 'sup_01',
    supplierName: 'Nobel Pharmsanoat QK',
    manufacturer: 'Chinoin / Sanofi',
    dosage: '40 mg, 24 tabletka',
    batches: [
      {
        id: 'b_03',
        productId: 'prod_03',
        batchNumber: 'SN-4091',
        expiryDate: '2027-08-30',
        quantity: 18,
        purchasePrice: 22000,
        receivedDate: '2026-01-14',
      },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'prod_04',
    name: 'Mezim Forte 10000',
    barcode: '4008429012345',
    sku: 'MED-MZM-10K',
    category: 'Hazm qilish fermentlari',
    unit: 'quti',
    purchasePrice: 38000,
    sellingPrice: 49000,
    minStock: 12,
    currentStock: 8, // Low stock!
    supplierId: 'sup_01',
    supplierName: 'Nobel Pharmsanoat QK',
    manufacturer: 'Berlin-Chemie AG',
    dosage: '10000 TB, 20 tabletka',
    batches: [
      {
        id: 'b_04',
        productId: 'prod_04',
        batchNumber: 'BC-2024-X',
        expiryDate: '2026-10-15',
        quantity: 8,
        purchasePrice: 38000,
        receivedDate: '2026-01-05',
      },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'prod_05',
    name: 'Sitramon P',
    barcode: '4780003450091',
    sku: 'MED-CIT-P',
    category: 'Dorilar (Kombinatsiyalangan)',
    unit: 'quti',
    purchasePrice: 3000,
    sellingPrice: 5000,
    minStock: 30,
    currentStock: 120,
    supplierId: 'sup_02',
    supplierName: 'Jurabek Laboratories',
    manufacturer: 'Remedy Group',
    dosage: '10 tabletka',
    batches: [
      {
        id: 'b_05',
        productId: 'prod_05',
        batchNumber: 'RG-2026-A',
        expiryDate: '2028-01-10',
        quantity: 120,
        purchasePrice: 3000,
        receivedDate: '2026-01-18',
      },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'prod_06',
    name: 'Voltaren Emulgel 1%',
    barcode: '7680387580015',
    sku: 'MED-VLT-050',
    category: 'Yallig‘lanishga qarshi vositalar',
    unit: 'tubik',
    purchasePrice: 55000,
    sellingPrice: 72000,
    minStock: 5,
    currentStock: 14,
    supplierId: 'sup_01',
    supplierName: 'Nobel Pharmsanoat QK',
    manufacturer: 'GlaxoSmithKline (GSK)',
    dosage: '1% gel, 50g',
    batches: [
      {
        id: 'b_06',
        productId: 'prod_06',
        batchNumber: 'GSK-552',
        expiryDate: '2026-12-01',
        quantity: 14,
        purchasePrice: 55000,
        receivedDate: '2026-01-20',
      },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'prod_07',
    name: 'Coca-Cola Classic 0.5L',
    barcode: '5449000000996',
    sku: 'BEV-COC-050',
    category: 'Ichimliklar',
    unit: 'dona',
    purchasePrice: 5200,
    sellingPrice: 7000,
    minStock: 24,
    currentStock: 96,
    supplierId: 'sup_03',
    supplierName: 'Coca-Cola Bottlers Uzbekistan',
    manufacturer: 'Coca-Cola Ichimligi Uzbekiston',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'prod_08',
    name: 'Coca-Cola Classic 1.5L',
    barcode: '5449000000439',
    sku: 'BEV-COC-150',
    category: 'Ichimliklar',
    unit: 'dona',
    purchasePrice: 10500,
    sellingPrice: 14000,
    minStock: 20,
    currentStock: 48,
    supplierId: 'sup_03',
    supplierName: 'Coca-Cola Bottlers Uzbekistan',
    manufacturer: 'Coca-Cola Ichimligi Uzbekiston',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'prod_09',
    name: 'Nutella 350g',
    barcode: '3017620422003',
    sku: 'GRC-NUT-350',
    category: 'Oziq-ovqat',
    unit: 'banka',
    purchasePrice: 42000,
    sellingPrice: 54000,
    minStock: 10,
    currentStock: 0, // Out of stock!
    supplierId: 'sup_04',
    supplierName: 'Nestle Central Asia LLC',
    manufacturer: 'Ferrero SpA',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: 'prod_10',
    name: 'Nestle Choco Milk 100g',
    barcode: '4820000190112',
    sku: 'GRC-NES-100',
    category: 'Shirinliklar',
    unit: 'dona',
    purchasePrice: 11000,
    sellingPrice: 15000,
    minStock: 15,
    currentStock: 35,
    supplierId: 'sup_04',
    supplierName: 'Nestle Central Asia LLC',
    manufacturer: 'Nestle S.A.',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
];

const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp_01',
    name: 'Bino oylik ijarasi',
    category: 'Rent',
    amount: 6000000,
    date: '2026-02-01',
    createdById: 'user_admin',
    createdByName: 'Dilshod Rahimov',
    note: 'Fevral oyi uchun ijara to‘lovi',
  },
  {
    id: 'exp_02',
    name: 'Elektr energiyasi to‘lovi',
    category: 'Electricity',
    amount: 850000,
    date: '2026-02-05',
    createdById: 'user_admin',
    createdByName: 'Dilshod Rahimov',
    note: 'Shahar elektr tarmoqlari',
  },
  {
    id: 'exp_03',
    name: 'Optik tolali internet (Sarkor Telecom)',
    category: 'Internet',
    amount: 350000,
    date: '2026-02-05',
    createdById: 'user_admin',
    createdByName: 'Dilshod Rahimov',
  },
  {
    id: 'exp_04',
    name: 'Dorixona xodimlari oylik maoshi',
    category: 'Salary',
    amount: 9500000,
    date: '2026-02-08',
    createdById: 'user_admin',
    createdByName: 'Dilshod Rahimov',
    note: 'Avans va oylik maoshlar',
  },
  {
    id: 'exp_05',
    name: 'Yetkazib berish va transport xarajati',
    category: 'Transport',
    amount: 420000,
    date: '2026-02-12',
    createdById: 'user_manager',
    createdByName: 'Malika Karimova',
  },
];

const DEFAULT_PURCHASES: Purchase[] = [
  {
    id: 'pur_01',
    invoiceNumber: 'INV-2026-001',
    supplierId: 'sup_01',
    supplierName: 'Nobel Pharmsanoat QK',
    items: [
      {
        id: 'pi_01',
        productId: 'prod_01',
        productName: 'Paracetamol 500mg',
        barcode: '4780001230018',
        quantity: 100,
        purchasePrice: 6500,
        totalCost: 650000,
        batchNumber: 'NB-2025-09',
        expiryDate: '2027-05-15',
      },
      {
        id: 'pi_02',
        productId: 'prod_03',
        productName: 'No-Shpa 40mg',
        barcode: '4601669002233',
        quantity: 25,
        purchasePrice: 22000,
        totalCost: 550000,
        batchNumber: 'SN-4091',
        expiryDate: '2027-08-30',
      },
    ],
    totalAmount: 1200000,
    paidAmount: 1200000,
    debtAmount: 0,
    paymentMethod: 'transfer',
    date: '2026-01-15T10:30:00.000Z',
    createdById: 'user_manager',
    createdByName: 'Malika Karimova',
    notes: 'Birlamchi partiya',
  },
  {
    id: 'pur_02',
    invoiceNumber: 'INV-2026-002',
    supplierId: 'sup_03',
    supplierName: 'Coca-Cola Bottlers Uzbekistan',
    items: [
      {
        id: 'pi_03',
        productId: 'prod_07',
        productName: 'Coca-Cola Classic 0.5L',
        barcode: '5449000000996',
        quantity: 120,
        purchasePrice: 5200,
        totalCost: 624000,
      },
      {
        id: 'pi_04',
        productId: 'prod_08',
        productName: 'Coca-Cola Classic 1.5L',
        barcode: '5449000000439',
        quantity: 60,
        purchasePrice: 10500,
        totalCost: 630000,
      },
    ],
    totalAmount: 1254000,
    paidAmount: 1254000,
    debtAmount: 0,
    paymentMethod: 'transfer',
    date: '2026-01-18T14:20:00.000Z',
    createdById: 'user_admin',
    createdByName: 'Dilshod Rahimov',
  },
];

const DEFAULT_SALES: Sale[] = [
  {
    id: 'sale_01',
    receiptNumber: 'CHK-1001',
    customerId: 'cust_01',
    customerName: 'Umumiy xaridor (Oddiy)',
    items: [
      {
        id: 'si_01',
        productId: 'prod_01',
        productName: 'Paracetamol 500mg',
        barcode: '4780001230018',
        unit: 'quti',
        quantity: 5,
        sellingPrice: 9500,
        purchasePrice: 6500,
        totalAmount: 47500,
        totalCost: 32500,
        profit: 15000,
      },
      {
        id: 'si_02',
        productId: 'prod_07',
        productName: 'Coca-Cola Classic 0.5L',
        barcode: '5449000000996',
        unit: 'dona',
        quantity: 4,
        sellingPrice: 7000,
        purchasePrice: 5200,
        totalAmount: 28000,
        totalCost: 20800,
        profit: 7200,
      },
    ],
    subtotal: 75500,
    discount: 0,
    totalAmount: 75500,
    totalCost: 53300,
    profit: 22200,
    paymentMethod: 'cash',
    paidAmount: 75500,
    debtAmount: 0,
    date: '2026-02-15T11:45:00.000Z',
    createdById: 'user_cashier',
    createdByName: 'Anvar Zokirov (Kassir)',
    status: 'completed',
  },
  {
    id: 'sale_02',
    receiptNumber: 'CHK-1002',
    customerId: 'cust_02',
    customerName: 'Akmal Karimov (Doimiy mijoz)',
    items: [
      {
        id: 'si_03',
        productId: 'prod_02',
        productName: 'Amoksitsillin 500mg',
        barcode: '4780001230025',
        unit: 'quti',
        quantity: 2,
        sellingPrice: 21000,
        purchasePrice: 14000,
        totalAmount: 42000,
        totalCost: 28000,
        profit: 14000,
      },
      {
        id: 'si_04',
        productId: 'prod_03',
        productName: 'No-Shpa 40mg',
        barcode: '4601669002233',
        unit: 'quti',
        quantity: 1,
        sellingPrice: 31000,
        purchasePrice: 22000,
        totalAmount: 31000,
        totalCost: 22000,
        profit: 9000,
      },
    ],
    subtotal: 73000,
    discount: 3000,
    totalAmount: 70000,
    totalCost: 50000,
    profit: 20000,
    paymentMethod: 'card',
    paidAmount: 70000,
    debtAmount: 0,
    date: '2026-02-16T16:15:00.000Z',
    createdById: 'user_cashier',
    createdByName: 'Anvar Zokirov (Kassir)',
    status: 'completed',
  },
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit_01',
    action: 'CREATE',
    module: 'SETTINGS',
    details: 'Tizim ishga tushirildi va asosiy ma’lumotlar yuklandi.',
    userId: 'user_admin',
    userName: 'Dilshod Rahimov (Admin)',
    timestamp: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'audit_02',
    action: 'CREATE',
    module: 'PURCHASES',
    details: 'Kirim hujjati yaratildi: INV-2026-001 (Nobel Pharmsanoat)',
    userId: 'user_manager',
    userName: 'Malika Karimova (Menejer)',
    timestamp: '2026-01-15T10:30:00.000Z',
  },
];

// Helper to load or initialize from localStorage
function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'null' || raw === 'undefined') {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return parsed as T;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

export class BusinessDB {
  // Profile
  static getProfile(): BusinessProfile {
    const profile = getStorage<BusinessProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    if (!profile || !profile.name) {
      return DEFAULT_PROFILE;
    }
    return profile;
  }

  static updateProfile(profile: Partial<BusinessProfile>, currentUser?: User): BusinessProfile {
    const current = this.getProfile();
    const updated: BusinessProfile = { ...current, ...profile };
    setStorage(STORAGE_KEYS.PROFILE, updated);

    if (currentUser) {
      this.addAuditLog('UPDATE', 'SETTINGS', `Tashkilot profili yangilandi: ${updated.name}`, currentUser);
    }
    return updated;
  }

  // Users
  static getUsers(): User[] {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    if (!Array.isArray(users) || users.length === 0) {
      return DEFAULT_USERS;
    }
    return users;
  }

  static getCurrentUser(): User {
    const users = this.getUsers();
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        if (parsed && parsed.id) {
          const found = users.find((u) => u.id === parsed.id);
          if (found && found.name) return found;
          if (parsed.name) return parsed;
        }
      } catch {}
    }
    return users[0] || DEFAULT_USERS[0];
  }

  static setCurrentUser(user: User): void {
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
  }

  static saveUser(user: User, currentUser: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
      this.addAuditLog('UPDATE', 'USERS', `Foydalanuvchi yangilandi: ${user.name} (${user.role})`, currentUser);
    } else {
      users.push(user);
      this.addAuditLog('CREATE', 'USERS', `Yangi xodim qo‘shildi: ${user.name} (${user.role})`, currentUser);
    }
    setStorage(STORAGE_KEYS.USERS, users);
  }

  // Products
  static getProducts(): Product[] {
    return getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  }

  static getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  static getProductByBarcode(barcode: string): Product | undefined {
    const clean = barcode.trim();
    if (!clean) return undefined;
    return this.getProducts().find((p) => p.barcode === clean);
  }

  static addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, currentUser: User): { success: boolean; product?: Product; error?: string } {
    const products = this.getProducts();

    // Check duplicate barcode
    if (product.barcode && product.barcode.trim()) {
      const existing = products.find((p) => p.barcode.trim() === product.barcode.trim());
      if (existing) {
        return {
          success: false,
          error: `BU MAHSULOT ALLAQACHON MAVJUD! "${existing.name}" (Shtrix-kod: ${existing.barcode}). Iltimos, mavjud mahsulotni oching.`,
          product: existing,
        };
      }
    }

    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.push(newProduct);
    setStorage(STORAGE_KEYS.PRODUCTS, products);

    this.addAuditLog('CREATE', 'PRODUCTS', `Yangi mahsulot qo‘shildi: ${newProduct.name} (SKU: ${newProduct.sku})`, currentUser);

    return { success: true, product: newProduct };
  }

  static updateProduct(product: Product, currentUser: User): void {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = { ...product, updatedAt: new Date().toISOString() };
      setStorage(STORAGE_KEYS.PRODUCTS, products);
      this.addAuditLog('UPDATE', 'PRODUCTS', `Mahsulot tahrirlandi: ${product.name}`, currentUser);
    }
  }

  static deleteProduct(productId: string, currentUser: User): { success: boolean; error?: string } {
    if (currentUser.role !== 'admin') {
      return { success: false, error: 'Faqatgina Administrator mahsulotlarni o‘chirish huquqiga ega!' };
    }

    const products = this.getProducts();
    const target = products.find((p) => p.id === productId);
    if (!target) return { success: false, error: 'Mahsulot topilmadi' };

    const filtered = products.filter((p) => p.id !== productId);
    setStorage(STORAGE_KEYS.PRODUCTS, filtered);

    this.addAuditLog('DELETE', 'PRODUCTS', `Mahsulot o‘chirildi: ${target.name} (Shtrix-kod: ${target.barcode})`, currentUser);

    return { success: true };
  }

  static adjustStock(productId: string, newStock: number, reason: string, currentUser: User): void {
    const products = this.getProducts();
    const target = products.find((p) => p.id === productId);
    if (target) {
      const oldStock = target.currentStock;
      target.currentStock = newStock;
      target.updatedAt = new Date().toISOString();
      setStorage(STORAGE_KEYS.PRODUCTS, products);

      this.addAuditLog(
        'ADJUST',
        'INVENTORY',
        `Inventarizatsiya / Qoldiq to‘g‘rilandi: ${target.name} (${oldStock} -> ${newStock}). Sabab: ${reason}`,
        currentUser
      );
    }
  }

  // Purchases (Kirim)
  static getPurchases(): Purchase[] {
    return getStorage<Purchase[]>(STORAGE_KEYS.PURCHASES, DEFAULT_PURCHASES);
  }

  static recordPurchase(purchaseData: Omit<Purchase, 'id'>, currentUser: User): Purchase {
    const purchases = this.getPurchases();
    const products = this.getProducts();
    const suppliers = this.getSuppliers();

    const purchase: Purchase = {
      ...purchaseData,
      id: `pur_${Date.now()}`,
      createdById: currentUser.id,
      createdByName: currentUser.name,
    };

    // 1. Automatically increase stock and update batch records
    for (const item of purchase.items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        product.currentStock = (product.currentStock || 0) + item.quantity;
        // Optionally update last purchase price
        product.purchasePrice = item.purchasePrice;

        // If batch or expiry date provided (e.g. for pharmacy)
        if (item.batchNumber || item.expiryDate) {
          if (!product.batches) product.batches = [];
          product.batches.push({
            id: `b_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            productId: product.id,
            batchNumber: item.batchNumber || `LOT-${Date.now()}`,
            expiryDate: item.expiryDate || '',
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            receivedDate: purchase.date,
          });
        }
        product.updatedAt = new Date().toISOString();
      }
    }

    // 2. Update Supplier stats and debt
    const supplier = suppliers.find((s) => s.id === purchase.supplierId);
    if (supplier) {
      supplier.totalPurchases = (supplier.totalPurchases || 0) + purchase.totalAmount;
      if (purchase.debtAmount > 0) {
        supplier.currentDebt = (supplier.currentDebt || 0) + purchase.debtAmount;
      }
    }

    purchases.unshift(purchase);

    setStorage(STORAGE_KEYS.PURCHASES, purchases);
    setStorage(STORAGE_KEYS.PRODUCTS, products);
    setStorage(STORAGE_KEYS.SUPPLIERS, suppliers);

    this.addAuditLog(
      'CREATE',
      'PURCHASES',
      `Yangi kirim hujjati saqlandi: ${purchase.invoiceNumber} (${purchase.supplierName}), Jami: ${purchase.totalAmount.toLocaleString()} so‘m`,
      currentUser
    );

    return purchase;
  }

  // Sales (Sotuv / POS)
  static getSales(): Sale[] {
    return getStorage<Sale[]>(STORAGE_KEYS.SALES, DEFAULT_SALES);
  }

  static recordSale(saleData: Omit<Sale, 'id' | 'status'>, currentUser: User): Sale {
    const sales = this.getSales();
    const products = this.getProducts();
    const customers = this.getCustomers();

    const sale: Sale = {
      ...saleData,
      id: `sale_${Date.now()}`,
      status: 'completed',
      createdById: currentUser.id,
      createdByName: currentUser.name,
    };

    // 1. Automatically decrease stock
    for (const item of sale.items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        product.currentStock = Math.max(0, (product.currentStock || 0) - item.quantity);
        product.updatedAt = new Date().toISOString();

        // Reduce batches if available (FIFO)
        if (product.batches && product.batches.length > 0) {
          let remQty = item.quantity;
          for (const batch of product.batches) {
            if (remQty <= 0) break;
            if (batch.quantity >= remQty) {
              batch.quantity -= remQty;
              remQty = 0;
            } else {
              remQty -= batch.quantity;
              batch.quantity = 0;
            }
          }
        }
      }
    }

    // 2. Update Customer history and debt
    if (sale.customerId) {
      const customer = customers.find((c) => c.id === sale.customerId);
      if (customer) {
        customer.totalPurchases = (customer.totalPurchases || 0) + 1;
        customer.totalSpent = (customer.totalSpent || 0) + sale.totalAmount;
        if (sale.debtAmount > 0) {
          customer.currentDebt = (customer.currentDebt || 0) + sale.debtAmount;
        }
      }
    }

    sales.unshift(sale);

    setStorage(STORAGE_KEYS.SALES, sales);
    setStorage(STORAGE_KEYS.PRODUCTS, products);
    setStorage(STORAGE_KEYS.CUSTOMERS, customers);

    this.addAuditLog(
      'CREATE',
      'SALES',
      `Yangi sotuv amalga oshirildi: ${sale.receiptNumber}, Jami: ${sale.totalAmount.toLocaleString()} so‘m, Foyda: ${sale.profit.toLocaleString()} so‘m (${sale.customerName})`,
      currentUser
    );

    return sale;
  }

  // Returns (Qaytarish)
  static getReturns(): ReturnRecord[] {
    return getStorage<ReturnRecord[]>(STORAGE_KEYS.RETURNS, []);
  }

  static recordReturn(returnData: Omit<ReturnRecord, 'id'>, currentUser: User): ReturnRecord {
    const returns = this.getReturns();
    const products = this.getProducts();

    const record: ReturnRecord = {
      ...returnData,
      id: `ret_${Date.now()}`,
      createdById: currentUser.id,
      createdByName: currentUser.name,
    };

    if (record.type === 'customer_return') {
      // Customer returns items -> increase stock back
      for (const item of record.items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          product.currentStock = (product.currentStock || 0) + item.quantity;
        }
      }
    } else {
      // Supplier return -> decrease stock
      for (const item of record.items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          product.currentStock = Math.max(0, (product.currentStock || 0) - item.quantity);
        }
      }
    }

    returns.unshift(record);
    setStorage(STORAGE_KEYS.RETURNS, returns);
    setStorage(STORAGE_KEYS.PRODUCTS, products);

    this.addAuditLog(
      'RETURN',
      'INVENTORY',
      `Mahsulot qaytarildi (${record.type === 'customer_return' ? 'Mijozdan qaytarish' : 'Yetkazib beruvchiga qaytarish'}): ${record.partyName}, Jami: ${record.totalAmount.toLocaleString()} so‘m`,
      currentUser
    );

    return record;
  }

  // Expenses (Xarajatlar)
  static getExpenses(): Expense[] {
    return getStorage<Expense[]>(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
  }

  static addExpense(expenseData: Omit<Expense, 'id'>, currentUser: User): Expense {
    const expenses = this.getExpenses();
    const expense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      createdById: currentUser.id,
      createdByName: currentUser.name,
    };
    expenses.unshift(expense);
    setStorage(STORAGE_KEYS.EXPENSES, expenses);

    this.addAuditLog(
      'CREATE',
      'EXPENSES',
      `Xarajat qo‘shildi: ${expense.name} (${expense.category}) - ${expense.amount.toLocaleString()} so‘m`,
      currentUser
    );

    return expense;
  }

  static deleteExpense(id: string, currentUser: User): { success: boolean; error?: string } {
    if (currentUser.role !== 'admin') {
      return { success: false, error: 'Faqatgina Administrator xarajatlarni o‘chirish huquqiga ega!' };
    }
    const expenses = this.getExpenses();
    const target = expenses.find((e) => e.id === id);
    if (!target) return { success: false, error: 'Xarajat topilmadi' };

    const filtered = expenses.filter((e) => e.id !== id);
    setStorage(STORAGE_KEYS.EXPENSES, filtered);

    this.addAuditLog('DELETE', 'EXPENSES', `Xarajat o‘chirildi: ${target.name} - ${target.amount.toLocaleString()} so‘m`, currentUser);

    return { success: true };
  }

  // Customers (Mijozlar)
  static getCustomers(): Customer[] {
    return getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  }

  static addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'totalSpent' | 'currentDebt'>, currentUser: User): Customer {
    const customers = this.getCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: `cust_${Date.now()}`,
      totalPurchases: 0,
      totalSpent: 0,
      currentDebt: 0,
      createdAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    setStorage(STORAGE_KEYS.CUSTOMERS, customers);

    this.addAuditLog('CREATE', 'CUSTOMERS', `Yangi mijoz qo‘shildi: ${newCustomer.name} (${newCustomer.phone})`, currentUser);

    return newCustomer;
  }

  static updateCustomer(customer: Customer, currentUser: User): void {
    const customers = this.getCustomers();
    const index = customers.findIndex((c) => c.id === customer.id);
    if (index >= 0) {
      customers[index] = customer;
      setStorage(STORAGE_KEYS.CUSTOMERS, customers);
      this.addAuditLog('UPDATE', 'CUSTOMERS', `Mijoz ma’lumotlari yangilandi: ${customer.name}`, currentUser);
    }
  }

  // Suppliers (Yetkazib beruvchilar)
  static getSuppliers(): Supplier[] {
    return getStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, DEFAULT_SUPPLIERS);
  }

  static addSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'totalPurchases' | 'currentDebt'>, currentUser: User): Supplier {
    const suppliers = this.getSuppliers();
    const newSupplier: Supplier = {
      ...supplier,
      id: `sup_${Date.now()}`,
      totalPurchases: 0,
      currentDebt: 0,
      createdAt: new Date().toISOString(),
    };
    suppliers.push(newSupplier);
    setStorage(STORAGE_KEYS.SUPPLIERS, suppliers);

    this.addAuditLog('CREATE', 'SUPPLIERS', `Yangi yetkazib beruvchi qo‘shildi: ${newSupplier.name}`, currentUser);

    return newSupplier;
  }

  // Payments / Debt settlements
  static getPayments(): PaymentTransaction[] {
    return getStorage<PaymentTransaction[]>(STORAGE_KEYS.PAYMENTS, []);
  }

  static recordPayment(paymentData: Omit<PaymentTransaction, 'id'>, currentUser: User): PaymentTransaction {
    const payments = this.getPayments();
    const payment: PaymentTransaction = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      createdById: currentUser.id,
      createdByName: currentUser.name,
    };

    if (payment.type === 'customer_payment') {
      const customers = this.getCustomers();
      const customer = customers.find((c) => c.id === payment.partyId);
      if (customer) {
        customer.currentDebt = Math.max(0, (customer.currentDebt || 0) - payment.amount);
        setStorage(STORAGE_KEYS.CUSTOMERS, customers);
      }
    } else {
      const suppliers = this.getSuppliers();
      const supplier = suppliers.find((s) => s.id === payment.partyId);
      if (supplier) {
        supplier.currentDebt = Math.max(0, (supplier.currentDebt || 0) - payment.amount);
        setStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
      }
    }

    payments.unshift(payment);
    setStorage(STORAGE_KEYS.PAYMENTS, payments);

    this.addAuditLog(
      'PAYMENT',
      payment.type === 'customer_payment' ? 'CUSTOMERS' : 'SUPPLIERS',
      `Qarz to‘lovi qabul qilindi/berildi: ${payment.partyName} - ${payment.amount.toLocaleString()} so‘m (${payment.paymentMethod})`,
      currentUser
    );

    return payment;
  }

  // Audit Logs
  static getAuditLogs(): AuditLog[] {
    return getStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
  }

  static addAuditLog(
    action: AuditLog['action'],
    module: AuditLog['module'],
    details: string,
    currentUser: User
  ): void {
    const logs = this.getAuditLogs();
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action,
      module,
      details,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(log);
    // Keep last 1000 logs
    if (logs.length > 1000) logs.length = 1000;
    setStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // Financial Analytics & Calculations
  static getFinancialSummary() {
    const sales = this.getSales();
    const purchases = this.getPurchases();
    const expenses = this.getExpenses();
    const products = this.getProducts();

    const todayStr = new Date().toISOString().split('T')[0];

    // Total sales revenue
    const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    // Total product cost of items sold (COGS)
    const totalCostOfGoodsSold = sales.reduce((sum, s) => sum + s.totalCost, 0);
    // Gross profit = Sales Revenue - Cost of Sold Products
    const grossProfit = totalSalesRevenue - totalCostOfGoodsSold;

    // Total purchases
    const totalPurchasesCost = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

    // Total expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Net profit = Gross Profit - Business Expenses
    const netProfit = grossProfit - totalExpenses;

    // Today's stats
    const todaySales = sales.filter((s) => s.date.startsWith(todayStr));
    const todaySalesRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const todaySalesCost = todaySales.reduce((sum, s) => sum + s.totalCost, 0);
    const todayGrossProfit = todaySalesRevenue - todaySalesCost;

    const todayExpenses = expenses.filter((e) => e.date.startsWith(todayStr));
    const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const todayNetProfit = todayGrossProfit - todayExpensesTotal;

    // Inventory value
    // Total purchase value of remaining inventory
    const currentInventoryCostValue = products.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0);
    // Total retail value of remaining inventory
    const currentInventoryRetailValue = products.reduce((sum, p) => sum + p.currentStock * p.sellingPrice, 0);
    // Expected profit from remaining inventory
    const expectedProfitFromInventory = currentInventoryRetailValue - currentInventoryCostValue;

    // Stock counts
    const totalProductsCount = products.length;
    const totalStockQuantity = products.reduce((sum, p) => sum + p.currentStock, 0);
    const lowStockProducts = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock);
    const outOfStockProducts = products.filter((p) => p.currentStock === 0);

    // Expiring soon (for pharmacy)
    const now = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(now.getDate() + 90);

    const expiringSoonProducts = products.filter((p) => {
      if (!p.batches || p.batches.length === 0) return false;
      return p.batches.some((b) => {
        if (!b.expiryDate) return false;
        const exp = new Date(b.expiryDate);
        return exp >= now && exp <= ninetyDaysFromNow;
      });
    });

    const expiredProducts = products.filter((p) => {
      if (!p.batches || p.batches.length === 0) return false;
      return p.batches.some((b) => {
        if (!b.expiryDate) return false;
        const exp = new Date(b.expiryDate);
        return exp < now;
      });
    });

    // Debts
    const customers = this.getCustomers();
    const suppliers = this.getSuppliers();
    const totalCustomerDebt = customers.reduce((sum, c) => sum + (c.currentDebt || 0), 0);
    const totalSupplierDebt = suppliers.reduce((sum, s) => sum + (s.currentDebt || 0), 0);

    return {
      totalSalesRevenue,
      totalCostOfGoodsSold,
      grossProfit,
      totalPurchasesCost,
      totalExpenses,
      netProfit,
      todaySalesRevenue,
      todayGrossProfit,
      todayExpensesTotal,
      todayNetProfit,
      currentInventoryCostValue,
      currentInventoryRetailValue,
      expectedProfitFromInventory,
      totalProductsCount,
      totalStockQuantity,
      lowStockProducts,
      outOfStockProducts,
      expiringSoonProducts,
      expiredProducts,
      costOfGoodsSold: totalCostOfGoodsSold,
      totalCustomerDebt,
      totalSupplierDebt,
    };
  }

  // Returns Accessors & Helpers
  static getCustomerReturns(): any[] {
    const returns = this.getReturns();
    return returns
      .filter((r) => r.type === 'customer_return')
      .map((r) => ({
        id: r.id,
        saleId: r.referenceId,
        productId: r.items[0]?.productId || '',
        productName: r.items[0]?.productName || '',
        quantity: r.items.reduce((sum, i) => sum + i.quantity, 0),
        refundAmount: r.totalAmount,
        reason: r.reason,
        date: r.date,
        createdById: r.createdById,
        createdByName: r.createdByName,
      }));
  }

  static getSupplierReturns(): any[] {
    const returns = this.getReturns();
    return returns
      .filter((r) => r.type === 'supplier_return')
      .map((r) => ({
        id: r.id,
        purchaseId: r.referenceId,
        supplierId: '',
        supplierName: r.partyName,
        productId: r.items[0]?.productId || '',
        productName: r.items[0]?.productName || '',
        quantity: r.items.reduce((sum, i) => sum + i.quantity, 0),
        amount: r.totalAmount,
        reason: r.reason,
        date: r.date,
        createdById: r.createdById,
        createdByName: r.createdByName,
      }));
  }

  static recordCustomerReturn(data: any, currentUser: User) {
    return this.recordReturn(
      {
        type: 'customer_return',
        referenceId: data.saleId || '',
        referenceNumber: 'RET-CUST',
        partyName: data.productName,
        items: [
          {
            productId: data.productId,
            productName: data.productName,
            quantity: data.quantity,
            price: data.refundAmount / (data.quantity || 1),
            cost: 0,
          },
        ],
        totalAmount: data.refundAmount,
        reason: data.reason,
        date: data.date,
        createdById: currentUser.id,
        createdByName: currentUser.name,
      },
      currentUser
    );
  }

  static recordSupplierReturn(data: any, currentUser: User) {
    return this.recordReturn(
      {
        type: 'supplier_return',
        referenceId: data.purchaseId || '',
        referenceNumber: 'RET-SUP',
        partyName: data.supplierName,
        items: [
          {
            productId: data.productId,
            productName: data.productName,
            quantity: data.quantity,
            price: data.amount / (data.quantity || 1),
            cost: data.amount / (data.quantity || 1),
          },
        ],
        totalAmount: data.amount,
        reason: data.reason,
        date: data.date,
        createdById: currentUser.id,
        createdByName: currentUser.name,
      },
      currentUser
    );
  }

  static recordCustomerDebtPayment(customerId: string, amount: number, note: string, currentUser: User) {
    const customer = this.getCustomers().find((c) => c.id === customerId);
    return this.recordPayment(
      {
        type: 'customer_payment',
        partyId: customerId,
        partyName: customer?.name || 'Mijoz',
        amount,
        paymentMethod: 'cash',
        date: new Date().toISOString(),
        note,
        createdById: currentUser.id,
        createdByName: currentUser.name,
      },
      currentUser
    );
  }

  static recordSupplierDebtPayment(supplierId: string, amount: number, note: string, currentUser: User) {
    const supplier = this.getSuppliers().find((s) => s.id === supplierId);
    return this.recordPayment(
      {
        type: 'supplier_payment',
        partyId: supplierId,
        partyName: supplier?.name || 'Yetkazib beruvchi',
        amount,
        paymentMethod: 'transfer',
        date: new Date().toISOString(),
        note,
        createdById: currentUser.id,
        createdByName: currentUser.name,
      },
      currentUser
    );
  }

  static addUser(data: any, currentUser: User) {
    const user: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      username: data.username,
      role: data.role,
      phone: data.phone,
      email: data.email,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    return this.saveUser(user, currentUser);
  }

  static saveProfile(profile: BusinessProfile) {
    return this.updateProfile(profile);
  }

  static exportCompleteBackup(): string {
    return this.exportFullDatabase();
  }

  static restoreFromBackup(jsonString: string, currentUser: User) {
    return this.importFullDatabase(jsonString, currentUser);
  }

  static resetToDemo() {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }

  // Database Backup / Restore JSON
  static exportFullDatabase(): string {
    const data = {
      profile: this.getProfile(),
      users: this.getUsers(),
      products: this.getProducts(),
      purchases: this.getPurchases(),
      sales: this.getSales(),
      expenses: this.getExpenses(),
      customers: this.getCustomers(),
      suppliers: this.getSuppliers(),
      returns: this.getReturns(),
      payments: this.getPayments(),
      auditLogs: this.getAuditLogs(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importFullDatabase(jsonString: string, currentUser: User): { success: boolean; error?: string } {
    if (currentUser.role !== 'admin') {
      return { success: false, error: 'Faqatgina Administrator ma’lumotlar bazasini qayta yuklashi mumkin!' };
    }
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) setStorage(STORAGE_KEYS.PROFILE, data.profile);
      if (data.users) setStorage(STORAGE_KEYS.USERS, data.users);
      if (data.products) setStorage(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.purchases) setStorage(STORAGE_KEYS.PURCHASES, data.purchases);
      if (data.sales) setStorage(STORAGE_KEYS.SALES, data.sales);
      if (data.expenses) setStorage(STORAGE_KEYS.EXPENSES, data.expenses);
      if (data.customers) setStorage(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.suppliers) setStorage(STORAGE_KEYS.SUPPLIERS, data.suppliers);
      if (data.returns) setStorage(STORAGE_KEYS.RETURNS, data.returns);
      if (data.payments) setStorage(STORAGE_KEYS.PAYMENTS, data.payments);
      if (data.auditLogs) setStorage(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);

      this.addAuditLog('UPDATE', 'SETTINGS', 'To‘liq ma’lumotlar bazasi zaxiradan qayta tiklandi', currentUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: `JSON faylni o‘qishda xatolik: ${err.message}` };
    }
  }
}

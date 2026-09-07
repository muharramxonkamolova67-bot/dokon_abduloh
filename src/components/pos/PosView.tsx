import React, { useState, useRef, useEffect } from 'react';
import {
  Barcode,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  UserCheck,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  BookOpen,
  CheckCircle2,
  Printer,
  X,
  AlertCircle,
  Package,
} from 'lucide-react';
import { BusinessProfile, Customer, Product, Sale, SaleItem, User } from '../../types';
import { BusinessDB } from '../../services/db';
import { ReceiptModal } from '../modals/ReceiptModal';

interface PosViewProps {
  profile: BusinessProfile;
  currentUser: User;
  onNavigate: (tab: string) => void;
}

export const PosView: React.FC<PosViewProps> = ({ profile, currentUser, onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Barcode quick input
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Cart
  const [cart, setCart] = useState<
    {
      product: Product;
      quantity: number;
      sellingPrice: number;
    }[]
  >([]);

  // Sale metadata
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust_01');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'debt'>('cash');
  const [discount, setDiscount] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<number | ''>('');

  // Receipt Modal
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load data
  const loadData = () => {
    setProducts(BusinessDB.getProducts());
    setCustomers(BusinessDB.getCustomers());
  };

  useEffect(() => {
    loadData();
    // Auto-focus barcode input on load
    barcodeInputRef.current?.focus();
  }, []);

  // Categories
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtered products for quick-select
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.sku.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  // Handle barcode submission (scanner Enter)
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    const found = products.find((p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase());
    if (found) {
      addToCart(found);
      setBarcodeInput('');
    } else {
      setErrorMsg(`Shtrix-kod topilmadi: "${code}". Iltimos, mahsulotlar ro‘yxatidan tekshiring.`);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const addToCart = (product: Product) => {
    setErrorMsg(null);
    if (product.currentStock <= 0) {
      setErrorMsg(`"${product.name}" omborda tugagan (Qoldiq: 0)!`);
      setTimeout(() => setErrorMsg(null), 3000);
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product,
            quantity: 1,
            sellingPrice: product.sellingPrice,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCashTendered('');
    setErrorMsg(null);
    barcodeInputRef.current?.focus();
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
  const grandTotal = Math.max(0, subtotal - discount);
  const totalCost = cart.reduce((sum, item) => sum + item.quantity * item.product.purchasePrice, 0);
  const calculatedProfit = grandTotal - totalCost;

  const changeDue =
    typeof cashTendered === 'number' && cashTendered > grandTotal
      ? cashTendered - grandTotal
      : 0;

  // Complete Sale
  const handleCompleteSale = () => {
    if (cart.length === 0) {
      setErrorMsg('Savat bo‘sh! Iltimos, avval mahsulot qo‘shing.');
      return;
    }

    if (paymentMethod === 'debt' && (!selectedCustomerId || selectedCustomerId === 'cust_01')) {
      setErrorMsg('Nasiya (qarz)ga sotish uchun aniq mijozni tanlashingiz shart!');
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomerId) || {
      id: 'cust_01',
      name: 'Umumiy xaridor (Oddiy)',
    };

    const saleItems: SaleItem[] = cart.map((item, idx) => ({
      id: `si_${Date.now()}_${idx}`,
      productId: item.product.id,
      productName: item.product.name,
      barcode: item.product.barcode,
      unit: item.product.unit,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice,
      purchasePrice: item.product.purchasePrice,
      totalAmount: item.quantity * item.sellingPrice,
      totalCost: item.quantity * item.product.purchasePrice,
      profit: item.quantity * item.sellingPrice - item.quantity * item.product.purchasePrice,
    }));

    const newSale = BusinessDB.recordSale(
      {
        receiptNumber: `CHK-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: customer.id,
        customerName: customer.name,
        items: saleItems,
        subtotal,
        discount,
        totalAmount: grandTotal,
        totalCost,
        profit: calculatedProfit,
        paymentMethod,
        paidAmount: paymentMethod === 'debt' ? 0 : grandTotal,
        debtAmount: paymentMethod === 'debt' ? grandTotal : 0,
        date: new Date().toISOString(),
        createdById: currentUser.id,
        createdByName: currentUser.name,
      },
      currentUser
    );

    // Refresh products stock
    loadData();

    // Show receipt
    setCompletedSale(newSale);
    setIsReceiptOpen(true);
    clearCart();
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-4">
      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          barcodeInputRef.current?.focus();
        }}
        sale={completedSale}
        profile={profile}
      />

      {/* Left Column: Barcode & Product Catalog (60%) */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {/* Top: Barcode Scanner Input */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center gap-3">
          <form onSubmit={handleBarcodeSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Barcode className="w-5 h-5 text-blue-600 dark:text-blue-400 absolute left-3 top-2.5" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Shtrix-kod skanerlang yoki kiriting (Enter bosing)..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Qo‘shish
            </button>
          </form>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {/* Search by name */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mahsulot nomi yoki SKU bo‘yicha izlash..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'All' ? 'Barchasi' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.currentStock <= 0;
            const isLowStock = p.currentStock > 0 && p.currentStock <= p.minStock;

            return (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className={`text-left p-3 rounded-xl border flex flex-col justify-between transition-all group relative cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] text-slate-400 font-mono truncate">{p.sku}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        isOutOfStock
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isOutOfStock ? '0 qoldiq' : `${p.currentStock} ${p.unit}`}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                    {p.name}
                  </h4>
                  {p.dosage && <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.dosage}</p>}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                    {p.sellingPrice.toLocaleString()} {profile.currency}
                  </span>
                  <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Cart & Checkout (40%) */}
      <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {/* Cart Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Savat ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              Tozalash
            </button>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="m-3 p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs">Savat bo‘sh. Shtrix-kod skanerlang yoki mahsulot tanlang.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.product.name}
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    {item.sellingPrice.toLocaleString()} x {item.quantity} ={' '}
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {(item.quantity * item.sellingPrice).toLocaleString()}
                    </span>
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product.id, Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-10 text-center py-0.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded"
                  />
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer & Payment Section */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
          {/* Customer select */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Mijoz (Customer)
              </label>
              <button
                onClick={() => onNavigate('mijozlar')}
                className="text-[10px] text-blue-600 hover:underline"
              >
                + Yangi mijoz
              </button>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.currentDebt > 0 ? `(Qarz: ${c.currentDebt.toLocaleString()} so‘m)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              To‘lov Usuli
            </label>
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-1.5 text-[11px] rounded-lg font-bold flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Naqd</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-1.5 text-[11px] rounded-lg font-bold flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  paymentMethod === 'card'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Karta</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`py-1.5 text-[11px] rounded-lg font-bold flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  paymentMethod === 'transfer'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>O‘tkazma</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('debt')}
                className={`py-1.5 text-[11px] rounded-lg font-bold flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  paymentMethod === 'debt'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Nasiya</span>
              </button>
            </div>
          </div>

          {/* Discount & Cash Tendered */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Chegirma (so‘m)</span>
              <input
                type="number"
                min="0"
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
              />
            </div>
            {paymentMethod === 'cash' && (
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Qabul qilingan naqd</span>
                <input
                  type="number"
                  min="0"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={grandTotal.toString()}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                />
              </div>
            )}
          </div>

          {/* Change to return */}
          {paymentMethod === 'cash' && changeDue > 0 && (
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex justify-between items-center text-xs text-emerald-800 dark:text-emerald-300 font-bold">
              <span>Qaytim (Mijozga berish):</span>
              <span>{changeDue.toLocaleString()} {profile.currency}</span>
            </div>
          )}

          {/* Totals Breakdown */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Oraliq summa:</span>
              <span>{subtotal.toLocaleString()} so‘m</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Chegirma:</span>
                <span>-{discount.toLocaleString()} so‘m</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1">
              <span>JAMI:</span>
              <span>{grandTotal.toLocaleString()} {profile.currency}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Kutilayotgan sof foyda:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                +{calculatedProfit.toLocaleString()} so‘m
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCompleteSale}
            disabled={cart.length === 0}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Sotuvni Yakunlash (F12)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

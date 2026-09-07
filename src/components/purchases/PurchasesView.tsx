import React, { useState, useEffect } from 'react';
import {
  PackagePlus,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Barcode,
  Calendar,
  Truck,
  FileText,
  DollarSign,
  Layers,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';
import { BusinessProfile, Product, Purchase, PurchaseItem, Supplier, User } from '../../types';
import { BusinessDB } from '../../services/db';

interface PurchasesViewProps {
  profile: BusinessProfile;
  currentUser: User;
  onNavigate: (tab: string) => void;
  onOpenAddProduct: () => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  profile,
  currentUser,
  onNavigate,
  onOpenAddProduct,
}) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Mode: list vs new incoming goods invoice form
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // Form states
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'debt'>('transfer');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Line items
  const [items, setItems] = useState<
    {
      productId: string;
      productName: string;
      barcode: string;
      quantity: number;
      purchasePrice: number;
      batchNumber?: string;
      expiryDate?: string;
    }[]
  >([]);

  // Add line item input helpers
  const [itemSearch, setItemSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemBatch, setItemBatch] = useState('');
  const [itemExpiry, setItemExpiry] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = () => {
    setPurchases(BusinessDB.getPurchases());
    setProducts(BusinessDB.getProducts());
    setSuppliers(BusinessDB.getSuppliers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const startNewInvoice = () => {
    setIsCreating(true);
    setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
    setSupplierId(suppliers[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setItems([]);
    setNotes('');
    setErrorMsg(null);
  };

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setItemPrice(p.purchasePrice);
    setItemBatch(`LOT-${Date.now().toString().slice(-4)}`);
    setItemSearch('');
  };

  const addItemToInvoice = () => {
    if (!selectedProduct) {
      setErrorMsg('Iltimos, avval mahsulotni tanlang!');
      return;
    }
    if (itemQty <= 0) {
      setErrorMsg('Miqdor 0 dan katta bo‘lishi kerak!');
      return;
    }
    if (itemPrice <= 0) {
      setErrorMsg('Kirim narxi 0 dan katta bo‘lishi kerak!');
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        barcode: selectedProduct.barcode,
        quantity: itemQty,
        purchasePrice: itemPrice,
        batchNumber: itemBatch.trim() || undefined,
        expiryDate: itemExpiry || undefined,
      },
    ]);

    setSelectedProduct(null);
    setItemQty(1);
    setItemPrice(0);
    setItemBatch('');
    setItemExpiry('');
    setErrorMsg(null);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalInvoiceAmount = items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('Kirim qilish uchun kamida bitta mahsulot qo‘shing!');
      return;
    }

    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) {
      setErrorMsg('Iltimos, yetkazib beruvchini tanlang!');
      return;
    }

    const finalPaid =
      paymentMethod === 'debt'
        ? 0
        : typeof paidAmount === 'number'
        ? paidAmount
        : totalInvoiceAmount;
    const finalDebt = Math.max(0, totalInvoiceAmount - finalPaid);

    const purchaseItems: PurchaseItem[] = items.map((item, idx) => ({
      id: `pi_${Date.now()}_${idx}`,
      productId: item.productId,
      productName: item.productName,
      barcode: item.barcode,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
      totalCost: item.quantity * item.purchasePrice,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
    }));

    BusinessDB.recordPurchase(
      {
        invoiceNumber,
        supplierId: supplier.id,
        supplierName: supplier.name,
        items: purchaseItems,
        totalAmount: totalInvoiceAmount,
        paidAmount: finalPaid,
        debtAmount: finalDebt,
        paymentMethod,
        date: new Date(date).toISOString(),
        createdById: currentUser.id,
        createdByName: currentUser.name,
        notes,
      },
      currentUser
    );

    loadData();
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Kirim (Xaridlar va Yangi Yuk Qabul Qilish)
          </h2>
          <p className="text-xs text-slate-500">
            Yetkazib beruvchilardan kelgan tovarlarni qabul qilish, omborni ko‘paytirish va xarajatlarni qayd etish
          </p>
        </div>

        {!isCreating && (
          <div className="flex items-center space-x-2.5">
            <button
              onClick={startNewInvoice}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <PackagePlus className="w-4 h-4" />
              <span>Yangi Kirim Hujjati</span>
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal if viewing an old invoice */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Kirim Fakturasi: {selectedPurchase.invoiceNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Yetkazib beruvchi: {selectedPurchase.supplierName} • Sana: {new Date(selectedPurchase.date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Kiritgan xodim</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPurchase.createdByName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Jami summa</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {selectedPurchase.totalAmount.toLocaleString()} {profile.currency}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">To‘lov holati</span>
                  <span className="font-bold capitalize">{selectedPurchase.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">Mahsulot</th>
                      <th className="p-2.5">Soni</th>
                      <th className="p-2.5">Kirim narxi</th>
                      <th className="p-2.5 text-right">Jami</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedPurchase.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-white">
                          {it.productName}
                          {it.batchNumber && (
                            <span className="block text-[10px] text-slate-400 font-mono">
                              Partiya: {it.batchNumber} {it.expiryDate ? `• Muddati: ${it.expiryDate}` : ''}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono">{it.quantity}</td>
                        <td className="p-2.5">{it.purchasePrice.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                          {it.totalCost.toLocaleString()} {profile.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-xs font-semibold rounded-xl"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW PURCHASE INVOICE FORM */}
      {isCreating ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <PackagePlus className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Yangi Kirim Hujjati (Kirim Fakturasi)
              </h3>
            </div>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Bekor qilish
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Faktura / Hujjat raqami
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Yetkazib beruvchi (Supplier)
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kirim Sanasi</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">To‘lov usuli</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
              >
                <option value="transfer">Bank o‘tkazmasi</option>
                <option value="cash">Naqd pul</option>
                <option value="card">Plastik karta</option>
                <option value="debt">Qarz (Nasiya kirim)</option>
              </select>
            </div>
          </div>

          {/* Add Item Form Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Mahsulot qo‘shish (Pozitsiya)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
              {/* Product picker */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mahsulot tanlang yoki qidiring
                </label>
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const p = products.find((x) => x.id === e.target.value);
                    if (p) handleSelectProduct(p);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-900 dark:text-white"
                >
                  <option value="">-- Mahsulotni tanlang --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.barcode}) • Tan narx: {p.purchasePrice} so‘m
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Keltirilgan Soni
                </label>
                <input
                  type="number"
                  min="1"
                  value={itemQty}
                  onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-mono"
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kirim narxi (so‘m)
                </label>
                <input
                  type="number"
                  min="0"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-semibold"
                />
              </div>

              {/* Add item button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addItemToInvoice}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Qo‘shish</span>
                </button>
              </div>
            </div>

            {/* Pharmacy Partiya & Muddat */}
            {profile.type === 'pharmacy' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                    Seriya / Partiya raqami (Batch)
                  </label>
                  <input
                    type="text"
                    value={itemBatch}
                    onChange={(e) => setItemBatch(e.target.value)}
                    placeholder="LOT-2026-A"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                    Yaroqlilik muddati (Expiry date)
                  </label>
                  <input
                    type="date"
                    value={itemExpiry}
                    onChange={(e) => setItemExpiry(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Current Items in Invoice */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Mahsulot nomi</th>
                  <th className="p-3">Shtrix-kod</th>
                  <th className="p-3">Soni</th>
                  <th className="p-3">Kirim narxi</th>
                  <th className="p-3">Jami summa</th>
                  <th className="p-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      Hali mahsulot qo‘shilmadi. Yuqoridagi paneldan mahsulot tanlang.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {item.productName}
                        {item.batchNumber && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Partiya: {item.batchNumber} {item.expiryDate ? `• Muddat: ${item.expiryDate}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{item.barcode}</td>
                      <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{item.quantity}</td>
                      <td className="p-3">{item.purchasePrice.toLocaleString()} so‘m</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {(item.quantity * item.purchasePrice).toLocaleString()} so‘m
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary & Save */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-xs text-slate-500 block">JAMI KIRIM QIYMATI:</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {totalInvoiceAmount.toLocaleString()} {profile.currency}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSaveInvoice}
                disabled={items.length === 0}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kirimni Saqlash va Omborni Yangilash</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* PURCHASES HISTORY TABLE */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Barcha Kirim Hujjatlari Tarixi ({purchases.length})
            </h3>
            <span className="text-xs text-slate-500">
              Jami xarid: {purchases.reduce((s, p) => s + p.totalAmount, 0).toLocaleString()} {profile.currency}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Faktura #</th>
                  <th className="p-3.5">Sana</th>
                  <th className="p-3.5">Yetkazib beruvchi</th>
                  <th className="p-3.5">Pozitsiyalar</th>
                  <th className="p-3.5">Jami Summa</th>
                  <th className="p-3.5">To‘lov Usuli</th>
                  <th className="p-3.5">Kiritgan xodim</th>
                  <th className="p-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-blue-600 dark:text-blue-400">
                      {p.invoiceNumber}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(p.date).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-white">{p.supplierName}</td>
                    <td className="p-3.5 text-slate-500">{p.items.length} xil tovar</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {p.totalAmount.toLocaleString()} {profile.currency}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{p.createdByName}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedPurchase(p)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Tafsilot</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

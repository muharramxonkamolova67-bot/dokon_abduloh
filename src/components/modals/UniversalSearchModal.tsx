import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Boxes,
  Users,
  Truck,
  Receipt,
  PackagePlus,
  ArrowRight,
} from 'lucide-react';
import { BusinessDB } from '../../services/db';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, entityId?: string) => void;
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  const products = useMemo(() => BusinessDB.getProducts(), [isOpen]);
  const customers = useMemo(() => BusinessDB.getCustomers(), [isOpen]);
  const suppliers = useMemo(() => BusinessDB.getSuppliers(), [isOpen]);
  const sales = useMemo(() => BusinessDB.getSales(), [isOpen]);
  const purchases = useMemo(() => BusinessDB.getPurchases(), [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedProducts = (products || []).filter(
      (p) =>
        (p?.name || '').toLowerCase().includes(q) ||
        (p?.barcode || '').includes(q) ||
        (p?.sku || '').toLowerCase().includes(q) ||
        (p?.category || '').toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedCustomers = (customers || []).filter(
      (c) => (c?.name || '').toLowerCase().includes(q) || (c?.phone || '').includes(q)
    ).slice(0, 4);

    const matchedSuppliers = (suppliers || []).filter(
      (s) => (s?.name || '').toLowerCase().includes(q) || (s?.phone || '').includes(q)
    ).slice(0, 4);

    const matchedSales = (sales || []).filter(
      (s) => (s?.receiptNumber || '').toLowerCase().includes(q) || (s?.customerName || '').toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedPurchases = (purchases || []).filter(
      (p) => (p?.invoiceNumber || '').toLowerCase().includes(q) || (p?.supplierName || '').toLowerCase().includes(q)
    ).slice(0, 4);

    return {
      products: matchedProducts,
      customers: matchedCustomers,
      suppliers: matchedSuppliers,
      sales: matchedSales,
      purchases: matchedPurchases,
      totalCount:
        matchedProducts.length +
        matchedCustomers.length +
        matchedSuppliers.length +
        matchedSales.length +
        matchedPurchases.length,
    };
  }, [query, products, customers, suppliers, sales, purchases]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Umumiy qidiruv: Mahsulot, shtrix-kod, mijoz, chek..."
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-400 text-sm font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Qidirish uchun mahsulot nomi, shtrix-kod, mijoz yoki faktura raqamini yozing.
            </div>
          ) : results && results.totalCount === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Hech qanday ma’lumot topilmadi: <span className="font-semibold text-slate-600 dark:text-slate-300">"{query}"</span>
            </div>
          ) : (
            results && (
              <>
                {/* Products */}
                {results.products.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-blue-500" /> Mahsulotlar ({results.products.length})
                    </p>
                    <div className="space-y-1.5">
                      {results.products.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onNavigate('mahsulotlar', p.id);
                            onClose();
                          }}
                          className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700/60 rounded-xl cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">{p.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              Barkod: {p.barcode} • SKU: {p.sku} • Qoldiq: {p.currentStock} {p.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {p.sellingPrice.toLocaleString()} so‘m
                            </p>
                            <span className="text-[10px] text-slate-400">{p.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customers */}
                {results.customers.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-500" /> Mijozlar ({results.customers.length})
                    </p>
                    <div className="space-y-1.5">
                      {results.customers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            onNavigate('mijozlar', c.id);
                            onClose();
                          }}
                          className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700/60 rounded-xl cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">{c.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{c.phone}</p>
                          </div>
                          <div className="text-right text-[11px]">
                            <p className="font-semibold text-slate-600 dark:text-slate-300">
                              Xaridlar: {c.totalPurchases} ta
                            </p>
                            {c.currentDebt > 0 && (
                              <p className="text-red-500 font-bold">Qarz: {c.currentDebt.toLocaleString()} so‘m</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sales */}
                {results.sales.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-emerald-500" /> Sotuv Cheklari ({results.sales.length})
                    </p>
                    <div className="space-y-1.5">
                      {results.sales.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            onNavigate('sotuv', s.id);
                            onClose();
                          }}
                          className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/60 rounded-xl cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                              Chek #{s.receiptNumber} — {s.customerName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {new Date(s.date).toLocaleString()} • Sotuvchi: {s.createdByName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                              {s.totalAmount.toLocaleString()} so‘m
                            </p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              Foyda: +{s.profit.toLocaleString()} so‘m
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Purchases */}
                {results.purchases.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <PackagePlus className="w-3.5 h-3.5 text-indigo-500" /> Kirim Hujjatlari ({results.purchases.length})
                    </p>
                    <div className="space-y-1.5">
                      {results.purchases.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onNavigate('kirim', p.id);
                            onClose();
                          }}
                          className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/60 rounded-xl cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                              Faktura #{p.invoiceNumber} — {p.supplierName}
                            </p>
                            <p className="text-[11px] text-slate-400">{new Date(p.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                              {p.totalAmount.toLocaleString()} so‘m
                            </p>
                            <span className="text-[10px] text-slate-400">{p.items.length} ta pozitsiya</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

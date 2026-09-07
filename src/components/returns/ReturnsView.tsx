import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Plus,
  Search,
  Package,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  X,
  Truck,
} from 'lucide-react';
import { BusinessProfile, CustomerReturn, Product, Supplier, SupplierReturn, User } from '../../types';
import { BusinessDB } from '../../services/db';

interface ReturnsViewProps {
  profile: BusinessProfile;
  currentUser: User;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({ profile, currentUser }) => {
  const [customerReturns, setCustomerReturns] = useState<CustomerReturn[]>([]);
  const [supplierReturns, setSupplierReturns] = useState<SupplierReturn[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'customer' | 'supplier'>('customer');

  // Supplier Return Modal
  const [isSupplierReturnModalOpen, setIsSupplierReturnModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [returnQty, setReturnQty] = useState<number>(1);
  const [refundPrice, setRefundPrice] = useState<number>(0);
  const [reason, setReason] = useState('Yaroqsiz / Zararlangan tovar');

  const loadData = () => {
    setCustomerReturns(BusinessDB.getCustomerReturns());
    setSupplierReturns(BusinessDB.getSupplierReturns());
    setProducts(BusinessDB.getProducts());
    setSuppliers(BusinessDB.getSuppliers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSupplierReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === selectedProductId);
    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!product || !supplier) return;

    BusinessDB.recordSupplierReturn(
      {
        purchaseId: '',
        supplierId: supplier.id,
        supplierName: supplier.name,
        productId: product.id,
        productName: product.name,
        quantity: returnQty,
        amount: returnQty * refundPrice,
        reason,
        date: new Date().toISOString(),
        createdById: currentUser.id,
        createdByName: currentUser.name,
      },
      currentUser
    );

    loadData();
    setIsSupplierReturnModalOpen(false);
    setSelectedProductId('');
    setReturnQty(1);
    setRefundPrice(0);
  };

  return (
    <div className="space-y-6">
      {/* Supplier Return Modal */}
      {isSupplierReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleSupplierReturnSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Yetkazib Beruvchiga Qaytarish (Vozvrat)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSupplierReturnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Yetkazib beruvchi *</label>
                <select
                  required
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="">-- Tanlang --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Qaytariladigan mahsulot *</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((x) => x.id === e.target.value);
                    if (p) setRefundPrice(p.purchasePrice);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="">-- Mahsulot tanlang --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Omborda: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Soni</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={returnQty}
                    onChange={(e) => setReturnQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Narxi (so‘m)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={refundPrice}
                    onChange={(e) => setRefundPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Qaytarish sababi</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsSupplierReturnModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 text-white"
              >
                Qaytarishni Saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Qaytarishlar Jurnali (Returns & Refunds)
          </h2>
          <p className="text-xs text-slate-500">
            Mijozlardan qaytarilgan tovarlar va zavodga yuborilgan nuqsonli tovarlar hisobi
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSupplierReturnModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Yetkazib Beruvchiga Qaytarish</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('customer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSubTab === 'customer'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Mijoz Qaytarishlari ({customerReturns.length})
        </button>
        <button
          onClick={() => setActiveSubTab('supplier')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSubTab === 'supplier'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Yetkazib Beruvchiga Qaytarishlar ({supplierReturns.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {activeSubTab === 'customer' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b">
                <tr>
                  <th className="p-3.5">Sana</th>
                  <th className="p-3.5">Mahsulot</th>
                  <th className="p-3.5">Qaytarilgan Soni</th>
                  <th className="p-3.5">Mijozga Qaytarilgan Summa</th>
                  <th className="p-3.5">Sababi</th>
                  <th className="p-3.5">Qabul qilgan xodim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customerReturns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      Hozircha mijozlardan qaytarishlar qayd etilmagan.
                    </td>
                  </tr>
                ) : (
                  customerReturns.map((cr) => (
                    <tr key={cr.id}>
                      <td className="p-3.5 text-slate-500">
                        {new Date(cr.date).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{cr.productName}</td>
                      <td className="p-3.5 font-bold font-mono text-emerald-600">+{cr.quantity} (omborga)</td>
                      <td className="p-3.5 font-bold text-rose-600 font-mono">
                        -{cr.refundAmount.toLocaleString()} {profile.currency}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{cr.reason}</td>
                      <td className="p-3.5 text-slate-500">{cr.createdByName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b">
                <tr>
                  <th className="p-3.5">Sana</th>
                  <th className="p-3.5">Yetkazib Beruvchi</th>
                  <th className="p-3.5">Mahsulot</th>
                  <th className="p-3.5">Qaytarilgan Soni</th>
                  <th className="p-3.5">Qoplangan Summa</th>
                  <th className="p-3.5">Sababi</th>
                  <th className="p-3.5">Xodim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {supplierReturns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      Hozircha yetkazib beruvchiga qaytarishlar yo‘q.
                    </td>
                  </tr>
                ) : (
                  supplierReturns.map((sr) => (
                    <tr key={sr.id}>
                      <td className="p-3.5 text-slate-500">
                        {new Date(sr.date).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{sr.supplierName}</td>
                      <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{sr.productName}</td>
                      <td className="p-3.5 font-bold font-mono text-rose-600">-{sr.quantity} (ombordan)</td>
                      <td className="p-3.5 font-bold text-emerald-600 font-mono">
                        +{sr.amount.toLocaleString()} {profile.currency}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{sr.reason}</td>
                      <td className="p-3.5 text-slate-500">{sr.createdByName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

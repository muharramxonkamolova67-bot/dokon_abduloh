import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  Eye,
  RotateCcw,
  X,
  Filter,
} from 'lucide-react';
import { BusinessProfile, Sale, User } from '../../types';
import { BusinessDB } from '../../services/db';
import { ReceiptModal } from '../modals/ReceiptModal';
import { ExcelService } from '../../services/excelService';

interface SalesViewProps {
  profile: BusinessProfile;
  currentUser: User;
  initialSaleId?: string;
}

export const SalesView: React.FC<SalesViewProps> = ({ profile, currentUser, initialSaleId }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Return modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnItemProduct, setReturnItemProduct] = useState('');
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState('Mijoz mahsulotni qaytardi');

  const loadData = () => {
    const list = BusinessDB.getSales();
    setSales(list);

    if (initialSaleId) {
      const found = list.find((s) => s.id === initialSaleId);
      if (found) setSelectedSale(found);
    }
  };

  useEffect(() => {
    loadData();
  }, [initialSaleId]);

  // Filters
  const filteredSales = sales.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.receiptNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.createdByName.toLowerCase().includes(q) ||
      s.items.some((it) => it.productName.toLowerCase().includes(q));

    const matchesPayment = paymentFilter === 'ALL' || s.paymentMethod === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalCost = filteredSales.reduce((sum, s) => sum + s.totalCost, 0);
  const totalProfit = filteredSales.reduce((sum, s) => sum + s.profit, 0);
  const avgBasket = filteredSales.length > 0 ? Math.round(totalRevenue / filteredSales.length) : 0;

  const handleExportExcel = () => {
    ExcelService.exportSalesToExcel(filteredSales);
  };

  const handleRePrint = (sale: Sale) => {
    setSelectedSale(sale);
    setIsReceiptOpen(true);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale || !returnItemProduct) return;

    const item = selectedSale.items.find((i) => i.productId === returnItemProduct);
    if (!item) return;

    BusinessDB.recordCustomerReturn(
      {
        saleId: selectedSale.id,
        productId: item.productId,
        productName: item.productName,
        quantity: Math.min(returnQuantity, item.quantity),
        refundAmount: Math.min(returnQuantity, item.quantity) * item.sellingPrice,
        reason: returnReason,
        date: new Date().toISOString(),
        createdById: currentUser.id,
        createdByName: currentUser.name,
      },
      currentUser
    );

    loadData();
    setIsReturnModalOpen(false);
    setSelectedSale(null);
  };

  return (
    <div className="space-y-6">
      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={selectedSale}
        profile={profile}
      />

      {/* Sale Details Dialog */}
      {selectedSale && !isReceiptOpen && !isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Chek Tafsilotlari: {selectedSale.receiptNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {new Date(selectedSale.date).toLocaleString()} • Kassir: {selectedSale.createdByName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              {/* Financial Quick Box */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tushum (Sotuv)</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {selectedSale.totalAmount.toLocaleString()} {profile.currency}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tan narxi (COGS)</span>
                  <span className="text-base font-bold text-slate-600 dark:text-slate-400">
                    {selectedSale.totalCost.toLocaleString()} {profile.currency}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sof foyda</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    +{selectedSale.profit.toLocaleString()} {profile.currency}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">Mahsulot</th>
                      <th className="p-2.5">Soni</th>
                      <th className="p-2.5">Sotish narxi</th>
                      <th className="p-2.5">Tan narxi</th>
                      <th className="p-2.5">Foyda</th>
                      <th className="p-2.5 text-right">Jami</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedSale.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-white">
                          {it.productName}
                          <span className="block text-[10px] text-slate-400 font-mono">{it.barcode}</span>
                        </td>
                        <td className="p-2.5 font-bold text-blue-600">
                          {it.quantity} {it.unit}
                        </td>
                        <td className="p-2.5">{it.sellingPrice.toLocaleString()}</td>
                        <td className="p-2.5 text-slate-400">{it.purchasePrice.toLocaleString()}</td>
                        <td className="p-2.5 text-emerald-600 font-semibold">+{it.profit.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                          {it.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <button
                onClick={() => setIsReturnModalOpen(true)}
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mijozdan qaytarish (Refund)</span>
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsReceiptOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Chekni Chop Etish</span>
                </button>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-xs font-semibold rounded-xl"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Return Modal */}
      {isReturnModalOpen && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleConfirmReturn}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Tovarni Qaytarishni Rasmiylashtirish</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Qaytarilayotgan Mahsulot</label>
                <select
                  required
                  value={returnItemProduct}
                  onChange={(e) => {
                    setReturnItemProduct(e.target.value);
                    const it = selectedSale.items.find((i) => i.productId === e.target.value);
                    if (it) setReturnQuantity(it.quantity);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="">-- Mahsulot tanlang --</option>
                  {selectedSale.items.map((it) => (
                    <option key={it.productId} value={it.productId}>
                      {it.productName} ({it.quantity} {it.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Qaytarilgan soni</label>
                <input
                  type="number"
                  min="1"
                  value={returnQuantity}
                  onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Qaytarish sababi</label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white"
              >
                Qaytarishni Tasdiqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Sotuvlar Tarixi va Buxgalteriya Qaydlari
          </h2>
          <p className="text-xs text-slate-500">
            Barcha amalga oshirilgan savdolar, kassa cheklari va har bir operatsiyadan olingan sof foyda
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Excelga Eksport</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jami Sotuv Tushumi</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {totalRevenue.toLocaleString()} {profile.currency}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{filteredSales.length} ta chek bo‘yicha</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tan Narx (COGS)</span>
          <h3 className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">
            {totalCost.toLocaleString()} {profile.currency}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Sotilgan tovarlar qiymati</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Yalpi Foyda</span>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            +{totalProfit.toLocaleString()} {profile.currency}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Rentabellik: {totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}%
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">O‘rtacha Chek</span>
          <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {avgBasket.toLocaleString()} {profile.currency}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Bitta xaridor hisobiga</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Chek raqami, mijoz yoki tovar nomi bo‘yicha izlash..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">To‘lov:</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
          >
            <option value="ALL">Barcha to‘lovlar</option>
            <option value="cash">Naqd pul</option>
            <option value="card">Plastik karta</option>
            <option value="transfer">Bank o‘tkazmasi</option>
            <option value="debt">Nasiya (Qarz)</option>
          </select>
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Chek raqami</th>
                <th className="p-3.5">Sana va vaqt</th>
                <th className="p-3.5">Mijoz</th>
                <th className="p-3.5">Kassir</th>
                <th className="p-3.5">Mahsulotlar</th>
                <th className="p-3.5">To‘lov Usuli</th>
                <th className="p-3.5">Tushum</th>
                <th className="p-3.5">Sof Foyda</th>
                <th className="p-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Sotuvlar topilmadi.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedSale(s)}
                  >
                    <td className="p-3.5 font-bold font-mono text-blue-600 dark:text-blue-400">
                      {s.receiptNumber}
                    </td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(s.date).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-white">{s.customerName}</td>
                    <td className="p-3.5 text-slate-500">{s.createdByName}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {s.items.length} ta tovar ({s.items.reduce((acc, i) => acc + i.quantity, 0)} dona)
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          s.paymentMethod === 'debt'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {s.totalAmount.toLocaleString()} {profile.currency}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                      +{s.profit.toLocaleString()} {profile.currency}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRePrint(s)}
                          title="Chekni chop etish"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedSale(s)}
                          title="Batafsil ko‘rish"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

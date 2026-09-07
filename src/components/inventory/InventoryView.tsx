import React, { useState, useEffect } from 'react';
import {
  Warehouse,
  AlertTriangle,
  Clock,
  Search,
  Download,
  Plus,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { BusinessProfile, Product, User } from '../../types';
import { BusinessDB } from '../../services/db';
import { ExcelService } from '../../services/excelService';

interface InventoryViewProps {
  profile: BusinessProfile;
  currentUser: User;
  onOpenAddProduct: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  profile,
  currentUser,
  onOpenAddProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW' | 'OUT' | 'EXPIRING'>('ALL');
  const [selectedProductForAdjustment, setSelectedProductForAdjustment] = useState<Product | null>(null);

  // Expanded rows for batch details
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Stock Adjustment Form
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('Inventarizatsiya qayta sanovi');

  const loadData = () => {
    setProducts(BusinessDB.getProducts());
  };

  useEffect(() => {
    loadData();
  }, []);

  const isPharmacy = profile.type === 'pharmacy';

  // Filters
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'LOW') return p.currentStock > 0 && p.currentStock <= p.minStock;
    if (statusFilter === 'OUT') return p.currentStock <= 0;
    if (statusFilter === 'EXPIRING') {
      const now = new Date();
      const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      return (
        p.batches?.some((b) => b.expiryDate && new Date(b.expiryDate) <= in90Days) || false
      );
    }
    return true;
  });

  // Aggregations
  const totalCostValue = products.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + p.currentStock * p.sellingPrice, 0);
  const expectedProfit = totalRetailValue - totalCostValue;
  const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock).length;
  const outOfStockCount = products.filter((p) => p.currentStock <= 0).length;

  const handleOpenAdjustment = (product: Product) => {
    setSelectedProductForAdjustment(product);
    setNewStockValue(product.currentStock);
    setAdjustmentReason('Inventarizatsiya qayta sanovi');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjustment) return;

    BusinessDB.adjustStock(
      selectedProductForAdjustment.id,
      newStockValue,
      adjustmentReason,
      currentUser
    );

    loadData();
    setSelectedProductForAdjustment(null);
  };

  const handleExportExcel = () => {
    ExcelService.exportProductsToExcel(filteredProducts);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Ombor Qoldiqlari va Real-Vaqt Hisobi
          </h2>
          <p className="text-xs text-slate-500">
            Kirim, sotuv, qaytarishlar va inventarizatsiya natijasida hisoblangan aniq qoldiqlar
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Excelga Yuklash</span>
          </button>
          <button
            onClick={onOpenAddProduct}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Mahsulot</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Jami Mahsulot Turlari
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{products.length} xil</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Jami qoldiq: {products.reduce((s, p) => s + p.currentStock, 0)} dona
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Ombor Kirim Qiymati (Tan narx)
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {totalCostValue.toLocaleString()} {profile.currency}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Ombordagi pul miqdori</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Ombor Sotuv Qiymati
          </span>
          <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {totalRetailValue.toLocaleString()} {profile.currency}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Chakana narxda jami</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Kutilayotgan Sof Foyda
          </span>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            +{expectedProfit.toLocaleString()} {profile.currency}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">To‘liq sotilganda olinadigan</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Kam Qolgan / Tugagan
          </span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xl font-black text-amber-600">{lowStockCount} kam</span>
            <span className="text-sm font-bold text-rose-600">/ {outOfStockCount} tugagan</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Buyurtma berish tavsiya etiladi</p>
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
            placeholder="Mahsulot nomi, shtrix-kod yoki kategoriya..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Barchasi ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('LOW')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
              statusFilter === 'LOW'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400'
            }`}
          >
            Kam qolganlar ({lowStockCount})
          </button>
          <button
            onClick={() => setStatusFilter('OUT')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
              statusFilter === 'OUT'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-rose-700 dark:text-rose-400'
            }`}
          >
            Tugaganlar ({outOfStockCount})
          </button>
          {isPharmacy && (
            <button
              onClick={() => setStatusFilter('EXPIRING')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                statusFilter === 'EXPIRING'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-400'
              }`}
            >
              Muddati yaqin dorilar
            </button>
          )}
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProductForAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleSaveAdjustment}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Qoldiqni To‘g‘rilash (Inventarizatsiya)</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProductForAdjustment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">{selectedProductForAdjustment.name}</p>
              <p className="text-slate-500 font-mono">Shtrix-kod: {selectedProductForAdjustment.barcode}</p>
              <p className="text-slate-500">
                Tizimdagi joriy qoldiq:{' '}
                <span className="font-bold text-blue-600">
                  {selectedProductForAdjustment.currentStock} {selectedProductForAdjustment.unit}
                </span>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Haqiqiy sanalgan yangi qoldiq</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">To‘g‘rilash sababi</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="Inventarizatsiya qayta sanovi">Inventarizatsiya qayta sanovi</option>
                  <option value="Buzuq / Yaroqsiz tovar hisobdan chiqarildi">
                    Buzuq / Yaroqsiz tovar hisobdan chiqarildi
                  </option>
                  <option value="Yo‘qolgan tovar">Yo‘qolgan tovar</option>
                  <option value="Xatolik tuzatildi">Kirimdagi xatolik tuzatildi</option>
                  <option value="Boshqa">Boshqa</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedProductForAdjustment(null)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white"
              >
                Qoldiqni Yangilash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Mahsulot Nomi</th>
                <th className="p-3.5">Shtrix-kod / SKU</th>
                <th className="p-3.5">Kategoriya</th>
                <th className="p-3.5">Joriy Qoldiq</th>
                <th className="p-3.5">Tan Narxi</th>
                <th className="p-3.5">Sotish Narxi</th>
                <th className="p-3.5">Kirim Qiymati</th>
                <th className="p-3.5">Kutilayotgan Foyda</th>
                <th className="p-3.5">Holati</th>
                <th className="p-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.currentStock <= 0;
                const isLowStock = p.currentStock > 0 && p.currentStock <= p.minStock;
                const totalItemCost = p.currentStock * p.purchasePrice;
                const totalItemExpectedProfit = p.currentStock * (p.sellingPrice - p.purchasePrice);
                const hasBatches = p.batches && p.batches.length > 0;
                const isExpanded = expandedRowId === p.id;

                return (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          {hasBatches && (
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : p.id)}
                              className="text-slate-400 hover:text-blue-600"
                              title="Partiyalar"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          <div>
                            <span>{p.name}</span>
                            {p.dosage && <span className="text-[10px] text-slate-400 block">{p.dosage}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        <div>{p.barcode}</div>
                        <div className="text-[10px] text-slate-400">{p.sku}</div>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{p.category}</td>
                      <td className="p-3.5 font-bold font-mono">
                        <span
                          className={`text-sm ${
                            isOutOfStock
                              ? 'text-rose-600'
                              : isLowStock
                              ? 'text-amber-600'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {p.currentStock} {p.unit}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Min: {p.minStock} {p.unit}
                        </span>
                      </td>
                      <td className="p-3.5">{p.purchasePrice.toLocaleString()} so‘m</td>
                      <td className="p-3.5 font-semibold text-blue-600 dark:text-blue-400">
                        {p.sellingPrice.toLocaleString()} so‘m
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {totalItemCost.toLocaleString()} so‘m
                      </td>
                      <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                        +{totalItemExpectedProfit.toLocaleString()} so‘m
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {isOutOfStock ? 'Tugagan' : isLowStock ? 'Kam Qoldi' : 'Yetarli'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleOpenAdjustment(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Tahrirlash</span>
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Partiya / Seriyalar row */}
                    {isExpanded && p.batches && (
                      <tr className="bg-slate-50/80 dark:bg-slate-850/80">
                        <td colSpan={10} className="p-3 pl-8">
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                              Partiyalar va Yaroqlilik Muddatlari ({p.batches.length} ta partiya):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {p.batches.map((b) => (
                                <div
                                  key={b.id}
                                  className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] space-y-0.5"
                                >
                                  <div className="flex justify-between font-bold">
                                    <span>Partiya: {b.batchNumber}</span>
                                    <span>{b.quantity} dona</span>
                                  </div>
                                  <div className="flex justify-between text-slate-500">
                                    <span>Muddati:</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                      {b.expiryDate || 'Noma‘lum'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

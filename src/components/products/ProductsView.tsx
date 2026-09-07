import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Edit2,
  Trash2,
  Barcode,
  Tag,
  AlertTriangle,
  Download,
  Filter,
  CheckCircle2,
  X,
  Printer,
  Sparkles,
  Layers,
} from 'lucide-react';
import { BusinessProfile, Product, User } from '../../types';
import { BusinessDB } from '../../services/db';
import { ProductModal } from '../modals/ProductModal';
import { ExcelService } from '../../services/excelService';

interface ProductsViewProps {
  profile: BusinessProfile;
  currentUser: User;
  onOpenOnlineSearch: () => void;
  onOpenAddProduct: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  profile,
  currentUser,
  onOpenOnlineSearch,
  onOpenAddProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // Barcode Tag Print Modal
  const [tagToPrint, setTagToPrint] = useState<Product | null>(null);

  const loadData = () => {
    setProducts(BusinessDB.getProducts());
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleEdit = (p: Product) => {
    setProductToEdit(p);
    setIsEditModalOpen(true);
  };

  const handleDelete = (p: Product) => {
    setDeleteConfirmProduct(p);
  };

  const confirmDelete = () => {
    if (!deleteConfirmProduct) return;
    BusinessDB.deleteProduct(deleteConfirmProduct.id, currentUser);
    setDeleteConfirmProduct(null);
    loadData();
  };

  const handleExport = () => {
    ExcelService.exportProductsToExcel(filteredProducts);
  };

  return (
    <div className="space-y-6">
      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <ProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setProductToEdit(null);
          }}
          productToEdit={productToEdit}
          suppliers={BusinessDB.getSuppliers()}
          currentUser={currentUser}
          isPharmacy={profile.type === 'pharmacy'}
          onSaved={loadData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Mahsulotni O‘chirish</h3>
                <p className="text-xs text-slate-500">Bu amal qaytarib bo‘lmaydi</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Siz haqiqatan ham <strong>"{deleteConfirmProduct.name}"</strong> mahsulotini bazadan o‘chirib
              tashlamoqchimisiz? (Qoldiq: {deleteConfirmProduct.currentStock} {deleteConfirmProduct.unit})
            </p>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
              >
                Ha, O‘chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Price Tag Modal */}
      {tagToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xs p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs font-bold">Narx Yorlig‘i (Price Tag)</span>
              <button onClick={() => setTagToPrint(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Price Label */}
            <div className="p-4 border-2 border-dashed border-slate-400 rounded-xl text-center space-y-2 bg-white text-slate-900 font-mono">
              <p className="text-[10px] text-slate-500 uppercase">{profile.name}</p>
              <h4 className="text-xs font-bold leading-snug">{tagToPrint.name}</h4>
              <div className="h-8 bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px,#000_4px,#000_6px,#fff_6px,#fff_8px)] rounded-xs my-1"></div>
              <p className="text-[10px] tracking-widest">{tagToPrint.barcode}</p>
              <div className="text-base font-black text-slate-900 pt-1 border-t border-slate-300">
                {tagToPrint.sellingPrice.toLocaleString()} {profile.currency}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Chop etish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Mahsulotlar Katalogi (Nomenklatura)
          </h2>
          <p className="text-xs text-slate-500">
            Tizimdagi barcha tovarlar, narxlar, shtrix-kodlar va xususiyatlar ro‘yxati
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenOnlineSearch}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Online Bazadan Qidirish</span>
          </button>
          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Excelga Yuklash</span>
          </button>
          <button
            onClick={onOpenAddProduct}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mahsulot Qo‘shish</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mahsulot nomi, shtrix-kod, zavod yoki artikul..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat === 'ALL' ? 'Barchasi' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Mahsulot</th>
                <th className="p-3.5">Shtrix-kod</th>
                <th className="p-3.5">Kategoriya</th>
                <th className="p-3.5">Kirim Narxi</th>
                <th className="p-3.5">Sotish Narxi</th>
                <th className="p-3.5">Ustama %</th>
                <th className="p-3.5">Qoldiq</th>
                <th className="p-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => {
                const markup =
                  p.purchasePrice > 0
                    ? Math.round(((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100)
                    : 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal flex items-center gap-2 mt-0.5">
                        {p.manufacturer && <span>Zavod: {p.manufacturer}</span>}
                        {p.dosage && <span>• {p.dosage}</span>}
                        <span>• SKU: {p.sku}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{p.barcode}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3.5">{p.purchasePrice.toLocaleString()} so‘m</td>
                    <td className="p-3.5 font-bold text-blue-600 dark:text-blue-400">
                      {p.sellingPrice.toLocaleString()} so‘m
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400">+{markup}%</td>
                    <td className="p-3.5 font-bold font-mono">
                      <span
                        className={
                          p.currentStock <= 0
                            ? 'text-rose-600'
                            : p.currentStock <= p.minStock
                            ? 'text-amber-600'
                            : 'text-slate-900 dark:text-white'
                        }
                      >
                        {p.currentStock} {p.unit}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setTagToPrint(p)}
                          title="Narx yorlig‘ini chop etish"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(p)}
                          title="Tahrirlash"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(p)}
                            title="O‘chirish"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

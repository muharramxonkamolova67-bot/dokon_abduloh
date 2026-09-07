import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Check,
  Building2,
  Tag,
  Barcode,
  X,
  Package,
} from 'lucide-react';
import { OnlineProductSearchService, OnlineProductResult } from '../../services/onlineProductSearch';
import { BusinessProfile, User } from '../../types';
import { BusinessDB } from '../../services/db';

interface OnlineSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  profile: BusinessProfile;
  onProductAdded: () => void;
}

export const OnlineSearchModal: React.FC<OnlineSearchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  profile,
  onProductAdded,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OnlineProductResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await OnlineProductSearchService.searchProducts(query);
      setResults(res);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportProduct = (item: OnlineProductResult) => {
    // Check if barcode or product already exists
    const existing = BusinessDB.getProductByBarcode(item.barcode);
    if (existing) {
      alert(`"${item.name}" (Shtrix-kod: ${item.barcode}) allaqachon bazangizda mavjud!`);
      return;
    }

    // Add to BusinessDB
    BusinessDB.addProduct(
      {
        name: item.name,
        barcode: item.barcode,
        category: item.category,
        sku: item.sku,
        unit: 'dona',
        currentStock: 10, // Initial default
        minStock: 5,
        purchasePrice: item.estimatedPurchasePrice,
        sellingPrice: item.estimatedSellingPrice,
        description: item.description,
        manufacturer: item.manufacturer,
        country: item.country,
        dosage: item.dosage,
      },
      currentUser
    );

    setAddedIds((prev) => new Set(prev).add(item.barcode));
    onProductAdded();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Online Tovar va Dori Katalogi Qidiruvi
              </h3>
              <p className="text-xs text-slate-500">
                Shtrix-kod yoki nom orqali minglab rasmiy tovarlarni toping va bazangizga 1 bosishda qo‘shing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Masalan: Paracetamol, Coca-Cola, 4780000123456..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSearching ? 'Qidirilmoqda...' : 'Qidirish'}
          </button>
        </form>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs">
                Qidiruv maydoniga tovar nomi yoki shtrix-kodini kiriting va "Qidirish" tugmasini bosing.
              </p>
            </div>
          ) : (
            results.map((item) => {
              const isAdded = addedIds.has(item.barcode);
              return (
                <div
                  key={item.barcode}
                  className="p-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {item.category}
                      </span>
                      {item.dosage && (
                        <span className="text-[11px] font-semibold text-slate-500">{item.dosage}</span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</h4>
                    <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500 font-mono">
                      <span>Shtrix-kod: {item.barcode}</span>
                      {item.manufacturer && <span>Ishlab chiqaruvchi: {item.manufacturer}</span>}
                      {item.country && <span>Mamlakat: {item.country}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs pt-1 font-semibold">
                      <span className="text-slate-600 dark:text-slate-400">
                        Kutilayotgan tan narx: {item.estimatedPurchasePrice.toLocaleString()} {profile.currency}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        Tavsiya sotish narxi: {item.estimatedSellingPrice.toLocaleString()} {profile.currency}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleImportProduct(item)}
                    disabled={isAdded}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap ${
                      isAdded
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Qo‘shildi</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Bazaga Qo‘shish</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

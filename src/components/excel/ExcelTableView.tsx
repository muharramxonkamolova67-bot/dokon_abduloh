import React, { useState, useEffect, useRef } from 'react';
import {
  Table as TableIcon,
  Upload,
  Download,
  Search,
  Plus,
  ArrowUpDown,
  Check,
  X,
  AlertCircle,
  FileSpreadsheet,
  Edit2,
  Trash2,
} from 'lucide-react';
import { BusinessProfile, Product, User } from '../../types';
import { BusinessDB } from '../../services/db';
import { ExcelService } from '../../services/excelService';

interface ExcelTableViewProps {
  profile: BusinessProfile;
  currentUser: User;
  onOpenAddProduct: () => void;
}

export const ExcelTableView: React.FC<ExcelTableViewProps> = ({
  profile,
  currentUser,
  onOpenAddProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Inline editing state: rowId + field
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: 'name' | 'barcode' | 'sku' | 'category' | 'unit' | 'purchasePrice' | 'sellingPrice' | 'currentStock' | 'minStock';
  } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const loadData = () => {
    setProducts(BusinessDB.getProducts());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sort toggle
  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Sort
  const filteredProducts = products
    .filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = (aVal as string).toLowerCase();
      if (typeof bVal === 'string') bVal = (bVal as string).toLowerCase();

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Cell Click -> Start Editing
  const startEditing = (
    product: Product,
    field: 'name' | 'barcode' | 'sku' | 'category' | 'unit' | 'purchasePrice' | 'sellingPrice' | 'currentStock' | 'minStock'
  ) => {
    setEditingCell({ id: product.id, field });
    setEditValue(String(product[field] ?? ''));
  };

  // Save Inline Edit
  const saveEdit = () => {
    if (!editingCell) return;

    const product = products.find((p) => p.id === editingCell.id);
    if (!product) return;

    const updated = { ...product };
    const field = editingCell.field;

    if (field === 'purchasePrice' || field === 'sellingPrice' || field === 'currentStock' || field === 'minStock') {
      const numVal = Math.max(0, Number(editValue) || 0);
      (updated as any)[field] = numVal;
    } else {
      (updated as any)[field] = editValue.trim();
    }

    BusinessDB.updateProduct(updated, currentUser);
    loadData();
    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
  };

  // Excel Import
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('Yuklanmoqda...');
    const result = await ExcelService.importProductsFromExcel(file, currentUser);

    if (result.success) {
      setImportStatus(`Muvaffaqiyatli: ${result.added} ta yangi qo‘shildi, ${result.updated} ta yangilandi!`);
      loadData();
    } else {
      setImportStatus(`Xatolik: ${result.errors.join(', ')}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setImportStatus(null), 6000);
  };

  const handleExportExcel = () => {
    ExcelService.exportProductsToExcel(filteredProducts);
  };

  // Bottom Formula Bar Calculations
  const totalSKUs = filteredProducts.length;
  const totalStock = filteredProducts.reduce((sum, p) => sum + p.currentStock, 0);
  const totalCostValue = filteredProducts.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0);
  const totalRetailValue = filteredProducts.reduce((sum, p) => sum + p.currentStock * p.sellingPrice, 0);
  const totalExpectedProfit = totalRetailValue - totalCostValue;

  const averageMargin =
    totalCostValue > 0 ? Math.round((totalExpectedProfit / totalCostValue) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-emerald-600" />
            <span>Excel Jadval Rejimi (Spreadsheet)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Hujayrani bosib to‘g‘ridan-to‘g‘ri tahrirlang (In-place editing) yoki Excel fayllarini yuklang
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Excel / CSV Import</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Excel Export (.xlsx)</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Qator</span>
          </button>
        </div>
      </div>

      {/* Import Status Alert */}
      {importStatus && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between text-xs text-blue-800 dark:text-blue-300">
          <span>{importStatus}</span>
          <button onClick={() => setImportStatus(null)} className="text-blue-500 hover:text-blue-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Jadval bo‘yicha tezkor qidiruv (Nomi, shtrix-kod, artikul, kategoriya)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
          />
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {filteredProducts.length} ta qator
        </span>
      </div>

      {/* Spreadsheet Grid Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[62vh]">
          <table className="w-full text-left text-xs border-collapse">
            {/* Header Row */}
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 sticky top-0 z-10 border-b border-slate-300 dark:border-slate-700 select-none">
              <tr>
                <th className="p-2.5 border-r border-slate-200 dark:border-slate-700 w-10 text-center text-slate-400 font-mono">
                  #
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-bold cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span>Mahsulot Nomi</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('barcode')}
                  className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-bold cursor-pointer hover:bg-slate-200/60"
                >
                  <div className="flex items-center justify-between">
                    <span>Shtrix-kod</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sku')}
                  className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-bold cursor-pointer hover:bg-slate-200/60"
                >
                  <div className="flex items-center justify-between">
                    <span>SKU</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-bold cursor-pointer hover:bg-slate-200/60"
                >
                  <div className="flex items-center justify-between">
                    <span>Kategoriya</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />
                  </div>
                </th>
                <th className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-bold">Birlik</th>
                <th
                  onClick={() => handleSort('currentStock')}
                  className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-bold cursor-pointer hover:bg-slate-200/60 text-right"
                >
                  <div className="flex items-center justify-end">
                    <span>Qoldiq</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('purchasePrice')}
                  className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-bold cursor-pointer hover:bg-slate-200/60 text-right"
                >
                  <div className="flex items-center justify-end">
                    <span>Kirim Narxi</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sellingPrice')}
                  className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-bold cursor-pointer hover:bg-slate-200/60 text-right"
                >
                  <div className="flex items-center justify-end">
                    <span>Sotish Narxi</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />
                  </div>
                </th>
                <th className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-bold text-right">
                  Jami Kirim Qiymati
                </th>
                <th className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-bold text-right">
                  Kutilayotgan Foyda
                </th>
                <th className="p-2.5 font-bold text-right">Ustama %</th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredProducts.map((p, idx) => {
                const totalItemCost = p.currentStock * p.purchasePrice;
                const totalItemRetail = p.currentStock * p.sellingPrice;
                const totalItemExpectedProfit = totalItemRetail - totalItemCost;
                const markupPercent =
                  p.purchasePrice > 0
                    ? Math.round(((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100)
                    : 0;

                const isEditingThis = (field: any) =>
                  editingCell?.id === p.id && editingCell?.field === field;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    {/* Index */}
                    <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center text-slate-400 font-mono text-[11px] bg-slate-50/50 dark:bg-slate-850/50">
                      {idx + 1}
                    </td>

                    {/* Name */}
                    <td
                      onClick={() => startEditing(p, 'name')}
                      className="p-2 border-r border-slate-200 dark:border-slate-800 font-medium text-slate-900 dark:text-white cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      {isEditingThis('name') ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            autoFocus
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="w-full px-1.5 py-0.5 text-xs bg-white dark:bg-slate-800 border-2 border-blue-600 rounded outline-none"
                          />
                          <button onClick={saveEdit} className="p-0.5 text-emerald-600">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span>{p.name}</span>
                      )}
                    </td>

                    {/* Barcode */}
                    <td
                      onClick={() => startEditing(p, 'barcode')}
                      className="p-2 border-r border-slate-200 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      {isEditingThis('barcode') ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-full px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-slate-800 border-2 border-blue-600 rounded outline-none"
                        />
                      ) : (
                        p.barcode
                      )}
                    </td>

                    {/* SKU */}
                    <td
                      onClick={() => startEditing(p, 'sku')}
                      className="p-2 border-r border-slate-200 dark:border-slate-800 font-mono text-slate-500 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      {isEditingThis('sku') ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-full px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-slate-800 border-2 border-blue-600 rounded outline-none"
                        />
                      ) : (
                        p.sku
                      )}
                    </td>

                    {/* Category */}
                    <td
                      onClick={() => startEditing(p, 'category')}
                      className="p-2 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      {isEditingThis('category') ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-full px-1.5 py-0.5 text-xs bg-white dark:bg-slate-800 border-2 border-blue-600 rounded outline-none"
                        />
                      ) : (
                        p.category
                      )}
                    </td>

                    {/* Unit */}
                    <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-slate-500">
                      {p.unit}
                    </td>

                    {/* Current Stock */}
                    <td
                      onClick={() => startEditing(p, 'currentStock')}
                      className="p-2 border-r border-slate-200 dark:border-slate-800 font-bold font-mono text-right cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      {isEditingThis('currentStock') ? (
                        <input
                          autoFocus
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-20 px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-slate-800 border-2 border-blue-600 rounded outline-none text-right"
                        />
                      ) : (
                        <span
                          className={
                            p.currentStock <= 0
                              ? 'text-rose-600 font-black'
                              : p.currentStock <= p.minStock
                              ? 'text-amber-600'
                              : 'text-slate-900 dark:text-white'
                          }
                        >
                          {p.currentStock}
                        </span>
                      )}
                    </td>

                    {/* Purchase Price */}
                    <td
                      onClick={() => startEditing(p, 'purchasePrice')}
                      className="p-2 border-r border-slate-200 dark:border-slate-800 text-right font-mono cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      {isEditingThis('purchasePrice') ? (
                        <input
                          autoFocus
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-24 px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-slate-800 border-2 border-blue-600 rounded outline-none text-right"
                        />
                      ) : (
                        p.purchasePrice.toLocaleString()
                      )}
                    </td>

                    {/* Selling Price */}
                    <td
                      onClick={() => startEditing(p, 'sellingPrice')}
                      className="p-2 border-r border-slate-200 dark:border-slate-800 text-right font-bold font-mono text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      {isEditingThis('sellingPrice') ? (
                        <input
                          autoFocus
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-24 px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-slate-800 border-2 border-blue-600 rounded outline-none text-right"
                        />
                      ) : (
                        p.sellingPrice.toLocaleString()
                      )}
                    </td>

                    {/* Total Purchase Value (Calculated formula: Qty * PurchasePrice) */}
                    <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-right font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {totalItemCost.toLocaleString()}
                    </td>

                    {/* Total Expected Profit (Calculated formula: Qty * (Sell - Purchase)) */}
                    <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      +{totalItemExpectedProfit.toLocaleString()}
                    </td>

                    {/* Markup % */}
                    <td className="p-2 text-right font-semibold text-slate-700 dark:text-slate-300 font-mono">
                      {markupPercent}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BOTTOM FORMULA SUMMARY BAR (Spreadsheet Status Bar) */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-4">
            <span className="text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">COUNT:</strong> {totalSKUs} ta
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">SUM(Qoldiq):</strong> {totalStock} dona
            </span>
          </div>

          <div className="flex items-center space-x-5">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">SUM(Kirim qiymati)</span>
              <span className="text-slate-900 dark:text-white font-bold">
                {totalCostValue.toLocaleString()} {profile.currency}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase">SUM(Sotish qiymati)</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {totalRetailValue.toLocaleString()} {profile.currency}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase">SUM(Kutilayotgan Foyda)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                +{totalExpectedProfit.toLocaleString()} {profile.currency}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase">AVERAGE(Ustama)</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">{averageMargin}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

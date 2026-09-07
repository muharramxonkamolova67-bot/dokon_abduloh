import React, { useState, useEffect } from 'react';
import {
  X,
  Boxes,
  Barcode,
  Building2,
  DollarSign,
  Layers,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Product, Supplier, User } from '../../types';
import { BusinessDB } from '../../services/db';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  prefillData?: Partial<Product> | null;
  suppliers: Supplier[];
  currentUser: User;
  isPharmacy: boolean;
  onSaved: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  prefillData,
  suppliers,
  currentUser,
  isPharmacy,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Umumiy');
  const [unit, setUnit] = useState('dona');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(0);
  const [sellingPrice, setSellingPrice] = useState<number | ''>(0);
  const [initialStock, setInitialStock] = useState<number | ''>(0);
  const [minStock, setMinStock] = useState<number | ''>(5);
  const [supplierId, setSupplierId] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [dosage, setDosage] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setBarcode(productToEdit.barcode);
      setSku(productToEdit.sku);
      setCategory(productToEdit.category);
      setUnit(productToEdit.unit);
      setPurchasePrice(productToEdit.purchasePrice);
      setSellingPrice(productToEdit.sellingPrice);
      setMinStock(productToEdit.minStock);
      setSupplierId(productToEdit.supplierId || '');
      setManufacturer(productToEdit.manufacturer || '');
      setDosage(productToEdit.dosage || '');
      setDescription(productToEdit.description || '');
      setInitialStock(productToEdit.currentStock);
      if (productToEdit.batches && productToEdit.batches.length > 0) {
        setBatchNumber(productToEdit.batches[0].batchNumber || '');
        setExpiryDate(productToEdit.batches[0].expiryDate || '');
      }
    } else if (prefillData) {
      setName(prefillData.name || '');
      setBarcode(prefillData.barcode || '');
      setSku(prefillData.sku || `SKU-${Date.now().toString().slice(-6)}`);
      setCategory(prefillData.category || 'Umumiy');
      setUnit(prefillData.unit || 'dona');
      setPurchasePrice(prefillData.purchasePrice || 0);
      setSellingPrice(prefillData.sellingPrice || 0);
      setMinStock(prefillData.minStock || 5);
      setInitialStock(0);
      setManufacturer(prefillData.manufacturer || '');
      setDosage(prefillData.dosage || '');
      setDescription(prefillData.description || '');
    } else {
      // Clean new product
      setName('');
      setBarcode('');
      setSku(`SKU-${Date.now().toString().slice(-6)}`);
      setCategory(isPharmacy ? 'Dorilar' : 'Oziq-ovqat');
      setUnit('dona');
      setPurchasePrice('');
      setSellingPrice('');
      setInitialStock(0);
      setMinStock(5);
      setSupplierId('');
      setManufacturer('');
      setDosage('');
      setBatchNumber('');
      setExpiryDate('');
      setDescription('');
    }
    setErrorMessage(null);
  }, [productToEdit, prefillData, isOpen, isPharmacy]);

  if (!isOpen) return null;

  const generateBarcode = () => {
    // Generate valid 13-digit EAN style barcode
    const random12 = '478' + Math.floor(100000000 + Math.random() * 900000000).toString();
    setBarcode(random12);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMessage('Iltimos, mahsulot nomini kiriting!');
      return;
    }

    const pPrice = typeof purchasePrice === 'number' ? purchasePrice : Number(purchasePrice) || 0;
    const sPrice = typeof sellingPrice === 'number' ? sellingPrice : Number(sellingPrice) || 0;
    const iStock = typeof initialStock === 'number' ? initialStock : Number(initialStock) || 0;
    const mStock = typeof minStock === 'number' ? minStock : Number(minStock) || 5;

    const supplierObj = suppliers.find((s) => s.id === supplierId);

    if (productToEdit) {
      // Update existing
      BusinessDB.updateProduct(
        {
          ...productToEdit,
          name: cleanName,
          barcode: barcode.trim(),
          sku: sku.trim(),
          category,
          unit,
          purchasePrice: pPrice,
          sellingPrice: sPrice,
          minStock: mStock,
          supplierId: supplierId || undefined,
          supplierName: supplierObj?.name,
          manufacturer: manufacturer.trim() || undefined,
          dosage: dosage.trim() || undefined,
          description: description.trim() || undefined,
        },
        currentUser
      );
      onSaved();
      onClose();
    } else {
      // Add new with duplicate barcode check
      const result = BusinessDB.addProduct(
        {
          name: cleanName,
          barcode: barcode.trim() || `BC-${Date.now()}`,
          sku: sku.trim() || `SKU-${Date.now()}`,
          category,
          unit,
          purchasePrice: pPrice,
          sellingPrice: sPrice,
          minStock: mStock,
          currentStock: iStock,
          supplierId: supplierId || undefined,
          supplierName: supplierObj?.name,
          manufacturer: manufacturer.trim() || undefined,
          dosage: dosage.trim() || undefined,
          description: description.trim() || undefined,
          batches:
            batchNumber || expiryDate
              ? [
                  {
                    id: `b_${Date.now()}`,
                    productId: '',
                    batchNumber: batchNumber.trim() || `LOT-${Date.now().toString().slice(-4)}`,
                    expiryDate: expiryDate,
                    quantity: iStock,
                    purchasePrice: pPrice,
                    receivedDate: new Date().toISOString(),
                  },
                ]
              : undefined,
        },
        currentUser
      );

      if (!result.success) {
        setErrorMessage(result.error || 'Mahsulotni qo‘shishda xatolik yuz berdi');
        return;
      }

      onSaved();
      onClose();
    }
  };

  const expectedProfit =
    (typeof sellingPrice === 'number' ? sellingPrice : 0) -
    (typeof purchasePrice === 'number' ? purchasePrice : 0);

  const profitMarginPercent =
    typeof purchasePrice === 'number' && purchasePrice > 0 && typeof sellingPrice === 'number'
      ? Math.round(((sellingPrice - purchasePrice) / purchasePrice) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {productToEdit ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot Qo‘shish'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Markaziy yagona mahsulotlar bazasiga ma’lumotlarni kiritish
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {/* Row 1: Name & Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mahsulot nomi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Paracetamol 500mg yoki Coca-Cola 0.5L"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Shtrix-kod (Barcode)
                </label>
                <button
                  type="button"
                  onClick={generateBarcode}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-2.5 h-2.5" /> Avto-kod yaratish
                </button>
              </div>
              <div className="relative">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Skanerlang yoki kiriting"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Row 2: SKU, Category, Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Artikul (SKU)
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU-1002"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategoriya
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Kategoriya tanlang"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
              <datalist id="category-suggestions">
                <option value="Dorilar" />
                <option value="Antibiotiklar" />
                <option value="Spazmolitiklar" />
                <option value="Vitaminlar" />
                <option value="Ichimliklar" />
                <option value="Oziq-ovqat" />
                <option value="Shirinliklar" />
                <option value="Gigiyena" />
                <option value="Xo‘jalik mollari" />
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                O‘lchov birligi
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="dona">dona (pcs)</option>
                <option value="quti">quti (box)</option>
                <option value="flakon">flakon (vial)</option>
                <option value="ampula">ampula</option>
                <option value="tubik">tubik</option>
                <option value="pachka">pachka (pack)</option>
                <option value="kg">kg (kilogramm)</option>
                <option value="litr">litr</option>
                <option value="metr">metr</option>
              </select>
            </div>
          </div>

          {/* Row 3: Prices & Profit Calculation */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kirim / Tan narxi (Purchase Price) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-3 pr-14 py-2 text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">so‘m</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sotish narxi (Selling Price) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-3 pr-14 py-2 text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white text-emerald-600 dark:text-emerald-400 font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">so‘m</span>
                </div>
              </div>
            </div>

            {/* Calculated profit indicator */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500">Kutilayotgan foyda (har bir donadan):</span>
              <div className="flex items-center space-x-2">
                <span
                  className={`font-bold ${
                    expectedProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'
                  }`}
                >
                  {expectedProfit.toLocaleString()} so‘m
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold">
                  Ustama: {profitMarginPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Row 4: Stocks & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {!productToEdit && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Boshlang‘ich qoldiq (Stock)
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Minimal chegara (Low stock)
              </label>
              <input
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div className={productToEdit ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Yetkazib beruvchi (Supplier)
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="">-- Tanlanmagan --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pharmacy specific fields: Manufacturer, Dosage, Batch, Expiry */}
          {isPharmacy && (
            <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>Dorixona parametrlari (Seriya & Yaroqlilik)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ishlab chiqaruvchi (Zavod / Brend)
                  </label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="Nobel, Berlin-Chemie, Jurabek..."
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dozasi / Shakli
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="500mg, 10 tabletka, 1% maz..."
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Partiya / Seriya raqami (Batch #)
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="LOT-2026-X"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amal qilish muddati (Expiry Date)
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Izoh / Tavsif
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qo‘shimcha ma’lumotlar yoki qayerda saqlanishi..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              {productToEdit ? 'O‘zgarishlarni Saqlash' : 'Mahsulotni Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

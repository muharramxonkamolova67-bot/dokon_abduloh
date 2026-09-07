import * as XLSX from 'xlsx';
import { Product, Sale, User } from '../types';
import { BusinessDB } from './db';

export function exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function exportToCSV(data: any[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface ExcelImportResult {
  products: Partial<Product>[];
  errors: string[];
}

export async function parseExcelOrCSV(file: File): Promise<ExcelImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const products: Partial<Product>[] = [];
        const errors: string[] = [];

        rawJson.forEach((row, index) => {
          const rowNum = index + 2; // header is line 1

          // Flexible header mapping (Uzbek, English, Russian)
          const name =
            row['Mahsulot nomi'] ||
            row['Nomi'] ||
            row['Name'] ||
            row['Product Name'] ||
            row['Наименование'] ||
            row['Название'];
          const barcode = String(
            row['Shtrix-kod'] || row['Barcode'] || row['Штрихкод'] || row['Barkod'] || ''
          ).trim();
          const sku = String(row['Artikul'] || row['SKU'] || row['Kod'] || row['Артикул'] || '').trim();
          const category = row['Kategoriya'] || row['Category'] || row['Категория'] || 'Umumiy';
          const unit = row['Birlik'] || row['Unit'] || row['Ед.изм'] || 'dona';

          const purchasePrice = Number(
            row['Tan narx'] ||
              row['Kirim narxi'] ||
              row['Cost Price'] ||
              row['Purchase Price'] ||
              row['Себестоимость'] ||
              0
          );
          const sellingPrice = Number(
            row['Sotish narxi'] ||
              row['Chakana narx'] ||
              row['Selling Price'] ||
              row['Price'] ||
              row['Цена продажи'] ||
              0
          );
          const currentStock = Number(
            row['Miqdor'] || row['Qoldiq'] || row['Stock'] || row['Quantity'] || row['Остаток'] || 0
          );
          const minStock = Number(row['Minimal qoldiq'] || row['Min Stock'] || row['Мин.остаток'] || 5);
          const supplierName = row['Yetkazib beruvchi'] || row['Supplier'] || row['Поставщик'] || '';
          const manufacturer = row['Ishlab chiqaruvchi'] || row['Manufacturer'] || row['Производитель'] || '';
          const dosage = row['Dozasi'] || row['Dosage'] || row['Дозировка'] || '';

          if (!name) {
            errors.push(`${rowNum}-qatorda mahsulot nomi kiritilmagan.`);
            return;
          }

          products.push({
            name: String(name).trim(),
            barcode: barcode || `BC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            sku: sku || `SKU-${Date.now()}-${index}`,
            category: String(category).trim(),
            unit: String(unit).trim(),
            purchasePrice: isNaN(purchasePrice) ? 0 : purchasePrice,
            sellingPrice: isNaN(sellingPrice) ? 0 : sellingPrice,
            currentStock: isNaN(currentStock) ? 0 : currentStock,
            minStock: isNaN(minStock) ? 5 : minStock,
            supplierName: supplierName ? String(supplierName).trim() : undefined,
            manufacturer: manufacturer ? String(manufacturer).trim() : undefined,
            dosage: dosage ? String(dosage).trim() : undefined,
          });
        });

        resolve({ products, errors });
      } catch (err: any) {
        reject(new Error(`Faylni o‘qishda xatolik: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Faylni yuklashda xatolik yuz berdi'));
    reader.readAsBinaryString(file);
  });
}

export const ExcelService = {
  exportToExcel,
  exportToCSV,
  parseExcelOrCSV,

  exportProductsToExcel: (products: Product[], fileName: string = 'Mahsulotlar_Ombor') => {
    const data = products.map((p) => ({
      'Mahsulot nomi': p.name,
      'Shtrix-kod': p.barcode,
      Artikul: p.sku,
      Kategoriya: p.category,
      Birlik: p.unit,
      'Tan narx (so‘m)': p.purchasePrice,
      'Sotish narx (so‘m)': p.sellingPrice,
      'Qoldiq miqdori': p.currentStock,
      'Minimal qoldiq': p.minStock,
      'Jami tan qiymat': p.currentStock * p.purchasePrice,
      'Kutilayotgan foyda': p.currentStock * (p.sellingPrice - p.purchasePrice),
      'Yetkazib beruvchi': p.supplierName || '',
      'Ishlab chiqaruvchi': p.manufacturer || '',
      Dozasi: p.dosage || '',
    }));
    exportToExcel(data, fileName, 'Ombor');
  },

  exportSalesToExcel: (sales: Sale[], fileName: string = 'Savdolar_Hisoboti') => {
    const data = sales.map((s) => ({
      'Chek raqami': s.receiptNumber,
      Sana: new Date(s.date).toLocaleString('uz-UZ'),
      Mijoz: s.customerName,
      Kassir: s.createdByName,
      'To‘lov usuli': s.paymentMethod,
      'Jami summa': s.totalAmount,
      'Tan narxi (COGS)': s.costAmount || s.totalCost,
      'Sof foyda': s.profit,
      Chegirma: s.discount,
      'Nasiya qarz': s.debtAmount,
    }));
    exportToExcel(data, fileName, 'Savdolar');
  },

  importProductsFromExcel: async (
    file: File,
    currentUser: User
  ): Promise<{ success: boolean; added: number; updated: number; errors: string[] }> => {
    try {
      const parsed = await parseExcelOrCSV(file);
      let added = 0;
      let updated = 0;
      const errors = [...parsed.errors];

      const existingProducts = BusinessDB.getProducts();

      for (const item of parsed.products) {
        if (!item.name) continue;

        const matchByBarcode = item.barcode ? existingProducts.find((p) => p.barcode === item.barcode) : undefined;
        const matchBySku = item.sku ? existingProducts.find((p) => p.sku === item.sku) : undefined;
        const existing = matchByBarcode || matchBySku;

        if (existing) {
          BusinessDB.updateProduct(
            {
              ...existing,
              currentStock: existing.currentStock + (item.currentStock || 0),
              purchasePrice: item.purchasePrice || existing.purchasePrice,
              sellingPrice: item.sellingPrice || existing.sellingPrice,
              category: item.category || existing.category,
              unit: item.unit || existing.unit,
              supplierName: item.supplierName || existing.supplierName,
              manufacturer: item.manufacturer || existing.manufacturer,
              dosage: item.dosage || existing.dosage,
            },
            currentUser
          );
          updated++;
        } else {
          const res = BusinessDB.addProduct(
            {
              name: item.name,
              barcode: item.barcode || `BC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              sku: item.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              category: item.category || 'Umumiy',
              unit: item.unit || 'dona',
              purchasePrice: item.purchasePrice || 0,
              sellingPrice: item.sellingPrice || 0,
              currentStock: item.currentStock || 0,
              minStock: item.minStock || 5,
              supplierName: item.supplierName,
              manufacturer: item.manufacturer,
              dosage: item.dosage,
            },
            currentUser
          );
          if (res.success) {
            added++;
          } else if (res.error) {
            errors.push(res.error);
          }
        }
      }

      return {
        success: added > 0 || updated > 0,
        added,
        updated,
        errors,
      };
    } catch (err: any) {
      return {
        success: false,
        added: 0,
        updated: 0,
        errors: [err.message || 'Excel faylni o‘qishda xatolik'],
      };
    }
  },

  generateSampleTemplate: () => {
    const sampleRows = [
      {
        'Mahsulot nomi': 'Paracetamol 500mg #10',
        'Shtrix-kod': '4780012345678',
        Artikul: 'SKU-001',
        Kategoriya: 'Dori-darmon',
        Birlik: 'quti',
        'Tan narx': 4500,
        'Sotish narxi': 6000,
        Miqdor: 50,
        'Minimal qoldiq': 10,
        'Yetkazib beruvchi': 'Grand Pharm',
        'Ishlab chiqaruvchi': 'Nobel',
        Dozasi: '500mg',
      },
      {
        'Mahsulot nomi': 'Coca-Cola 1.5L',
        'Shtrix-kod': '5449000000996',
        Artikul: 'SKU-002',
        Kategoriya: 'Ichimliklar',
        Birlik: 'dona',
        'Tan narx': 11000,
        'Sotish narxi': 14000,
        Miqdor: 24,
        'Minimal qoldiq': 6,
        'Yetkazib beruvchi': 'CCI Bottlers',
        'Ishlab chiqaruvchi': 'Coca-Cola',
        Dozasi: '',
      },
    ];
    exportToExcel(sampleRows, 'Namuna_Tovar_Shabloni', 'Namuna');
  },
};

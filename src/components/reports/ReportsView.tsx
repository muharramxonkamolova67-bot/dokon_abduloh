import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Warehouse,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { BusinessProfile, User } from '../../types';
import { BusinessDB } from '../../services/db';
import { ExcelService } from '../../services/excelService';

interface ReportsViewProps {
  profile: BusinessProfile;
  currentUser: User;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ profile, currentUser }) => {
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'expenses' | 'pnl'>('sales');
  const summary = BusinessDB.getFinancialSummary();
  const sales = BusinessDB.getSales();
  const products = BusinessDB.getProducts();
  const expenses = BusinessDB.getExpenses();

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (reportType === 'sales') {
      ExcelService.exportSalesToExcel(sales);
    } else if (reportType === 'inventory') {
      ExcelService.exportProductsToExcel(products);
    } else {
      ExcelService.exportSalesToExcel(sales);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Rasmiy Biznes Hisobotlari (Reports & Analytics)
          </h2>
          <p className="text-xs text-slate-500">
            Moliya, savdo, xarajatlar va ombor bo‘yicha to‘liq jamlanma hisobotlar va eksport
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Chop Etish / PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setReportType('sales')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            reportType === 'sales'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Savdo va Cheklar Hisoboti
        </button>
        <button
          onClick={() => setReportType('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            reportType === 'inventory'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Ombor Balansi va Tan Narx
        </button>
        <button
          onClick={() => setReportType('expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            reportType === 'expenses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Xarajatlar Tahlili
        </button>
        <button
          onClick={() => setReportType('pnl')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            reportType === 'pnl'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Foyda va Zarar (P&L)
        </button>
      </div>

      {/* Report Sheet Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        {/* Official Header */}
        <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 space-y-1">
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {profile.name} — RASMIY BIZNES HISOBOTI
          </h2>
          <p className="text-xs text-slate-500">
            Manzil: {profile.address} • Tel: {profile.phone}
          </p>
          <p className="text-[11px] text-slate-400">
            Hujjat shakllantirilgan sana: {new Date().toLocaleString('uz-UZ')}
          </p>
        </div>

        {/* Content depending on reportType */}
        {reportType === 'sales' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Jami Sotuvlar Soni</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{sales.length} ta chek</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Jami Tushum</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {summary.totalSalesRevenue.toLocaleString()} {profile.currency}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Yalpi Foyda</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  +{summary.grossProfit.toLocaleString()} {profile.currency}
                </span>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 font-semibold border-b">
                <tr>
                  <th className="p-2.5">Chek #</th>
                  <th className="p-2.5">Sana</th>
                  <th className="p-2.5">Mijoz</th>
                  <th className="p-2.5">Kassir</th>
                  <th className="p-2.5">To‘lov</th>
                  <th className="p-2.5 text-right">Summa</th>
                  <th className="p-2.5 text-right">Foyda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td className="p-2.5 font-mono font-bold text-blue-600">{s.receiptNumber}</td>
                    <td className="p-2.5 text-slate-500">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="p-2.5">{s.customerName}</td>
                    <td className="p-2.5 text-slate-500">{s.createdByName}</td>
                    <td className="p-2.5 uppercase text-[10px] font-bold">{s.paymentMethod}</td>
                    <td className="p-2.5 text-right font-bold">{s.totalAmount.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-600">+{s.profit.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'inventory' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Jami Tovarlar Nomi</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{products.length} xil</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Ombor Tan Narx Qiymati</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {summary.currentInventoryCostValue.toLocaleString()} {profile.currency}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Kutilayotgan Foyda</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  +{summary.expectedProfitFromInventory.toLocaleString()} {profile.currency}
                </span>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 font-semibold border-b">
                <tr>
                  <th className="p-2.5">Nomi</th>
                  <th className="p-2.5">Shtrix-kod</th>
                  <th className="p-2.5">Qoldiq</th>
                  <th className="p-2.5">Tan Narxi</th>
                  <th className="p-2.5">Sotish Narxi</th>
                  <th className="p-2.5 text-right">Jami Tan Qiymat</th>
                  <th className="p-2.5 text-right">Kutilayotgan Foyda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2.5 font-bold">{p.name}</td>
                    <td className="p-2.5 font-mono text-slate-500">{p.barcode}</td>
                    <td className="p-2.5 font-mono font-bold">
                      {p.currentStock} {p.unit}
                    </td>
                    <td className="p-2.5">{p.purchasePrice.toLocaleString()}</td>
                    <td className="p-2.5 font-semibold text-blue-600">{p.sellingPrice.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-bold">
                      {(p.currentStock * p.purchasePrice).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-600">
                      +{ (p.currentStock * (p.sellingPrice - p.purchasePrice)).toLocaleString() }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'expenses' && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-xs flex justify-between items-center">
              <span className="font-bold text-rose-900 dark:text-rose-200">
                Jami Qayd Etilgan Xarajatlar:
              </span>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                -{summary.totalExpenses.toLocaleString()} {profile.currency}
              </span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 font-semibold border-b">
                <tr>
                  <th className="p-2.5">Xarajat</th>
                  <th className="p-2.5">Kategoriya</th>
                  <th className="p-2.5">Sana</th>
                  <th className="p-2.5">Xodim</th>
                  <th className="p-2.5 text-right">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="p-2.5 font-bold">{e.title || e.name}</td>
                    <td className="p-2.5">{e.category}</td>
                    <td className="p-2.5 text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="p-2.5 text-slate-500">{e.createdByName}</td>
                    <td className="p-2.5 text-right font-bold text-rose-600 font-mono">
                      -{e.amount.toLocaleString()} {profile.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'pnl' && (
          <div className="space-y-4 font-mono text-xs sm:text-sm">
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between">
                <span>1. Jami Savdo Tushumi (Revenue):</span>
                <span className="font-bold">{summary.totalSalesRevenue.toLocaleString()} {profile.currency}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>2. Sotilgan Tovar Tan Narxi (COGS):</span>
                <span>-{summary.costOfGoodsSold.toLocaleString()} {profile.currency}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600 pt-2 border-t">
                <span>YALPI FOYDA (Gross Profit):</span>
                <span>+{summary.grossProfit.toLocaleString()} {profile.currency}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>3. Operatsion Xarajatlar (Expenses):</span>
                <span>-{summary.totalExpenses.toLocaleString()} {profile.currency}</span>
              </div>
              <div className="flex justify-between font-black text-base pt-2 border-t-2 border-slate-900 dark:border-white">
                <span>SOF FOYDA (NET PROFIT):</span>
                <span className="text-emerald-600">+{summary.netProfit.toLocaleString()} {profile.currency}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

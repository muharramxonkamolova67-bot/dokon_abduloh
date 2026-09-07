import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  PackagePlus,
  Warehouse,
  Boxes,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Globe,
  Receipt,
  Users,
  Building2,
  Calendar,
} from 'lucide-react';
import { BusinessProfile, Product, Sale, User } from '../../types';
import { BusinessDB } from '../../services/db';

interface DashboardViewProps {
  profile?: BusinessProfile;
  currentUser?: User;
  onNavigate?: (tab: string, entityId?: string) => void;
  onOpenOnlineSearch?: () => void;
  onOpenAddProduct?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  currentUser,
  onNavigate,
  onOpenOnlineSearch,
  onOpenAddProduct,
}) => {
  const summary = BusinessDB.getFinancialSummary();
  const sales = BusinessDB.getSales().slice(0, 5);
  const isPharmacy = profile?.type === 'pharmacy';
  const currency = profile?.currency || "so'm";

  const safeNavigate = (tab: string, entityId?: string) => {
    if (onNavigate) {
      onNavigate(tab, entityId);
    }
  };

  // Calculate monthly stats for SVG chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dailyChartData = last7Days.map((dateStr) => {
    const daySales = BusinessDB.getSales().filter((s) => s.date.startsWith(dateStr));
    const revenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const profit = daySales.reduce((sum, s) => sum + s.profit, 0);
    const dayName = new Date(dateStr).toLocaleDateString('uz-UZ', { weekday: 'short' });
    return { date: dateStr, dayName, revenue, profit };
  });

  const maxRevenue = Math.max(...dailyChartData.map((d) => d.revenue), 100000);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs uppercase tracking-wider">
                {isPharmacy ? 'Dorixona Boshqaruvi' : 'Savdo & Buxgalteriya'}
              </span>
              <span className="text-xs text-blue-200">
                {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight mt-1.5">
              Xush kelibsiz, {currentUser?.name || 'Foydalanuvchi'}!
            </h2>
            <p className="text-xs md:text-sm text-blue-100 max-w-xl mt-1">
              Do‘koningizdagi barcha kirim, sotuv, ombor qoldiqlari va sof foyda hisob-kitoblari real vaqt rejimida yangilanmoqda.
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => safeNavigate('pos')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Kassa (POS)</span>
            </button>
            <button
              onClick={() => safeNavigate('purchases')}
              className="px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <PackagePlus className="w-4 h-4 text-blue-700" />
              <span>Yangi Kirim</span>
            </button>
            <button
              onClick={onOpenOnlineSearch}
              className="px-3.5 py-2.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>Online Qidiruv</span>
            </button>
            <button
              onClick={onOpenAddProduct}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Mahsulot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bugungi Tushum</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {summary.todaySalesRevenue.toLocaleString()} {profile.currency}
            </h3>
            <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
              <span>Jami tushum:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {summary.totalSalesRevenue.toLocaleString()} {profile.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Net Profit */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sof Foyda (Net Profit)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className={`text-xl font-black ${summary.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {summary.netProfit.toLocaleString()} {profile.currency}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Yalpi foyda ({summary.grossProfit.toLocaleString()}) - Xarajatlar ({summary.totalExpenses.toLocaleString()})
            </p>
          </div>
        </div>

        {/* Card 3: Inventory Value */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Joriy Ombor Qiymati</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {summary.currentInventoryCostValue.toLocaleString()} {profile.currency}
            </h3>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
              Kutilayotgan foyda: +{summary.expectedProfitFromInventory.toLocaleString()} {profile.currency}
            </p>
          </div>
        </div>

        {/* Card 4: Total Debts */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nasiya & Qarzlar</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-amber-600 dark:text-amber-400">
              {summary.totalCustomerDebt.toLocaleString()} {profile.currency}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Yetkazib beruvchilarga qarz: {summary.totalSupplierDebt.toLocaleString()} {profile.currency}
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Warning Bars: Low Stock & Expiring Drugs */}
      {(summary.lowStockProducts.length > 0 || summary.expiringSoonProducts.length > 0 || summary.outOfStockProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Low Stock Box */}
          {summary.lowStockProducts.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                    Kam qolgan mahsulotlar ({summary.lowStockProducts.length} ta)
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                    {summary.lowStockProducts.slice(0, 3).map((p) => `${p.name} (${p.currentStock} ${p.unit})`).join(', ')}
                    {summary.lowStockProducts.length > 3 && ' va boshqalar...'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => safeNavigate('inventory')}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                Ko‘rish
              </button>
            </div>
          )}

          {/* Expiring Soon Drugs (Pharmacy Mode) */}
          {isPharmacy && summary.expiringSoonProducts.length > 0 && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                    Yaroqlilik muddati yaqin dorilar ({summary.expiringSoonProducts.length} ta)
                  </h4>
                  <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                    90 kun ichida muddati tugaydigan partiyalar mavjud.
                  </p>
                </div>
              </div>
              <button
                onClick={() => safeNavigate('inventory')}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                Omborda tekshirish
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 7-Day Sales & Profit Visualizer */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Haftalik Savdo va Sof Foyda Dinamikasi
              </h3>
              <p className="text-xs text-slate-500">So‘nggi 7 kunlik ko‘rsatkichlar</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                <span className="w-3 h-3 rounded-xs bg-blue-500 inline-block"></span> Tushum
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span> Foyda
              </span>
            </div>
          </div>

          {/* Bar Visualizer */}
          <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-slate-100 dark:border-slate-800">
            {dailyChartData.map((d, i) => {
              const revHeight = Math.max(8, (d.revenue / maxRevenue) * 140);
              const profitHeight = Math.max(4, (d.profit / maxRevenue) * 140);

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    {/* Revenue Bar */}
                    <div
                      style={{ height: `${revHeight}px` }}
                      className="w-1/2 bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all relative group"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-20">
                        {d.revenue.toLocaleString()}
                      </div>
                    </div>
                    {/* Profit Bar */}
                    <div
                      style={{ height: `${profitHeight}px` }}
                      className="w-1/2 bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all relative group"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-20">
                        +{d.profit.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 capitalize">
                    {d.dayName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary Row */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Jami Mahsulotlar</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {summary.totalProductsCount} xil
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Jami Qoldiq Soni</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {summary.totalStockQuantity} dona
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Jami Xarajatlar</span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                {summary.totalExpenses.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Sales Transactions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">So‘nggi Sotuvlar</h3>
              <button
                onClick={() => safeNavigate('sales')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Barchasi
              </button>
            </div>

            <div className="space-y-2">
              {sales.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Hali sotuv amalga oshirilmadi</p>
              ) : (
                sales.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => safeNavigate('sales', s.id)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{s.receiptNumber}</p>
                      <p className="text-[11px] text-slate-400">
                        {s.customerName} • {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {s.totalAmount.toLocaleString()} so‘m
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        +{s.profit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500">Bugungi sof foyda:</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              +{summary.todayNetProfit.toLocaleString()} {profile.currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

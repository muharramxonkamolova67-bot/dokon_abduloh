import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  TrendingDown,
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Download,
} from 'lucide-react';
import { BusinessProfile, User } from '../../types';
import { BusinessDB } from '../../services/db';

interface FinanceViewProps {
  profile: BusinessProfile;
  currentUser: User;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ profile, currentUser }) => {
  const [period, setPeriod] = useState<'all' | 'today' | 'month'>('all');
  const summary = BusinessDB.getFinancialSummary();
  const sales = BusinessDB.getSales();
  const expenses = BusinessDB.getExpenses();

  // Top profitable products
  const productProfitMap = new Map<string, { name: string; quantity: number; revenue: number; profit: number }>();
  sales.forEach((s) => {
    s.items.forEach((item) => {
      const existing = productProfitMap.get(item.productId) || {
        name: item.productName,
        quantity: 0,
        revenue: 0,
        profit: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += item.totalAmount;
      existing.profit += item.profit;
      productProfitMap.set(item.productId, existing);
    });
  });

  const topProfitableProducts = Array.from(productProfitMap.values())
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 6);

  // Expense by category
  const expenseByCategory = new Map<string, number>();
  expenses.forEach((e) => {
    expenseByCategory.set(e.category, (expenseByCategory.get(e.category) || 0) + e.amount);
  });

  const grossProfitMargin =
    summary.totalSalesRevenue > 0
      ? Math.round((summary.grossProfit / summary.totalSalesRevenue) * 100)
      : 0;

  const netProfitMargin =
    summary.totalSalesRevenue > 0
      ? Math.round((summary.netProfit / summary.totalSalesRevenue) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Moliya va Sof Foyda Tahlili (P&L Accounting)
          </h2>
          <p className="text-xs text-slate-500">
            Kassadan tushgan tushum, tovarlarning tan narxi (COGS), korxona xarajatlari va yakuniy sof foyda
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold"
          >
            Chop etish
          </button>
        </div>
      </div>

      {/* Main Financial Accounting Ledger Card (P&L Cascade) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Foyda va Zarar Hisoboti (P&L Statement)
        </h3>

        <div className="space-y-3 font-mono text-xs sm:text-sm">
          {/* Step 1: Revenue */}
          <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-sans">
                1
              </span>
              <span className="font-semibold text-slate-900 dark:text-white font-sans">
                Jami Savdo Tushumi (Revenue)
              </span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {summary.totalSalesRevenue.toLocaleString()} {profile.currency}
            </span>
          </div>

          {/* Step 2: COGS */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-500 text-white flex items-center justify-center text-xs font-bold font-sans">
                2
              </span>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-sans">
                  (-) Sotilgan Tovarlar Tan Narxi (COGS)
                </span>
                <p className="text-[11px] text-slate-400 font-sans">Xarid qilingan asl narxi</p>
              </div>
            </div>
            <span className="font-bold text-slate-600 dark:text-slate-400 text-base">
              -{summary.costOfGoodsSold.toLocaleString()} {profile.currency}
            </span>
          </div>

          {/* Result 1: Gross Profit */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold font-sans">
                =
              </span>
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200 font-sans text-sm">
                  Yalpi Foyda (Gross Profit)
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 ml-2 font-sans font-semibold">
                  (Marja: {grossProfitMargin}%)
                </span>
              </div>
            </div>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">
              +{summary.grossProfit.toLocaleString()} {profile.currency}
            </span>
          </div>

          {/* Step 3: Expenses */}
          <div className="flex items-center justify-between p-3 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/50">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold font-sans">
                3
              </span>
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-sans">
                  (-) Korxona Operatsion Xarajatlari (Expenses)
                </span>
                <p className="text-[11px] text-slate-400 font-sans">Ijara, maosh, kommunal, transport</p>
              </div>
            </div>
            <span className="font-bold text-rose-600 dark:text-rose-400 text-base">
              -{summary.totalExpenses.toLocaleString()} {profile.currency}
            </span>
          </div>

          {/* Result 2: Net Profit */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 font-sans">
                YAKUNIY SOF FOYDA (NET PROFIT)
              </span>
              <h4 className="text-2xl font-black mt-0.5">
                {summary.netProfit.toLocaleString()} {profile.currency}
              </h4>
            </div>
            <div className="text-right font-sans">
              <span className="text-xs text-emerald-100 block">Sof Rentabellik:</span>
              <span className="text-lg font-bold">{netProfitMargin}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Profitable Products & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Profitable Products */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Eng Ko‘p Foyda Keltirgan Mahsulotlar (Top Products)
            </h3>
            <span className="text-xs text-slate-400">Sof foyda bo‘yicha</span>
          </div>

          <div className="space-y-2.5">
            {topProfitableProducts.map((p, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{p.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    Sotilgan: {p.quantity} dona • Tushum: {p.revenue.toLocaleString()} so‘m
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    +{p.profit.toLocaleString()} so‘m
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Categories Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Xarajatlar Taqsimoti (Kategoriyalar bo‘yicha)
            </h3>
            <span className="text-xs text-rose-600 font-bold">
              Jami: {summary.totalExpenses.toLocaleString()} {profile.currency}
            </span>
          </div>

          <div className="space-y-3">
            {Array.from(expenseByCategory.entries()).map(([cat, amount], idx) => {
              const percent = summary.totalExpenses > 0 ? Math.round((amount / summary.totalExpenses) * 100) : 0;
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{cat}</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {amount.toLocaleString()} so‘m ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-rose-500 rounded-full transition-all"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

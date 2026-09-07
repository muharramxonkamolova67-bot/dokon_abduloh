import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  PackagePlus,
  Warehouse,
  Boxes,
  FileSpreadsheet,
  Users,
  Truck,
  Receipt,
  RotateCcw,
  TrendingUp,
  FileText,
  UserCog,
  Settings,
  History,
  AlertTriangle,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  userRole: UserRole;
  lowStockCount: number;
  expiringCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  userRole,
  lowStockCount,
  expiringCount,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'sotuv', label: 'Sotuv (Kassa / POS)', icon: ShoppingCart, badge: null },
    { id: 'kirim', label: 'Kirim (Xaridlar)', icon: PackagePlus, badge: null },
    {
      id: 'ombor',
      label: 'Ombor',
      icon: Warehouse,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: 'bg-amber-500',
    },
    { id: 'mahsulotlar', label: 'Mahsulotlar', icon: Boxes, badge: null },
    { id: 'excel', label: 'Excel Jadval', icon: FileSpreadsheet, badge: 'PRO' },
    { id: 'mijozlar', label: 'Mijozlar', icon: Users, badge: null },
    { id: 'yetkazib_beruvchilar', label: 'Yetkazib beruvchilar', icon: Truck, badge: null },
    { id: 'xarajatlar', label: 'Xarajatlar', icon: Receipt, badge: null },
    { id: 'qaytarish', label: 'Qaytarish', icon: RotateCcw, badge: null },
    { id: 'foyda_zarar', label: 'Foyda / Zarar', icon: TrendingUp, badge: null },
    { id: 'hisobotlar', label: 'Hisobotlar', icon: FileText, badge: null },
    { id: 'xodimlar', label: 'Xodimlar', icon: UserCog, badge: null, adminOnly: true },
    { id: 'sozlamalar', label: 'Sozlamalar', icon: Settings, badge: null },
    { id: 'audit', label: 'Audit tarixi', icon: History, badge: null, adminOnly: true },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* App brand header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-500/20">
            B
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-wide">BIZNES TIZIMI</h1>
            <p className="text-[10px] text-slate-400 font-mono">ERP & SPREADSHEET</p>
          </div>
        </div>
      </div>

      {/* Warning banner if low stock or expiring */}
      {(lowStockCount > 0 || expiringCount > 0) && (
        <div className="mx-3 mt-3 p-2 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-center space-x-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div className="truncate">
            {lowStockCount > 0 && <span>{lowStockCount} ta kam qolgan</span>}
            {lowStockCount > 0 && expiringCount > 0 && <span> • </span>}
            {expiringCount > 0 && <span>{expiringCount} ta muddati yaqin</span>}
          </div>
        </div>
      )}

      {/* Navigation menu list */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          // If cashier, limit finance, employees and audit
          if (item.adminOnly && userRole !== 'admin') return null;
          if (userRole === 'cashier' && (item.id === 'foyda_zarar' || item.id === 'xarajatlar')) {
            return null;
          }

          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    item.badgeColor
                      ? `${item.badgeColor} text-white`
                      : isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Offline & Baza Faol</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">v2.5 Pro</span>
      </div>
    </aside>
  );
};

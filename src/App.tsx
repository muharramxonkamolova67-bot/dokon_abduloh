import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Table,
  Boxes,
  Package,
  FileSpreadsheet,
  Receipt,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  UserCheck,
  FileText,
  ShieldAlert,
  Settings,
  Plus,
  Sparkles,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { BusinessProfile, Product, User } from './types';
import { BusinessDB } from './services/db';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { PosView } from './components/pos/PosView';
import { ExcelTableView } from './components/excel/ExcelTableView';
import { ProductsView } from './components/products/ProductsView';
import { InventoryView } from './components/inventory/InventoryView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { SalesView } from './components/sales/SalesView';
import { ReturnsView } from './components/returns/ReturnsView';
import { FinanceView } from './components/finance/FinanceView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { CustomersView } from './components/crm/CustomersView';
import { SuppliersView } from './components/crm/SuppliersView';
import { EmployeesView } from './components/employees/EmployeesView';
import { ReportsView } from './components/reports/ReportsView';
import { AuditView } from './components/audit/AuditView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { ProductModal } from './components/modals/ProductModal';
import { OnlineSearchModal } from './components/modals/OnlineSearchModal';

type NavTab =
  | 'dashboard'
  | 'pos'
  | 'excel'
  | 'products'
  | 'inventory'
  | 'purchases'
  | 'sales'
  | 'returns'
  | 'finance'
  | 'expenses'
  | 'customers'
  | 'suppliers'
  | 'employees'
  | 'reports'
  | 'audit'
  | 'settings';

export default function App() {
  const [profile, setProfile] = useState<BusinessProfile>(() => {
    const p = BusinessDB.getProfile();
    return p && p.name
      ? p
      : {
          id: 'biz_01',
          name: 'Grand Pharm & Market',
          type: 'pharmacy',
          currency: "so'm",
          phone: '+998 (90) 123-45-67',
          address: 'Toshkent sh., Amir Temur shoh ko‘chasi, 42-uy',
          receiptHeader: 'Grand Pharm & Market — Savdo va Dorixona Tizimi',
          receiptFooter: 'Xaridingiz uchun rahmat! Salomat bo‘ling!',
          taxRate: 0,
          isConfigured: true,
        };
  });

  const [users, setUsers] = useState<User[]>(() => {
    const u = BusinessDB.getUsers();
    return Array.isArray(u) && u.length > 0
      ? u
      : [
          {
            id: 'user_1',
            name: 'Admin (Boshqaruvchi)',
            username: 'admin',
            role: 'admin',
            status: 'active',
          },
        ];
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const cur = BusinessDB.getCurrentUser();
    if (cur && cur.name) return cur;
    const allUsers = BusinessDB.getUsers();
    return (
      allUsers[0] || {
        id: 'user_1',
        name: 'Admin',
        username: 'admin',
        role: 'admin',
        status: 'active',
      }
    );
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Global modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isOnlineSearchOpen, setIsOnlineSearchOpen] = useState(false);

  // Badge counts
  const [lowStockCount, setLowStockCount] = useState(0);

  const refreshCounts = () => {
    const products = BusinessDB.getProducts();
    const low = products.filter((p) => p.currentStock <= p.minStock).length;
    setLowStockCount(low);
  };

  useEffect(() => {
    refreshCounts();
  }, [activeTab]);

  const handleNavigate = (tab: string, _entityId?: string) => {
    const tabMap: Record<string, NavTab> = {
      sotuv: 'pos',
      pos: 'pos',
      kirim: 'purchases',
      purchases: 'purchases',
      ombor: 'inventory',
      inventory: 'inventory',
      tovarlar: 'products',
      products: 'products',
      savdolar: 'sales',
      sales: 'sales',
      vozvrat: 'returns',
      returns: 'returns',
      moliya: 'finance',
      finance: 'finance',
      xarajatlar: 'expenses',
      expenses: 'expenses',
      mijozlar: 'customers',
      customers: 'customers',
      yetkazib: 'suppliers',
      suppliers: 'suppliers',
      xodimlar: 'employees',
      employees: 'employees',
      hisobotlar: 'reports',
      reports: 'reports',
      audit: 'audit',
      sozlamalar: 'settings',
      settings: 'settings',
      excel: 'excel',
      dashboard: 'dashboard',
    };

    const target = tabMap[tab.toLowerCase()] || (tab as NavTab);
    setActiveTab(target);
    setIsSidebarOpen(false);
  };

  const navGroups = [
    {
      title: 'Asosiy Boshqaruv',
      items: [
        { id: 'dashboard' as NavTab, label: 'Boshqaruv Paneli', icon: LayoutDashboard },
        { id: 'pos' as NavTab, label: 'Kassa / POS Savdo', icon: ShoppingCart, highlight: true },
        { id: 'excel' as NavTab, label: 'Excel Jadval (Smart)', icon: Table, badge: 'Formula' },
      ],
    },
    {
      title: 'Ombor va Tovarlar',
      items: [
        { id: 'products' as NavTab, label: 'Mahsulotlar Katalogi', icon: Boxes },
        {
          id: 'inventory' as NavTab,
          label: 'Ombor & Qoldiqlar',
          icon: Package,
          badgeCount: lowStockCount > 0 ? lowStockCount : undefined,
        },
        { id: 'purchases' as NavTab, label: 'Kirim Hujjatlari', icon: FileSpreadsheet },
        { id: 'sales' as NavTab, label: 'Savdolar Tarixi', icon: Receipt },
        { id: 'returns' as NavTab, label: 'Qaytarishlar (Vozvrat)', icon: RotateCcw },
      ],
    },
    {
      title: 'Moliya va Xarajatlar',
      items: [
        { id: 'finance' as NavTab, label: 'Moliya & Sof Foyda', icon: TrendingUp },
        { id: 'expenses' as NavTab, label: 'Xarajatlar Jurnali', icon: TrendingDown },
        { id: 'customers' as NavTab, label: 'Mijozlar & Nasiyalar', icon: Users },
        { id: 'suppliers' as NavTab, label: 'Yetkazib Beruvchilar', icon: Building2 },
      ],
    },
    {
      title: 'Tizim va Hisobotlar',
      items: [
        { id: 'reports' as NavTab, label: 'Rasmiy Hisobotlar', icon: FileText },
        { id: 'employees' as NavTab, label: 'Xodimlar & Rollar', icon: UserCheck },
        { id: 'audit' as NavTab, label: 'Audit va Tizim Tarixi', icon: ShieldAlert },
        { id: 'settings' as NavTab, label: 'Sozlamalar & Zaxira', icon: Settings },
      ],
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Global Add Product Modal */}
      {isAddProductOpen && (
        <ProductModal
          isOpen={isAddProductOpen}
          onClose={() => setIsAddProductOpen(false)}
          productToEdit={null}
          suppliers={BusinessDB.getSuppliers()}
          currentUser={currentUser}
          isPharmacy={profile.type === 'pharmacy'}
          onSaved={() => {
            refreshCounts();
          }}
        />
      )}

      {/* Global Online Search Modal */}
      {isOnlineSearchOpen && (
        <OnlineSearchModal
          isOpen={isOnlineSearchOpen}
          onClose={() => setIsOnlineSearchOpen(false)}
          currentUser={currentUser}
          profile={profile}
          onProductAdded={() => {
            refreshCounts();
          }}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Brand Logo & Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
                ERP
              </div>
              <div className="leading-tight">
                <h1 className="font-extrabold text-sm text-slate-900 dark:text-white truncate max-w-[140px]">
                  {profile?.name || 'Grand Pharm & Market'}
                </h1>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-slate-400 font-medium capitalize">
                    {profile?.type === 'pharmacy' ? 'Dorixona Tizimi' : 'Savdo & Ombor'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Button: Quick Add Product */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Mahsulot Qo‘shish</span>
            </button>

            <button
              onClick={() => setIsOnlineSearchOpen(true)}
              className="w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Online Bazadan Qidirish</span>
            </button>
          </div>

          {/* Navigation Links (Grouped) */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-xs font-semibold">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.title}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : item.highlight
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {item.badgeCount !== undefined && item.badgeCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-rose-500 text-white">
                          {item.badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Account / Role Switcher */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Joriy Xodim:</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold uppercase">
                {currentUser?.role || 'admin'}
              </span>
            </div>

            <select
              value={currentUser?.id || ''}
              onChange={(e) => {
                const u = users.find((x) => x.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="w-full text-xs font-bold py-1 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          ></div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Bar */}
          <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between flex-shrink-0 z-10">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                  Bo‘lim:
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
                  {activeTab === 'pos'
                    ? 'Kassa / POS Savdo'
                    : activeTab === 'excel'
                    ? 'Excel Smart Jadvali'
                    : activeTab === 'dashboard'
                    ? 'Boshqaruv Paneli'
                    : activeTab === 'inventory'
                    ? 'Ombor & Qoldiqlar'
                    : activeTab === 'finance'
                    ? 'Moliya & Sof Foyda'
                    : activeTab}
                </span>
              </div>
            </div>

            {/* Top Right Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsOnlineSearchOpen(true)}
                title="Online tovar qidiruvi"
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Online Katalog</span>
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isDarkMode ? 'Kunduzgi rejim' : 'Tungi rejim'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center">
                  {(currentUser?.name || 'A').charAt(0)}
                </div>
                <div className="text-left text-xs leading-none">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{currentUser?.name || 'Admin'}</p>
                  <span className="text-[10px] text-slate-400 capitalize">{currentUser?.role || 'admin'}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Active View Container */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeTab === 'dashboard' && (
              <DashboardView
                profile={profile}
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onOpenOnlineSearch={() => setIsOnlineSearchOpen(true)}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
              />
            )}

            {activeTab === 'pos' && (
              <PosView profile={profile} currentUser={currentUser} onNavigate={handleNavigate} />
            )}

            {activeTab === 'excel' && (
              <ExcelTableView
                profile={profile}
                currentUser={currentUser}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
              />
            )}

            {activeTab === 'products' && (
              <ProductsView
                profile={profile}
                currentUser={currentUser}
                onOpenOnlineSearch={() => setIsOnlineSearchOpen(true)}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                profile={profile}
                currentUser={currentUser}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
              />
            )}

            {activeTab === 'purchases' && (
              <PurchasesView
                profile={profile}
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
              />
            )}

            {activeTab === 'sales' && (
              <SalesView profile={profile} currentUser={currentUser} />
            )}

            {activeTab === 'returns' && (
              <ReturnsView profile={profile} currentUser={currentUser} />
            )}

            {activeTab === 'finance' && (
              <FinanceView profile={profile} currentUser={currentUser} />
            )}

            {activeTab === 'expenses' && (
              <ExpensesView profile={profile} currentUser={currentUser} />
            )}

            {activeTab === 'customers' && (
              <CustomersView profile={profile} currentUser={currentUser} />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersView profile={profile} currentUser={currentUser} />
            )}

            {activeTab === 'employees' && (
              <EmployeesView profile={profile} currentUser={currentUser} />
            )}

            {activeTab === 'reports' && (
              <ReportsView profile={profile} currentUser={currentUser} />
            )}

            {activeTab === 'audit' && (
              <AuditView profile={profile} currentUser={currentUser} />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                profile={profile}
                currentUser={currentUser}
                onProfileUpdated={(updated) => setProfile(updated)}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

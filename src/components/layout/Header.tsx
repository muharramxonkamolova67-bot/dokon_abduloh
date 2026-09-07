import React from 'react';
import {
  Search,
  Globe,
  ShoppingCart,
  PackagePlus,
  Moon,
  Sun,
  ShieldCheck,
  Building2,
  UserCheck,
  Users,
} from 'lucide-react';
import { BusinessProfile, User } from '../../types';

interface HeaderProps {
  profile?: BusinessProfile;
  currentUser?: User;
  users?: User[];
  onSelectUser?: (user: User) => void;
  onOpenUniversalSearch?: () => void;
  onOpenOnlineSearch?: () => void;
  onNavigate?: (tab: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentUser,
  users = [],
  onSelectUser,
  onOpenUniversalSearch,
  onOpenOnlineSearch,
  onNavigate,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const profileName = profile?.name || 'Biznes Tizimi';
  const userName = currentUser?.name || 'Foydalanuvchi';
  const userRole = currentUser?.role || 'admin';
  const currency = profile?.currency || "so'm";

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Store Title & Type */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            {profileName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800 dark:text-white text-base leading-tight tracking-tight">
                {profileName}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                  profile?.type === 'pharmacy'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                }`}
              >
                {profile?.type === 'pharmacy' ? 'Dorixona' : profile?.type === 'shop' ? 'Do‘kon' : 'Savdo'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {currency.toUpperCase()} • Excel + POS + Buxgalteriya
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="flex-1 max-w-lg mx-4 hidden md:block">
        <button
          onClick={onOpenUniversalSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-sm border border-slate-200 dark:border-slate-700 transition-colors group text-left cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span>Mahsulot, shtrix-kod, mijoz, chek qidirish...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenUniversalSearch}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg md:hidden"
          title="Qidirish"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Online Search Button */}
        <button
          onClick={onOpenOnlineSearch}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-800/60 transition-colors"
          title="Internet mahsulotlar bazasidan qidirish"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <span className="hidden sm:inline">Online Qidiruv</span>
        </button>

        {/* Quick POS Cashier Button */}
        <button
          onClick={() => onNavigate('sotuv')}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Kassa (POS)</span>
        </button>

        {/* Quick Kirim Button */}
        <button
          onClick={() => onNavigate('kirim')}
          className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-800 transition-colors"
        >
          <PackagePlus className="w-3.5 h-3.5" />
          <span>Kirim</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title={isDarkMode ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Switcher Dropdown */}
        <div className="relative group">
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center font-bold text-xs">
              {userName.charAt(0)}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {userName}
              </p>
              <div className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {userRole === 'admin'
                    ? 'Admin'
                    : userRole === 'manager'
                    ? 'Menejer'
                    : 'Kassir'}
                </span>
              </div>
            </div>
          </div>

          {/* User selector popup */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 hidden group-hover:block z-50">
            <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Foydalanuvchini almashtirish
              </p>
            </div>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => onSelectUser && onSelectUser(u)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors ${
                  u.id === currentUser?.id
                    ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">
                    {(u.name || 'U').charAt(0)}
                  </div>
                  <div>
                    <p className="leading-tight">{u.name}</p>
                    <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
                  </div>
                </div>
                {u.id === currentUser?.id && <UserCheck className="w-4 h-4 text-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

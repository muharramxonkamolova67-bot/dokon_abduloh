import React, { useState, useRef } from 'react';
import {
  Settings,
  Building2,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Save,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { BusinessProfile, User } from '../../types';
import { BusinessDB } from '../../services/db';

interface SettingsViewProps {
  profile: BusinessProfile;
  currentUser: User;
  onProfileUpdated: (updated: BusinessProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  currentUser,
  onProfileUpdated,
}) => {
  const [name, setName] = useState(profile.name);
  const [type, setType] = useState(profile.type);
  const [currency, setCurrency] = useState(profile.currency);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [receiptHeader, setReceiptHeader] = useState(profile.receiptHeader || '');
  const [receiptFooter, setReceiptFooter] = useState(profile.receiptFooter || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Backup & restore
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BusinessProfile = {
      ...profile,
      name: name.trim(),
      type,
      currency,
      phone: phone.trim(),
      address: address.trim(),
      receiptHeader: receiptHeader.trim() || undefined,
      receiptFooter: receiptFooter.trim() || undefined,
    };

    BusinessDB.saveProfile(updated);
    onProfileUpdated(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleDownloadBackup = () => {
    const backupJson = BusinessDB.exportCompleteBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMsg('Baza zaxira nusxasi muvaffaqiyatli yuklab olindi!');
    setTimeout(() => setBackupMsg(null), 4000);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = BusinessDB.restoreFromBackup(content, currentUser);
        if (res.success) {
          setBackupMsg('Baza zaxira nusxadan to‘liq tiklandi! Sahifa yangilanmoqda...');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setBackupMsg(`Xatolik: ${res.error}`);
        }
      } catch (err) {
        setBackupMsg('Faylni o‘qishda xatolik!');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetToDemo = () => {
    if (window.confirm('Haqiqatan ham barcha ma’lumotlarni dastlabki namunaviy holatga qaytarmoqchimisiz?')) {
      BusinessDB.resetToDemo();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>Tizim Sozlamalari va Baza Zaxirasi</span>
        </h2>
        <p className="text-xs text-slate-500">
          Korxona rekvizitlari, kassa cheki parametrlari hamda ma’lumotlar xavfsizligi
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Sozlamalar muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      {backupMsg && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-2 text-xs text-blue-800 dark:text-blue-300">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>{backupMsg}</span>
        </div>
      )}

      {/* Business Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Do‘kon / Korxona Rekvizitlari</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Kompaniya / Do‘kon Nomi *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Faoliyat Turi *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-semibold"
            >
              <option value="retail">Savdo do‘koni / Supermarket / Universal</option>
              <option value="pharmacy">Dorixona (Partiya, seriya va yaroqlilik nazorati bilan)</option>
              <option value="wholesale">Ulgurji savdo (Optom ombor)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Asosiy Valyuta
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="so‘m, USD"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Telefon Raqami
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Manzil (Chekda chop etiladi)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Kassa Cheki Sarlavhasi (Ixtiyoriy)
            </label>
            <input
              type="text"
              value={receiptHeader}
              onChange={(e) => setReceiptHeader(e.target.value)}
              placeholder="Masalan: Qulay narxlar va sifat kafolati!"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Kassa Cheki Pastki Matni
            </label>
            <input
              type="text"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              placeholder="Xaridingiz uchun rahmat! Yana kutamiz!"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Sozlamalarni Saqlash</span>
          </button>
        </div>
      </form>

      {/* Database Backup & Restore Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Database className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Ma’lumotlar Bazasi Zaxirasi (Backup & Restore)
          </h3>
        </div>

        <p className="text-xs text-slate-500">
          Tizimdagi barcha tovarlar, ombor qoldiqlari, sotuvlar, kirimlar, mijozlar va moliya tarixini bitta
          faylga yuklab oling yoki boshqa qurilmaga tiklang.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleRestoreBackup}
          className="hidden"
        />

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>To‘liq Zaxira Nusxani Yuklab Olish (Backup JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Zaxiradan Tiklash (Restore JSON)</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDemo}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2 ml-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Namunaviy Baza Qaytarish</span>
          </button>
        </div>
      </div>
    </div>
  );
};

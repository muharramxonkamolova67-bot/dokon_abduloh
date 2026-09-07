import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Phone,
  DollarSign,
  CreditCard,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import { BusinessProfile, Supplier, User } from '../../types';
import { BusinessDB } from '../../services/db';

interface SuppliersViewProps {
  profile: BusinessProfile;
  currentUser: User;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ profile, currentUser }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // New Supplier
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Repayment
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payNote, setPayNote] = useState('Ta’minotchiga qarz to‘lovi');

  const loadData = () => {
    setSuppliers(BusinessDB.getSuppliers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    BusinessDB.addSupplier(
      {
        name: name.trim(),
        contactPerson: contactPerson.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      },
      currentUser
    );

    loadData();
    setIsAddModalOpen(false);
    setName('');
    setContactPerson('');
    setPhone('');
    setAddress('');
  };

  const handleOpenPay = (s: Supplier) => {
    setSelectedSupplier(s);
    setPayAmount(s.currentDebt);
    setIsPayModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    const amount = typeof payAmount === 'number' ? payAmount : Number(payAmount) || 0;
    if (amount <= 0) return;

    BusinessDB.recordSupplierDebtPayment(
      selectedSupplier.id,
      amount,
      payNote,
      currentUser
    );

    loadData();
    setIsPayModalOpen(false);
    setSelectedSupplier(null);
  };

  const filtered = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || s.name.toLowerCase().includes(q) || (s.phone && s.phone.includes(q));
  });

  const totalOwed = suppliers.reduce((sum, s) => sum + s.currentDebt, 0);

  return (
    <div className="space-y-6">
      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddSupplier}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Yangi Yetkazib Beruvchi</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Korxona / Ta’minotchi nomi *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Grand Pharm MChJ"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Aloqa qiluvchi shaxs</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Masalan: Jamshid aka (Menejer)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Telefon raqami</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 71 200 00 00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Manzil</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Toshkent sh., Chilonzor..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white"
              >
                Saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {isPayModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleSavePayment}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Yetkazib Beruvchiga Qarzni To‘lash</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-xs space-y-1">
              <p className="font-bold text-rose-900 dark:text-rose-200">{selectedSupplier.name}</p>
              <p className="text-rose-700 dark:text-rose-300">
                Bizning jami qarzimiz:{' '}
                <strong className="text-sm">{selectedSupplier.currentDebt.toLocaleString()} so‘m</strong>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">To‘lanayotgan summa (so‘m) *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedSupplier.currentDebt}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">To‘lov izohi</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white"
              >
                To‘lovni Qayd Qilish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Yetkazib Beruvchilar (Kontragentlar)
          </h2>
          <p className="text-xs text-slate-500">
            Kompaniyaga tovar keltiruvchi ta’minotchilar va ularga to‘lanishi kerak bo‘lgan qarzlar
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Yetkazib Beruvchi</span>
        </button>
      </div>

      {/* Total Debt Box */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Bizning Yetkazib Beruvchilarga Jami Qarzimiz
          </span>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {totalOwed.toLocaleString()} {profile.currency}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{suppliers.length} ta hamkor ta’minotchi</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Kompaniya Nomi</th>
                <th className="p-3.5">Mas’ul Shaxs</th>
                <th className="p-3.5">Telefon</th>
                <th className="p-3.5">Jami Keltirilgan Yuk</th>
                <th className="p-3.5">Bizning Qarzimiz</th>
                <th className="p-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {s.name}
                    {s.address && <span className="block text-[10px] text-slate-400 font-normal">{s.address}</span>}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{s.contactPerson || '-'}</td>
                  <td className="p-3.5 font-mono text-slate-500">{s.phone || '-'}</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {s.totalSupplied.toLocaleString()} {profile.currency}
                  </td>
                  <td className="p-3.5 font-bold font-mono">
                    <span className={s.currentDebt > 0 ? 'text-rose-600' : 'text-slate-400'}>
                      {s.currentDebt.toLocaleString()} {profile.currency}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {s.currentDebt > 0 && (
                      <button
                        onClick={() => handleOpenPay(s)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Qarzni to‘lash
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

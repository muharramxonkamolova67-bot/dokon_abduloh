import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  DollarSign,
  CreditCard,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import { BusinessProfile, Customer, User } from '../../types';
import { BusinessDB } from '../../services/db';

interface CustomersViewProps {
  profile: BusinessProfile;
  currentUser: User;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ profile, currentUser }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New Customer Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentNote, setPaymentNote] = useState('Nasiya qarz to‘lovi');

  const loadData = () => {
    setCustomers(BusinessDB.getCustomers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    BusinessDB.addCustomer(
      {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      },
      currentUser
    );

    loadData();
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setAddress('');
  };

  const handleOpenPayModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPaymentAmount(customer.currentDebt);
    setIsPayModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const amount = typeof paymentAmount === 'number' ? paymentAmount : Number(paymentAmount) || 0;
    if (amount <= 0) return;

    BusinessDB.recordCustomerDebtPayment(
      selectedCustomer.id,
      amount,
      paymentNote,
      currentUser
    );

    loadData();
    setIsPayModalOpen(false);
    setSelectedCustomer(null);
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
  });

  const totalDebt = customers.reduce((sum, c) => sum + c.currentDebt, 0);

  return (
    <div className="space-y-6">
      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddCustomer}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Yangi Mijoz Qo‘shish</span>
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
                <label className="block font-semibold mb-1">Mijozning to‘liq ismi *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Sardor Rahimov"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Telefon raqami</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Manzili</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shahar, tuman, ko‘cha..."
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

      {/* Debt Repayment Modal */}
      {isPayModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleSavePayment}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Qarz To‘lovini Qabul Qilish</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs space-y-1">
              <p className="font-bold text-amber-900 dark:text-amber-200">{selectedCustomer.name}</p>
              <p className="text-amber-700 dark:text-amber-300">
                Jami nasiya qarzi:{' '}
                <strong className="text-sm">{selectedCustomer.currentDebt.toLocaleString()} so‘m</strong>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">To‘lanayotgan summa (so‘m) *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedCustomer.currentDebt}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Kassa izohi</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
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
                To‘lovni Qabul Qilish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Mijozlar Bazasi va Nasiyalar (CRM)
          </h2>
          <p className="text-xs text-slate-500">
            Xaridorlar ro‘yxati, xaridlar tarixi va qarz daftari nazorati
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Mijoz Qo‘shish</span>
        </button>
      </div>

      {/* Total Debt Box */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Mijozlarning Bizga Jami Qarzi (Nasiyalar)
          </span>
          <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalDebt.toLocaleString()} {profile.currency}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{customers.length} ta ro‘yxatga olingan mijoz</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
          <CreditCard className="w-6 h-6" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Mijoz Ismi</th>
                <th className="p-3.5">Telefon</th>
                <th className="p-3.5">Xaridlar Soni</th>
                <th className="p-3.5">Jami Xarid Summasi</th>
                <th className="p-3.5">Joriy Nasiya Qarzi</th>
                <th className="p-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {c.name}
                    {c.address && <span className="block text-[10px] text-slate-400 font-normal">{c.address}</span>}
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">{c.phone || '-'}</td>
                  <td className="p-3.5 font-bold">{c.totalPurchases} marta</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {c.totalSpent.toLocaleString()} {profile.currency}
                  </td>
                  <td className="p-3.5 font-bold font-mono">
                    <span className={c.currentDebt > 0 ? 'text-rose-600' : 'text-slate-400'}>
                      {c.currentDebt.toLocaleString()} {profile.currency}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {c.currentDebt > 0 && (
                      <button
                        onClick={() => handleOpenPayModal(c)}
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

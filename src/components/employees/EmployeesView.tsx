import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Shield,
  Phone,
  Mail,
  CheckCircle2,
  X,
  ShoppingCart,
} from 'lucide-react';
import { BusinessProfile, User } from '../../types';
import { BusinessDB } from '../../services/db';

interface EmployeesViewProps {
  profile: BusinessProfile;
  currentUser: User;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({ profile, currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'cashier'>('cashier');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const loadData = () => {
    setUsers(BusinessDB.getUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    BusinessDB.addUser(
      {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        role,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      },
      currentUser
    );

    loadData();
    setIsModalOpen(false);
    setName('');
    setUsername('');
    setPhone('');
    setEmail('');
  };

  const sales = BusinessDB.getSales();

  return (
    <div className="space-y-6">
      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddUser}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Yangi Xodim Qo‘shish</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">To‘liq ismi *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Nodir Aliyev"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Foydalanuvchi logini (Username) *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nodir_kassa"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Lavozim / Ruxsat darajasi *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold"
                >
                  <option value="cashier">Kassir (Sotuv va chek chiqarish huquqi)</option>
                  <option value="manager">Menejer (Kirim va ombor boshqaruvi)</option>
                  <option value="admin">Administrator (Barcha huquqlar, tahrirlash va o‘chirish)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Telefon raqami</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 000 00 00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white"
              >
                Xodimni Saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Xodimlar va Ruxsatlar (User Access Management)
          </h2>
          <p className="text-xs text-slate-500">
            Kassirlar, omborchilar va administratorlar ro‘yxati hamda har birining savdo samaradorligi
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Xodim Qo‘shish</span>
          </button>
        )}
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.map((u) => {
          const userSales = sales.filter((s) => s.createdById === u.id);
          const totalGenerated = userSales.reduce((sum, s) => sum + s.totalAmount, 0);

          return (
            <div
              key={u.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-black text-base flex items-center justify-center">
                    {(u.name || 'U').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{u.name || 'Xodim'}</h3>
                    <p className="text-xs text-slate-400 font-mono">@{u.username || 'user'}</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    u.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      : u.role === 'manager'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {u.role}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                {u.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Ruxsat:{' '}
                    {u.role === 'admin'
                      ? 'To‘liq boshqaruv (Barcha huquqlar)'
                      : u.role === 'manager'
                      ? 'Kirim va ombor nazorati'
                      : 'Kassa va savdo operatsiyalari'}
                  </span>
                </div>
              </div>

              {/* Performance Box */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Amalga oshirgan sotuvlari:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{userSales.length} ta chek</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Jami tushumi:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {totalGenerated.toLocaleString()} {profile.currency}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

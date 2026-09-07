import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Trash2,
  X,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { BusinessProfile, Expense, User } from '../../types';
import { BusinessDB } from '../../services/db';

interface ExpensesViewProps {
  profile: BusinessProfile;
  currentUser: User;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ profile, currentUser }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Ijara');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const loadData = () => {
    setExpenses(BusinessDB.getExpenses());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
    if (numAmount <= 0) return;

    BusinessDB.addExpense(
      {
        name: title.trim(),
        title: title.trim(),
        category,
        amount: numAmount,
        date: new Date(date).toISOString(),
        createdById: currentUser.id,
        createdByName: currentUser.name,
        notes: notes.trim() || undefined,
      },
      currentUser
    );

    loadData();
    setIsModalOpen(false);
    setTitle('');
    setAmount('');
    setNotes('');
  };

  const filteredExpenses = expenses.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
  });

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddExpense}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                <span>Yangi Xarajat Qayd Qilish</span>
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
                <label className="block font-semibold mb-1">Xarajat nomi / maqsadi *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Dekabr oyi do‘kon ijarasi"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Kategoriya</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="Ijara">Do‘kon Ijarasi (Rent)</option>
                  <option value="Xodimlar maoshi">Xodimlar Maoshi (Salary)</option>
                  <option value="Kommunal">Kommunal (Svet, Gaz, Suv, Musor)</option>
                  <option value="Internet va aloqa">Internet va Aloqa</option>
                  <option value="Transport va benzin">Transport va Benzin</option>
                  <option value="Soliqlar">Soliqlar va Litsenziyalar</option>
                  <option value="Reklama">Reklama va Marketing</option>
                  <option value="Kantselyariya va xo‘jalik">Kantselyariya va Xo‘jalik mollari</option>
                  <option value="Boshqa">Boshqa xarajatlar</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Summasi ({profile.currency}) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Sanasi</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Izoh (ixtiyoriy)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Qo‘shimcha tafsilotlar..."
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
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white"
              >
                Xarajatni Saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Xarajatlar Jurnali (Expenses)
          </h2>
          <p className="text-xs text-slate-500">
            Biznesingizning barcha operatsion xarajatlari sof foydani to‘g‘ri hisoblash uchun bu yerda qayd etiladi
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Xarajat Qayd Qilish</span>
        </button>
      </div>

      {/* KPI Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Jami Xarajatlar Summasi
          </span>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {totalExpense.toLocaleString()} {profile.currency}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{filteredExpenses.length} ta operatsiya bo‘yicha</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
          <TrendingDown className="w-6 h-6" />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Nomi</th>
                <th className="p-3.5">Kategoriya</th>
                <th className="p-3.5">Sana</th>
                <th className="p-3.5">Kiritgan xodim</th>
                <th className="p-3.5">Summasi</th>
                <th className="p-3.5">Izoh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{exp.title}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {new Date(exp.date).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-3.5 text-slate-500">{exp.createdByName}</td>
                  <td className="p-3.5 font-bold text-rose-600 dark:text-rose-400 font-mono">
                    -{exp.amount.toLocaleString()} {profile.currency}
                  </td>
                  <td className="p-3.5 text-slate-400">{exp.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

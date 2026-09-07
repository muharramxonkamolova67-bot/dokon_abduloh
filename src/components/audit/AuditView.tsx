import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Layers,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { AuditLog, BusinessProfile, User as AppUser } from '../../types';
import { BusinessDB } from '../../services/db';

interface AuditViewProps {
  profile: BusinessProfile;
  currentUser: AppUser;
}

export const AuditView: React.FC<AuditViewProps> = ({ profile, currentUser }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const loadData = () => {
    setLogs(BusinessDB.getAuditLogs());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.userName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entityName.toLowerCase().includes(q);

    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;

    return matchesSearch && matchesEntity;
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'delete':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'adjust_stock':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <span>Audit va Tizim Tarixi (Audit Log)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Tizimdagi har bir sotuv, kirim, qoldiq to‘g‘rilash va o‘zgarishlar vaqti va xodimi bilan doimiy saqlanadi
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Xodim ismi, amal turi yoki detal bo‘yicha izlash..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Bo‘lim:</span>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg outline-none"
          >
            <option value="ALL">Barcha bo‘limlar</option>
            <option value="Product">Mahsulotlar</option>
            <option value="Sale">Sotuvlar (Kassa)</option>
            <option value="Purchase">Kirimlar</option>
            <option value="Customer">Mijozlar</option>
            <option value="Supplier">Yetkazib beruvchilar</option>
            <option value="Expense">Xarajatlar</option>
            <option value="Return">Qaytarishlar</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b">
              <tr>
                <th className="p-3.5">Vaqt va Sana</th>
                <th className="p-3.5">Xodim</th>
                <th className="p-3.5">Amal Turi</th>
                <th className="p-3.5">Bo‘lim</th>
                <th className="p-3.5">Obyekt</th>
                <th className="p-3.5">Amal Tafsiloti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 text-slate-500 whitespace-nowrap font-mono">
                    {new Date(log.timestamp).toLocaleString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-white whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getActionBadgeColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-300">{log.entityType}</td>
                  <td className="p-3.5 font-medium text-slate-900 dark:text-white">{log.entityName}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-md">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Printer, X, Check, ShieldCheck } from 'lucide-react';
import { BusinessProfile, Sale } from '../../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  profile: BusinessProfile;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
  profile,
}) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const paymentLabels: Record<string, string> = {
    cash: 'Naqd pul',
    card: 'Plastik karta',
    transfer: 'Bank o‘tkazmasi',
    debt: 'Nasiya / Qarz',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header toolbar */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 print:hidden">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              Sotuv Muvaffaqiyatli Saqlandi
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Chop etish (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt (80mm standard width) */}
        <div className="p-6 bg-white text-slate-900 font-mono text-xs max-h-[75vh] overflow-y-auto print:max-h-none print:p-0">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-400 space-y-1">
            <h2 className="text-base font-black tracking-tight">{profile.name}</h2>
            <p className="text-[11px] text-slate-600">{profile.address}</p>
            <p className="text-[11px] text-slate-600">Tel: {profile.phone}</p>
            {profile.receiptHeader && (
              <p className="text-[10px] text-slate-500 italic mt-1">{profile.receiptHeader}</p>
            )}
          </div>

          {/* Meta Info */}
          <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Chek raqami:</span>
              <span className="font-bold">{sale.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Sana / Vaqt:</span>
              <span>{new Date(sale.date).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Kassir / Xodim:</span>
              <span>{sale.createdByName}</span>
            </div>
            <div className="flex justify-between">
              <span>Mijoz:</span>
              <span className="font-bold">{sale.customerName}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
            <div className="flex justify-between font-bold text-[10px] text-slate-500 pb-1 border-b border-slate-200 uppercase">
              <span className="w-1/2">Mahsulot</span>
              <span className="w-1/4 text-center">Soni x Narx</span>
              <span className="w-1/4 text-right">Summa</span>
            </div>

            {sale.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <p className="font-semibold text-slate-900 leading-tight">{item.productName}</p>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span className="text-[10px] text-slate-400">{item.barcode}</span>
                  <span>
                    {item.quantity} {item.unit} x {item.sellingPrice.toLocaleString()}
                  </span>
                  <span className="font-bold text-slate-900">{item.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Calculations Total */}
          <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span>Oraliq summa:</span>
              <span>{sale.subtotal.toLocaleString()} so‘m</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Chegirma:</span>
                <span>-{sale.discount.toLocaleString()} so‘m</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black pt-1 border-t border-slate-300">
              <span>JAMI TO‘LOV:</span>
              <span>{sale.totalAmount.toLocaleString()} so‘m</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 pt-1">
              <span>To‘lov usuli:</span>
              <span className="font-bold uppercase">{paymentLabels[sale.paymentMethod] || sale.paymentMethod}</span>
            </div>
            {sale.debtAmount > 0 && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>Nasiya (Qarz):</span>
                <span>{sale.debtAmount.toLocaleString()} so‘m</span>
              </div>
            )}
          </div>

          {/* Simulated Barcode at bottom of receipt */}
          <div className="text-center pt-4 space-y-1">
            <div className="h-9 max-w-[200px] mx-auto bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px,#000_4px,#000_7px,#fff_7px,#fff_9px)] rounded-xs"></div>
            <p className="text-[10px] tracking-widest text-slate-600 font-bold">{sale.receiptNumber}</p>
            {profile.receiptFooter && (
              <p className="text-[10px] text-slate-500 italic mt-2">{profile.receiptFooter}</p>
            )}
            <p className="text-[9px] text-slate-400">Tizim: Business Management ERP</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Yopish (Kassaga qaytish)
          </button>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShieldCheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);
const CheckCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const XCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
);
const AlertTriangleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

export const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md p-4 z-[9999] flex items-center justify-center animate-fade-in" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-3xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hidden md:block mb-6 text-center">
              <h1 className="text-3xl font-extrabold text-white mb-2">Lisensi & Penggunaan Aplikasi</h1>
              <p className="text-slate-300">Hak kepemilikan dan batasan penggunaan eksklusif oleh Ardra.</p>
            </div>

            <div className="bg-white dark:bg-gray-900 w-full rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 flex flex-col max-h-[85vh]">
                <div className="p-6 md:hidden text-left border-b border-slate-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Lisensi & Penggunaan</h1>
                </div>
                
                <div className="p-6 md:p-8 text-left space-y-8 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900">
                    <div className="flex items-start gap-5 pb-8 border-b border-slate-100 dark:border-white/10">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <ShieldCheckIcon />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kepemilikan Intelektual</h2>
                            <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm leading-relaxed">Seluruh hak kekayaan intelektual atas aplikasi ini—termasuk konsep, desain, kode, dan alur kerja—adalah milik eksklusif <strong className="text-slate-900 dark:text-white">Ardra</strong>. Lisensi ini tidak memberikan hak kepemilikan apa pun kepada pengguna.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-5 pb-8 border-b border-slate-100 dark:border-white/10">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <CheckCircleIcon />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Penggunaan yang Diizinkan</h2>
                            <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm leading-relaxed">Anda diberikan lisensi terbatas oleh Ardra untuk menggunakan aplikasi ini untuk keperluan pribadi atau bisnis yang sah, sesuai dengan fungsionalitas yang disediakan.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-5">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                            <XCircleIcon />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Batasan & Larangan</h2>
                            <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm">Anda dilarang keras untuk melakukan tindakan berikut:</p>
                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 mt-2 space-y-1 text-sm pl-1">
                                <li>Menyalin, menduplikasi, atau mereproduksi aplikasi dalam bentuk apa pun.</li>
                                <li>Melakukan rekayasa balik (reverse-engineering), membongkar, atau memodifikasi sistem.</li>
                                <li>Menjual kembali, menyewakan, atau mendistribusikan ulang aplikasi tanpa izin tertulis dari <strong className="text-slate-900 dark:text-white">Ardra</strong>.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-4 rounded-r-xl" role="alert">
                        <div className="flex items-start">
                            <div className="py-1"><AlertTriangleIcon /></div>
                            <div className="ml-3">
                                <p className="font-bold">Peringatan Keras</p>
                                <p className="text-sm mt-1">Penyebaran, penjualan ulang, atau kloning aplikasi ini tanpa izin adalah pelanggaran hukum. Tindakan hukum akan diambil terhadap pihak mana pun yang melanggar ketentuan ini.</p>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 text-right md:hidden">
                    <button onClick={onClose} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold">
                        Tutup
                    </button>
                 </div>
            </div>
            
             <button onClick={onClose} className="hidden md:inline-block mt-6 bg-white/10 text-white font-semibold py-2 px-8 rounded-full backdrop-blur-lg hover:bg-white/20 transition-all border border-white/10 hover:scale-105">
                Tutup
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

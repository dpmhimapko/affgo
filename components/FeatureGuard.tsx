
import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Lock } from './icons/LucideIcons';
import { motion } from 'framer-motion';

interface FeatureGuardProps {
  children: React.ReactNode;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({ children }) => {
  const { isApproved, isAdmin, loading } = useUser();

  if (loading) return null;

  if (isApproved || isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-50 grayscale select-none">
        {children}
      </div>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-800 border-4 border-cartoon-dark p-6 sm:p-8 rounded-[2rem] shadow-cartoon-lg max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 bg-cartoon-yellow border-4 border-cartoon-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-cartoon">
            <Lock className="w-8 h-8 text-cartoon-dark" />
          </div>
          <h2 className="text-xl font-black text-cartoon-dark dark:text-white mb-2 uppercase italic">Akses Terbatas</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-bold mb-6">
            Akun Anda belum disetujui oleh admin. Anda dapat melihat fitur ini, tetapi belum dapat menjalankannya.
          </p>
          <a
            href="https://wa.me/62882002152004"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-3 px-6 bg-cartoon-blue text-white font-black rounded-xl border-4 border-cartoon-dark shadow-cartoon hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-cartoon-hover transition-all text-sm"
          >
            HUBUNGI ADMIN
          </a>
        </motion.div>
      </div>
    </div>
  );
};

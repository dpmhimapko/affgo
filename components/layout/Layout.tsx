
import React, { useState } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Sidebar } from './Sidebar';
import type { View } from '../../App';
import { useApiKey } from '../../hooks/useApiKey';
import { useLanguage } from '../../contexts/LanguageContext';
import { Lock, Key } from '../icons/LucideIcons';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  setActiveView: (view: View) => void;
  isAdmin?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, isAdmin }) => {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isConfigured } = useApiKey();
  const { t } = useLanguage();

  const isRestrictedView = !['home', 'featureGuide', 'settings', 'adminDashboard'].includes(activeView);
  const isLocked = !isConfigured && isRestrictedView;

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-100">
      <Header 
        onMenuClick={() => setMobileSidebarOpen(true)} 
      />
      
      <div className="flex flex-grow w-full max-w-[1380px] mx-auto relative pt-6 px-4 sm:px-6 lg:px-8 gap-6 lg:gap-8">
        {/* Overlay for mobile */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}
        
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
          isAdmin={isAdmin}
        />
        
        <main className="flex-1 min-w-0 pb-12 animate-fade-in relative">
          <div className={isLocked ? 'pointer-events-none select-none' : ''}>
            {children}
          </div>

          <AnimatePresence>
            {isLocked && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-white/40 backdrop-blur-[2px] rounded-[2.5rem]"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white border-4 border-cartoon-dark p-8 rounded-[2rem] shadow-cartoon-lg max-w-md w-full text-center pointer-events-auto"
                >
                  <div className="w-20 h-20 bg-cartoon-yellow border-4 border-cartoon-dark rounded-full flex items-center justify-center mx-auto mb-6 shadow-cartoon">
                    <Lock className="w-10 h-10 text-cartoon-dark" />
                  </div>
                  <h2 className="text-2xl font-black text-cartoon-dark mb-4 uppercase italic">Fitur Terkunci!</h2>
                  <p className="text-slate-600 font-bold mb-8">
                    Ups! Kamu harus mengatur API Key terlebih dahulu untuk menggunakan fitur keren ini.
                  </p>
                  <button
                    onClick={() => setActiveView('settings')}
                    className="w-full bg-cartoon-blue text-white font-black py-4 rounded-2xl border-4 border-cartoon-dark shadow-cartoon hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-cartoon-hover transition-all flex items-center justify-center gap-3"
                  >
                    <Key className="w-6 h-6" />
                    ATUR API KEY SEKARANG
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <Footer />
    </div>
  );
};

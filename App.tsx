
import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { UsageProvider } from './contexts/UsageContext';
import { Layout } from './components/layout/Layout';
import { VirtualTryOn } from './pages/VirtualTryOn';
import HomePage from './pages/HomePage';
import GoAesthetic from './pages/GoAesthetic';
import GoKids from './pages/GoKids';
import GoFamily from './pages/GoFamily';
import GoKamarAesthetic from './pages/GoKamarAesthetic';
import GoSofa from './pages/GoSofa';
import GoSofaV2 from './pages/GoSofaV2';
import GoHanger from './pages/GoHanger';
import GoHangerV2 from './pages/GoHangerV2';
import GoKain from './pages/GoKain';
import GoSepatu from './pages/GoSepatu';
import GoSepatuV2 from './pages/GoSepatuV2';
import { GoModelVip } from './pages/GoModelVip';
import { GoModelPremium } from './pages/GoModelPremium';
import { GoModelPremiumV2 } from './pages/GoModelPremiumV2';
import GoCermin from './pages/GoCermin';
import GoClean from './pages/GoClean';
import { GoSelfieVip } from './pages/GoSelfieVip';
import { GoSetup } from './pages/GoSetup';
import { GoSetupV2 } from './pages/GoSetupV2';
import { GoSetupV3 } from './pages/GoSetupV3';
import { History } from './pages/History';
import { FeatureGuide } from './pages/FeatureGuide';
import { AdminDashboard } from './pages/AdminDashboard';
import { auth, db, doc, updateDoc } from './firebase';
import { Login } from './components/Login';
import { Spinner } from './components/Spinner';
import { AlertTriangle as AlertCircle } from './components/icons/LucideIcons';
import { motion, AnimatePresence } from 'framer-motion';

import { UserProvider, useUser } from './contexts/UserContext';
import { FeatureGuard } from './components/FeatureGuard';

export type View = 'home' | 'featureGuide' | 'virtualTryOn' | 'goAesthetic' | 'goKamarAesthetic' | 'goSofa' | 'goSofaV2' | 'goHanger' | 'goHangerV2' | 'goKain' | 'goSepatu' | 'goSepatuV2' | 'goKids' | 'goFamily' | 'goModelVip' | 'goModelPremium' | 'goModelPremiumV2' | 'goCermin' | 'goClean' | 'goSelfieVip' | 'goSetup' | 'goSetupV2' | 'goSetupV3' | 'adminDashboard';

function AppContent() {
  const { t } = useLanguage();
  const { user, loading, isAdmin, isApproved } = useUser();
  const [activeView, setActiveView] = useState<View>('home');
  const [apiErrorType, setApiErrorType] = useState<'API_KEY_LIMIT' | 'API_KEY_INVALID' | null>(null);

  useEffect(() => {
    const handleError = (e: any) => {
      setApiErrorType(e.detail);
    };
    window.addEventListener('gemini-api-error', handleError);
    return () => window.removeEventListener('gemini-api-error', handleError);
  }, []);

  useEffect(() => {
    if (user) {
      const updateActivity = async () => {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            lastActive: new Date()
          });
        } catch (e) {
          console.error("Error updating activity:", e);
        }
      };
      updateActivity();
    }
  }, [user]);

  const handleNavigate = (view: View) => {
    setActiveView(view);
  };

  const renderActiveView = () => {
      const view = (() => {
        switch (activeView) {
          case 'home': return <HomePage />;
          case 'featureGuide': return <FeatureGuide />;
          case 'virtualTryOn': return <VirtualTryOn />;
          case 'goModelVip': return <GoModelVip />;
          case 'goModelPremium': return <GoModelPremium />;
          case 'goModelPremiumV2': return <GoModelPremiumV2 />;
          case 'goAesthetic': return <GoAesthetic />;
          case 'goKamarAesthetic': return <GoKamarAesthetic />;
          case 'goSofa': return <GoSofa />;
          case 'goSofaV2': return <GoSofaV2 />;
          case 'goHanger': return <GoHanger />;
          case 'goHangerV2': return <GoHangerV2 />;
          case 'goKain': return <GoKain />;
          case 'goSepatu': return <GoSepatu />;
          case 'goSepatuV2': return <GoSepatuV2 />;
          case 'goKids': return <GoKids />;
          case 'goFamily': return <GoFamily />;
          case 'goCermin': return <GoCermin />;
          case 'goClean': return <GoClean />;
          case 'goSelfieVip': return <GoSelfieVip />;
          case 'goSetup': return <GoSetup />;
          case 'goSetupV2': return <GoSetupV2 />;
          case 'goSetupV3': return <GoSetupV3 />;
          case 'adminDashboard': return <AdminDashboard />;
          default: return <HomePage />;
        }
      })();

      const isPublic = ['home', 'featureGuide'].includes(activeView);
      if (isPublic || isAdmin) return view;
      return <FeatureGuard>{view}</FeatureGuard>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cartoon-yellow">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout activeView={activeView} setActiveView={handleNavigate} isAdmin={isAdmin} isApproved={isApproved}>
      <AnimatePresence>
        {apiErrorType && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-slate-800 border-4 border-cartoon-dark rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-cartoon-lg relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 border-cartoon-dark shadow-cartoon">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black text-cartoon-dark dark:text-white text-center mb-3 sm:mb-4 uppercase italic tracking-tight">
                {apiErrorType === 'API_KEY_LIMIT' ? t('errors.apiKeyLimit') : t('errors.apiKeyInvalid')}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-300 text-center mb-6 sm:mb-8 font-bold leading-relaxed text-sm sm:text-base">
                {apiErrorType === 'API_KEY_LIMIT' ? t('errors.apiKeyLimitDesc') : t('errors.apiKeyInvalidDesc')}
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setApiErrorType(null)}
                  className="w-full py-4 px-6 bg-cartoon-blue text-white font-black rounded-2xl border-4 border-cartoon-dark shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase italic"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {renderActiveView()}
    </Layout>
  );
}

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <UsageProvider>
          <AppContent />
        </UsageProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;


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
import Settings from './pages/Settings';
import { auth, onAuthStateChanged, db, doc, onSnapshot, updateDoc } from './firebase';
import { Login } from './components/Login';
import { ApprovalPending } from './components/ApprovalPending';
import { Spinner } from './components/Spinner';
import { useApiKey } from './hooks/useApiKey';
import { AlertTriangle as AlertCircle, X, ExternalLink } from './components/icons/LucideIcons';
import { motion, AnimatePresence } from 'framer-motion';

export type View = 'home' | 'featureGuide' | 'virtualTryOn' | 'goAesthetic' | 'goKamarAesthetic' | 'goSofa' | 'goSofaV2' | 'goHanger' | 'goHangerV2' | 'goKain' | 'goSepatu' | 'goSepatuV2' | 'goKids' | 'goFamily' | 'goModelVip' | 'goModelPremium' | 'goModelPremiumV2' | 'goCermin' | 'goClean' | 'goSelfieVip' | 'goSetup' | 'goSetupV2' | 'goSetupV3' | 'adminDashboard' | 'settings';

function AppContent() {
  const { t } = useLanguage();
  const { isConfigured } = useApiKey();
  const [activeView, setActiveView] = useState<View>('home');
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  const [apiErrorType, setApiErrorType] = useState<'API_KEY_LIMIT' | 'API_KEY_INVALID' | null>(null);

  useEffect(() => {
    const handleError = (e: any) => {
      setApiErrorType(e.detail);
    };
    window.addEventListener('gemini-api-error', handleError);
    return () => window.removeEventListener('gemini-api-error', handleError);
  }, []);

  useEffect(() => {
    if (!isConfigured && user) {
      setShowApiKeyWarning(true);
    } else {
      setShowApiKeyWarning(false);
    }
  }, [isConfigured, user]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsubscribeDoc = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setUserData({ isApproved: false, role: 'user' });
        }
        setLoading(false);
      }, (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      });

      return () => unsubscribeDoc();
    }
  }, [user]);

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

      // Update immediately on mount/login
      updateActivity();

      // Removed 2-minute interval as per user request
      // const interval = setInterval(updateActivity, 120000);
      // return () => clearInterval(interval);
    }
  }, [user]);

  const handleNavigate = (view: View) => {
    setActiveView(view);
  };

  const renderActiveView = () => {
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
        case 'settings': return <Settings />;
        default: return <HomePage />;
      }
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

  const isApproved = userData?.isApproved;
  const isAdmin = userData?.role === 'admin' || user.email === 'aahdan298@gmail.com';

  if (isApproved === false && !isAdmin) {
    return <ApprovalPending />;
  }

  return (
    <Layout activeView={activeView} setActiveView={handleNavigate} isAdmin={isAdmin}>
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
                <a
                  href="https://drive.google.com/file/d/1gwFxZemZM1VFJHxjI91ggblqGeDyjLMh/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 bg-red-600 text-white font-black rounded-2xl border-4 border-cartoon-dark shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase italic text-center text-sm"
                >
                  Tonton Video Tutorial
                </a>
                <button
                  onClick={() => {
                    handleNavigate('settings');
                    setApiErrorType(null);
                  }}
                  className="w-full py-4 px-6 bg-cartoon-blue text-white font-black rounded-2xl border-4 border-cartoon-dark shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase italic"
                >
                  {t('sidebar.settings')}
                </button>
                <button
                  onClick={() => setApiErrorType(null)}
                  className="w-full py-3 px-6 bg-white dark:bg-slate-700 text-cartoon-dark dark:text-white font-black rounded-2xl border-4 border-cartoon-dark shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase italic"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {showApiKeyWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50"
          >
            <div className="bg-amber-50 border-4 border-cartoon-dark rounded-2xl p-3 sm:p-4 shadow-cartoon-lg flex items-start gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0">
                <AlertCircle size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-amber-900 text-sm sm:text-base truncate">{t('settings.status.missing')}</h4>
                <p className="text-xs sm:text-sm text-amber-800 mb-2 line-clamp-2">
                  {t('settings.status.missingDesc')}
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      handleNavigate('settings');
                      setShowApiKeyWarning(false);
                    }}
                    className="text-xs sm:text-sm font-bold text-amber-900 underline hover:text-amber-700"
                  >
                    {t('sidebar.settings')}
                  </button>
                  <a
                    href="https://drive.google.com/file/d/1gwFxZemZM1VFJHxjI91ggblqGeDyjLMh/view?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-bold text-red-600 underline hover:text-red-800 flex items-center gap-1"
                  >
                    Tutorial <ExternalLink size={12} className="sm:w-3.5 sm:h-3.5" />
                  </a>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeyWarning(false)}
                className="p-1 hover:bg-amber-100 rounded-lg text-amber-400 transition-colors shrink-0"
              >
                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
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
      <UsageProvider>
        <AppContent />
      </UsageProvider>
    </LanguageProvider>
  );
}

export default App;

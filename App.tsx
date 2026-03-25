
import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { UsageProvider } from './contexts/UsageContext';
import { Layout } from './components/layout/Layout';
import { VirtualTryOn } from './pages/VirtualTryOn';
import HomePage from './pages/HomePage';
import GoAesthetic from './pages/GoAesthetic';
import GoKids from './pages/GoKids';
import GoFamily from './pages/GoFamily';
import { GoModelVip } from './pages/GoModelVip';
import GoCermin from './pages/GoCermin';
import GoClean from './pages/GoClean';
import { GoSelfieVip } from './pages/GoSelfieVip';
import { GoSetup } from './pages/GoSetup';
import { FeatureGuide } from './pages/FeatureGuide';
import { AdminDashboard } from './pages/AdminDashboard';
import Settings from './pages/Settings';
import { auth, onAuthStateChanged, db, doc, onSnapshot } from './firebase';
import { Login } from './components/Login';
import { ApprovalPending } from './components/ApprovalPending';
import { Spinner } from './components/Spinner';
import { useApiKey } from './hooks/useApiKey';
import { AlertTriangle as AlertCircle, X } from './components/icons/LucideIcons';
import { motion, AnimatePresence } from 'framer-motion';

export type View = 'home' | 'featureGuide' | 'virtualTryOn' | 'goAesthetic' | 'goKids' | 'goFamily' | 'goModelVip' | 'goCermin' | 'goClean' | 'goSelfieVip' | 'goSetup' | 'adminDashboard' | 'settings';

function AppContent() {
  const { t } = useLanguage();
  const { isConfigured } = useApiKey();
  const [activeView, setActiveView] = useState<View>('home');
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);

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

  const handleNavigate = (view: View) => {
    setActiveView(view);
  };

  const renderActiveView = () => {
      switch (activeView) {
        case 'home': return <HomePage />;
        case 'featureGuide': return <FeatureGuide />;
        case 'virtualTryOn': return <VirtualTryOn />;
        case 'goModelVip': return <GoModelVip />;
        case 'goAesthetic': return <GoAesthetic />;
        case 'goKids': return <GoKids />;
        case 'goFamily': return <GoFamily />;
        case 'goCermin': return <GoCermin />;
        case 'goClean': return <GoClean />;
        case 'goSelfieVip': return <GoSelfieVip />;
        case 'goSetup': return <GoSetup />;
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
        {showApiKeyWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-lg flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-amber-900">{t('settings.status.missing')}</h4>
                <p className="text-sm text-amber-800 mb-2">
                  {t('settings.status.missingDesc')}
                </p>
                <button
                  onClick={() => {
                    handleNavigate('settings');
                    setShowApiKeyWarning(false);
                  }}
                  className="text-sm font-bold text-amber-900 underline hover:text-amber-700"
                >
                  {t('sidebar.settings')}
                </button>
              </div>
              <button
                onClick={() => setShowApiKeyWarning(false)}
                className="p-1 hover:bg-amber-100 rounded-lg text-amber-400 transition-colors"
              >
                <X size={18} />
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


import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { db, auth, doc, updateDoc, increment, onSnapshot } from '../firebase';

const SESSION_LIMIT = 50; // Demo limit for the session

interface UsageContextType {
  sessionUsage: number;
  totalUsage: number;
  SESSION_LIMIT: number;
  incrementUsage: (amount?: number) => void;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export const UsageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionUsage, setSessionUsage] = useState(0);
  const [totalUsage, setTotalUsage] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setTotalUsage(docSnap.data().generationCount || 0);
      }
    });

    return () => unsubscribe();
  }, []);

  const incrementUsage = useCallback(async (amount = 1) => {
    setSessionUsage(prev => Math.min(prev + amount, SESSION_LIMIT));
    
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          generationCount: increment(amount)
        });
      } catch (error) {
        console.error("Error updating generation count:", error);
      }
    }
  }, []);

  const value = { sessionUsage, totalUsage, SESSION_LIMIT, incrementUsage };

  return (
    <UsageContext.Provider value={value}>
      {children}
    </UsageContext.Provider>
  );
};

export const useUsage = (): UsageContextType => {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error('useUsage must be used within a UsageProvider');
  }
  return context;
};


import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

const SESSION_LIMIT = 50; // Demo limit for the session

interface UsageContextType {
  sessionUsage: number;
  SESSION_LIMIT: number;
  incrementUsage: (amount?: number) => void;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export const UsageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionUsage, setSessionUsage] = useState(0);

  const incrementUsage = useCallback((amount = 1) => {
    setSessionUsage(prev => Math.min(prev + amount, SESSION_LIMIT));
  }, []);

  const value = { sessionUsage, SESSION_LIMIT, incrementUsage };

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

import React, { createContext, useContext, useState, useEffect } from 'react';

const API_KEY_STORAGE_KEY = 'gemini_api_key';

interface ApiKeyContextType {
  apiKey: string | null;
  effectiveApiKey: string;
  isConfigured: boolean;
  saveApiKey: (key: string) => void;
  clearApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem(API_KEY_STORAGE_KEY) : null;
  });

  const saveApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey(null);
  };

  const effectiveApiKey = apiKey || process.env.API_KEY || '';
  const isConfigured = !!effectiveApiKey;

  return (
    <ApiKeyContext.Provider value={{ apiKey, effectiveApiKey, isConfigured, saveApiKey, clearApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKeyContext = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKeyContext must be used within an ApiKeyProvider');
  }
  return context;
};

import { useState, useEffect } from 'react';

const API_KEY_STORAGE_KEY = 'gemini_api_key';

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(() => {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  });

  const saveApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey(null);
  };

  // Also check process.env.API_KEY as a fallback
  const effectiveApiKey = apiKey || process.env.API_KEY || '';

  return {
    apiKey,
    effectiveApiKey,
    saveApiKey,
    clearApiKey,
    isConfigured: !!effectiveApiKey
  };
}

// Static helper for non-hook usage (like in services)
export function getEffectiveApiKey() {
  const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
  return stored || process.env.API_KEY || '';
}

import { useApiKeyContext } from '../contexts/ApiKeyContext';

export function useApiKey() {
  const context = useApiKeyContext();
  
  return {
    apiKey: context.apiKey,
    effectiveApiKey: context.effectiveApiKey,
    saveApiKey: context.saveApiKey,
    clearApiKey: context.clearApiKey,
    isConfigured: context.isConfigured
  };
}

// Static helper for non-hook usage (like in services)
export function getEffectiveApiKey() {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
  return stored || process.env.API_KEY || '';
}

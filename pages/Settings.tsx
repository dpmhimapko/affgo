import React, { useState } from 'react';
import { useApiKey } from '../hooks/useApiKey';
import { useLanguage } from '../contexts/LanguageContext';
import { Save, TrashIcon as Trash2, ExternalLink, AlertTriangle as AlertCircle, ShieldCheck as CheckCircle2, Key } from '../components/icons/LucideIcons';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const { apiKey, saveApiKey, clearApiKey, isConfigured } = useApiKey();
  const { t } = useLanguage();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = () => {
    if (inputKey.trim()) {
      saveApiKey(inputKey.trim());
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
    }
  };

  const handleClear = () => {
    clearApiKey();
    setInputKey('');
    setStatus('idle');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Key size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
          </div>
          <p className="text-gray-600">{t('settings.description')}</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Status Alert */}
          {!isConfigured ? (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold">{t('settings.status.missing')}</p>
                <p className="text-sm opacity-90">Fitur AI tidak akan berfungsi hingga API Key diatur.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
              <CheckCircle2 className="shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold">{t('settings.status.saved')}</p>
                <p className="text-sm opacity-90">API Key Anda tersimpan secara lokal di browser ini.</p>
              </div>
            </div>
          )}

          {/* Input Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              {t('settings.label')}
            </label>
            <div className="flex gap-3">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono"
              />
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shrink-0"
              >
                <Save size={20} />
                {t('settings.saveButton')}
              </button>
              {isConfigured && (
                <button
                  onClick={handleClear}
                  className="px-4 py-3 bg-white text-red-600 border border-red-200 rounded-xl font-semibold hover:bg-red-50 transition-colors flex items-center gap-2 shrink-0"
                  title={t('settings.clearButton')}
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            {status === 'success' && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-emerald-600 font-medium flex items-center gap-1"
              >
                <CheckCircle2 size={16} /> API Key berhasil disimpan!
              </motion.p>
            )}
          </div>

          {/* Help Section */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bagaimana cara mendapatkan API Key?</h3>
            <div className="bg-indigo-50 rounded-xl p-6">
              <ol className="list-decimal list-inside space-y-3 text-indigo-900">
                <li>Kunjungi <span className="font-bold">Google AI Studio</span>.</li>
                <li>Login dengan akun Google Anda.</li>
                <li>Klik tombol <span className="font-bold">"Get API key"</span> di sidebar kiri.</li>
                <li>Klik <span className="font-bold">"Create API key in new project"</span>.</li>
                <li>Salin key yang muncul dan tempelkan di atas.</li>
              </ol>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
              >
                Buka Google AI Studio <ExternalLink size={18} />
              </a>
            </div>
          </div>

          <div className="text-sm text-gray-500 italic">
            * API Key Anda disimpan di penyimpanan lokal browser (localStorage). Kami tidak menyimpan API Key Anda di server kami.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;

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

        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Help Section - MOVED TO TOP */}
          <div className="pb-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Butuh Bantuan Mendapatkan API Key?</h3>
            <div className="max-w-md mx-auto">
              <a 
                href="https://drive.google.com/file/d/1gwFxZemZM1VFJHxjI91ggblqGeDyjLMh/view?usp=drive_link" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-6 sm:p-10 bg-red-600 text-white rounded-[2rem] sm:rounded-[2.5rem] shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all group border-4 border-cartoon-dark"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 group-hover:rotate-6 transition-transform">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/>
                  </svg>
                </div>
                <span className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-center">Tonton Video Tutorial</span>
                <p className="text-xs sm:text-sm font-bold opacity-90 mt-2 uppercase tracking-widest text-center">Lihat Cara Mendapatkan API Key di Sini</p>
              </a>
            </div>
          </div>

          {/* Status Alert */}
          <div className="flex items-start gap-3 p-5 bg-cartoon-blue/10 border-4 border-cartoon-dark rounded-3xl text-cartoon-dark shadow-cartoon">
            <div className="p-2 bg-cartoon-blue rounded-xl text-white shrink-0 shadow-cartoon-sm">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="font-black uppercase italic text-sm tracking-widest mb-2 text-cartoon-blue">Aturan Main API Key</p>
              <p className="text-sm font-bold leading-relaxed whitespace-pre-line">{t('settings.expiryNotice')}</p>
            </div>
          </div>

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
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono w-full"
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleSave}
                  className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  <Save size={20} />
                  <span className="sm:inline">{t('settings.saveButton')}</span>
                </button>
                {isConfigured && (
                  <button
                    onClick={handleClear}
                    className="px-4 py-3 bg-white text-red-600 border border-red-200 rounded-xl font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shrink-0"
                    title={t('settings.clearButton')}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
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

          <div className="text-sm text-gray-500 italic">
            * API Key Anda disimpan di penyimpanan lokal browser (localStorage). Kami tidak menyimpan API Key Anda di server kami.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;

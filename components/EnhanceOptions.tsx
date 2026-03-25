import React, { useState, useEffect } from 'react';
import { EnhanceMethod, CustomizationOptions } from '../types';
import { THEMES } from '../constants';
import { ImageUploader } from './ImageUploader';
import { SmartIcon } from './icons/SmartIcon';
import { CustomizeIcon } from './icons/CustomizeIcon';
import { ReferenceIcon } from './icons/ReferenceIcon';
import { Spinner } from './Spinner';
import { useLanguage } from '../contexts/LanguageContext';

interface EnhanceOptionsProps {
  onEnhance: (method: EnhanceMethod, options: CustomizationOptions) => void;
  isLoading: boolean;
  onReferenceImageUpload: (dataUrl: string, mimeType: string) => void;
  referenceImage: string | null;
  isProductImageUploaded: boolean;
}

const MethodTab = ({ Icon, label, isActive, onClick }: { Icon: React.FC, label: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
      isActive
        ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-md ring-1 ring-black/5 dark:ring-white/10 transform scale-[1.02]'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
    }`}
  >
    <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
        <Icon />
    </span>
    <span>{label}</span>
  </button>
);

export const EnhanceOptions: React.FC<EnhanceOptionsProps> = ({ 
  onEnhance, 
  isLoading, 
  onReferenceImageUpload, 
  referenceImage, 
  isProductImageUploaded 
}) => {
  const { t } = useLanguage();
  const [activeMethod, setActiveMethod] = useState<EnhanceMethod>(EnhanceMethod.SMART);
  const [theme, setTheme] = useState(THEMES[0].key);
  const [customTheme, setCustomTheme] = useState('');
  const [props, setProps] = useState(THEMES[0].props);
  const [instructions, setInstructions] = useState('');
  
  useEffect(() => {
    setInstructions('');
  }, [activeMethod]);

  const handleEnhanceClick = () => {
    if (!isProductImageUploaded) return;

    const options: CustomizationOptions = {
      theme,
      customTheme,
      props,
      instructions
    };
    onEnhance(activeMethod, options);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedThemeKey = e.target.value;
    setTheme(selectedThemeKey);

    if (selectedThemeKey === 'Other') {
      setProps('');
    } else {
      const selectedThemeObject = THEMES.find(t => t.key === selectedThemeKey);
      if (selectedThemeObject) {
        setProps(selectedThemeObject.props);
      }
    }
  };

  const isEnhanceButtonDisabled = isLoading || !isProductImageUploaded || (activeMethod === EnhanceMethod.REFERENCE && !referenceImage);

  const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";
  const labelClasses = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";

  return (
    <div className="space-y-8">
      {/* Segmented Control for Method Selection */}
      <div className="p-1.5 bg-gray-100/80 dark:bg-black/40 rounded-2xl flex flex-col sm:flex-row gap-1 backdrop-blur-md border border-gray-200/50 dark:border-white/5">
        <MethodTab 
          Icon={SmartIcon} 
          label={EnhanceMethod.SMART} 
          isActive={activeMethod === EnhanceMethod.SMART} 
          onClick={() => setActiveMethod(EnhanceMethod.SMART)} 
        />
        <MethodTab 
          Icon={CustomizeIcon} 
          label={EnhanceMethod.CUSTOMIZE} 
          isActive={activeMethod === EnhanceMethod.CUSTOMIZE} 
          onClick={() => setActiveMethod(EnhanceMethod.CUSTOMIZE)} 
        />
        <MethodTab 
          Icon={ReferenceIcon} 
          label={EnhanceMethod.REFERENCE} 
          isActive={activeMethod === EnhanceMethod.REFERENCE} 
          onClick={() => setActiveMethod(EnhanceMethod.REFERENCE)} 
        />
      </div>

      <div className="animate-fade-in min-h-[200px]">
        {activeMethod === EnhanceMethod.SMART && (
          <div className="flex flex-col items-center justify-center text-center h-[240px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-8 bg-gray-50/30 dark:bg-white/5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20 text-indigo-600 dark:text-indigo-300 rounded-2xl flex items-center justify-center mb-4 shadow-inner ring-1 ring-indigo-500/20">
                <SmartIcon />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">{t('options.smart.title')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">{t('options.smart.description')}</p>
          </div>
        )}

        {activeMethod === EnhanceMethod.CUSTOMIZE && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label htmlFor="theme" className={labelClasses}>{t('options.customize.theme.label')}</label>
              <div className="relative group">
                  <select
                    id="theme"
                    name="theme"
                    className={`${inputClasses} appearance-none cursor-pointer pr-10`}
                    value={theme}
                    onChange={handleThemeChange}
                  >
                    {THEMES.map(tItem => <option key={tItem.key} value={tItem.key}>{t(`themes.${tItem.key}`)}</option>)}
                    <option value="Other">{t('options.customize.theme.other')}</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
              </div>
            </div>
            
            {theme === 'Other' && (
              <div className="animate-fade-in">
                <label htmlFor="custom-theme" className={labelClasses}>{t('options.customize.customTheme.label')}</label>
                <input
                  type="text"
                  id="custom-theme"
                  className={inputClasses}
                  placeholder={t('options.customize.customTheme.placeholder')}
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                />
              </div>
            )}
             <div>
              <label htmlFor="props" className={labelClasses}>{t('options.customize.props.label')}</label>
              <input
                type="text"
                id="props"
                className={inputClasses}
                placeholder={t('options.customize.props.placeholder')}
                value={props}
                onChange={(e) => setProps(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="instructions" className={labelClasses}>{t('options.shared.instructions.label')}</label>
              <textarea
                id="instructions"
                rows={3}
                className={inputClasses}
                placeholder={t('options.shared.instructions.placeholderCustomize')}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </div>
        )}

        {activeMethod === EnhanceMethod.REFERENCE && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className={labelClasses}>Reference Image</label>
              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-3 rounded-xl mb-4">
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed flex gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t('options.reference.description')}
                </p>
              </div>
               <ImageUploader 
                onImageUpload={onReferenceImageUpload} 
                uploadedImage={referenceImage}
                label="Upload Reference Image"
                labelKey="uploader.referenceLabel"
              />
            </div>
            <div>
              <label htmlFor="instructions-ref" className={labelClasses}>{t('options.shared.instructions.label')}</label>
              <textarea
                id="instructions-ref"
                rows={3}
                className={inputClasses}
                placeholder={t('options.shared.instructions.placeholderReference')}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <button
            onClick={handleEnhanceClick}
            disabled={isEnhanceButtonDisabled}
            className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_10px_40px_-5px_rgba(79,70,229,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden"
        >
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20"></div>
            {isLoading ? (
                <div className="flex items-center gap-3">
                    <Spinner className="h-5 w-5 text-white" />
                    <span className="tracking-wide">Processing Magic...</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    <span className="tracking-wide">{t('options.enhanceButton')}</span>
                </div>
            )}
        </button>
        
        {!isProductImageUploaded && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium animate-fade-in border border-red-100 dark:border-red-900/30 backdrop-blur-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                {t('errors.noProductImage')}
            </div>
        )}
        
        {activeMethod === EnhanceMethod.REFERENCE && !referenceImage && isProductImageUploaded && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-yellow-50/80 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-xl text-xs font-medium animate-fade-in border border-yellow-100 dark:border-yellow-900/30 backdrop-blur-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                {t('errors.noReferenceImage')}
            </div>
        )}
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { CustomizationOptions } from '../types';
import { DIGITAL_IMAGING_THEMES } from '../constants';
import { Spinner } from './Spinner';
import { useLanguage } from '../contexts/LanguageContext';

interface DigitalImagingOptionsProps {
  onGenerate: (options: CustomizationOptions) => void;
  isLoading: boolean;
  isProductImageUploaded: boolean;
}

export const DigitalImagingOptions: React.FC<DigitalImagingOptionsProps> = ({ 
  onGenerate, 
  isLoading, 
  isProductImageUploaded
}) => {
  const { t } = useLanguage();
  const [theme, setTheme] = useState(DIGITAL_IMAGING_THEMES[0].key);
  const [customTheme, setCustomTheme] = useState('');
  const [props, setProps] = useState(DIGITAL_IMAGING_THEMES[0].props);
  const [instructions, setInstructions] = useState('');

  const handleGenerateClick = () => {
    if (!isProductImageUploaded) return;
    const options: CustomizationOptions = { theme, customTheme, props, instructions };
    onGenerate(options);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedThemeKey = e.target.value;
    setTheme(selectedThemeKey);

    if (selectedThemeKey === 'Other') {
      setProps('');
    } else {
      const selectedThemeObject = DIGITAL_IMAGING_THEMES.find(t => t.key === selectedThemeKey);
      if (selectedThemeObject) {
        setProps(selectedThemeObject.props);
      }
    }
  };

  const isGenerateButtonDisabled = isLoading || !isProductImageUploaded;
  
  const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm appearance-none";
  const labelClasses = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-5">
        <div>
          <label htmlFor="di-theme" className={labelClasses}>{t('options.customize.theme.label')}</label>
           <div className="relative group">
            <select
                id="di-theme"
                name="theme"
                className={`${inputClasses} cursor-pointer`}
                value={theme}
                onChange={handleThemeChange}
            >
                {DIGITAL_IMAGING_THEMES.map(tItem => <option key={tItem.key} value={tItem.key}>{t(`digitalImaging.themes.${tItem.key}`)}</option>)}
                <option value="Other">{t('options.customize.theme.other')}</option>
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
        {theme === 'Other' && (
          <div className="animate-fade-in">
            <label htmlFor="di-custom-theme" className={labelClasses}>{t('options.customize.customTheme.label')}</label>
            <input
              type="text"
              id="di-custom-theme"
              className={inputClasses}
              placeholder={t('options.customize.customTheme.placeholder')}
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
            />
          </div>
        )}
        <div>
          <label htmlFor="di-props" className={labelClasses}>{t('options.customize.props.label')}</label>
          <input
            type="text"
            id="di-props"
            className={inputClasses}
            placeholder={t('options.customize.props.placeholder')}
            value={props}
            onChange={(e) => setProps(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="di-instructions" className={labelClasses}>{t('options.shared.instructions.label')}</label>
          <textarea
            id="di-instructions"
            rows={3}
            className={inputClasses}
            placeholder={t('options.shared.instructions.placeholderCustomize')}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={handleGenerateClick}
        disabled={isGenerateButtonDisabled}
        className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_10px_40px_-5px_rgba(79,70,229,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] rounded-2xl overflow-hidden"></span>
        {isLoading ? (
             <div className="flex items-center gap-3">
                <Spinner className="h-5 w-5 text-white" />
                <span className="tracking-wide">Creating Masterpiece...</span>
            </div>
        ) : (
            <span className="tracking-wide">{t('digitalImaging.generateButton')}</span>
        )}
      </button>
      {!isProductImageUploaded && (
        <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{t('errors.noProductImage')}</p>
      )}
    </div>
  );
};
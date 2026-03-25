import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PovStudioOptions, PovHandStyle } from '../types';
import { POV_THEMES } from '../constants';
import { ImageUploader } from './ImageUploader';
import { Spinner } from './Spinner';

interface PovOptionsProps {
    options: PovStudioOptions;
    setOptions: (options: PovStudioOptions) => void;
    onGenerate: () => void;
    isLoading: boolean;
    isProductImageUploaded: boolean;
    backgroundImage: string | null;
    onBackgroundUpload: (dataUrl: string, mimeType: string) => void;
}

export const PovOptions: React.FC<PovOptionsProps> = ({
    options,
    setOptions,
    onGenerate,
    isLoading,
    isProductImageUploaded,
    backgroundImage,
    onBackgroundUpload
}) => {
    const { t } = useLanguage();

    const handleHandStyleChange = (style: PovHandStyle) => {
        setOptions({ ...options, handStyle: style });
    };

    const handleBackgroundModeChange = (mode: 'preset' | 'custom') => {
        setOptions({ ...options, backgroundMode: mode });
    };

    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setOptions({ ...options, theme: e.target.value });
    };

    const handleCustomThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOptions({ ...options, customTheme: e.target.value });
    };

    const getHandStyleLabel = (style: PovHandStyle) => {
        switch (style) {
            case PovHandStyle.AUTO: return t('povStudio.handStyle.auto');
            case PovHandStyle.FEMALE: return t('povStudio.handStyle.female');
            case PovHandStyle.MALE: return t('povStudio.handStyle.male');
            case PovHandStyle.SWEATER: return t('povStudio.handStyle.sweater');
            default: return style;
        }
    };

    const isGenerateDisabled = isLoading || !isProductImageUploaded || (options.backgroundMode === 'custom' && !backgroundImage);
    
    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm appearance-none";
    const labelClasses = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Hand Style Selection */}
            <div>
                <label className={labelClasses}>{t('povStudio.handStyle.label')}</label>
                <div className="grid grid-cols-2 gap-2">
                    {Object.values(PovHandStyle).map((style) => (
                        <button
                            key={style}
                            onClick={() => handleHandStyleChange(style)}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center text-center min-h-[42px] ${
                                options.handStyle === style
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-white/10'
                            }`}
                        >
                            {getHandStyleLabel(style)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Background Mode Selection */}
            <div>
                <label className={labelClasses}>{t('povStudio.background.modeLabel')}</label>
                <div className="p-1 bg-gray-100 dark:bg-white/5 rounded-xl flex gap-1">
                    <button
                        onClick={() => handleBackgroundModeChange('preset')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            options.backgroundMode === 'preset'
                                ? 'bg-white dark:bg-gray-700 shadow text-slate-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                        }`}
                    >
                        {t('povStudio.background.preset')}
                    </button>
                    <button
                        onClick={() => handleBackgroundModeChange('custom')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            options.backgroundMode === 'custom'
                                ? 'bg-white dark:bg-gray-700 shadow text-slate-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                        }`}
                    >
                        {t('povStudio.background.custom')}
                    </button>
                </div>
            </div>

            {/* Conditional Background Input */}
            <div className="min-h-[100px]">
                {options.backgroundMode === 'preset' ? (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label className={labelClasses}>{t('povStudio.background.themeLabel')}</label>
                            <div className="relative group">
                                <select
                                    value={options.theme}
                                    onChange={handleThemeChange}
                                    className={`${inputClasses} cursor-pointer`}
                                >
                                    {POV_THEMES.map((theme) => (
                                        <option key={theme.key} value={theme.key}>
                                            {t(`povStudio.themes.${theme.key}`) || theme.name}
                                        </option>
                                    ))}
                                    <option value="Other">{t('options.customize.theme.other')}</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Custom Theme Input - Shown only when 'Other' is selected */}
                        {options.theme === 'Other' && (
                            <div className="animate-fade-in">
                                <label className={labelClasses}>{t('options.customize.customTheme.label')}</label>
                                <input
                                    type="text"
                                    value={options.customTheme}
                                    onChange={handleCustomThemeChange}
                                    placeholder={t('options.customize.customTheme.placeholder')}
                                    className={inputClasses}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <label className={labelClasses}>{t('uploader.backgroundLabel')}</label>
                        <ImageUploader
                            onImageUpload={onBackgroundUpload}
                            uploadedImage={backgroundImage}
                            label="Upload Background"
                            labelKey="uploader.backgroundLabel"
                        />
                    </div>
                )}
            </div>

             {/* Additional Instructions */}
             <div>
              <label className={labelClasses}>{t('options.shared.instructions.label')}</label>
              <textarea
                rows={2}
                className={inputClasses}
                placeholder={t('options.shared.instructions.placeholderCustomize')}
                value={options.instructions}
                onChange={(e) => setOptions({ ...options, instructions: e.target.value })}
              />
            </div>

            {/* Generate Button */}
            <div className="pt-4">
                <button
                    onClick={onGenerate}
                    disabled={isGenerateDisabled}
                    className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_10px_40px_-5px_rgba(79,70,229,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-3">
                            <Spinner className="h-5 w-5 text-white" />
                            <span className="tracking-wide">Generating POV...</span>
                        </div>
                    ) : (
                        <span className="tracking-wide">{t('povStudio.generateButton')}</span>
                    )}
                </button>
                {!isProductImageUploaded && (
                    <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{t('errors.noProductImage')}</p>
                )}
                 {options.backgroundMode === 'custom' && !backgroundImage && isProductImageUploaded && (
                    <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{t('povStudio.errors.noBackground')}</p>
                )}
            </div>
        </div>
    );
};
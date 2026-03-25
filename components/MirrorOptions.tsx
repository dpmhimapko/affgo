
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MirrorStudioOptions } from '../types';
import { MIRROR_THEMES, MIRROR_FRAMES } from '../constants';
import { ImageUploader } from './ImageUploader';

interface MirrorOptionsProps {
    options: MirrorStudioOptions;
    setOptions: (options: MirrorStudioOptions) => void;
    onGenerate: () => void;
    isLoading: boolean;
    isProductImageUploaded: boolean;
    modelImage: string | null;
    onModelUpload: (dataUrl: string, mimeType: string) => void;
}

export const MirrorOptions: React.FC<MirrorOptionsProps> = ({
    options,
    setOptions,
    onGenerate,
    isLoading,
    isProductImageUploaded,
    modelImage,
    onModelUpload
}) => {
    const { t } = useLanguage();

    const handleSourceChange = (source: 'generate' | 'upload') => {
        setOptions({ ...options, modelSource: source });
    };

    const handleGenderChange = (gender: 'Female' | 'Male') => {
        setOptions({ ...options, gender });
    };

    const handleEthnicityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOptions({ ...options, ethnicity: e.target.value });
    };

    const handleFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setOptions({ ...options, frame: e.target.value });
    };

    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setOptions({ ...options, theme: e.target.value });
    };

    const handleCustomThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOptions({ ...options, customTheme: e.target.value });
    };

    const isGenerateDisabled = isLoading || !isProductImageUploaded || (options.modelSource === 'upload' && !modelImage);

    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm appearance-none";
    const labelClasses = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";

    return (
        <div className="space-y-6 animate-fade-in">
             {/* Model Source Selection */}
             <div>
                <label className={labelClasses}>{t('mirrorStudio.options.modelSourceLabel')}</label>
                <div className="p-1 bg-gray-100 dark:bg-white/5 rounded-xl flex gap-1">
                    <button
                        onClick={() => handleSourceChange('generate')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            options.modelSource === 'generate'
                                ? 'bg-white dark:bg-gray-700 shadow text-slate-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                        }`}
                    >
                        {t('mirrorStudio.options.generate')}
                    </button>
                    <button
                        onClick={() => handleSourceChange('upload')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            options.modelSource === 'upload'
                                ? 'bg-white dark:bg-gray-700 shadow text-slate-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                        }`}
                    >
                        {t('mirrorStudio.options.upload')}
                    </button>
                </div>
            </div>

            {/* Conditional Inputs based on Source */}
            <div className="min-h-[120px]">
                {options.modelSource === 'generate' ? (
                    <div className="space-y-5 animate-fade-in">
                         {/* Gender Selection */}
                        <div>
                            <label className={labelClasses}>{t('mirrorStudio.options.genderLabel')}</label>
                            <div className="flex gap-2">
                                {(['Female', 'Male'] as const).map((gender) => (
                                    <button
                                        key={gender}
                                        onClick={() => handleGenderChange(gender)}
                                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                                            options.gender === gender
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                                : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        {t(`mirrorStudio.options.${gender.toLowerCase()}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Ethnicity Input */}
                        <div>
                            <label className={labelClasses}>{t('mirrorStudio.options.ethnicityLabel')}</label>
                            <input
                                type="text"
                                value={options.ethnicity}
                                onChange={handleEthnicityChange}
                                placeholder={t('mirrorStudio.options.ethnicityPlaceholder')}
                                className={inputClasses}
                            />
                        </div>
                    </div>
                ) : (
                     <div className="animate-fade-in">
                        <label className={labelClasses}>{t('mirrorStudio.options.uploadModelLabel')}</label>
                        <ImageUploader
                            onImageUpload={onModelUpload}
                            uploadedImage={modelImage}
                            label="Upload Model"
                            labelKey="uploader.modelLabel"
                        />
                    </div>
                )}
            </div>

            <hr className="border-gray-100 dark:border-white/5" />

            {/* Frame Selection */}
            <div>
                <label className={labelClasses}>{t('mirrorStudio.options.frameLabel')}</label>
                 <div className="relative group">
                    <select
                        value={options.frame}
                        onChange={handleFrameChange}
                        className={`${inputClasses} cursor-pointer`}
                    >
                        {MIRROR_FRAMES.map((frame) => (
                            <option key={frame.key} value={frame.key}>
                                {t(`mirrorStudio.frames.${frame.key}`) || frame.name}
                            </option>
                        ))}
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Theme Selection */}
            <div>
                <label className={labelClasses}>{t('mirrorStudio.options.themeLabel')}</label>
                 <div className="relative group">
                    <select
                        value={options.theme}
                        onChange={handleThemeChange}
                        className={`${inputClasses} cursor-pointer`}
                    >
                        {MIRROR_THEMES.map((theme) => (
                            <option key={theme.key} value={theme.key}>
                                {t(`mirrorStudio.themes.${theme.key}`) || theme.name}
                            </option>
                        ))}
                        <option value="Other">{t('options.customize.theme.other')}</option>
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Custom Theme Input */}
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

            {/* Generate Button */}
            <div className="pt-4">
                <button
                    onClick={onGenerate}
                    disabled={isGenerateDisabled}
                    className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_10px_40px_-5px_rgba(79,70,229,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] rounded-2xl overflow-hidden"></span>
                    {isLoading ? (
                        <div className="flex items-center gap-3">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span className="tracking-wide">Generating...</span>
                        </div>
                    ) : (
                        <span className="tracking-wide">{t('mirrorStudio.generateButton')}</span>
                    )}
                </button>
                {!isProductImageUploaded && (
                    <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{t('errors.noProductImage')}</p>
                )}
                {options.modelSource === 'upload' && !modelImage && isProductImageUploaded && (
                     <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{t('mirrorStudio.errors.noModel')}</p>
                )}
            </div>
        </div>
    );
};
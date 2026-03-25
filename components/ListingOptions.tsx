import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ListingStudioOptions } from '../types';
import { LISTING_STYLES } from '../constants';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ListingOptionsProps {
    options: ListingStudioOptions;
    setOptions: (options: ListingStudioOptions) => void;
    onGenerate: () => void;
    isLoading: boolean;
    isProductImageUploaded: boolean;
}

export const ListingOptions: React.FC<ListingOptionsProps> = ({
    options,
    setOptions,
    onGenerate,
    isLoading,
    isProductImageUploaded
}) => {
    const { t } = useLanguage();

    const handleAddFeature = () => {
        if (options.features.length < 5) {
            setOptions({ ...options, features: [...options.features, ''] });
        }
    };

    const handleRemoveFeature = (index: number) => {
        const newFeatures = options.features.filter((_, i) => i !== index);
        setOptions({ ...options, features: newFeatures });
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...options.features];
        newFeatures[index] = value;
        setOptions({ ...options, features: newFeatures });
    };

    const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setOptions({ ...options, style: e.target.value });
    };

    // Validation: Must have at least 1 feature filled out
    const isValid = options.features.some(f => f.trim().length > 0);
    const isGenerateDisabled = isLoading || !isProductImageUploaded || !isValid;

    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";
    const labelClasses = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Features List */}
            <div>
                <label className={labelClasses}>{t('listingStudio.sections.features.title')}</label>
                <div className="space-y-3">
                    {options.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 w-4 text-center">{index + 1}</span>
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                placeholder={t('listingStudio.form.featurePlaceholder')}
                                className={inputClasses}
                            />
                            {options.features.length > 1 && (
                                <button
                                    onClick={() => handleRemoveFeature(index)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    {options.features.length < 5 && (
                        <button
                            onClick={handleAddFeature}
                            className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mt-2 ml-6"
                        >
                            <PlusIcon className="w-3 h-3" />
                            {t('listingStudio.form.addFeature')}
                        </button>
                    )}
                </div>
            </div>

            {/* Style Selection */}
            <div>
                <label className={labelClasses}>{t('listingStudio.form.styleLabel')}</label>
                <div className="relative group">
                    <select
                        value={options.style}
                        onChange={handleStyleChange}
                        className={`${inputClasses} cursor-pointer appearance-none`}
                    >
                        {LISTING_STYLES.map((style) => (
                            <option key={style.key} value={style.key}>
                                {t(`listingStudio.styles.${style.key}`) || style.name}
                            </option>
                        ))}
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
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
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span className="tracking-wide">Designing...</span>
                        </div>
                    ) : (
                        <span className="tracking-wide">{t('listingStudio.generateButton')}</span>
                    )}
                </button>
                {!isProductImageUploaded && (
                    <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{t('errors.noProductImage')}</p>
                )}
                {isProductImageUploaded && !isValid && (
                     <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{t('listingStudio.errors.minFeatures')}</p>
                )}
            </div>
        </div>
    );
};
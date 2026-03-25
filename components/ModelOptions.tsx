
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { ImageData, ModelGenerationOptions } from '../types';
import { ImageUploader } from './ImageUploader';

// Constants for model generation
const GENDERS = ['Female', 'Male', 'Other'];
const ETHNICITIES = ['Caucasian', 'Asian', 'African', 'Hispanic', 'Middle Eastern', 'Other'];
const ASPECT_RATIOS = ['1:1', '3:4', '9:16'];

interface ModelOptionsProps {
    modelOption: 'upload' | 'generate';
    setModelOption: (option: 'upload' | 'generate') => void;
    modelImage: ImageData | null;
    handleModelImageUpload: (dataUrl: string, mimeType: string) => void;
    generationParams: ModelGenerationOptions;
    setGenerationParams: (params: ModelGenerationOptions) => void;
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
}

export const ModelOptions: React.FC<ModelOptionsProps> = ({ 
    modelOption, 
    setModelOption, 
    modelImage, 
    handleModelImageUpload, 
    generationParams, 
    setGenerationParams,
    aspectRatio,
    setAspectRatio
}) => {
  const { t } = useLanguage();
  
  const translatedEthnicities = ETHNICITIES.map(key => ({
    key,
    name: t(`virtualTryOn.modelOptions.ethnicities.${key.charAt(0).toLowerCase() + key.slice(1).replace(' ', '')}`) || key
  }));

  const handleEthnicityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEthnicity = e.target.value;
    if (newEthnicity !== 'Other') {
        setGenerationParams({ ...generationParams, ethnicity: newEthnicity, customEthnicity: '' });
    } else {
        setGenerationParams({ ...generationParams, ethnicity: newEthnicity });
    }
  };

  const handleCustomEthnicityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setGenerationParams({ ...generationParams, customEthnicity: e.target.value });
  };

  const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm appearance-none";
  const labelClasses = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Segmented Control */}
      <div className="p-1.5 bg-gray-100/80 dark:bg-black/40 rounded-2xl flex gap-1 backdrop-blur-md border border-gray-200/50 dark:border-white/5">
        <button
          onClick={() => setModelOption('upload')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            modelOption === 'upload'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-md ring-1 ring-black/5 dark:ring-white/10 transform scale-[1.02]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          {t('virtualTryOn.modelOptions.upload')}
        </button>
        <button
          onClick={() => setModelOption('generate')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            modelOption === 'generate'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-md ring-1 ring-black/5 dark:ring-white/10 transform scale-[1.02]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          {t('virtualTryOn.modelOptions.generate')}
        </button>
      </div>

      {modelOption === 'upload' ? (
        <div className="animate-fade-in">
            <ImageUploader
            onImageUpload={handleModelImageUpload}
            uploadedImage={modelImage?.dataUrl || null}
            label="Upload Model Image"
            labelKey="uploader.modelLabel"
            />
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in p-1">
          <div>
            <label className={labelClasses}>{t('virtualTryOn.modelOptions.gender')}</label>
            <div className="relative group">
                <select
                value={generationParams.gender}
                onChange={(e) => setGenerationParams({ ...generationParams, gender: e.target.value })}
                className={`${inputClasses} cursor-pointer`}
                >
                {GENDERS.map(gender => <option key={gender} value={gender}>{t(`virtualTryOn.modelOptions.${gender.toLowerCase()}`)}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
          </div>
          <div>
            <label className={labelClasses}>{t('virtualTryOn.modelOptions.ethnicity')}</label>
             <div className="relative group">
                <select
                value={generationParams.ethnicity}
                onChange={handleEthnicityChange}
                className={`${inputClasses} cursor-pointer`}
                >
                {translatedEthnicities.map(eth => <option key={eth.key} value={eth.key}>{eth.name}</option>)}
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
          </div>
          {generationParams.ethnicity === 'Other' && (
            <div className="animate-fade-in">
              <label htmlFor="custom-ethnicity" className={labelClasses}>{t('virtualTryOn.modelOptions.customEthnicity.label')}</label>
              <input
                type="text"
                id="custom-ethnicity"
                value={generationParams.customEthnicity || ''}
                onChange={handleCustomEthnicityChange}
                placeholder={t('virtualTryOn.modelOptions.customEthnicity.placeholder')}
                className={inputClasses}
              />
            </div>
          )}
          <div>
            <label className={labelClasses}>{t('virtualTryOn.modelOptions.details')}</label>
            <textarea
              rows={3}
              className={inputClasses}
              placeholder={t('virtualTryOn.modelOptions.detailsPlaceholder')}
              value={generationParams.details}
              onChange={(e) => setGenerationParams({ ...generationParams, details: e.target.value })}
            />
          </div>
        </div>
      )}
      
      {/* Aspect Ratio Selector - Available for both upload and generate modes */}
      <div className="pt-2 border-t border-gray-100 dark:border-white/10">
        <label className={labelClasses}>{t('virtualTryOn.modelOptions.aspectRatio')}</label>
        <div className="flex gap-2 mt-2">
            {ASPECT_RATIOS.map((ratio) => (
                <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                        aspectRatio === ratio
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-white/10'
                    }`}
                >
                    {ratio}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

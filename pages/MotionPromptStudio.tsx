
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { generateMotionPrompt } from '../services/geminiService';
import type { ImageData } from '../types';
import { CopyIcon } from '../components/icons/CopyIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { InfoIcon } from '../components/icons/InfoIcon';
import { StepHeader } from '../components/StepHeader';
import { PromoCard } from '../components/PromoCard';

const PromptResultCard: React.FC<{ prompt: string }> = ({ prompt }) => {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800/30 transition-all duration-300 shadow-sm group">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{prompt}</p>
            <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-white bg-gray-100 dark:bg-white/10 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
            >
                {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                {copied ? t('motionPromptStudio.results.copied') : t('motionPromptStudio.results.copyButton')}
            </button>
        </div>
    );
};


export const MotionPromptStudio: React.FC = () => {
  const { t } = useLanguage();
  const [image, setImage] = useState<ImageData | null>(null);
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[] | null>(null);

  const handleImageUpload = (dataUrl: string, mimeType: string) => {
    setImage({ dataUrl, mimeType });
    setGeneratedPrompts(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!image) {
      setError(t('motionPromptStudio.errors.noImage'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPrompts(null);

    try {
      const { prompts } = await generateMotionPrompt(image, keywords);
      setGeneratedPrompts(prompts);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setKeywords('');
    setIsLoading(false);
    setError(null);
    setGeneratedPrompts(null);
  };

  const isGenerateDisabled = isLoading || !image;

  const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";

  const renderResultContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full p-8">
           <div className="relative mb-6">
             <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-2xl animate-pulse-slow"></div>
             <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-xl">
                <Spinner className="h-10 w-10 text-indigo-600" />
             </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 animate-pulse">{t('motionPromptStudio.loading.title')}</h3>
           <div className="mt-4 inline-flex items-center text-left justify-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 px-4 py-2 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg backdrop-blur-sm">
            <InfoIcon className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{t('notes.navigationWarning')}</span>
          </div>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center text-center h-full p-8">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-red-100 dark:border-red-900/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('results.error.title')}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 max-w-sm leading-relaxed">{error}</p>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-white dark:bg-gray-800 text-slate-700 dark:text-white border border-slate-200 dark:border-gray-600 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700 transition-all font-semibold shadow-sm hover:shadow-md"
          >
            {t('results.error.button')}
          </button>
        </div>
      );
    }

    if (generatedPrompts) {
      return (
        <div className="space-y-4 animate-fade-in">
            {generatedPrompts.map((prompt, index) => (
                <PromptResultCard key={index} prompt={prompt} />
            ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 dark:text-slate-500 p-8">
        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-dashed border-slate-200 dark:border-white/10 rotate-3 transition-transform hover:rotate-6">
            <CopyIcon className="w-8 h-8 opacity-40" />
        </div>
        <p className="text-sm font-bold opacity-70 tracking-wide">{t('motionPromptStudio.results.placeholder')}</p>
      </div>
    );
  };

  return (
    <div className="w-full">
      <FeatureHeader
        title={t('sidebar.motionPromptStudio')}
        description={t('motionPromptStudio.page.description')}
      />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-5 space-y-8">
           <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all space-y-8">
                {/* Step 1: Upload */}
                <div>
                    <StepHeader 
                        step={1}
                        title={t('motionPromptStudio.sections.upload.title')}
                        description={t('motionPromptStudio.sections.upload.subtitle')}
                    />
                    <ImageUploader 
                    onImageUpload={handleImageUpload}
                    uploadedImage={image?.dataUrl || null}
                    label="Upload Image"
                    labelKey="uploader.imageLabel"
                    />
                </div>
                
                {/* Step 2: Keywords */}
                <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                    <StepHeader 
                        step={2}
                        title={t('motionPromptStudio.sections.keywords.title')}
                        description={t('motionPromptStudio.sections.keywords.subtitle')}
                    />
                    <textarea
                    rows={3}
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder={t('motionPromptStudio.form.placeholder')}
                    className={inputClasses}
                    />
                    <div className="pt-6 mt-2">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerateDisabled}
                            className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_10px_40px_-5px_rgba(79,70,229,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] rounded-2xl overflow-hidden"></span>
                            {isLoading ? (
                                 <div className="flex items-center gap-3">
                                    <Spinner className="h-5 w-5 text-white" />
                                    <span className="tracking-wide">Thinking...</span>
                                </div>
                            ) : (
                                <span className="tracking-wide">{t('motionPromptStudio.generateButton')}</span>
                            )}
                        </button>
                        {error && !isLoading && (
                             <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Right Column: Result */}
        <div className="xl:col-span-7 xl:sticky xl:top-24 h-fit">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                     <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 rounded-full flex items-center justify-center font-bold text-slate-500 dark:text-slate-300 text-sm border border-slate-200 dark:border-white/10 shadow-sm">
                        3
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('motionPromptStudio.results.title').substring(3)}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('motionPromptStudio.results.description')}</p>
                    </div>
                </div>
                <div className="flex-grow w-full min-h-[300px] rounded-2xl p-1">
                    {renderResultContent()}
                </div>
                {generatedPrompts && !isLoading && !error && (
                <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-white/10 animate-slide-up">
                    <button
                        onClick={handleGenerate}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-base font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all duration-200"
                    >
                        {t('motionPromptStudio.results.regenerateButton')}
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-full py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        {t('results.resetButton')}
                    </button>
                </div>
                )}
            </div>
        </div>
      </div>
      <PromoCard />
    </div>
  );
};

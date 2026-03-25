
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { generatePerspectiveSet } from '../services/geminiService';
import { PerspectiveGrid, PerspectiveStudioOptions } from '../types';
import { THEMES } from '../constants';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { InfoIcon } from '../components/icons/InfoIcon';
import { ZoomIcon } from '../components/icons/ZoomIcon';
import { ZoomModal } from '../components/ZoomModal';
import { PromoCard } from '../components/PromoCard';

export const PerspectiveStudio: React.FC = () => {
  const { t } = useLanguage();
  
  // State for 4 angles
  const [grid, setGrid] = useState<PerspectiveGrid>({
    front: null,
    back: null,
    side: null,
    top: null
  });

  const [options, setOptions] = useState<PerspectiveStudioOptions>({
    theme: THEMES[0].key,
    customTheme: '',
    instructions: ''
  });

  // Results state: mapped by view key
  const [results, setResults] = useState<{ [key: string]: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Zoom state
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const handleZoom = (imageUrl: string) => {
      setZoomImage(imageUrl);
      setIsZoomModalOpen(true);
  };

  const handleUpload = (view: keyof PerspectiveGrid, dataUrl: string, mimeType: string) => {
    setGrid(prev => ({ ...prev, [view]: { dataUrl, mimeType } }));
    // Clear results if user uploads a new image to ensure consistency
    if (results) setResults(null);
    setError(null);
  };

  const handleGenerate = async () => {
    // Validate at least one image exists
    if (!grid.front && !grid.back && !grid.side && !grid.top) {
      setError(t('perspectiveStudio.errors.noImages'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const generatedSet = await generatePerspectiveSet(grid, options);
      setResults(generatedSet);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setGrid({ front: null, back: null, side: null, top: null });
    setResults(null);
    setOptions({ ...options, instructions: '' }); 
    setError(null);
  };

  const handleDownload = (url: string, view: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `perspective-${view}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm appearance-none";
  const labelClasses = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";

  const renderView = (key: keyof PerspectiveGrid, labelKey: string) => {
      const hasResult = results && results[key];
      // const hasInput = grid[key]; // unused

      return (
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 ml-1">{t(labelKey)}</label>
            {hasResult ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden group border border-indigo-200 dark:border-indigo-900 shadow-lg bg-white/50 dark:bg-white/5">
                    <img src={results[key]!} alt={`Result ${key}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button onClick={() => handleZoom(results[key]!)} className="bg-white text-slate-900 p-3 rounded-full shadow-lg hover:scale-110 transition-transform" title="Zoom">
                            <ZoomIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDownload(results[key]!, key)} className="bg-white text-slate-900 p-3 rounded-full shadow-lg hover:scale-110 transition-transform" title="Download">
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">AFTER</div>
                </div>
            ) : (
                <ImageUploader 
                    onImageUpload={(d, m) => handleUpload(key, d, m)}
                    uploadedImage={grid[key]?.dataUrl || null}
                    label={t(labelKey)}
                    labelKey={labelKey}
                />
            )}
        </div>
      );
  };

  return (
    <div className="w-full">
      <FeatureHeader 
        title={t('perspectiveStudio.page.title')}
        description={t('perspectiveStudio.page.description')}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Grid Upload & Results */}
        <div className="xl:col-span-8 space-y-8">
             <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm">
                 <StepHeader 
                   step={1}
                   title={t('perspectiveStudio.sections.upload.title')}
                   description={t('perspectiveStudio.sections.upload.subtitle')}
                 />
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {renderView('front', 'perspectiveStudio.labels.front')}
                    {renderView('back', 'perspectiveStudio.labels.back')}
                    {renderView('side', 'perspectiveStudio.labels.side')}
                    {renderView('top', 'perspectiveStudio.labels.top')}
                 </div>
                 
                 <div className="mt-8 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl flex items-start gap-3">
                    <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                        Upload multiple angles of your product. Our AI will enhance each photo individually but use the <strong>same style settings</strong> for all of them, ensuring a cohesive look for your entire product gallery.
                    </p>
                 </div>
             </div>
        </div>

        {/* Right Column: Config */}
        <div className="xl:col-span-4 space-y-8">
           <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all sticky top-24 shadow-sm">
               <StepHeader 
                   step={2}
                   title={t('perspectiveStudio.sections.style.title')}
                   description={t('perspectiveStudio.sections.style.subtitle')}
               />
               <div className="space-y-5">
                  <div>
                    <label className={labelClasses}>{t('options.customize.theme.label')}</label>
                    <div className="relative group">
                        <select
                            value={options.theme}
                            onChange={(e) => setOptions({...options, theme: e.target.value})}
                            className={`${inputClasses} cursor-pointer`}
                        >
                            {THEMES.map(tItem => <option key={tItem.key} value={tItem.key}>{t(`themes.${tItem.key}`)}</option>)}
                            <option value="Other">{t('options.customize.theme.other')}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                  </div>

                  {options.theme === 'Other' && (
                    <div className="animate-fade-in">
                        <label className={labelClasses}>{t('options.customize.customTheme.label')}</label>
                        <input
                            type="text"
                            className={inputClasses}
                            placeholder={t('options.customize.customTheme.placeholder')}
                            value={options.customTheme}
                            onChange={(e) => setOptions({...options, customTheme: e.target.value})}
                        />
                    </div>
                  )}

                  <div>
                    <label className={labelClasses}>{t('options.shared.instructions.label')}</label>
                    <textarea
                        rows={3}
                        className={inputClasses}
                        placeholder={t('options.shared.instructions.placeholderCustomize')}
                        value={options.instructions}
                        onChange={(e) => setOptions({...options, instructions: e.target.value})}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || (!grid.front && !grid.back && !grid.side && !grid.top)}
                        className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_10px_40px_-5px_rgba(79,70,229,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] rounded-2xl overflow-hidden"></span>
                        {isLoading ? (
                            <div className="flex items-center gap-3">
                                <Spinner className="h-5 w-5 text-white" />
                                <span className="tracking-wide">Generating Set...</span>
                            </div>
                        ) : (
                            <span className="tracking-wide">{t('perspectiveStudio.generateButton')}</span>
                        )}
                    </button>
                    {error && (
                        <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>
                    )}
                    {results && !isLoading && !error && (
                        <button
                            onClick={handleReset}
                            className="w-full mt-3 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            {t('results.resetButton')}
                        </button>
                    )}
                  </div>
               </div>
           </div>
        </div>
      </div>
      <ZoomModal 
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        imageUrl={zoomImage || ''}
      />
      <PromoCard />
    </div>
  );
};


import React, { useState } from 'react';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import { generateDigitalImaging, generateDigitalImagingConcepts, generateDigitalImagingFromConcept } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import type { ImageData, CustomizationOptions } from '../types';
import { FeatureHeader } from '../components/FeatureHeader';
import { DigitalImagingOptions } from '../components/DigitalImagingOptions';
import { Spinner } from '../components/Spinner';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { StepHeader } from '../components/StepHeader';
import { PromoCard } from '../components/PromoCard';

const ModeButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        isActive
        ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-md ring-1 ring-black/5 dark:ring-white/10 transform scale-[1.02]'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
    }`}
  >
    {label}
  </button>
);

const ConceptCard: React.FC<{ concept: string; onGenerate: () => void; isLoading: boolean }> = ({ concept, onGenerate, isLoading }) => {
    const { t } = useLanguage();
    return (
        <div className="p-4 bg-white dark:bg-gray-800/50 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 group">
            <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">{concept}</p>
            <button
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transform group-hover:scale-105"
            >
                {t('digitalImaging.conceptGenerator.generateImageButton')}
            </button>
        </div>
    );
};

export const DigitalImaging: React.FC = () => {
  const { t } = useLanguage();
  const [productImage, setProductImage] = useState<ImageData | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New state for concept generation mode
  const [mode, setMode] = useState<'customize' | 'generateConcept'>('customize');
  const [concepts, setConcepts] = useState<string[] | null>(null);
  const [isConceptLoading, setIsConceptLoading] = useState(false);
  const [conceptError, setConceptError] = useState<string | null>(null);


  const handleProductImageUpload = (dataUrl: string, mimeType: string) => {
    setProductImage({ dataUrl, mimeType });
    // Reset everything when a new image is uploaded
    setGeneratedImages(null);
    setSelectedImage(null);
    setError(null);
    setConcepts(null);
    setConceptError(null);
  };

  const handleGenerateCustomize = async (options: CustomizationOptions) => {
    if (!productImage) {
      setError(t('errors.noProductImage'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages(null);
    setSelectedImage(null);

    try {
      const result = await generateDigitalImaging(productImage, options);
      setGeneratedImages(result.imageUrls);
      if (result.imageUrls && result.imageUrls.length > 0) {
        setSelectedImage(result.imageUrls[0]);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateConcepts = async () => {
    if (!productImage) return;
    setIsConceptLoading(true);
    setConceptError(null);
    setConcepts(null);
    try {
        const result = await generateDigitalImagingConcepts(productImage);
        setConcepts(result.concepts);
    } catch (e: any) {
        console.error(e);
        setConceptError(t('digitalImaging.errors.conceptError'));
    } finally {
        setIsConceptLoading(false);
    }
  };

  const handleGenerateFromConcept = async (concept: string) => {
    if (!productImage) {
      setError(t('errors.noProductImage'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImages(null);
    setSelectedImage(null);
    
    try {
        const result = await generateDigitalImagingFromConcept(productImage, concept);
        setGeneratedImages(result.imageUrls);
        if (result.imageUrls.length > 0) {
            setSelectedImage(result.imageUrls[0]);
        }
    } catch (e: any) {
        console.error(e);
        setError(e.message || "An unexpected error occurred. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setProductImage(null);
    setGeneratedImages(null);
    setSelectedImage(null);
    setIsLoading(false);
    setError(null);
    setConcepts(null);
    setConceptError(null);
  };

  const handleDownload = () => {
    if (selectedImage) {
      const link = document.createElement('a');
      link.href = selectedImage;
      link.download = `digital-imaging-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <div className="w-full">
      <FeatureHeader 
        title={t('digitalImaging.page.title')}
        description={t('digitalImaging.page.description')}
      />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Upload and Options */}
        <div className="xl:col-span-5 space-y-8">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all space-y-8">
                 {/* 1. Upload */}
                <div>
                    <StepHeader 
                        step={1}
                        title={t('sections.upload.title')}
                        description={t('sections.upload.subtitle')}
                    />
                    <ImageUploader 
                    onImageUpload={handleProductImageUpload}
                    uploadedImage={productImage?.dataUrl || null}
                    label="Product Image"
                    labelKey="uploader.productLabel"
                    />
                </div>
                
                {/* 2. Method Selection */}
                <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                    <StepHeader 
                        step={2}
                        title={t('digitalImaging.sections.concept.title')}
                        description={t('digitalImaging.sections.concept.subtitle')}
                    />
                    <div className="p-1.5 bg-gray-100/80 dark:bg-black/40 rounded-2xl flex gap-1 backdrop-blur-md border border-gray-200/50 dark:border-white/5">
                        <ModeButton label={t('digitalImaging.modes.customize')} isActive={mode === 'customize'} onClick={() => setMode('customize')} />
                        <ModeButton label={t('digitalImaging.modes.generateConcept')} isActive={mode === 'generateConcept'} onClick={() => setMode('generateConcept')} />
                    </div>
                </div>
                
                {/* 3. Configuration */}
                <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                    {mode === 'customize' ? (
                        <div className="animate-fade-in">
                            <StepHeader 
                                step={3}
                                title={t('digitalImaging.sections.style.title')}
                                description={t('digitalImaging.sections.style.subtitle')}
                            />
                            <DigitalImagingOptions
                                onGenerate={handleGenerateCustomize}
                                isLoading={isLoading}
                                isProductImageUploaded={!!productImage}
                            />
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <StepHeader 
                                    step={3}
                                    title={t('digitalImaging.conceptGenerator.title')}
                                    description={t('digitalImaging.conceptGenerator.subtitle')}
                                />
                                <button
                                    onClick={handleGenerateConcepts}
                                    disabled={isConceptLoading || !productImage || isLoading}
                                    className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                    {isConceptLoading ? <Spinner className="h-5 w-5" /> : <SparklesIcon className="h-5 w-5" />}
                                    {t('digitalImaging.conceptGenerator.button')}
                                </button>
                            </div>
                            {(isConceptLoading || conceptError || concepts) && (
                                <div className="animate-slide-up pt-6 border-t border-gray-100 dark:border-white/10">
                                    <StepHeader 
                                        step={4}
                                        title={t('digitalImaging.conceptGenerator.resultsTitle')}
                                        description={t('digitalImaging.conceptGenerator.resultsSubtitle')}
                                    />
                                    {isConceptLoading && (
                                        <div className="text-center p-8 flex flex-col items-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                            <Spinner className="h-8 w-8 text-indigo-500" />
                                            <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('digitalImaging.conceptGenerator.loading')}</p>
                                        </div>
                                    )}
                                    {conceptError && <p className="text-center text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">{conceptError}</p>}
                                    {concepts && (
                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {concepts.map((concept, index) => (
                                                <ConceptCard key={index} concept={concept} onGenerate={() => handleGenerateFromConcept(concept)} isLoading={isLoading} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Result Display */}
        <div className="xl:col-span-7 xl:sticky xl:top-24 h-fit">
          <ResultDisplay
            originalImage={productImage?.dataUrl || null}
            generatedImages={generatedImages}
            selectedImage={selectedImage}
            isLoading={isLoading}
            error={error}
            onDownload={handleDownload}
            onReset={handleReset}
            onSelectImage={handleSelectImage}
          />
        </div>
      </div>
      <PromoCard />
    </div>
  );
}


import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { ImageData, ModelGenerationOptions } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import { Spinner } from '../components/Spinner';
import { FeatureHeader } from '../components/FeatureHeader';
import { ModelOptions } from '../components/ModelOptions';
import { StepHeader } from '../components/StepHeader';
import { generateLifestylePhotoshoot } from '../services/geminiService';
import { PromoCard } from '../components/PromoCard';


export const LifestylePhotoshoot: React.FC = () => {
    const { t } = useLanguage();
    
    // State
    const [productImage, setProductImage] = useState<ImageData | null>(null);
    const [modelImage, setModelImage] = useState<ImageData | null>(null);
    const [modelOption, setModelOption] = useState<'upload' | 'generate'>('upload');
    const [generationParams, setGenerationParams] = useState<ModelGenerationOptions>({ gender: 'Female', ethnicity: 'Caucasian', customEthnicity: '', details: '' });
    const [interactionPrompt, setInteractionPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('3:4'); // Default aspect ratio
    
    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Handlers
    const handleProductImageUpload = (dataUrl: string, mimeType: string) => {
        setProductImage({ dataUrl, mimeType });
        setGeneratedImages(null);
        setSelectedImage(null);
        setError(null);
    };

    const handleModelImageUpload = (dataUrl: string, mimeType: string) => {
        setModelImage({ dataUrl, mimeType });
    };

    const handleGenerate = async () => {
        if (!productImage) {
            setError(t('lifestylePhotoshoot.errors.noProduct'));
            return;
        }
        if (modelOption === 'upload' && !modelImage) {
            setError(t('lifestylePhotoshoot.errors.noModel'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages(null);
        setSelectedImage(null);

        try {
            const result = await generateLifestylePhotoshoot(
                productImage,
                modelOption === 'upload' ? modelImage : null,
                modelOption === 'generate' ? generationParams : null,
                interactionPrompt
            );
            
            setGeneratedImages(result.imageUrls);
            if (result.imageUrls.length > 0) {
                setSelectedImage(result.imageUrls[0]);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Gagal membuat foto lifestyle.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setProductImage(null);
        setModelImage(null);
        setInteractionPrompt('');
        setGeneratedImages(null);
        setSelectedImage(null);
        setIsLoading(false);
        setError(null);
    };

    const handleDownload = () => {
        if (selectedImage) {
            const link = document.createElement('a');
            link.href = selectedImage;
            link.download = `lifestyle-photoshoot-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const isGenerateDisabled = isLoading || !productImage || (modelOption === 'upload' && !modelImage);
    
    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";
      
    return (
      <div className="w-full">
        <FeatureHeader
          title={t('lifestylePhotoshoot.page.title')}
          description={t('lifestylePhotoshoot.page.description')}
        />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column */}
            <aside className="lg:col-span-2 lg:sticky top-8 self-start space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    {/* 1. Product Upload */}
                    <div>
                        <StepHeader 
                            step={1}
                            title={t('lifestylePhotoshoot.sections.uploadProduct.title')}
                            description={t('lifestylePhotoshoot.sections.uploadProduct.subtitle')}
                        />
                        <ImageUploader
                            onImageUpload={handleProductImageUpload}
                            uploadedImage={productImage?.dataUrl || null}
                            label="Product Image"
                            labelKey="uploader.productLabel"
                        />
                    </div>

                    {/* 2. Model Options */}
                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader 
                            step={2}
                            title={t('lifestylePhotoshoot.sections.provideModel.title')}
                            description={t('lifestylePhotoshoot.sections.provideModel.subtitle')}
                        />
                        <ModelOptions
                            modelOption={modelOption}
                            setModelOption={setModelOption}
                            modelImage={modelImage}
                            handleModelImageUpload={handleModelImageUpload}
                            generationParams={generationParams}
                            setGenerationParams={setGenerationParams}
                            aspectRatio={aspectRatio}
                            setAspectRatio={setAspectRatio}
                        />
                    </div>

                    {/* 3. Direct Photoshoot */}
                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader 
                            step={3}
                            title={t('lifestylePhotoshoot.sections.direct.title')}
                            description={t('lifestylePhotoshoot.sections.direct.subtitle')}
                        />
                        <div>
                            <label htmlFor="interactionPrompt" className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1">{t('lifestylePhotoshoot.form.interaction.label')}</label>
                            <textarea
                                id="interactionPrompt"
                                rows={4}
                                className={inputClasses}
                                placeholder={t('lifestylePhotoshoot.form.interaction.placeholder')}
                                value={interactionPrompt}
                                onChange={(e) => setInteractionPrompt(e.target.value)}
                            />
                        </div>
                    </div>
            
                <div className="pt-2">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerateDisabled}
                        className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_10px_40px_-5px_rgba(79,70,229,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        {isLoading ? (
                             <div className="flex items-center gap-3">
                                <Spinner className="h-5 w-5 text-white" />
                                <span className="tracking-wide">Generating Scene...</span>
                            </div>
                        ) : (
                            <span className="tracking-wide">{t('lifestylePhotoshoot.generateButton')}</span>
                        )}
                    </button>
                    {error && (
                         <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>
                    )}
                </div>
            </aside>

            {/* Right Column */}
            <section className="lg:col-span-3">
                <ResultDisplay
                    originalImage={modelImage?.dataUrl || productImage?.dataUrl || null}
                    generatedImages={generatedImages}
                    selectedImage={selectedImage}
                    isLoading={isLoading}
                    error={error}
                    onDownload={handleDownload}
                    onReset={handleReset}
                    onSelectImage={setSelectedImage}
                />
            </section>
        </div>
        <PromoCard />
      </div>
    );
};

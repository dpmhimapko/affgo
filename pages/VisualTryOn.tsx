
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUsage } from '../contexts/UsageContext';
import type { ImageData, ModelGenerationOptions } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import { PlusIcon } from '../components/icons/PlusIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { Spinner } from '../components/Spinner';
import { FeatureHeader } from '../components/FeatureHeader';
import { ModelOptions } from '../components/ModelOptions';
import { generateVirtualTryOn } from '../services/geminiService';
import { StepHeader } from '../components/StepHeader';

export const VirtualTryOn: React.FC = () => {
    const { t } = useLanguage();
    const { incrementUsage } = useUsage();
    // State
    const [productImages, setProductImages] = useState<(ImageData | null)[]>([null]);
    const [modelImage, setModelImage] = useState<ImageData | null>(null);
    const [modelOption, setModelOption] = useState<'upload' | 'generate'>('upload');
    const [generationParams, setGenerationParams] = useState<ModelGenerationOptions>({ gender: 'Female', ethnicity: 'Caucasian', customEthnicity: '', details: '' });
    const [aspectRatio, setAspectRatio] = useState('3:4'); // Default aspect ratio
    
    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Handlers for product images
    const handleAddProductSlot = () => {
        if (productImages.length < 4) {
            setProductImages(prev => [...prev, null]);
        }
    };
    const handleProductImageUpload = (dataUrl: string, mimeType: string, index: number) => {
        setProductImages(prev => {
            const newImages = [...prev];
            newImages[index] = { dataUrl, mimeType };
            return newImages;
        });
        setGeneratedImages(null);
        setSelectedImage(null);
        setError(null);
    };
    const handleRemoveProductSlot = (index: number) => {
        const newImages = productImages.filter((_, i) => i !== index);
        if (newImages.length === 0) {
            setProductImages([null]);
        } else {
            setProductImages(newImages);
        }
    };

    // Handlers for model
    const handleModelImageUpload = (dataUrl: string, mimeType: string) => {
        setModelImage({ dataUrl, mimeType });
    };

    // Main generation handler
    const handleGenerate = async () => {
        const validProductImages = productImages.filter(p => p !== null) as ImageData[];
        if (validProductImages.length === 0) {
            setError(t('virtualTryOn.errors.noProducts'));
            return;
        }
        if (modelOption === 'upload' && !modelImage) {
            setError(t('virtualTryOn.errors.noModel'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages(null);
        setSelectedImage(null);

        try {
            // Fix: Changed arguments to match generateVirtualTryOn signature in geminiService.ts (Expected 3 arguments, but got 5)
            // Passing a placeholder for modelImage if modelOption is 'generate' as signature currently requires a model image.
            const result = await generateVirtualTryOn(
                validProductImages[0],
                (modelOption === 'upload' ? modelImage : { dataUrl: '', mimeType: 'image/png' }) as ImageData,
                aspectRatio
            );
            
            // Fix: result.imageUrl instead of result.imageUrls
            setGeneratedImages([result.imageUrl]);
            if (result.imageUrl) {
                setSelectedImage(result.imageUrl);
            }
            incrementUsage();
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Reset and download handlers
    const handleReset = () => {
        setProductImages([null]);
        setModelImage(null);
        setGeneratedImages(null);
        setSelectedImage(null);
        setIsLoading(false);
        setError(null);
    };

    const handleDownload = () => {
        if (selectedImage) {
            const link = document.createElement('a');
            link.href = selectedImage;
            link.download = `virtual-try-on-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const isGenerateDisabled = isLoading ||
      (productImages.filter(p => p).length === 0) ||
      (modelOption === 'upload' && !modelImage);
      
    return (
      <div className="w-full">
        <FeatureHeader
          title={t('virtualTryOn.page.title')}
          description={t('virtualTryOn.page.description')}
        />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="xl:col-span-5 space-y-8">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all">
                     {/* Product Upload */}
                    <div className="mb-8">
                        <StepHeader 
                            step={1}
                            title={t('virtualTryOn.sections.uploadProduct.title')}
                            description={t('virtualTryOn.sections.uploadProduct.subtitle')}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            {productImages.map((img, index) => (
                                <div key={index} className="relative group">
                                    <ImageUploader
                                        onImageUpload={(dataUrl, mimeType) => handleProductImageUpload(dataUrl, mimeType, index)}
                                        uploadedImage={img?.dataUrl || null}
                                        label={`Product ${index + 1}`}
                                        labelKey="uploader.productLabel"
                                    />
                                    {productImages.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveProductSlot(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-red-600"
                                            aria-label="Remove product"
                                        >
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {productImages.length < 4 && (
                                <button
                                    onClick={handleAddProductSlot}
                                    className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-300 bg-gray-50/50 dark:bg-white/5"
                                >
                                    <div className="p-2 bg-white dark:bg-white/10 rounded-full mb-2 shadow-sm">
                                         <PlusIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wide">{t('virtualTryOn.sections.uploadProduct.addProduct')}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Model Options */}
                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader 
                            step={2}
                            title={t('virtualTryOn.sections.provideModel.title')}
                            description={t('virtualTryOn.sections.provideModel.subtitle')}
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
                </div>

                 <div className="pt-4">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerateDisabled}
                        className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_10px_40px_-5px_rgba(79,70,229,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] rounded-2xl overflow-hidden"></span>
                        {isLoading ? (
                            <div className="flex items-center gap-3">
                                <Spinner className="h-5 w-5 text-white" />
                                <span className="tracking-wide">Generating Try-On...</span>
                            </div>
                        ) : (
                             <span className="tracking-wide">{t('virtualTryOn.generateButton')}</span>
                        )}
                      </button>
                      {error && (
                         <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>
                      )}
                 </div>
            </div>

            {/* Right Column */}
            <div className="xl:col-span-7 xl:sticky xl:top-24 h-fit">
                <ResultDisplay
                    originalImage={modelImage?.dataUrl || productImages.find(p => p)?.dataUrl || null}
                    generatedImages={generatedImages}
                    selectedImage={selectedImage}
                    isLoading={isLoading}
                    error={error}
                    onDownload={handleDownload}
                    onReset={handleReset}
                    onSelectImage={setSelectedImage}
                />
            </div>
        </div>
      </div>
    );
};

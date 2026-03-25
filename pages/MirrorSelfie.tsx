
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import { MirrorOptions } from '../components/MirrorOptions';
import { generateMirrorSelfie } from '../services/geminiService';
import { MirrorStudioOptions, ImageData } from '../types';
import { MIRROR_THEMES, MIRROR_FRAMES } from '../constants';
import { PromoCard } from '../components/PromoCard';

export const MirrorSelfie: React.FC = () => {
    const { t } = useLanguage();
    const [productImage, setProductImage] = useState<ImageData | null>(null);
    const [modelImage, setModelImage] = useState<ImageData | null>(null);
    
    const [options, setOptions] = useState<MirrorStudioOptions>({
        modelSource: 'generate',
        gender: 'Female',
        ethnicity: '',
        frame: MIRROR_FRAMES[0].key,
        theme: MIRROR_THEMES[0].key,
        customTheme: ''
    });

    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleProductImageUpload = (dataUrl: string, mimeType: string) => {
        setProductImage({ dataUrl, mimeType });
        setGeneratedImages(null);
        setSelectedImage(null);
        setError(null);
    };

    const handleModelUpload = (dataUrl: string, mimeType: string) => {
        setModelImage({ dataUrl, mimeType });
    };

    const handleGenerate = async () => {
        if (!productImage) {
            setError(t('errors.noProductImage'));
            return;
        }

        if (options.modelSource === 'upload' && !modelImage) {
            setError(t('mirrorStudio.errors.noModel'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages(null);
        setSelectedImage(null);

        try {
            const result = await generateMirrorSelfie(productImage, options, modelImage);
            setGeneratedImages(result.imageUrls);
            if (result.imageUrls && result.imageUrls.length > 0) {
                setSelectedImage(result.imageUrls[0]);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setProductImage(null);
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
            link.download = `mirror-selfie-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="w-full">
            <FeatureHeader 
                title={t('mirrorStudio.page.title')}
                description={t('mirrorStudio.page.description')}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Controls */}
                <aside className="lg:col-span-2 lg:sticky top-8 self-start space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        {/* Upload Section */}
                        <div>
                            <StepHeader 
                                step={1}
                                title={t('mirrorStudio.sections.upload.title')}
                                description={t('mirrorStudio.sections.upload.subtitle')}
                            />
                            <ImageUploader 
                                onImageUpload={handleProductImageUpload}
                                uploadedImage={productImage?.dataUrl || null}
                                label="Product Image"
                                labelKey="uploader.productLabel"
                            />
                        </div>

                        {/* Options Section */}
                         <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                            <StepHeader 
                                step={2}
                                title={t('mirrorStudio.sections.configure.title')}
                                description={t('mirrorStudio.sections.configure.subtitle')}
                            />
                            <MirrorOptions 
                                options={options}
                                setOptions={setOptions}
                                onGenerate={handleGenerate}
                                isLoading={isLoading}
                                isProductImageUploaded={!!productImage}
                                modelImage={modelImage?.dataUrl || null}
                                onModelUpload={handleModelUpload}
                            />
                        </div>
                </aside>

                {/* Right Column: Results */}
                <section className="lg:col-span-3">
                    <ResultDisplay
                        originalImage={productImage?.dataUrl || null}
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


import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import { ListingOptions } from '../components/ListingOptions';
import { generateListingImage } from '../services/geminiService';
import { ListingStudioOptions, ImageData } from '../types';
import { LISTING_STYLES } from '../constants';
import { PromoCard } from '../components/PromoCard';

export const ListingStudio: React.FC = () => {
    const { t } = useLanguage();
    const [productImage, setProductImage] = useState<ImageData | null>(null);
    
    const [options, setOptions] = useState<ListingStudioOptions>({
        features: ['', '', ''],
        style: LISTING_STYLES[0].key
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

    const handleGenerate = async () => {
        if (!productImage) {
            setError(t('errors.noProductImage'));
            return;
        }
        
        // Filter out empty features
        const validFeatures = options.features.filter(f => f.trim().length > 0);

        if (validFeatures.length === 0) {
             setError(t('listingStudio.errors.minFeatures'));
             return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages(null);
        setSelectedImage(null);

        try {
            const result = await generateListingImage(productImage, options);
            setGeneratedImages(result.imageUrls);
            if (result.imageUrls.length > 0) {
                setSelectedImage(result.imageUrls[0]);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Gagal membuat gambar listing.");
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
        setOptions({
             features: ['', '', ''],
             style: LISTING_STYLES[0].key
        });
    };

    const handleDownload = () => {
        if (selectedImage) {
            const link = document.createElement('a');
            link.href = selectedImage;
            link.download = `listing-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="w-full">
            <FeatureHeader 
                title={t('listingStudio.page.title')}
                description={t('listingStudio.page.description')}
            />
            
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Column: Controls */}
                <div className="xl:col-span-5 space-y-8">
                     <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all space-y-8">
                        {/* Upload Section */}
                        <div>
                            <StepHeader 
                                step={1}
                                title={t('listingStudio.sections.upload.title')}
                                description={t('listingStudio.sections.upload.subtitle')}
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
                                title={t('listingStudio.sections.features.title')}
                                description={t('listingStudio.sections.features.subtitle')}
                            />
                            <ListingOptions 
                                options={options}
                                setOptions={setOptions}
                                onGenerate={handleGenerate}
                                isLoading={isLoading}
                                isProductImageUploaded={!!productImage}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Results */}
                <div className="xl:col-span-7 xl:sticky xl:top-24 h-fit">
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
                </div>
            </div>
            <PromoCard />
        </div>
    );
};

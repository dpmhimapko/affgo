
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import { UploadedImage } from '../types';
import { generateMockupImage } from '../services/geminiService';
import { Spinner } from '../components/Spinner';
import { PromoCard } from '../components/PromoCard';

// Simple representation for Preset Options since we don't have static assets
const PRESET_MOCKUPS = [
    { id: 'tshirt', name: 'Kaos Putih', prompt: 'a plain white t-shirt on a hanger, clean studio background' },
    { id: 'mug', name: 'Mug Keramik', prompt: 'a white ceramic coffee mug on a wooden table, cozy atmosphere' },
    { id: 'totebag', name: 'Tote Bag', prompt: 'a canvas tote bag hanging on a wall, natural light' },
    { id: 'hoodie', name: 'Hoodie Hitam', prompt: 'a black hoodie folded neatly on a surface, streetwear vibe' },
    { id: 'box', name: 'Box Kemasan', prompt: 'a plain cardboard packaging box, isometric view, white background' }
];

export const MockupGenerator: React.FC = () => {
    const { t } = useLanguage();
    
    // State
    const [designImage, setDesignImage] = useState<UploadedImage | null>(null);
    const [mockupImage, setMockupImage] = useState<UploadedImage | null>(null); // For Custom Upload
    const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'presets' | 'upload'>('presets');

    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [selectedResult, setSelectedResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Handlers
    const handleDesignUpload = (dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        setDesignImage({ base64, mimeType, name: 'design' });
        setGeneratedImages(null);
        setSelectedResult(null);
        setError(null);
    };

    const handleMockupUpload = (dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        setMockupImage({ base64, mimeType, name: 'mockup' });
    };

    const handleGenerate = async () => {
        if (!designImage) {
            setError(t('mockupGenerator.errors.noDesign'));
            return;
        }

        let targetMockup: UploadedImage | string = '';
        if (activeTab === 'presets') {
            const preset = PRESET_MOCKUPS.find(p => p.id === selectedPresetId);
            if (!preset) {
                setError("Pilih jenis produk dari daftar.");
                return;
            }
            targetMockup = preset.prompt;
        } else {
            if (!mockupImage) {
                setError(t('mockupGenerator.errors.noMockup'));
                return;
            }
            targetMockup = mockupImage;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages(null);
        setSelectedResult(null);

        try {
            const result = await generateMockupImage(designImage, targetMockup, "Make it look professional");
            setGeneratedImages(result.imageUrls);
            if (result.imageUrls.length > 0) {
                setSelectedResult(result.imageUrls[0]);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Gagal memasang mockup.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setDesignImage(null);
        setMockupImage(null);
        setGeneratedImages(null);
        setSelectedResult(null);
        setIsLoading(false);
        setError(null);
    };

    const handleDownload = () => {
        if (selectedResult) {
            const link = document.createElement('a');
            link.href = selectedResult;
            link.download = `mockup-generated-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const isGenerateDisabled = isLoading || !designImage || (activeTab === 'upload' && !mockupImage) || (activeTab === 'presets' && !selectedPresetId);

    return (
        <div className="w-full">
            <FeatureHeader
                title={t('mockupGenerator.page.title')}
                description={t('mockupGenerator.page.description')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Inputs */}
                <aside className="lg:col-span-2 lg:sticky top-8 self-start space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    
                    {/* 1. Design Upload */}
                    <div>
                        <StepHeader 
                            step={1} 
                            title={t('mockupGenerator.sections.uploadDesign.title')}
                            description={t('mockupGenerator.sections.uploadDesign.subtitle')}
                        />
                        <ImageUploader 
                            onImageUpload={handleDesignUpload}
                            uploadedImage={designImage ? `data:${designImage.mimeType};base64,${designImage.base64}` : null}
                            label={t('uploader.designLabel')}
                            labelKey="uploader.designLabel"
                        />
                    </div>

                    {/* 2. Mockup Selection */}
                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader 
                            step={2} 
                            title={t('mockupGenerator.sections.chooseMockup.title')}
                            description={t('mockupGenerator.sections.chooseMockup.subtitle')}
                        />
                        
                        {/* Tabs */}
                        <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl mb-4">
                            <button
                                onClick={() => setActiveTab('presets')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'presets' ? 'bg-white dark:bg-gray-700 shadow text-slate-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                {t('mockupGenerator.tabs.presets')}
                            </button>
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'upload' ? 'bg-white dark:bg-gray-700 shadow text-slate-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                {t('mockupGenerator.tabs.upload')}
                            </button>
                        </div>

                        {activeTab === 'presets' ? (
                            <div className="grid grid-cols-2 gap-3">
                                {PRESET_MOCKUPS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => setSelectedPresetId(preset.id)}
                                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 h-24 ${
                                            selectedPresetId === preset.id
                                            ? 'border-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                                        }`}
                                    >
                                        <span className="text-xs font-bold text-center">{preset.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <ImageUploader 
                                    onImageUpload={handleMockupUpload}
                                    uploadedImage={mockupImage ? `data:${mockupImage.mimeType};base64,${mockupImage.base64}` : null}
                                    label={t('uploader.mockupLabel')}
                                    labelKey="uploader.mockupLabel"
                                />
                            </div>
                        )}
                    </div>

                    {/* Generate Button */}
                    <div className="pt-4">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerateDisabled}
                            className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <Spinner className="h-5 w-5 text-white" />
                                    <span className="tracking-wide">Generating...</span>
                                </div>
                            ) : (
                                <span className="tracking-wide">{t('mockupGenerator.generateButton')}</span>
                            )}
                        </button>
                        {error && (
                            <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>
                        )}
                    </div>

                </aside>

                {/* Right Column: Result */}
                <section className="lg:col-span-3">
                    <ResultDisplay
                        originalImage={designImage ? `data:${designImage.mimeType};base64,${designImage.base64}` : null}
                        generatedImages={generatedImages}
                        selectedImage={selectedResult}
                        isLoading={isLoading}
                        error={error}
                        onDownload={handleDownload}
                        onReset={handleReset}
                        onSelectImage={setSelectedResult}
                    />
                </section>
            </div>
            <PromoCard />
        </div>
    );
};

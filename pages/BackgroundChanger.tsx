
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import { Spinner } from '../components/Spinner';
import { generateBackgroundChange, removeBackground } from '../services/geminiService';
import { BackgroundChangerOptions, ImageData } from '../types';
import { PromoCard } from '../components/PromoCard';

export const BackgroundChanger: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'change' | 'remove'>('change');
    
    // Common State
    const [productImage, setProductImage] = useState<ImageData | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Change Background specific state
    const [backgroundImage, setBackgroundImage] = useState<ImageData | null>(null);
    const [options, setOptions] = useState<BackgroundChangerOptions>({
        mode: 'upload',
        prompt: '',
        instructions: ''
    });

    const handleProductImageUpload = (dataUrl: string, mimeType: string) => {
        setProductImage({ dataUrl, mimeType });
        setGeneratedImages(null);
        setSelectedImage(null);
        setError(null);
    };

    const handleBackgroundUpload = (dataUrl: string, mimeType: string) => {
        setBackgroundImage({ dataUrl, mimeType });
    };

    const handleModeChange = (mode: 'upload' | 'generate') => {
        setOptions({ ...options, mode });
        setError(null);
    };

    const handleTabChange = (tab: 'change' | 'remove') => {
        setActiveTab(tab);
        setGeneratedImages(null);
        setSelectedImage(null);
        setError(null);
    };

    const handleGenerate = async () => {
        if (!productImage) {
            setError(t('backgroundChanger.errors.noProduct'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages(null);
        setSelectedImage(null);

        try {
            let result;
            if (activeTab === 'change') {
                if (options.mode === 'upload' && !backgroundImage) {
                    throw new Error(t('backgroundChanger.errors.noBackground'));
                }
                if (options.mode === 'generate' && !options.prompt.trim()) {
                    throw new Error(t('backgroundChanger.errors.noPrompt'));
                }
                result = await generateBackgroundChange(productImage, backgroundImage, options);
            } else {
                result = await removeBackground(productImage);
            }
            
            setGeneratedImages(result.imageUrls);
            if (result.imageUrls.length > 0) {
                setSelectedImage(result.imageUrls[0]);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Gagal memproses gambar.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setProductImage(null);
        setBackgroundImage(null);
        setGeneratedImages(null);
        setSelectedImage(null);
        setIsLoading(false);
        setError(null);
        setOptions({ mode: 'upload', prompt: '', instructions: '' });
    };

    const handleDownload = () => {
        if (selectedImage) {
            const link = document.createElement('a');
            link.href = selectedImage;
            link.download = `bg-result-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm appearance-none";
    const labelClasses = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";

    const isGenerateDisabled = isLoading || !productImage || 
        (activeTab === 'change' && ((options.mode === 'upload' && !backgroundImage) || (options.mode === 'generate' && !options.prompt.trim())));

    return (
        <div className="w-full">
            <FeatureHeader 
                title={t('backgroundChanger.page.title')}
                description={t('backgroundChanger.page.description')}
            />
            
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Column: Controls */}
                <div className="xl:col-span-5 space-y-8">
                     <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all space-y-8">
                        
                        {/* Top Tab Switcher */}
                        <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
                            <button
                                onClick={() => handleTabChange('change')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'change' ? 'bg-white dark:bg-gray-700 shadow text-slate-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                {t('backgroundChanger.tabs.change')}
                            </button>
                            <button
                                onClick={() => handleTabChange('remove')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'remove' ? 'bg-white dark:bg-gray-700 shadow text-slate-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                {t('backgroundChanger.tabs.remove')}
                            </button>
                        </div>

                        {/* Upload Section (Always Visible) */}
                        <div>
                            <StepHeader 
                                step={1}
                                title={t('backgroundChanger.sections.upload.title')}
                                description={t('backgroundChanger.sections.upload.subtitle')}
                            />
                            
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>
                                        {t('uploader.productLabel')}
                                    </label>
                                    <ImageUploader 
                                        onImageUpload={handleProductImageUpload}
                                        uploadedImage={productImage?.dataUrl || null}
                                        label="Product Image"
                                        labelKey="uploader.productLabel"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Specific Controls based on Tab */}
                        <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                            {activeTab === 'change' ? (
                                <>
                                    <StepHeader 
                                        step={2}
                                        title={t('backgroundChanger.sections.method.title')}
                                        description={t('backgroundChanger.sections.method.subtitle')}
                                    />

                                    {/* Mode Toggle */}
                                    <div className="p-1 mb-6 bg-gray-100 dark:bg-white/5 rounded-xl flex gap-1">
                                        <button
                                            onClick={() => handleModeChange('upload')}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                                options.mode === 'upload'
                                                    ? 'bg-white dark:bg-gray-700 shadow text-slate-900 dark:text-white'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                            }`}
                                        >
                                            {t('backgroundChanger.modes.upload')}
                                        </button>
                                        <button
                                            onClick={() => handleModeChange('generate')}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                                options.mode === 'generate'
                                                    ? 'bg-white dark:bg-gray-700 shadow text-slate-900 dark:text-white'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                            }`}
                                        >
                                            {t('backgroundChanger.modes.generate')}
                                        </button>
                                    </div>

                                    {options.mode === 'upload' ? (
                                        <div className="animate-fade-in">
                                            <label className={labelClasses}>
                                                {t('uploader.backgroundLabel')}
                                            </label>
                                            <ImageUploader 
                                                onImageUpload={handleBackgroundUpload}
                                                uploadedImage={backgroundImage?.dataUrl || null}
                                                label="New Background"
                                                labelKey="uploader.backgroundLabel"
                                            />
                                        </div>
                                    ) : (
                                        <div className="animate-fade-in space-y-4">
                                            <div>
                                                <label className={labelClasses}>
                                                    {t('backgroundChanger.form.prompt.label')}
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    className={inputClasses}
                                                    placeholder={t('backgroundChanger.form.prompt.placeholder')}
                                                    value={options.prompt}
                                                    onChange={(e) => setOptions({ ...options, prompt: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <label className={labelClasses}>
                                            {t('backgroundChanger.form.instructions.label')}
                                        </label>
                                        <textarea
                                            rows={2}
                                            className={inputClasses}
                                            placeholder={t('backgroundChanger.form.instructions.placeholder')}
                                            value={options.instructions}
                                            onChange={(e) => setOptions({ ...options, instructions: e.target.value })}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="animate-fade-in">
                                    <StepHeader 
                                        step={2}
                                        title={t('backgroundChanger.sections.remove.title')}
                                        description={t('backgroundChanger.sections.remove.subtitle')}
                                    />
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl">
                                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                            Fitur ini akan menghapus latar belakang secara otomatis dan menghasilkan gambar format PNG transparan.
                                        </p>
                                    </div>
                                </div>
                            )}

                             <div className="mt-6">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerateDisabled}
                                    className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-[0_10px_40px_-10px_rgba(192,38,211,0.5)] hover:shadow-[0_10px_40px_-5px_rgba(192,38,211,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] rounded-2xl overflow-hidden"></span>
                                    {isLoading ? (
                                        <div className="flex items-center gap-3">
                                            <Spinner className="h-5 w-5 text-white" />
                                            <span className="tracking-wide">Processing...</span>
                                        </div>
                                    ) : (
                                        <span className="tracking-wide">
                                            {activeTab === 'change' ? t('backgroundChanger.generateButton') : t('backgroundChanger.removeButton')}
                                        </span>
                                    )}
                                </button>
                                 {error && (
                                    <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                                        {error}
                                    </p>
                                )}
                            </div>
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

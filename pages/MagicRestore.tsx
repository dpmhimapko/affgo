
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadedImage } from '../types';
import { enhanceImage } from '../services/geminiService';
import { 
    X, Sparkles, Download, 
    Square as SquareIcon, RectangleHorizontal as RectangleHorizontalIcon, RectangleVertical as RectangleVerticalIcon 
} from '../components/icons/LucideIcons';
import { RestoreIcon } from '../components/icons/RestoreIcon';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { Spinner } from '../components/Spinner';
import { PromoCard } from '../components/PromoCard';

type AspectRatio = '1:1' | '16:9' | '9:16';

const RatioButton: React.FC<{ value: AspectRatio, selected: AspectRatio, onSelect: (val: AspectRatio) => void, icon: React.ReactNode }> = ({ value, selected, onSelect, icon }) => (
    <button 
        onClick={() => onSelect(value)} 
        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold border transition-all duration-200 ${
            selected === value 
            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300 shadow-sm' 
            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
        }`}
    >
        {icon}
        <span>{value}</span>
    </button>
);

const MagicRestore: React.FC = () => {
    const [imageData, setImageData] = useState<(UploadedImage & { dataUrl: string }) | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = (dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        setImageData({ base64, mimeType, dataUrl });
        setGeneratedImages(null);
        setSelectedImage(null);
        setError(null);
    };

    const handleReset = () => {
        setImageData(null);
        setGeneratedImages(null);
        setSelectedImage(null);
        setError(null);
        setIsLoading(false);
    };

    const handleGenerate = async () => {
        if (!imageData) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImages(null);
        setSelectedImage(null);

        const generationPromises = [1, 2, 3, 4].map(async (i) => {
            const prompt = `Enhance this image to professional studio portrait quality. Improve lighting, sharpness, and color balance. Make it look like a high-resolution photograph. Variation ${i}.`;
            return enhanceImage(imageData, prompt, aspectRatio);
        });

        try {
            const results = await Promise.all(generationPromises);
            const imageUrls = results.map(res => res.imageUrl);
            setGeneratedImages(imageUrls);
            if (imageUrls.length > 0) {
                setSelectedImage(imageUrls[0]);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Terjadi kesalahan.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (selectedImage) {
            const link = document.createElement('a');
            link.href = selectedImage;
            link.download = `magic-restore-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const isGenerateDisabled = !imageData || isLoading;

    return (
        <div className="w-full">
            <FeatureHeader 
                title="Go Restore"
                description="Unggah foto lama atau buram untuk meningkatkan kualitasnya secara otomatis menjadi foto studio profesional."
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Configuration */}
                <aside className="lg:col-span-2 lg:sticky top-8 self-start space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    
                    {/* Step 1: Upload */}
                    <div>
                        <StepHeader step={1} title="Unggah Foto" description="Foto yang ingin diperbaiki kualitasnya." />
                        <ImageUploader 
                            onImageUpload={handleUpload}
                            uploadedImage={imageData?.dataUrl || null}
                            label="Foto Asli"
                            labelKey="uploader.imageLabel"
                        />
                    </div>

                    {/* Step 2: Aspect Ratio */}
                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={2} title="Pilih Rasio" />
                        <div className="grid grid-cols-3 gap-3">
                            <RatioButton value="1:1" selected={aspectRatio} onSelect={setAspectRatio} icon={<SquareIcon className="w-4 h-4" />} />
                            <RatioButton value="16:9" selected={aspectRatio} onSelect={setAspectRatio} icon={<RectangleHorizontalIcon className="w-4 h-4" />} />
                            <RatioButton value="9:16" selected={aspectRatio} onSelect={setAspectRatio} icon={<RectangleVerticalIcon className="w-4 h-4" />} />
                        </div>
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
                                    <span className="tracking-wide">Memperbaiki...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="tracking-wide">Perbaiki Foto</span>
                                </div>
                            )}
                        </button>
                        {error && <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>}
                    </div>
                </aside>

                {/* Right Column: Results */}
                <section className="lg:col-span-3">
                    <ResultDisplay
                        originalImage={imageData?.dataUrl || null}
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

export default MagicRestore;

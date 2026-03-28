
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useUsage } from '../contexts/UsageContext';
import type { ImageData } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { FeatureHeader } from '../components/FeatureHeader';
import { generateVirtualTryOn } from '../services/geminiService';
import { StepHeader } from '../components/StepHeader';
import { PromoCard } from '../components/PromoCard';
import { ZoomModal } from '../components/ZoomModal';
import { Download as DownloadIcon, Eye as ZoomIcon, RefreshCw, User, ShoppingBag, Info } from '../components/icons/LucideIcons';
import { auth, saveToHistory } from '../firebase';

export const VirtualTryOn: React.FC = () => {
    const { t } = useLanguage();
    const { incrementUsage } = useUsage();
    
    // Input State
    const [modelImage, setModelImage] = useState<ImageData | null>(null);
    const [productImage, setProductImage] = useState<ImageData | null>(null);
    const [aspectRatio, setAspectRatio] = useState('3:4');
    
    // Result State
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMsg, setLoadingMsg] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    // Zoom State
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

    // Dynamic Loading Messages effect
    useEffect(() => {
        let interval: number;
        if (isLoading) {
            const loadingMessages = [
                "Menganalisis fitur wajah model...",
                "Mengekstrak detail tekstur produk...",
                "Menyesuaikan pencahayaan studio...",
                "Mencocokkan ukuran dan dimensi...",
                "Merender visual fotorealistis...",
                "Memberi sentuhan akhir..."
            ];
            let msgIndex = 0;
            setLoadingMsg(loadingMessages[0]);
            interval = window.setInterval(() => {
                msgIndex = (msgIndex + 1) % loadingMessages.length;
                setLoadingMsg(loadingMessages[msgIndex]);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleGenerate = async () => {
        if (!modelImage) {
            setError("Harap unggah foto model (subjek) terlebih dahulu.");
            return;
        }
        if (!productImage) {
            setError("Harap unggah foto produk (objek) terlebih dahulu.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const result = await generateVirtualTryOn(
                productImage,
                modelImage,
                aspectRatio
            );
            setResultImage(result.imageUrl);
            incrementUsage();
            
            // Save to history
            if (auth.currentUser) {
                await saveToHistory(auth.currentUser.uid, {
                    imageUrl: result.imageUrl,
                    type: "Go Try-On",
                    prompt: "Virtual Try-On Fusion"
                });
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setModelImage(null);
        setProductImage(null);
        setResultImage(null);
        setIsLoading(false);
        setError(null);
    };

    const handleDownload = () => {
        if (resultImage) {
            const link = document.createElement('a');
            link.href = resultImage;
            link.download = `go-tryon-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const isGenerateDisabled = isLoading || !modelImage || !productImage;
    
    const getAspectRatioClass = (ratio: string) => {
        switch (ratio) {
            case '1:1': return 'aspect-square';
            case '16:9': return 'aspect-video';
            case '9:16': return 'aspect-[9/16]';
            default: return 'aspect-[3/4]';
        }
    };
      
    return (
      <div className="w-full">
        <FeatureHeader
          title="Go Try-On"
          description="Pakaikan produk Anda pada model apa pun secara virtual dengan presisi tinggi menggunakan fusi visual AI."
        />

        {/* Use Guide Section from Snippet */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/5 mb-8">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-indigo-500" /> Cara Penggunaan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex gap-3 items-start">
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">1</span>
                    <p>Unggah foto model atau orang yang akan mengenakan produk.</p>
                </div>
                <div className="flex gap-3 items-start">
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">2</span>
                    <p>Unggah foto produk (pakaian, tas, atau aksesori).</p>
                </div>
                <div className="flex gap-3 items-start">
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">3</span>
                    <p>Klik "Hasilkan Gambar" dan biarkan AI memproses fusi visual.</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
            {/* Model Upload */}
            <div className="flex flex-col gap-4">
                <label className="font-bold text-slate-700 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider ml-1">
                    <User className="w-4 h-4 text-indigo-500" /> Foto Model (Subjek)
                </label>
                <ImageUploader
                    onImageUpload={(dataUrl, mimeType) => setModelImage({ dataUrl, mimeType })}
                    uploadedImage={modelImage?.dataUrl || null}
                    label="Model Photo"
                    labelKey="uploader.modelLabel" 
                />
            </div>

            {/* Product Upload */}
            <div className="flex flex-col gap-4">
                <label className="font-bold text-slate-700 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider ml-1">
                    <ShoppingBag className="w-4 h-4 text-indigo-500" /> Foto Produk (Objek)
                </label>
                <ImageUploader
                    onImageUpload={(dataUrl, mimeType) => setProductImage({ dataUrl, mimeType })}
                    uploadedImage={productImage?.dataUrl || null}
                    label="Product Photo"
                    labelKey="uploader.productLabel" 
                />
            </div>
        </div>

        {/* Action & Result Section */}
        <div className="flex flex-col items-center gap-8">
            <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="w-full md:w-80 py-4 px-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:dark:bg-slate-800 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                        <Spinner className="h-5 w-5 text-white" />
                        <span>Memproses...</span>
                    </div>
                ) : "Hasilkan Gambar"}
            </button>

            <AnimatePresence mode="wait">
                {(isLoading || resultImage || error) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="w-full max-w-2xl bg-white dark:bg-gray-900/50 backdrop-blur-2xl p-6 md:p-10 rounded-[3rem] border border-white/40 dark:border-white/5 shadow-2xl space-y-8"
                    >
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Hasil Generate AI</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                {isLoading ? "Sedang merender visual..." : "Selesai!"}
                            </p>
                        </div>

                        <div className={`relative ${getAspectRatioClass(aspectRatio)} bg-slate-50 dark:bg-black/20 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner flex items-center justify-center p-4`}>
                            {isLoading && (
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">
                                        {loadingMsg}
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="flex flex-col items-center gap-4 text-center p-8">
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full text-red-500">
                                        <RefreshCw className="w-8 h-8" />
                                    </div>
                                    <p className="text-red-600 dark:text-red-400 font-bold text-sm leading-relaxed">{error}</p>
                                    <button onClick={handleGenerate} className="mt-2 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider">Coba Lagi</button>
                                </div>
                            )}

                            {resultImage && !isLoading && (
                                <div className="relative w-full h-full group">
                                    <img src={resultImage} alt="Try On Result" className="w-full h-full object-contain rounded-2xl" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => setIsZoomModalOpen(true)} className="p-4 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-all transform hover:scale-110 shadow-2xl">
                                            <ZoomIcon className="w-8 h-8" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {resultImage && !isLoading && (
                            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    <DownloadIcon className="w-5 h-5" /> UNDUH GAMBAR
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 flex items-center justify-center gap-3 py-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-gray-700"
                                >
                                    <RefreshCw className="w-5 h-5" /> BUAT ULANG
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        
        <PromoCard />
        <ZoomModal 
            isOpen={isZoomModalOpen}
            onClose={() => setIsZoomModalOpen(false)}
            imageUrl={resultImage || ''}
        />
      </div>
    );
};

export default VirtualTryOn;

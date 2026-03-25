
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUsage } from '../contexts/UsageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { UploadedImage } from '../types';
import { generateCleanImage } from '../services/geminiService';
import { Download as DownloadIcon, Eye as ZoomIcon, RefreshCw, Image as ImageIcon, Shirt, X, Eraser } from '../components/icons/LucideIcons';
import { ZoomModal } from '../components/ZoomModal';
import { PromoCard } from '../components/PromoCard';

const PRODUCT_TYPES = ['baju', 'celana', 'tas', 'sepatu'];

export const GoClean: React.FC = () => {
    const { t } = useLanguage();
    const { incrementUsage } = useUsage();
    
    const [sourceImage, setSourceImage] = useState<UploadedImage | null>(null);
    const [productType, setProductType] = useState<string>('baju');
    const [customProductType, setCustomProductType] = useState('');
    
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

    const handleUpload = (dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        setSourceImage({ base64, mimeType });
        setResultImage(null);
        setError(null);
    };

    const handleGenerate = async () => {
        const finalProductType = productType === 'lainnya' ? customProductType : productType;
        if (!sourceImage) {
            setError(t('goClean.errors.noImage'));
            return;
        }
        if (!finalProductType.trim()) {
            setError(t('goClean.errors.noProductType'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const res = await generateCleanImage(sourceImage, finalProductType);
            setResultImage(res.imageUrl);
            incrementUsage();
        } catch (err: any) {
            setError(err.message || 'Gagal membersihkan gambar.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSourceImage(null);
        setResultImage(null);
        setError(null);
        setIsLoading(false);
        setProductType('baju');
        setCustomProductType('');
    };
    
    const handleDownload = () => {
        if (resultImage) {
            const link = document.createElement('a');
            link.href = resultImage;
            link.download = `go-clean-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    const isGenerateDisabled = isLoading || !sourceImage || (productType === 'lainnya' && !customProductType.trim());
    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";

    return (
        <div className="w-full">
            <FeatureHeader
                title={t('goClean.page.title')}
                description={t('goClean.page.description')}
            />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <aside className="w-full lg:w-[400px] flex-shrink-0 lg:sticky lg:top-8 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    
                    <section>
                        <StepHeader 
                            step={1} 
                            title={t('sections.upload.title')}
                            description={t('uploader.productLabel')}
                        />
                        <ImageUploader 
                            onImageUpload={handleUpload}
                            uploadedImage={sourceImage ? `data:${sourceImage.mimeType};base64,${sourceImage.base64}` : null}
                            label={t('uploader.imageLabel')}
                            labelKey="uploader.productLabel"
                        />
                    </section>

                    <section className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader 
                            step={2} 
                            title={t('goClean.sections.productType.title')}
                            description={t('goClean.sections.productType.subtitle')}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            {PRODUCT_TYPES.map(type => (
                                <button 
                                    key={type} 
                                    onClick={() => setProductType(type)}
                                    className={`p-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
                                        productType === type ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    <Shirt className="w-4 h-4" />
                                    <span className="text-sm font-bold capitalize">{t(`goClean.productTypes.${type}`)}</span>
                                </button>
                            ))}
                        </div>
                         <button 
                                onClick={() => setProductType('lainnya')}
                                className={`p-3 mt-2 w-full rounded-xl flex items-center justify-center gap-2 border transition-all ${
                                    productType === 'lainnya' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                            <span className="text-sm font-bold">{t('goClean.productTypes.lainnya')}</span>
                        </button>
                        {productType === 'lainnya' && (
                            <input
                                type="text"
                                value={customProductType}
                                onChange={(e) => setCustomProductType(e.target.value)}
                                placeholder={t('goClean.customProductPlaceholder')}
                                className="w-full mt-3 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                            />
                        )}
                    </section>

                    <div className="pt-4">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerateDisabled}
                            className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <Spinner className="h-5 w-5 text-white" />
                                    <span className="tracking-wide">Membersihkan...</span>
                                </div>
                            ) : (
                                 <div className="flex items-center gap-2">
                                    <Eraser className="w-5 h-5" />
                                    <span className="tracking-wide">{t('goClean.generateButton')}</span>
                                </div>
                            )}
                        </button>
                        
                        {error && (
                            <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>
                        )}
                    </div>
                </aside>

                <main className="flex-1 w-full bg-white dark:bg-gray-900/50 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-sm min-h-[500px] flex flex-col">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-white/10 pb-6">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Hasil Foto Bersih</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Produk Anda dengan latar putih bersih.</p>
                        </div>
                         {resultImage && !isLoading && (
                            <button onClick={handleReset} className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1.5"><RefreshCw className="w-3 h-3"/> Ulangi</button>
                         )}
                    </div>
                    
                    <div className="flex-grow flex items-center justify-center">
                        <div className="w-full max-w-lg aspect-square bg-slate-100 dark:bg-black/20 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner group relative">
                             {isLoading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 animate-pulse">
                                    <Spinner className="h-8 w-8 text-indigo-500" />
                                    <span className="text-[10px] font-black uppercase text-indigo-500 mt-2 tracking-widest">Membersihkan...</span>
                                </div>
                            ) : error ? (
                                 <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/10 text-red-500 text-center">
                                    <X className="w-6 h-6 mb-2 opacity-50" />
                                    <p className="text-xs font-bold uppercase">{error}</p>
                                </div>
                            ) : resultImage ? (
                                <>
                                    <img src={resultImage} alt="Cleaned Product" className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                                        <div className="flex gap-2 w-full">
                                            <button onClick={() => setIsZoomModalOpen(true)} className="flex-1 bg-white/20 hover:bg-white/40 text-white p-2.5 rounded-xl backdrop-blur-md transition-all flex items-center justify-center"><ZoomIcon className="w-4 h-4" /></button>
                                            <button onClick={handleDownload} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center"><DownloadIcon className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-center p-4">
                                     <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-dashed border-slate-200 rotate-3">
                                        <Eraser className="w-8 h-8 opacity-40" />
                                     </div>
                                    <p className="text-sm font-bold opacity-70">Hasil foto bersih akan muncul di sini.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
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

export default GoClean;


import React, { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadedImage } from '../types';
import { 
    generateStyloImage as generateFashionImage,
    generateProductPhoto
} from '../services/geminiService';
import { Shirt, Image as ImageIcon, UserPlus, X, Sparkles, Download, Eye, Square as SquareIcon, RectangleVertical as RectangleVerticalIcon, RectangleHorizontal as RectangleHorizontalIcon } from '../components/icons/LucideIcons';
import { InfoIcon as Info } from '../components/icons/InfoIcon';
import Loader from '../components/Loader';
import UniversalModal from '../components/UniversalModal';
import { FeatureHeader } from '../components/FeatureHeader';
import { PromoCard } from '../components/PromoCard';
import { StepHeader } from '../components/StepHeader';
import { Spinner } from '../components/Spinner';
import { ZoomModal } from '../components/ZoomModal';

declare const heic2any: any;

const convertHeicToJpg = async (file: File): Promise<File> => {
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type.toLowerCase() === 'image/heic';
    if (isHeic) {
        if (typeof heic2any !== 'undefined') {
            try {
                const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
                const finalBlob = Array.isArray(result) ? result[0] : result;
                const fileName = file.name.replace(/\.heic$/i, '.jpg');
                return new File([finalBlob as Blob], fileName, { type: 'image/jpeg' });
            } catch (error) {
                console.error("HEIC conversion failed:", error);
                alert("Gagal mengonversi file HEIC. Pastikan format file valid.");
                throw new Error("HEIC conversion failed");
            }
        } else {
             console.warn("heic2any library not loaded.");
             return file;
        }
    }
    return Promise.resolve(file);
};

const getAspectRatioClass = (ratio: string) => {
    const mapping: Record<string, string> = {
        '1:1': 'aspect-square', '16:9': 'aspect-video', '9:16': 'aspect-[9/16]',
        '4:3': 'aspect-[4/3]', '3:4': 'aspect-[3/4]',
    };
    return mapping[ratio] || 'aspect-square';
};

type ResultItem = { state: 'loading' } | { state: 'error'; message: string } | { state: 'done'; imageUrl: string };

const ImageUploadSlot: React.FC<{
    title: string;
    icon: React.ReactNode;
    imageData: UploadedImage | null;
    onUpload: (data: UploadedImage) => void;
    onRemove: () => void;
    className?: string;
    subtitle?: string;
}> = ({ title, icon, imageData, onUpload, onRemove, className = '', subtitle }) => {
    const inputId = useId();
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = async (file: File | null) => {
        if (!file) return;
        try {
            const processedFile = await convertHeicToJpg(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                const parts = dataUrl.split(',');
                const mimeType = parts[0].match(/:([A-Za-z0-9-.+\/]+);/)?.[1] || 'image/png';
                const base64 = parts[1];
                onUpload({ base64, mimeType, name: processedFile.name });
            };
            reader.readAsDataURL(processedFile);
        } catch (error) {
            console.error("Gagal memproses file:", error);
        }
    };
    
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer?.files?.[0]) handleFile(e.dataTransfer.files[0]);
    };

    return (
        <div className="flex flex-col gap-2 h-full">
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center">{title}</h4>
            <label 
                htmlFor={inputId}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer relative overflow-hidden group transition-all duration-300 ${className} ${
                    isDragging 
                    ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/20' 
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-white/5 hover:border-violet-400 hover:bg-white dark:hover:bg-white/10'
                }`}
            >
                {imageData ? (
                    <>
                        <img src={`data:${imageData.mimeType};base64,${imageData.base64}`} className="absolute top-0 left-0 w-full h-full object-contain p-2" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors transform hover:scale-110 shadow-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-slate-400 dark:text-slate-500 p-4">
                        <div className="mx-auto mb-2 text-slate-300 dark:text-slate-600 group-hover:text-violet-400 transition-colors">
                            {icon}
                        </div>
                        <p className="text-xs font-semibold">Klik atau seret</p>
                        {subtitle && <p className="text-[10px] opacity-60 mt-1">{subtitle}</p>}
                    </div>
                )}
            </label>
            <input id={inputId} type="file" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="sr-only" accept="image/png, image/jpeg, image/webp, .heic, .HEIC" />
        </div>
    );
};

const OptionGroup: React.FC<{ options: string[]; selected: string; onSelect: (value: string) => void; gridClass?: string; }> = ({ options, selected, onSelect, gridClass = 'grid-cols-2' }) => (
    <div className={`grid gap-2 ${gridClass}`}>
        {options.map(opt => (
            <button
                key={opt}
                onClick={() => onSelect(opt)}
                className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${
                    selected === opt 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-500'
                }`}
            >
                {opt}
            </button>
        ))}
    </div>
);

// Fix: Completed the MagicFashion component implementation and added the missing default export.
const MagicFashion: React.FC = () => {
    const [modelImage, setModelImage] = useState<UploadedImage | null>(null);
    const [productImage, setProductImage] = useState<UploadedImage | null>(null);
    const [logoImage, setLogoImage] = useState<UploadedImage | null>(null);
    const [aspectRatio, setAspectRatio] = useState('3:4');
    const [prompt, setPrompt] = useState('');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [zoomImage, setZoomImage] = useState<string | null>(null);
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    const handleGenerate = async () => {
        if (!modelImage) return;
        setIsLoading(true);
        setResults(Array(4).fill({ state: 'loading' }));

        for (let i = 0; i < 4; i++) {
            setLoadingMessage(`Rendering fashion look ${i + 1}/4...`);
            try {
                const res = await generateFashionImage(prompt || "High-end fashion editorial", modelImage, productImage, logoImage, aspectRatio);
                setResults(prev => {
                    const next = [...prev];
                    next[i] = { state: 'done', imageUrl: res.imageUrl };
                    return next;
                });
            } catch (err: any) {
                setResults(prev => {
                    const next = [...prev];
                    next[i] = { state: 'error', message: err.message || "Gagal render." };
                    return next;
                });
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="w-full">
            <FeatureHeader 
                title="Go Fashion Studio" 
                description="Ubah model Anda dengan pakaian dan gaya baru menggunakan fusi visual AI yang realistis." 
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                    <div className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-6 md:p-8 shadow-sm space-y-8">
                        <section>
                            <StepHeader step={1} title="Aset Utama" description="Unggah model dan item fashion." />
                            <div className="grid grid-cols-2 gap-4">
                                <ImageUploadSlot 
                                    title="Model (Wajib)" 
                                    icon={<UserPlus className="w-8 h-8" />} 
                                    imageData={modelImage} 
                                    onUpload={setModelImage} 
                                    onRemove={() => setModelImage(null)} 
                                    className="h-48"
                                />
                                <ImageUploadSlot 
                                    title="Produk (Opsional)" 
                                    icon={<Shirt className="w-8 h-8" />} 
                                    imageData={productImage} 
                                    onUpload={setProductImage} 
                                    onRemove={() => setProductImage(null)} 
                                    className="h-48"
                                />
                            </div>
                        </section>
                        
                        <section className="pt-6 border-t border-slate-100 dark:border-white/5">
                            <StepHeader step={2} title="Instruksi Gaya" />
                            <textarea 
                                value={prompt} 
                                onChange={e => setPrompt(e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all dark:text-white placeholder-gray-400"
                                rows={3}
                                placeholder="Jelaskan pakaian atau gaya yang diinginkan (misal: Red silk dress, urban background)..."
                            />
                        </section>

                        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                            <StepHeader step={3} title="Rasio Hasil" />
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => setAspectRatio('1:1')} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${aspectRatio === '1:1' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'}`}>
                                    <SquareIcon className="w-4 h-4" /> <span className="text-xs font-bold">1:1</span>
                                </button>
                                <button onClick={() => setAspectRatio('3:4')} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${aspectRatio === '3:4' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'}`}>
                                    <RectangleVerticalIcon className="w-4 h-4" /> <span className="text-xs font-bold">3:4</span>
                                </button>
                                <button onClick={() => setAspectRatio('16:9')} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${aspectRatio === '16:9' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'}`}>
                                    <RectangleHorizontalIcon className="w-4 h-4" /> <span className="text-xs font-bold">16:9</span>
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={handleGenerate} 
                                disabled={isLoading || !modelImage}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-3xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner className="w-5 h-5 text-white" />
                                        <span className="text-sm">Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        <span className="tracking-widest">GENERATE FASHION</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="lg:col-span-7 bg-white/50 dark:bg-gray-900/30 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-inner min-h-[600px]">
                    <div className="mb-8 pb-6 border-b border-gray-100 dark:border-white/10 px-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Fashion Board</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">{isLoading ? loadingMessage : '4 Variasi Sesi Pemotretan'}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {results.length === 0 && !isLoading ? (
                            <div className="col-span-full h-96 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                                <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-dashed border-slate-200 dark:border-white/10 rotate-3">
                                    <ImageIcon className="w-10 h-10 opacity-30" />
                                </div>
                                <p className="font-black uppercase tracking-widest text-xs">Menunggu Input Produksi</p>
                            </div>
                        ) : (
                            results.map((res, i) => (
                                <div key={i} className={`relative rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 group shadow-md ${getAspectRatioClass(aspectRatio)}`}>
                                    {res.state === 'loading' ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 animate-pulse">
                                            <Spinner className="w-10 h-10 text-indigo-500" />
                                            <span className="text-[10px] font-black text-slate-400 mt-4 uppercase">Rendering...</span>
                                        </div>
                                    ) : res.state === 'done' ? (
                                        <>
                                            <img src={res.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Fashion Result" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-[1px]">
                                                <button onClick={() => { setZoomImage(res.imageUrl); setIsZoomOpen(true); }} className="w-12 h-12 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-xl flex items-center justify-center transition-all scale-75 group-hover:scale-100 shadow-2xl border border-white/20"><Eye className="w-6 h-6" /></button>
                                                <a href={res.imageUrl} download={`fashion-look-${i + 1}.png`} className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-all scale-75 group-hover:scale-100 shadow-2xl border border-white/10"><Download className="w-6 h-6" /></a>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/10 text-red-500 text-center">
                                            <X className="w-8 h-8 mb-4 opacity-50" />
                                            <p className="text-xs font-bold uppercase tracking-tight leading-relaxed">{res.message}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
            <ZoomModal isOpen={isZoomOpen} onClose={() => setIsZoomOpen(false)} imageUrl={zoomImage || ''} />
            <PromoCard />
        </div>
    );
};

export default MagicFashion;

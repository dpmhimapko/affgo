
import React, { useState, useMemo, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { UploadedImage } from '../types';
import { generateMergePrompt, generateMergedImage } from '../services/geminiService';
import { 
    Sparkles, 
    Plus as PlusIcon, 
    X as CloseIcon, 
    Square as SquareIcon, 
    RectangleHorizontal as RectangleHorizontalIcon, 
    RectangleVertical as RectangleVerticalIcon, 
    Download as DownloadIcon,
    Eye as ZoomIcon,
    RefreshCw,
    Wand2
} from '../components/icons/LucideIcons';
import { Spinner } from '../components/Spinner';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { PromoCard } from '../components/PromoCard';
import { ZoomModal } from '../components/ZoomModal';

// Declare heic2any
declare const heic2any: any;

const MAX_IMAGES = 5;
const MIN_IMAGES = 2;

type AspectRatio = '1:1' | '16:9' | '9:16';

type MergeResult = {
    id: number;
    status: 'loading' | 'done' | 'error';
    imageUrl?: string;
    error?: string;
};

const convertHeicToJpg = async (file: File): Promise<File> => {
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type.toLowerCase() === 'image/heic';
    if (isHeic && typeof heic2any !== 'undefined') {
        try {
            const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
            const finalBlob = Array.isArray(result) ? result[0] : result;
            const fileName = file.name.replace(/\.heic$/i, '.jpg');
            return new File([finalBlob as Blob], fileName, { type: 'image/jpeg' });
        } catch (error) {
            console.error("HEIC conversion failed:", error);
        }
    }
    return file;
};

export const MergeProduct: React.FC = () => {
    const { t } = useLanguage();
    
    // Input States
    const [uploadedImages, setUploadedImages] = useState<(UploadedImage | null)[]>(Array(MIN_IMAGES).fill(null));
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [isMagicPromptLoading, setIsMagicPromptLoading] = useState(false);
    
    // Result States
    const [results, setResults] = useState<MergeResult[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // UI States
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const handleFileChange = async (file: File, index: number) => {
        if (!file) return;
        try {
            const processedFile = await convertHeicToJpg(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                const parts = dataUrl.split(',');
                const mimeType = parts[0].match(/:([A-Za-z0-9-.+\/]+);/)?.[1] || 'image/png';
                const base64 = parts[1];

                const newImages = [...uploadedImages];
                newImages[index] = { base64, mimeType, name: processedFile.name };
                
                // Add new empty slot if we have space and all current slots are filled
                if (newImages.length < MAX_IMAGES && newImages.every(img => img !== null)) {
                    newImages.push(null);
                }
                
                setUploadedImages(newImages);
                setError(null);
            };
            reader.readAsDataURL(processedFile);
        } catch (e) {
            console.error("File processing failed", e);
        }
    };

    const handleRemoveImage = (index: number) => {
        let newImages = [...uploadedImages];
        newImages.splice(index, 1);
        
        // Ensure at least MIN_IMAGES slots
        while (newImages.length < MIN_IMAGES) {
            newImages.push(null);
        }
        
        // Remove extra empty slots at the end, but keep at least one empty slot if under MAX
        const filledImages = newImages.filter(img => img !== null);
        const finalImages = [...filledImages];
        if (finalImages.length < MAX_IMAGES) {
            finalImages.push(null);
        }
        // If we still have fewer than MIN, add more nulls
        while (finalImages.length < MIN_IMAGES) {
            finalImages.push(null);
        }

        setUploadedImages(finalImages);
    };

    const handleMagicPrompt = async () => {
        const validImages = uploadedImages.filter((img): img is UploadedImage => img !== null);
        if (validImages.length < MIN_IMAGES) return;

        setIsMagicPromptLoading(true);
        try {
            // Enhanced: Send the current prompt text to be intelligently expanded
            const generatedPrompt = await generateMergePrompt(validImages, prompt);
            setPrompt(generatedPrompt);
        } catch (error) {
            console.error("Error generating magic prompt:", error);
            setPrompt("Gagal membuat instruksi otomatis. Silakan tulis manual.");
        } finally {
            setIsMagicPromptLoading(false);
        }
    };

    const handleGenerate = async () => {
        const validImages = uploadedImages.filter((img): img is UploadedImage => img !== null);
        if (validImages.length < MIN_IMAGES) {
            setError(t('mergeProduct.errors.atLeastTwo'));
            return;
        }
        if (!prompt.trim()) {
            setError("Tuliskan instruksi penggabungan terlebih dahulu.");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        // Initialize 4 variations
        const initialResults: MergeResult[] = Array.from({ length: 4 }, (_, i) => ({
            id: i,
            status: 'loading'
        }));
        setResults(initialResults);

        // Process sequentially to manage rate limits and show progressive results
        for (let i = 0; i < 4; i++) {
            try {
                const base64Data = await generateMergedImage(validImages, prompt, aspectRatio);
                const imageUrl = `data:image/png;base64,${base64Data}`;
                
                setResults(prev => {
                    if (!prev) return prev;
                    const next = [...prev];
                    next[i] = { id: i, status: 'done', imageUrl };
                    return next;
                });
            } catch (err: any) {
                console.error(`Variation ${i} failed:`, err);
                setResults(prev => {
                    if (!prev) return prev;
                    const next = [...prev];
                    next[i] = { id: i, status: 'error', error: "Gagal Render" };
                    return next;
                });
            }
        }
        setIsLoading(false);
    };

    const handleReset = () => {
        setUploadedImages(Array(MIN_IMAGES).fill(null));
        setPrompt('');
        setResults(null);
        setIsLoading(false);
        setError(null);
    };

    const handleZoom = (imageUrl: string) => {
        setZoomImage(imageUrl);
        setIsZoomModalOpen(true);
    };

    const handleDownload = (url: string, index: number) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `go-merge-${index + 1}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isActionDisabled = isLoading || uploadedImages.filter(img => img !== null).length < MIN_IMAGES;

    const getAspectRatioClass = (ratio: string) => {
        switch (ratio) {
            case '1:1': return 'aspect-square';
            case '16:9': return 'aspect-video';
            case '9:16': return 'aspect-[9/16]';
            default: return 'aspect-square';
        }
    };

    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";

    return (
        <div className="w-full">
            <FeatureHeader 
                title={t('mergeProduct.page.title')}
                description="Gabungkan beberapa subjek atau produk ke dalam satu frame sinematik dengan pencahayaan dan bayangan yang menyatu sempurna."
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                {/* Left Panel: Configuration */}
                <aside className="lg:col-span-2 lg:sticky lg:top-24 space-y-6">
                    <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700/50 space-y-8">
                        
                        {/* 1. Upload Section */}
                        <section>
                            <StepHeader 
                                step={1} 
                                title={t('mergeProduct.sections.uploadProducts.title')} 
                                description="Pilih orang atau produk yang ingin disatukan." 
                            />
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {uploadedImages.map((img, index) => (
                                    <Slot
                                        key={index}
                                        index={index}
                                        image={img}
                                        onFileChange={(file) => handleFileChange(file, index)}
                                        onRemove={() => handleRemoveImage(index)}
                                    />
                                ))}
                            </div>
                        </section>
                        
                        {/* 2. Instructions Section */}
                        <section className="pt-6 border-t border-slate-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <StepHeader 
                                    step={2} 
                                    title="Skenario Foto" 
                                    description="Tentukan lokasi dan interaksi agar hasil tidak kaku." 
                                />
                                <button 
                                    onClick={handleMagicPrompt} 
                                    disabled={isActionDisabled || isMagicPromptLoading}
                                    className="mb-6 flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-all disabled:opacity-50"
                                >
                                    {isMagicPromptLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                    Auto Scene
                                </button>
                            </div>
                            <textarea 
                                value={prompt} 
                                onChange={e => setPrompt(e.target.value)} 
                                className={inputClasses}
                                rows={4} 
                                placeholder="Contoh: Kedua orang ini sedang mengobrol santai di dalam kafe modern, cahaya hangat dari jendela, bayangan menyatu di lantai kayu..."
                            />
                             <p className="mt-2 text-[10px] text-slate-400 font-medium italic">
                                💡 Tip: Jelaskan interaksi subjek dan latar belakang secara detail untuk hasil paling realistis.
                            </p>
                        </section>
                        
                        {/* 3. Aspect Ratio Section */}
                        <section className="pt-6 border-t border-slate-100 dark:border-white/5">
                            <StepHeader step={3} title="Ukuran Hasil" />
                            <div className="grid grid-cols-3 gap-2">
                                <RatioButton value="1:1" selected={aspectRatio} onSelect={setAspectRatio} icon={<SquareIcon className="w-4 h-4" />} />
                                <RatioButton value="16:9" selected={aspectRatio} onSelect={setAspectRatio} icon={<RectangleHorizontalIcon className="w-4 h-4" />} />
                                <RatioButton value="9:16" selected={aspectRatio} onSelect={setAspectRatio} icon={<RectangleVerticalIcon className="w-4 h-4" />} />
                            </div>
                        </section>

                        {/* Action Area */}
                        <div className="pt-4">
                            <button 
                                onClick={handleGenerate} 
                                disabled={isActionDisabled || !prompt.trim()} 
                                className="w-full relative group overflow-hidden flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative flex items-center gap-3">
                                    {isLoading ? (
                                        <>
                                            <Spinner className="h-5 w-5 text-current" />
                                            <span className="tracking-wide">Merging & Relighting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                                            <span className="tracking-wide uppercase group-hover:text-white">Generate Cohesive Image</span>
                                        </>
                                    )}
                                </div>
                            </button>
                            
                            {error && (
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-center text-xs font-bold uppercase tracking-tight bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30 mt-4"
                                >
                                    {error}
                                </motion.p>
                            )}

                            {results && !isLoading && (
                                <button
                                    onClick={handleReset}
                                    className="w-full mt-3 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Ulangi Penggabungan
                                </button>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Right Panel: Results Grid */}
                <section className="lg:col-span-3 w-full bg-white dark:bg-gray-900/50 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm min-h-[600px]">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-white/10 pb-6 px-2">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Photographic Merge</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Relighted & Blended Variations</p>
                        </div>
                    </div>

                    {!results && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-96 text-slate-400 dark:text-slate-500 text-center">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-dashed border-slate-200 dark:border-white/10 rotate-3">
                                <Sparkles className="w-8 h-8 opacity-40" />
                            </div>
                            <p className="text-sm font-bold opacity-70 tracking-wide">{t('results.placeholder')}</p>
                        </div>
                    )}

                    {results && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
                            {results.map((result, index) => (
                                <div key={index} className={`group relative ${getAspectRatioClass(aspectRatio)} bg-slate-100 dark:bg-black/20 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl`}>
                                    {result.status === 'loading' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 animate-pulse">
                                            <Spinner className="h-10 w-10 text-indigo-500" />
                                            <span className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.2em]">Processing Layout {index + 1}...</span>
                                        </div>
                                    )}
                                    {result.status === 'error' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/10 text-red-500 text-center">
                                            <CloseIcon className="w-8 h-8 mb-4 opacity-50" />
                                            <p className="text-xs font-bold uppercase tracking-tight leading-relaxed">{result.error}</p>
                                        </div>
                                    )}
                                    {result.status === 'done' && result.imageUrl && (
                                        <>
                                            <img src={result.imageUrl} alt={`Result ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4 backdrop-blur-[1px]">
                                                <div className="flex gap-2 w-full">
                                                    <button onClick={() => handleZoom(result.imageUrl!)} className="flex-1 bg-white/20 hover:bg-white/40 text-white p-2.5 rounded-xl backdrop-blur-md transition-all flex items-center justify-center gap-2">
                                                        <ZoomIcon className="w-4 h-4" />
                                                        <span className="text-xs font-bold">View</span>
                                                    </button>
                                                    <button onClick={() => handleDownload(result.imageUrl!, index)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                                                        <DownloadIcon className="w-4 h-4" />
                                                        <span className="text-xs font-bold">Save</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-md border border-white/10 uppercase tracking-widest shadow-lg">
                                                Photo {index + 1}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
            
            <PromoCard />
            <ZoomModal 
                isOpen={isZoomModalOpen}
                onClose={() => setIsZoomModalOpen(false)}
                imageUrl={zoomImage || ''}
            />
        </div>
    );
};

const Slot: React.FC<{ 
    image: UploadedImage | null; 
    index: number;
    onFileChange: (file: File) => void; 
    onRemove: () => void 
}> = ({ image, index, onFileChange, onRemove }) => {
    const inputId = useId();
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onFileChange(e.target.files[0]);
        }
    };
    
    if (image) {
        return (
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm group border-2 border-indigo-500">
                <img src={`data:${image.mimeType};base64,${image.base64}`} className="w-full h-full object-cover" alt={image.name || `Slot ${index + 1}`} />
                <button onClick={onRemove} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <CloseIcon className="w-3 h-3" />
                </button>
            </div>
        );
    }
    
    return (
        <div className="relative aspect-square">
            <label 
                htmlFor={inputId}
                className="w-full h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-white/5 hover:border-indigo-400 hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer group"
            >
                <PlusIcon className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span className="text-[9px] font-black uppercase text-slate-400 mt-2">Slot {index + 1}</span>
            </label>
            <input id={inputId} type="file" onChange={handleFileSelect} className="sr-only" accept="image/png, image/jpeg, image/webp, .heic, .HEIC" />
        </div>
    );
};

const RatioButton: React.FC<{ value: AspectRatio, selected: AspectRatio, onSelect: (val: AspectRatio) => void, icon: React.ReactNode }> = ({ value, selected, onSelect, icon }) => (
    <button 
        onClick={() => onSelect(value)} 
        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold border transition-all duration-200 ${
            selected === value 
            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300 shadow-sm' 
            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
        }`}
    >
        {icon}
        <span>{value}</span>
    </button>
);

export default MergeProduct;

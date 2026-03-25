
import React, { useState, useReducer, useCallback, useMemo, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadedImage, BrollResult, BrollIdea } from '../types';
import { 
    generateBrollIdeas, 
    generateBrollImageFromIdea, 
    generateBrollDescription, 
    generateBrollCaption, 
    generateBrollVideoPrompt 
} from '../services/geminiService';
import Loader from '../components/Loader';
import UniversalModal from '../components/UniversalModal';
import { 
    Sparkles, 
    Image as ImageIcon, 
    X, 
    Square, 
    RectangleHorizontal, 
    RectangleVertical,
    Wand2,
    RefreshCw,
    Plus,
    Eye,
    Video,
    Download,
    Type as TypeIcon
} from '../components/icons/LucideIcons';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { PromoCard } from '../components/PromoCard';
import { ZoomModal } from '../components/ZoomModal';
import { Spinner } from '../components/Spinner';
import { ImageUploader } from '../components/ImageUploader';

// Declare heic2any
declare const heic2any: any;

type AspectRatio = '1:1' | '3:4' | '16:9' | '9:16';

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

type State = {
    productImages: (UploadedImage & { id: string, preview: string })[];
    modelImage: (UploadedImage & { preview: string }) | null;
    productDesc: string;
    photoTheme: string;
    aspectRatio: AspectRatio;
    isLoading: boolean;
    loadingMessage: string;
    completedCount: number;
    error: string | null;
    results: BrollResult[];
    isDescLoading: boolean;
    modalState: {
        isOpen: boolean;
        title: string;
        content: React.ReactNode;
    };
};

type Action =
  | { type: 'ADD_PRODUCT_IMAGE'; payload: UploadedImage & { id: string, preview: string } }
  | { type: 'REMOVE_PRODUCT_IMAGE'; payload: string }
  | { type: 'SET_MODEL_IMAGE'; payload: (UploadedImage & { preview: string }) | null }
  | { type: 'SET_FIELD'; payload: { field: 'productDesc' | 'photoTheme' | 'aspectRatio'; value: any } }
  | { type: 'GENERATE_START'; payload: string }
  | { type: 'GENERATE_IDEAS_SUCCESS'; payload: BrollIdea[] }
  | { type: 'GENERATE_IMAGE_UPDATE'; payload: { index: number; result: Partial<BrollResult> } }
  | { type: 'INCREMENT_COMPLETED' }
  | { type: 'GENERATE_FINISH' }
  | { type: 'GENERATE_ERROR'; payload: string }
  | { type: 'SET_DESC_LOADING'; payload: boolean }
  | { type: 'SET_MODAL'; payload: { isOpen: boolean; title?: string; content?: React.ReactNode } }
  | { type: 'RESET' };

const initialState: State = {
    productImages: [],
    modelImage: null,
    productDesc: '',
    photoTheme: '',
    aspectRatio: '16:9',
    isLoading: false,
    loadingMessage: '',
    completedCount: 0,
    error: null,
    results: [],
    isDescLoading: false,
    modalState: { isOpen: false, title: '', content: null },
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'ADD_PRODUCT_IMAGE':
            return { ...state, productImages: [...state.productImages, action.payload] };
        case 'REMOVE_PRODUCT_IMAGE':
            return { ...state, productImages: state.productImages.filter(img => img.id !== action.payload) };
        case 'SET_MODEL_IMAGE':
            return { ...state, modelImage: action.payload };
        case 'SET_FIELD':
            return { ...state, [action.payload.field]: action.payload.value };
        case 'GENERATE_START':
            return { ...state, isLoading: true, loadingMessage: action.payload, completedCount: 0, error: null, results: [] };
        case 'GENERATE_IDEAS_SUCCESS':
            return {
                ...state,
                loadingMessage: 'Memulai Produksi Visual...',
                results: action.payload.map(idea => ({ ...idea, imageUrl: null, status: 'loading', prompt: idea.prompt }))
            };
        case 'GENERATE_IMAGE_UPDATE': {
            const newResults = [...state.results];
            if (newResults[action.payload.index]) {
                newResults[action.payload.index] = { ...newResults[action.payload.index], ...action.payload.result };
            }
            return { ...state, results: newResults };
        }
        case 'INCREMENT_COMPLETED':
            return { ...state, completedCount: state.completedCount + 1 };
        case 'GENERATE_FINISH':
             return { ...state, isLoading: false, loadingMessage: '' };
        case 'GENERATE_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        case 'SET_DESC_LOADING':
            return { ...state, isDescLoading: action.payload };
        case 'SET_MODAL':
             return { ...state, modalState: { ...state.modalState, ...action.payload } };
        case 'RESET':
            return { ...initialState, aspectRatio: state.aspectRatio };
        default:
            return state;
    }
};

interface MagicBRollProps {
    onNavigate: (view: any) => void;
}

const MagicBRoll: React.FC<MagicBRollProps> = ({ onNavigate }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { 
        productImages, modelImage, productDesc, photoTheme, aspectRatio, 
        isLoading, loadingMessage, completedCount, error, results, isDescLoading, modalState 
    } = state;

    const [zoomState, setZoomState] = useState<{ isOpen: boolean, url: string }>({ isOpen: false, url: '' });
    const productUploadId = useId();

    const handleProductUpload = async (file: File) => {
        try {
            const processedFile = await convertHeicToJpg(file);
            const reader = new FileReader();
            reader.onload = e => {
                const dataUrl = e.target?.result as string;
                const [header, base64] = dataUrl.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
                dispatch({ 
                    type: 'ADD_PRODUCT_IMAGE', 
                    payload: { id: `img-${Date.now()}-${Math.random()}`, base64, mimeType, name: processedFile.name, preview: dataUrl } 
                });
            };
            reader.readAsDataURL(processedFile);
        } catch (e) { console.error(e); }
    };

    const handleModelImageUpload = (dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        dispatch({ 
            type: 'SET_MODEL_IMAGE', 
            payload: { base64, mimeType, name: 'model_reference', preview: dataUrl } 
        });
    };

    const handleAutoDesc = async () => {
        if (productImages.length === 0) return;
        dispatch({ type: 'SET_DESC_LOADING', payload: true });
        try {
            const desc = await generateBrollDescription(productImages, modelImage);
            dispatch({ type: 'SET_FIELD', payload: { field: 'productDesc', value: desc } });
        } catch (err) { console.error(err); }
        finally { dispatch({ type: 'SET_DESC_LOADING', payload: false }); }
    };

    const handleGenerate = async () => {
        if (productImages.length === 0 || !productDesc.trim()) return;

        dispatch({ type: 'GENERATE_START', payload: 'Direktur AI sedang merancang konsep...' });
        
        try {
            const ideas = await generateBrollIdeas(productImages, productDesc, modelImage, photoTheme, aspectRatio);
            dispatch({ type: 'GENERATE_IDEAS_SUCCESS', payload: ideas });
            
            // Execute sequentially for better stability and individual loading states
            for (let i = 0; i < ideas.length; i++) {
                const idea = ideas[i];
                try {
                    const result = await generateBrollImageFromIdea(idea.prompt, productImages, modelImage, aspectRatio);
                    dispatch({ type: 'GENERATE_IMAGE_UPDATE', payload: { index: i, result: { imageUrl: result.imageUrl, status: 'done' } } });
                } catch (err: any) {
                    console.error(`Gagal render slot ${i}:`, err);
                    dispatch({ type: 'GENERATE_IMAGE_UPDATE', payload: { index: i, result: { status: 'error', error: 'Gagal Render' } } });
                }
                dispatch({ type: 'INCREMENT_COMPLETED' });
            }
            
        } catch (err) {
             dispatch({ type: 'GENERATE_ERROR', payload: err instanceof Error ? err.message : 'Gagal memproses permintaan kreatif.' });
        } finally {
            dispatch({ type: 'GENERATE_FINISH' });
        }
    };

    const handleGetVideoPrompt = async (result: BrollResult) => {
        if (!result.imageUrl) return;
        dispatch({ type: 'SET_MODAL', payload: { isOpen: true, title: '🎬 AI Video Director Opts', content: <Loader message="Menganalisis sinematografi..." /> } });
        try {
            const [header, base64] = result.imageUrl.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
            const videoPrompt = await generateBrollVideoPrompt({ base64, mimeType }, productDesc, result.title);
            dispatch({ type: 'SET_MODAL', payload: { isOpen: true, content: (
                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-black/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 text-sm font-mono leading-relaxed dark:text-slate-300 shadow-inner">
                        {videoPrompt}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium italic">Salin prompt sinematik di atas ke generator video AI untuk hasil pergerakan kamera profesional.</p>
                    <button onClick={() => {
                        navigator.clipboard.writeText(videoPrompt);
                        alert("Prompt tersalin ke clipboard!");
                    }} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg">Salin Prompt</button>
                </div>
            ) } });
        } catch (e) { dispatch({ type: 'SET_MODAL', payload: { isOpen: true, title: 'Error', content: <p className="text-red-500">Gagal membuat video prompt.</p> } }); }
    };

    const handleGetCaption = async (result: BrollResult) => {
        if (!result.imageUrl) return;
        dispatch({ type: 'SET_MODAL', payload: { isOpen: true, title: '📱 Premium Ad Copy', content: <Loader message="Merancang narasi komersial..." /> } });
        try {
            const [header, base64] = result.imageUrl.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
            const caption = await generateBrollCaption({ base64, mimeType }, productDesc, result.title);
            dispatch({ type: 'SET_MODAL', payload: { isOpen: true, content: (
                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-black/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 text-sm leading-relaxed whitespace-pre-wrap dark:text-slate-300 shadow-inner italic">
                        {caption}
                    </div>
                    <button onClick={() => {
                        navigator.clipboard.writeText(caption);
                        alert("Caption komersial tersalin!");
                    }} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg">Salin Caption</button>
                </div>
            ) } });
        } catch (e) { dispatch({ type: 'SET_MODAL', payload: { isOpen: true, title: 'Error', content: <p className="text-red-500">Gagal membuat caption.</p> } }); }
    };

    const handleRegenerateCard = async (index: number, idea: BrollIdea) => {
        dispatch({ type: 'GENERATE_IMAGE_UPDATE', payload: { index, result: { status: 'loading', error: undefined } } });
        try {
            const result = await generateBrollImageFromIdea(idea.prompt, productImages, modelImage, aspectRatio);
            dispatch({ type: 'GENERATE_IMAGE_UPDATE', payload: { index, result: { imageUrl: result.imageUrl, status: 'done' } } });
        } catch (err: any) {
            dispatch({ type: 'GENERATE_IMAGE_UPDATE', payload: { index, result: { status: 'error', error: 'Gagal Retake' } } });
        }
    };

    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";

    return (
        <div className="w-full">
            <FeatureHeader
                title="Go B-Roll Studio"
                description="Hasilkan 6 konsep foto sinematik premium dengan integrasi cahaya global dan fisika kain yang realistis."
            />
            
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* 1. Control Sidebar (Sticky) */}
                <aside className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-24 space-y-6">
                    <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700/50 space-y-8">
                        
                        {/* Step 1: Assets */}
                        <div className="space-y-4">
                            <StepHeader step={1} title="Aset Produksi" description="Unggah foto produk dan wajah model Anda." />
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Aset Produk (Wajib)</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {productImages.map(img => (
                                            <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden border-2 border-indigo-500 group shadow-lg">
                                                <img src={img.preview} className="w-full h-full object-cover" alt="Product" />
                                                <button onClick={() => dispatch({ type: 'REMOVE_PRODUCT_IMAGE', payload: img.id })} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {productImages.length < 6 && (
                                            <label htmlFor={productUploadId} className="aspect-video rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
                                                <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
                                                <input id={productUploadId} type="file" className="sr-only" accept="image/*" onChange={e => e.target.files?.[0] && handleProductUpload(e.target.files[0])} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Wajah Model (Opsional)</h4>
                                    <div className="relative">
                                        <ImageUploader 
                                            onImageUpload={handleModelImageUpload}
                                            uploadedImage={modelImage?.preview || null}
                                            label="Unggah Wajah Model"
                                            labelKey="uploader.modelLabel"
                                        />
                                        {modelImage && (
                                            <button 
                                                onClick={() => dispatch({ type: 'SET_MODEL_IMAGE', payload: null })}
                                                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-lg z-10 transition-all active:scale-95"
                                                title="Hapus Model"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Context */}
                        <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <StepHeader step={2} title="Brief & Tema" />
                                <button onClick={handleAutoDesc} disabled={isDescLoading || productImages.length === 0} className="mb-6 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 transition-all">
                                    {isDescLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                    Buat Otomatis
                                </button>
                            </div>
                            <textarea 
                                value={productDesc} 
                                onChange={e => dispatch({ type: 'SET_FIELD', payload: { field: 'productDesc', value: e.target.value } })} 
                                className={inputClasses}
                                rows={2}
                                placeholder="Biarkan AI menganalisis aset atau tulis detail produk di sini..."
                            />
                            <input 
                                type="text" 
                                value={photoTheme} 
                                onChange={e => dispatch({ type: 'SET_FIELD', payload: { field: 'photoTheme', value: e.target.value } })}
                                className={inputClasses + " border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-indigo-900/10"}
                                placeholder="Tema Visual (cth: Cyberpunk, Minimalist...)"
                            />
                        </div>

                        {/* Step 3: Format */}
                        <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
                            <StepHeader step={3} title="Format Frame" />
                            <div className="grid grid-cols-4 gap-2">
                                {(['16:9', '9:16', '1:1', '3:4'] as AspectRatio[]).map(r => (
                                    <button 
                                        key={r} 
                                        onClick={() => dispatch({ type: 'SET_FIELD', payload: { field: 'aspectRatio', value: r } })}
                                        className={`py-2 px-1 rounded-xl text-[10px] font-black border transition-all ${aspectRatio === r ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <button 
                            onClick={handleGenerate} 
                            disabled={isLoading || productImages.length === 0 || !productDesc.trim()}
                            className="w-full relative group overflow-hidden flex justify-center items-center py-4 px-6 rounded-2xl text-lg font-black text-white bg-slate-900 dark:bg-white dark:text-slate-900 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center gap-3">
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        <span className="tracking-wide text-sm">
                                            {completedCount > 0 ? `Rendering ${completedCount}/6` : loadingMessage}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                                        <span className="tracking-wide uppercase group-hover:text-white">Start Production</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </aside>

                {/* 2. Results Gallery (2x3 Grid) */}
                <main className="flex-grow w-full bg-white/50 dark:bg-gray-900/30 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-inner min-h-[600px]">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-white/5 px-2">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Editorial Board</h3>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">6 Cinematic Product Concepts</p>
                        </div>
                        {results.length > 0 && !isLoading && (
                             <button onClick={() => dispatch({ type: 'RESET' })} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 flex items-center gap-1.5 transition-colors">
                                <RefreshCw className="w-3 h-3" /> Reset Gallery
                            </button>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {results.length === 0 && !isLoading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-96 flex flex-col items-center justify-center text-center">
                                <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-dashed border-slate-200 dark:border-white/10 rotate-3">
                                    <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 opacity-30" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-600 dark:text-slate-300 tracking-tight">Menunggu Brief Produksi...</h4>
                                <p className="text-sm text-slate-400 max-w-xs mt-2 leading-relaxed font-medium">Unggah foto produk dan model, lalu klik "Start Production" untuk merancang visual komersial terbaik.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {results.map((result, idx) => (
                                    <ResultCard 
                                        key={idx} 
                                        idx={idx} 
                                        result={result} 
                                        aspectRatio={aspectRatio}
                                        onVideoPrompt={() => handleGetVideoPrompt(result)}
                                        onCaption={() => handleGetCaption(result)}
                                        onRegenerate={() => handleRegenerateCard(idx, { title: result.title, prompt: result.prompt })}
                                        onZoom={(url) => setZoomState({ isOpen: true, url })}
                                    />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                    {error && <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl border border-red-100 dark:border-red-900/30 text-center font-bold shadow-sm animate-shake">{error}</div>}
                    
                    {results.length > 0 && (
                        <div className="mt-8 p-5 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl flex items-start gap-3">
                            <div className="p-2 bg-indigo-500 rounded-lg text-white">
                                <Wand2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide">Teknologi Optical Cohesion</p>
                                <p className="text-[10px] text-indigo-700 dark:text-indigo-300 leading-relaxed mt-1">Sistem kami menggunakan algoritma Ambient Occlusion untuk memastikan produk menyatu sempurna dengan pencahayaan lingkungan tanpa efek tempelan.</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <PromoCard />
            <ZoomModal isOpen={zoomState.isOpen} onClose={() => setZoomState({ isOpen: false, url: '' })} imageUrl={zoomState.url} />
            <UniversalModal isOpen={modalState.isOpen} onClose={() => dispatch({ type: 'SET_MODAL', payload: { isOpen: false } })} title={modalState.title}>
                {modalState.content}
            </UniversalModal>
        </div>
    );
};

const ResultCard: React.FC<{ 
    idx: number, 
    result: BrollResult, 
    aspectRatio: AspectRatio,
    onVideoPrompt: () => void,
    onCaption: () => void,
    onRegenerate: () => void,
    onZoom: (url: string) => void
}> = ({ idx, result, aspectRatio, onVideoPrompt, onCaption, onRegenerate, onZoom }) => {
    
    const aspectMapping: Record<AspectRatio, string> = {
        '1:1': 'aspect-square', '16:9': 'aspect-video', '9:16': 'aspect-[9/16]', '3:4': 'aspect-[3/4]'
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: idx * 0.05 }} 
            className="bg-white dark:bg-gray-800/90 rounded-[2.5rem] p-5 flex flex-col gap-4 border border-slate-100 dark:border-white/5 shadow-lg group hover:shadow-xl transition-all duration-300"
        >
            {/* Header Section: Permanent Title */}
            <div className="px-1 pt-1">
                <h3 className="text-sm font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-tight line-clamp-1">
                    {result.status === 'done' ? result.title : `Proses Foto 0${idx+1}...`}
                </h3>
            </div>

            {/* Image Container */}
            <div className={`relative ${aspectMapping[aspectRatio]} rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 flex items-center justify-center group/img-box shadow-inner`}>
                {result.status === 'loading' ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                            <Spinner className="h-10 w-10 text-indigo-500" />
                        </div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Computing Light...</span>
                    </div>
                ) : result.status === 'error' ? (
                    <div className="p-4 text-center text-red-500 text-[10px] font-bold">
                        <X className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        {result.error}
                        <button onClick={onRegenerate} className="block mx-auto mt-2 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">Try Again</button>
                    </div>
                ) : (
                    <>
                        <img src={result.imageUrl!} className="w-full h-full object-cover transition-transform duration-[2s] group/img-box:scale-110" alt={result.title} />
                        
                        {/* Minimal Hover Overlay for Zoom ONLY */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img-box:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[1px]">
                            <button onClick={() => onZoom(result.imageUrl!)} className="w-14 h-14 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all scale-75 group-hover/img-box:scale-100 shadow-2xl">
                                <Eye className="w-7 h-7" />
                            </button>
                        </div>
                    </>
                )}
            </div>
            
            {/* Actions Bar - Permanent Below Photo */}
            {result.status === 'done' && (
                <div className="flex flex-col gap-3 pt-2">
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={onVideoPrompt} className="flex flex-col items-center justify-center py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all group/btn">
                            <Video className="w-4 h-4 mb-1.5" />
                            <span className="text-[9px] font-black uppercase">Video</span>
                        </button>
                        <button onClick={onCaption} className="flex flex-col items-center justify-center py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all group/btn">
                            <TypeIcon className="w-4 h-4 mb-1.5" />
                            <span className="text-[9px] font-black uppercase">Copy</span>
                        </button>
                        <button onClick={onRegenerate} className="flex flex-col items-center justify-center py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all group/btn">
                            <RefreshCw className="w-4 h-4 mb-1.5" />
                            <span className="text-[9px] font-black uppercase">Retake</span>
                        </button>
                    </div>
                    <a href={result.imageUrl!} download={`magic_broll_${idx+1}.png`} className="w-full flex items-center justify-center gap-3 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg transition-all active:scale-95 group/dl">
                        <Download className="w-4 h-4 group-hover/dl:translate-y-0.5 transition-transform" />
                        Download High-Res
                    </a>
                </div>
            )}
            
            {/* Status Footer */}
            {result.status === 'done' && (
                <div className="flex items-center gap-2 px-2 pb-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Ready for Export</span>
                    <div className="h-px flex-grow bg-slate-100 dark:bg-white/5"></div>
                </div>
            )}
        </motion.div>
    );
};

export default MagicBRoll;

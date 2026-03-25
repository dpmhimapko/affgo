
import React, { useState, useReducer, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadedImage, ProductMode, StyleTheme } from '../types';
import { generateGoProductConcepts, generateGoProductImage, generateStyloImage, generateProductPhoto } from '../services/geminiService';
import { PhotoStudioIcon as Package } from '../components/icons/PhotoStudioIcon';
import { StudioPoseIcon as User } from '../components/icons/StudioPoseIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { ZoomIcon as EyeIcon } from '../components/icons/ZoomIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
// Fix: Added missing imports for Spinner and Image as ImageIcon
import { Spinner } from '../components/Spinner';
import { Image as ImageIcon } from '../components/icons/LucideIcons';

declare const heic2any: any;

type AspectRatio = '1:1' | '16:9' | '9:16';
type ModelSource = 'upload' | 'ai';
type ResultItem = {
    id: number;
    status: 'loading' | 'done' | 'error';
    imageUrl?: string;
    name?: string;
    error?: string;
}

const GENDERS = ['Female', 'Male', 'Non-binary'];
const AGES = ['Child (5-10)', 'Young Adult (20s)', 'Adult (30s-40s)', 'Elderly (65+)'];

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CartoonSelect = ({ value, onChange, options, label }: any) => (
  <div className="mb-4">
    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2 tracking-widest">{label}</label>
    <div className="relative">
        <select 
            value={value} 
            onChange={onChange} 
            className="w-full bg-white border-4 border-cartoon-dark rounded-2xl py-3 px-4 focus:outline-none shadow-cartoon font-black uppercase text-xs appearance-none"
        >
            {options.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path></svg>
        </div>
    </div>
  </div>
);

export const ProductStudio: React.FC<{ onNavigate: any }> = ({ onNavigate }) => {
    // Basic state management
    const [mode, setMode] = useState<ProductMode>(ProductMode.PRODUCT_ONLY);
    const [productImage, setProductImage] = useState<UploadedImage | null>(null);
    const [modelImage, setModelImage] = useState<UploadedImage | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [style, setStyle] = useState<StyleTheme>(StyleTheme.NATURAL);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<ResultItem[]>([]);
    const [loadingMsg, setLoadingMsg] = useState('');

    const handleGenerate = async () => {
        if (!productImage) return;
        setIsLoading(true);
        setLoadingMsg('Analisis...');
        setResults(Array(4).fill(null).map((_, i) => ({ id: i, status: 'loading' })));

        try {
            const concepts = await generateGoProductConcepts(productImage, false, style);
            for (let i = 0; i < concepts.length; i++) {
                setLoadingMsg(`Rendering ${i+1}/4`);
                const res = await generateGoProductImage(productImage, concepts[i].prompt, aspectRatio);
                setResults(prev => prev.map(item => item.id === i ? { ...item, status: 'done', imageUrl: res.imageUrl } : item));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <FeatureHeader 
                title="Product Studio"
                description="Ubah foto produk biasa jadi konten level pro dengan gaya visual yang menonjol."
            />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <aside className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-24 space-y-6">
                    <div className="bg-white p-6 rounded-[2.5rem] border-4 border-cartoon-dark shadow-cartoon-lg">
                        
                        {/* Mode Switcher */}
                        <div className="flex bg-slate-100 p-1 rounded-2xl border-2 border-cartoon-dark mb-8">
                            <button onClick={() => setMode(ProductMode.PRODUCT_ONLY)} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${mode === ProductMode.PRODUCT_ONLY ? 'bg-cartoon-blue text-white shadow-cartoon' : 'text-slate-400'}`}>Produk</button>
                            <button onClick={() => setMode(ProductMode.WITH_MODEL)} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${mode === ProductMode.WITH_MODEL ? 'bg-cartoon-blue text-white shadow-cartoon' : 'text-slate-400'}`}>+ Model</button>
                        </div>

                        <div className="space-y-6">
                            <section>
                                <StepHeader step={1} title="Upload Foto" />
                                <div className="space-y-4">
                                    <div className="bg-slate-50 border-4 border-cartoon-dark rounded-3xl p-4 shadow-inner relative aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-cartoon-yellow/10 transition-colors" onClick={() => document.getElementById('main-up')?.click()}>
                                        {productImage ? (
                                            <img src={`data:${productImage.mimeType};base64,${productImage.base64}`} className="w-full h-full object-contain" />
                                        ) : (
                                            <>
                                                <Package className="w-10 h-10 mb-2" />
                                                <span className="text-[10px] font-black uppercase">Pilih Produk</span>
                                            </>
                                        )}
                                        <input id="main-up" type="file" className="hidden" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    const b64 = (ev.target?.result as string).split(',')[1];
                                                    setProductImage({ base64: b64, mimeType: file.type });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }} />
                                    </div>
                                </div>
                            </section>

                            <section className="pt-6 border-t-4 border-cartoon-dark/10">
                                <StepHeader step={2} title="Gaya Visual" />
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.values(StyleTheme).map(s => (
                                        <button key={s} onClick={() => setStyle(s)} className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${style === s ? 'bg-cartoon-blue text-white border-cartoon-dark shadow-cartoon' : 'bg-white border-cartoon-dark shadow-cartoon-hover opacity-60'}`}>{s}</button>
                                    ))}
                                </div>
                            </section>

                            <button onClick={handleGenerate} disabled={isLoading || !productImage} className="w-full py-5 bg-cartoon-dark text-white rounded-3xl font-black uppercase italic tracking-wider shadow-cartoon-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-30 flex items-center justify-center gap-3">
                                {isLoading ? <><Spinner className="w-5 h-5" /> {loadingMsg}</> : <><SparklesIcon className="w-5 h-5" /> Generate GO!</>}
                            </button>
                        </div>
                    </div>
                </aside>

                <section className="flex-1 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {results.length === 0 && !isLoading ? (
                            <div className="col-span-full h-[400px] bg-white border-4 border-cartoon-dark rounded-[2.5rem] shadow-cartoon flex flex-col items-center justify-center p-12 text-center">
                                <ImageIcon className="w-20 h-20 text-slate-200 mb-6" />
                                <h3 className="text-xl font-black italic">SIAP UNTUK BERAKSI?</h3>
                                <p className="text-sm font-bold text-slate-400 max-w-xs mt-2 uppercase">Atur produkmu di kiri dan klik tombol hitam untuk melihat keajaiban!</p>
                            </div>
                        ) : (
                            results.map(res => (
                                <div key={res.id} className="bg-white border-4 border-cartoon-dark rounded-[2.5rem] shadow-cartoon overflow-hidden group aspect-square">
                                    {res.status === 'loading' ? (
                                        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 animate-pulse">
                                            <Spinner className="w-10 h-10 mb-4" />
                                            <span className="font-black italic uppercase text-[10px]">MEMOLES...</span>
                                        </div>
                                    ) : (
                                        <div className="relative h-full w-full group">
                                            <img src={res.imageUrl} className="h-full w-full object-cover" alt="Result" />
                                            <div className="absolute inset-0 bg-cartoon-blue/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <a href={res.imageUrl} download="affiliate-go.png" className="bg-white border-2 border-cartoon-dark p-3 rounded-2xl shadow-cartoon transform hover:scale-110">
                                                    <DownloadIcon className="w-6 h-6" />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

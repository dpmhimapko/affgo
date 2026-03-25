
import React, { useState, useId, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import { useLanguage } from '../contexts/LanguageContext';
import { getEffectiveApiKey } from '../hooks/useApiKey';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ZoomModal } from '../components/ZoomModal';
import Loader from '../components/Loader';
import { PovStudioIcon } from '../components/icons/PovStudioIcon';
import { 
    Upload, Video, MessageSquare, Type as TypeIcon, Image as ImageIcon, 
    Download, RefreshCw, Eye, Sparkles, Wand2, 
    Square, RectangleHorizontal, RectangleVertical, User, 
    Camera, ScanFace, Info
} from '../components/icons/LucideIcons';

type AspectRatio = '1:1' | '3:4' | '9:16' | '16:9';
type HandStyle = 'auto' | 'female' | 'male' | 'sweater';

const ResultBoxHand = ({ title, content, color, icon }: any) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(content).then(() => {
            setCopied(true); setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <div className={`bg-slate-900/50 rounded-2xl border ${color} p-5 space-y-3 shadow-xl animate-fade-in`}>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {icon} {title}
            </div>
            <div onClick={handleCopy} className="relative group cursor-pointer bg-black/40 p-4 rounded-xl border border-white/5 hover:bg-black/60 transition-all">
                <p className="text-xs text-slate-300 font-mono leading-relaxed line-clamp-6">{content}</p>
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[9px] font-black text-white transition-all ${copied ? 'bg-emerald-500 opacity-100' : 'bg-indigo-600 opacity-0 group-hover:opacity-100'}`}>
                    {copied ? "COPIED!" : "CLICK TO COPY"}
                </div>
            </div>
        </div>
    );
};

const AvoidXConflict = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
);

export const PovStudio: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'hand' | 'selfie'>('hand');

    const [productImageHand, setProductImageHand] = useState<{base64: string, preview: string} | null>(null);
    const [backgroundModeHand, setBackgroundModeHand] = useState<'upload' | 'prompt'>('upload');
    const [backgroundImageHand, setBackgroundImageHand] = useState<{base64: string, preview: string} | null>(null);
    const [backgroundPromptHand, setBackgroundPromptHand] = useState('');
    const [aspectRatioHand, setAspectRatioHand] = useState<AspectRatio>('1:1');
    const [handStyleHand, setHandStyleHand] = useState<HandStyle>('auto');
    const [voiceoverToneHand, setVoiceoverToneHand] = useState('Gen Z');
    const [generatedImageHand, setGeneratedImageHand] = useState<string | null>(null);
    const [isLoadingHand, setIsLoadingHand] = useState(false);
    const [errorHand, setErrorHand] = useState<string | null>(null);
    const [videoPromptHand, setVideoPromptHand] = useState<string | null>(null);
    const [isGeneratingPromptHand, setIsGeneratingPromptHand] = useState(false);
    const [voiceoverScriptHand, setVoiceoverScriptHand] = useState<string | null>(null);
    const [isGeneratingVoiceoverHand, setIsGeneratingVoiceoverHand] = useState(false);
    const [socialCaptionHand, setSocialCaptionHand] = useState<string | null>(null);
    const [isGeneratingCaptionHand, setIsGeneratingCaptionHand] = useState(false);
    const [isAutoSuggestLoadingHand, setIsAutoSuggestLoadingHand] = useState(false);
    const [isZoomModalOpenHand, setIsZoomModalOpenHand] = useState(false);
    const productInputIdHand = useId();
    const bgInputIdHand = useId();

    const [selectedImageSelfie, setSelectedImageSelfie] = useState<string | null>(null);
    const [base64ForAnalysisSelfie, setBase64ForAnalysisSelfie] = useState<string | null>(null);
    const [descriptionSelfie, setDescriptionSelfie] = useState('');
    const [aspectRatioSelfie, setAspectRatioSelfie] = useState('3:4'); 
    const [ethnicitySelfie, setEthnicitySelfie] = useState('Asian');
    const [backgroundTypeSelfie, setBackgroundTypeSelfie] = useState('Aesthetic Modern Bedroom with Full Body Mirror');
    const [generatedImageSelfie, setGeneratedImageSelfie] = useState<string | null>(null);
    const [isLoadingSelfie, setIsLoadingSelfie] = useState(false);
    const [isAnalyzingSelfie, setIsAnalyzingSelfie] = useState(false);
    const [errorSelfie, setErrorSelfie] = useState<string | null>(null);
    const [isZoomModalOpenSelfie, setIsZoomModalOpenSelfie] = useState(false);
    const selfieInputRef = useRef<HTMLInputElement>(null);

    const processFile = (file: File): Promise<{ base64: string, preview: string }> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width; let height = img.height;
                const MAX = 2000;
                if (width > MAX || height > MAX) {
                    if (width > height) { height *= MAX / width; width = MAX; }
                    else { width *= MAX / height; height = MAX; }
                }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject("Canvas Error");
                ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                const jpeg = canvas.toDataURL('image/jpeg', 0.9);
                resolve({ base64: jpeg.split(',')[1], preview: jpeg });
            };
        };
        reader.onerror = reject;
    });

    const handleUploadHand = async (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'bg') => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const res = await processFile(file);
            if (type === 'product') setProductImageHand(res);
            else { setBackgroundImageHand(res); setBackgroundModeHand('upload'); }
            setErrorHand(null); setGeneratedImageHand(null); setVideoPromptHand(null); setVoiceoverScriptHand(null); setSocialCaptionHand(null);
        } catch (err) { setErrorHand("Gagal memproses gambar."); }
    };

    const handleAutoSuggestBackgroundHand = async () => {
        if (!productImageHand) { setErrorHand("Unggah foto produk terlebih dahulu."); return; }
        setIsAutoSuggestLoadingHand(true); setBackgroundModeHand('prompt');
        try {
            const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [{ text: "Berikan satu rekomendasi latar belakang (background) yang paling cocok, realistis, dan estetik untuk sesi foto POV produk tersebut. Langsung saja deskripsinya dalam Bahasa Indonesia." }, { inlineData: { mimeType: "image/png", data: productImageHand.base64 } }] },
            });
            setBackgroundPromptHand(response.text?.trim() || "");
        } catch (err) { setBackgroundPromptHand("Di atas meja kayu estetik."); } 
        finally { setIsAutoSuggestLoadingHand(false); }
    };

    const handleSubmitHand = async () => {
        if (!productImageHand) { setErrorHand("Unggah foto produk Anda."); return; }
        if (backgroundModeHand === 'upload' && !backgroundImageHand) { setErrorHand("Unggah foto latar belakang."); return; }
        setIsLoadingHand(true); setErrorHand(null); setGeneratedImageHand(null);
        try {
            const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
            let handDesc = handStyleHand === 'female' ? "A clean, elegant female hand..." : handStyleHand === 'male' ? "A strong male hand..." : "A natural POV hand...";
            let finalPrompt = `Create photorealistic POV shot. ${handDesc} Holding the product naturally.`;
            const parts: any[] = [{ text: finalPrompt }, { inlineData: { mimeType: "image/jpeg", data: productImageHand.base64 } }];
            if (backgroundModeHand === 'upload' && backgroundImageHand) { parts.push({ inlineData: { mimeType: "image/jpeg", data: backgroundImageHand.base64 } }); }
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: { imageConfig: { aspectRatio: aspectRatioHand as any }, responseModalities: ['IMAGE'] as any }
            });
            const base64Data = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
            if (!base64Data) throw new Error("AI gagal merender.");
            setGeneratedImageHand(`data:image/png;base64,${base64Data}`);
        } catch (err: any) { setErrorHand(err.message); } finally { setIsLoadingHand(false); }
    };

    const runAnalysisHand = async (prompt: string, type: 'video' | 'vo' | 'caption') => {
        if (!generatedImageHand) return;
        const setter = type === 'video' ? setIsGeneratingPromptHand : type === 'vo' ? setIsGeneratingVoiceoverHand : setIsGeneratingCaptionHand;
        const dataSetter = type === 'video' ? setVideoPromptHand : type === 'vo' ? setVoiceoverScriptHand : setSocialCaptionHand;
        setter(true);
        try {
            const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [{ text: prompt }, { inlineData: { mimeType: "image/png", data: generatedImageHand.split(',')[1] } }] },
            });
            dataSetter(response.text?.trim() || "Gagal.");
        } catch (e) { setErrorHand("Gagal analisis."); } finally { setter(false); }
    };

    const ethnicitiesSelfie = [
        { id: 'Asian', label: 'Asia' },
        { id: 'Indonesian', label: 'Indonesia' },
        { id: 'Indonesian Muslim woman wearing a hijab', label: 'Muslimah (Hijab)' },
        { id: 'Caucasian', label: 'Bule (Caucasian)' },
        { id: 'Black', label: 'Afrika' },
        { id: 'Latino', label: 'Latino' },
        { id: 'Middle Eastern', label: 'Timur Tengah' }
    ];

    const backgroundsSelfie = [
        { id: 'Aesthetic Modern Bedroom with Full Body Mirror', label: 'Kamar Tidur Estetik' },
        { id: 'Clean Minimalist Clothing Store Fitting Room', label: 'Fitting Room Mall' },
        { id: 'Luxury Walk-in Closet with lighting', label: 'Walk-in Closet Mewah' },
        { id: 'Aesthetic Bathroom Mirror with plants', label: 'Cermin Wastafel Estetik' },
        { id: 'Minimalist White Studio Background', label: 'Studio Polos' },
        { id: 'Gym Changing Room Mirror', label: 'Locker Room' }
    ];

    const analyzeProductSelfie = async (base64Image: string) => {
        setIsAnalyzingSelfie(true); setErrorSelfie(null);
        const imageContent = base64Image.split(',')[1];
        try {
            const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [
                    { text: "Analyze this clothing item in extreme visual detail. Describe the exact color, material texture, logo placement, patterns, neck style, and fit." },
                    { inlineData: { mimeType: "image/jpeg", data: imageContent } }
                ] }
            });
            const text = response.text;
            if (text) { setDescriptionSelfie(text); }
        } catch (err) {} finally { setIsAnalyzingSelfie(false); }
    };

    const handleImageUploadSelfie = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result as string;
                setSelectedImageSelfie(res); setBase64ForAnalysisSelfie(res);
                setGeneratedImageSelfie(null); setDescriptionSelfie('');
                analyzeProductSelfie(res);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateSelfie = async () => {
        if (!descriptionSelfie || !base64ForAnalysisSelfie) return;
        setIsLoadingSelfie(true); setErrorSelfie(null); setGeneratedImageSelfie(null);
        const imageContent = base64ForAnalysisSelfie.split(',')[1];
        try {
            const ai = new GoogleGenAI({ apiKey: getEffectiveApiKey() });
            const promptText = `Generate MASTERPIECE, photorealistic image of a ${ethnicitySelfie} person wearing the EXACT clothing item from input. 
            Pose: Holding a smartphone with one hand covering their face (Mirror Selfie). centered composition. 
            BACKGROUND: ${backgroundTypeSelfie}, soft focus. 
            CRITICAL: Clothing design, text, and logos must be oriented EXACTLY as in input image (NOT mirrored). Maintain 100% fidelity.
            Context description: ${descriptionSelfie}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [
                    { text: promptText },
                    { inlineData: { mimeType: "image/jpeg", data: imageContent } }
                ] },
                config: { 
                    imageConfig: { aspectRatio: aspectRatioSelfie as any },
                    responseModalities: ["IMAGE"] as any 
                }
            });
            const base64Data = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
            if (base64Data) setGeneratedImageSelfie(`data:image/png;base64,${base64Data}`);
            else throw new Error("Gagal.");
        } catch (err: any) { setErrorSelfie("Gagal memproses gambar. Silakan coba lagi."); } finally { setIsLoadingSelfie(false); }
    };

    const handleDownloadSelfie = () => {
        if (!generatedImageSelfie) return;
        const link = document.createElement('a');
        link.href = generatedImageSelfie;
        link.download = `mirror-selfie-${aspectRatioSelfie.replace(':','-')}.png`;
        link.click();
    };

    const getAspectClass = (ratio: string) => {
        switch (ratio) {
            case '1:1': return 'aspect-square max-w-[500px]';
            case '3:4': return 'aspect-[3/4] max-w-[450px]';
            case '9:16': return 'aspect-[9/16] max-w-[380px]';
            case '16:9': return 'aspect-video max-w-full';
            default: return 'aspect-square';
        }
    };

    return (
        <div className="w-full">
            <FeatureHeader 
                title="Affiliate Go POV Studio" 
                description="Hasilkan konten produk personal dengan pilihan sudut pandang tangan atau gaya selfie cermin yang modern."
            />

            <div className="max-w-md mx-auto mb-10 p-1.5 bg-white/10 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 flex gap-2">
                <button 
                    onClick={() => setActiveTab('hand')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'hand' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <PovStudioIcon className="w-4 h-4" /> POV TANGAN
                </button>
                <button 
                    onClick={() => setActiveTab('selfie')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'selfie' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <ScanFace className="w-4 h-4" /> POV SELFIE
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'hand' ? (
                    <motion.div key="hand" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                            <div className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-6 md:p-8 shadow-sm space-y-10">
                                <section>
                                    <StepHeader step={1} title="Upload Produk" description="Gunakan foto produk saja tanpa tangan." />
                                    <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 group transition-all hover:border-indigo-500">
                                        {productImageHand ? (
                                            <div className="relative h-full w-full">
                                                <img src={productImageHand.preview} className="h-full w-full object-contain p-2" />
                                                <button onClick={() => setProductImageHand(null)} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all"><AvoidXConflict className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <label htmlFor={productInputIdHand} className="flex flex-col items-center justify-center h-full cursor-pointer p-4 text-center">
                                                <Upload className="w-10 h-10 text-slate-400 mb-3 group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
                                                <span className="text-sm font-black uppercase text-slate-500">Pilih Foto Produk</span>
                                            </label>
                                        )}
                                        <input id={productInputIdHand} type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadHand(e, 'product')} />
                                    </div>
                                </section>

                                <section className="pt-8 border-t border-slate-100 dark:border-white/5">
                                    <StepHeader step={2} title="Konfigurasi Gaya" description="Pilih rasio dan model tangan." />
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3 block ml-1">Rasio Gambar</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {(['1:1', '3:4', '9:16', '16:9'] as AspectRatio[]).map(r => (
                                                    <button key={r} onClick={() => setAspectRatioHand(r)} className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${aspectRatioHand === r ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-500'}`}>
                                                        {r === '1:1' ? <Square className="w-4 h-4 mb-1"/> : r === '16:9' ? <RectangleHorizontal className="w-4 h-4 mb-1"/> : <RectangleVertical className="w-4 h-4 mb-1"/>}
                                                        <span className="text-[10px] font-bold">{r}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3 block ml-1">{t('povStudio.handStyle.label')}</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(['auto', 'female', 'male', 'sweater'] as HandStyle[]).map(h => (
                                                    <button key={h} onClick={() => setHandStyleHand(h)} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${handStyleHand === h ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-500'}`}>
                                                        <User className="w-4 h-4 opacity-50" />
                                                        <span className="text-xs font-bold">{t(`povStudio.handStyle.${h}`)}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="pt-8 border-t border-slate-100 dark:border-white/5">
                                    <StepHeader step={3} title="Latar Belakang" description="Unggah foto atau gunakan prompt AI." />
                                    <div className="space-y-4">
                                        <div className="flex p-1 bg-black/20 rounded-2xl">
                                            <button onClick={() => setBackgroundModeHand('upload')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${backgroundModeHand === 'upload' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>Unggah Foto</button>
                                            <button onClick={() => setBackgroundModeHand('prompt')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${backgroundModeHand === 'prompt' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500'}`}>Deskripsi AI</button>
                                        </div>
                                        {backgroundModeHand === 'upload' ? (
                                            <div className="h-40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 relative overflow-hidden group bg-slate-50 dark:bg-black/20 hover:border-indigo-500 transition-all">
                                                {backgroundImageHand ? (
                                                    <img src={backgroundImageHand.preview} className="h-full w-full object-cover" />
                                                ) : (
                                                    <label htmlFor={bgInputIdHand} className="flex flex-col items-center justify-center h-full cursor-pointer text-slate-400">
                                                        <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                                                        <span className="text-[10px] font-black uppercase">Pilih Background</span>
                                                    </label>
                                                )}
                                                <input id={bgInputIdHand} type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadHand(e, 'bg')} />
                                            </div>
                                        ) : (
                                            <div className="space-y-3 animate-fade-in">
                                                <textarea value={backgroundPromptHand} onChange={(e) => setBackgroundPromptHand(e.target.value)} className="w-full h-28 bg-black/20 border border-white/10 rounded-2xl p-4 text-xs text-white focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none transition-all" placeholder="Contoh: Di meja kafe kayu estetik..." />
                                                <button onClick={handleAutoSuggestBackgroundHand} disabled={isAutoSuggestLoadingHand} className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors disabled:opacity-50">
                                                    {isAutoSuggestLoadingHand ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                                    {isAutoSuggestLoadingHand ? "Menganalisis..." : "Rekomendasi Pintar"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <div className="pt-4">
                                    <button onClick={handleSubmitHand} disabled={isLoadingHand} className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black rounded-[1.5rem] shadow-2xl shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50">
                                        {isLoadingHand ? <div className="flex items-center justify-center gap-3"><RefreshCw className="w-5 h-5 animate-spin" /><span>PROCESSING...</span></div> : <div className="flex items-center justify-center gap-3"><Sparkles className="w-5 h-5" /><span>BUAT GO POV</span></div>}
                                    </button>
                                    {errorHand && <p className="text-center text-[10px] font-bold text-red-500 mt-4 uppercase tracking-tighter bg-red-50 dark:bg-red-900/20 p-2 rounded-lg animate-shake">{errorHand}</p>}
                                </div>
                            </div>
                        </aside>

                        <main className="lg:col-span-7 space-y-8">
                            <div className="bg-white dark:bg-gray-900/50 backdrop-blur-2xl rounded-[3rem] border border-slate-200 dark:border-white/5 p-6 md:p-10 shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
                                <div className="flex items-center justify-center gap-3 mb-10">
                                    <Sparkles className="w-6 h-6 text-indigo-500" />
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Editorial Output</h2>
                                </div>
                                <div className="flex-grow flex items-center justify-center">
                                    <div className={`${getAspectClass(aspectRatioHand)} w-full bg-slate-100 dark:bg-black/40 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-inner flex items-center justify-center overflow-hidden group relative transition-all duration-700`}>
                                        {generatedImageHand ? (
                                            <>
                                                <img src={generatedImageHand} className="h-full w-full object-contain rounded-2xl shadow-2xl" alt="POV" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <button onClick={() => setIsZoomModalOpenHand(true)} className="p-4 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-all shadow-2xl scale-75 group-hover:scale-100"><Eye className="w-8 h-8" /></button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-300 dark:text-slate-700 select-none">
                                                <ImageIcon className="w-20 h-20 mb-4 opacity-20" />
                                                <span className="text-xs font-black uppercase tracking-[0.3em]">{isLoadingHand ? "AI sedang merender..." : "Menunggu Sinyal Kreatif"}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {generatedImageHand && !isLoadingHand && (
                                    <div className="mt-12 space-y-10 border-t border-slate-100 dark:border-white/5 pt-10">
                                        <div className="flex justify-center">
                                            <div className="bg-slate-100 dark:bg-black/40 p-1 rounded-2xl inline-flex gap-1 border border-slate-200 dark:border-white/10">
                                                {['Gen Z', 'Profesional', 'Friendly', 'Mewah'].map(t => (
                                                    <button key={t} onClick={() => setVoiceoverToneHand(t)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${voiceoverToneHand === t ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <button onClick={() => runAnalysisHand("Generate concise English video prompt...", 'video')} disabled={isGeneratingPromptHand} className="group relative flex flex-col items-center justify-center p-6 h-40 rounded-[2rem] border border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all hover:-translate-y-1">
                                                {isGeneratingPromptHand ? <Loader /> : <><Video className="w-8 h-8 text-indigo-500 mb-3" /><span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">Video Prompt</span></>}
                                            </button>
                                            <button onClick={() => runAnalysisHand("Create a voiceover script (Indonesian)...", 'vo')} disabled={isGeneratingVoiceoverHand} className="group relative flex flex-col items-center justify-center p-6 h-40 rounded-[2rem] border border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all hover:-translate-y-1">
                                                {isGeneratingVoiceoverHand ? <Loader /> : <><MessageSquare className="w-8 h-8 text-pink-500 mb-3" /><span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">V.O. Script</span></>}
                                            </button>
                                            <button onClick={() => runAnalysisHand("Create high-converting caption (Indonesian)...", 'caption')} disabled={isGeneratingCaptionHand} className="group relative flex flex-col items-center justify-center p-6 h-40 rounded-[2rem] border border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all hover:-translate-y-1">
                                                {isGeneratingCaptionHand ? <Loader /> : <><TypeIcon className="w-8 h-8 text-cyan-500 mb-3" /><span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">Go Caption</span></>}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6">
                                            {videoPromptHand && <ResultBoxHand title="AI Video Prompt" content={videoPromptHand} color="border-indigo-500/20" icon={<Video className="w-3 h-3" />} />}
                                            {voiceoverScriptHand && <ResultBoxHand title={`Naskah Voiceover (${voiceoverToneHand})`} content={voiceoverScriptHand} color="border-pink-500/20" icon={<MessageSquare className="w-3 h-3" />} />}
                                            {socialCaptionHand && <ResultBoxHand title="Social Media Caption" content={socialCaptionHand} color="border-cyan-500/20" icon={<TypeIcon className="w-3 h-3" />} />}
                                        </div>
                                        <div className="flex justify-center pt-4">
                                            <a href={generatedImageHand} download={`pov_hand_${Date.now()}.png`} className="flex items-center gap-3 px-10 py-4 bg-white text-slate-900 rounded-full font-black text-sm hover:bg-slate-100 transition-all shadow-xl active:scale-95 border-4 border-slate-200">
                                                <Download className="w-5 h-5" /> UNDUH GAMBAR
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>
                        <ZoomModal isOpen={isZoomModalOpenHand} onClose={() => setIsZoomModalOpenHand(false)} imageUrl={generatedImageHand || ''} />
                    </motion.div>
                ) : (
                    <motion.div key="selfie" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-6 md:p-8 shadow-sm space-y-8">
                                <section>
                                    <StepHeader step={1} title="Upload Pakaian" description="Gunakan foto pakaian yang jelas & terang." />
                                    <div 
                                        onClick={() => selfieInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                                        selectedImageSelfie ? 'border-indigo-300 bg-indigo-50/10' : 'border-slate-300 dark:border-slate-700 hover:border-black dark:hover:border-white hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <input type="file" ref={selfieInputRef} onChange={handleImageUploadSelfie} accept="image/png, image/jpeg, image/jpg" className="hidden" />
                                        {selectedImageSelfie ? (
                                            <div className="relative h-full w-full">
                                                <img src={selectedImageSelfie} alt="Uploaded" className="h-full w-full object-contain p-4" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                                        <RefreshCw className="w-4 h-4" /> Ganti Foto
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-6">
                                                <div className="bg-slate-100 dark:bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <Upload className="w-6 h-6" />
                                                </div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">Upload Foto Baju</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">High-Res Recommended</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="pt-8 border-t border-slate-100 dark:border-white/5 relative overflow-hidden">
                                    <StepHeader step={2} title="Konfigurasi Detail" description="Pilih preferensi model dan lokasi." />
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3 block ml-1">Ukuran Foto (Ratio)</label>
                                            <div className="grid grid-cols-5 gap-2">
                                                {['1:1', '3:4', '4:5', '9:16', '16:9'].map((ratio) => (
                                                    <button key={ratio} onClick={() => setAspectRatioSelfie(ratio)} disabled={isLoadingSelfie || isAnalyzingSelfie} className={`text-[10px] font-black py-2.5 rounded-xl border transition-all ${aspectRatioSelfie === ratio ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-400'}`}>{ratio}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3 block ml-1">Etnis Model</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {ethnicitiesSelfie.map((item) => (
                                                    <button key={item.id} onClick={() => setEthnicitySelfie(item.id)} disabled={isLoadingSelfie || isAnalyzingSelfie} className={`text-[10px] font-black py-2 px-1 rounded-xl border transition-all truncate ${ethnicitySelfie === item.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-400'}`}>{item.label}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3 block ml-1">Lokasi Mirror Selfie</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {backgroundsSelfie.map((bg) => (
                                                    <button key={bg.id} onClick={() => setBackgroundTypeSelfie(bg.id)} disabled={isLoadingSelfie || isAnalyzingSelfie} className={`text-[10px] font-black py-2.5 px-3 rounded-xl border transition-all text-left truncate ${backgroundTypeSelfie === bg.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-400'}`}>{bg.label}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-8">
                                        <button
                                            onClick={handleGenerateSelfie}
                                            disabled={isLoadingSelfie || isAnalyzingSelfie || !descriptionSelfie}
                                            className={`w-full py-5 rounded-3xl font-black text-white shadow-2xl flex items-center justify-center gap-3 transition-all duration-300 uppercase tracking-widest text-sm ${isLoadingSelfie || isAnalyzingSelfie || !descriptionSelfie ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-[1.02] active:scale-95 shadow-indigo-500/20'}`}
                                        >
                                            {isLoadingSelfie ? <><RefreshCw className="w-5 h-5 animate-spin" /> Rendering...</> : <><Camera className="w-5 h-5" /> Generate ({aspectRatioSelfie})</>}
                                        </button>
                                        {errorSelfie && <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-2"><AvoidXConflict className="w-4 h-4" /> {errorSelfie}</div>}
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="lg:col-span-7 h-full">
                            <div className="bg-white dark:bg-gray-900/50 backdrop-blur-2xl p-6 md:p-10 rounded-[3rem] border border-white/40 dark:border-white/5 shadow-2xl min-h-[600px] flex flex-col items-center">
                                <div className="flex justify-between items-center mb-8 w-full">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                        <ScanFace className="w-6 h-6 text-indigo-500" />
                                        Hasil Try-On
                                    </h2>
                                    {generatedImageSelfie && (
                                        <div className="flex gap-2">
                                            <span className="text-[9px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-wider">{aspectRatioSelfie}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={`flex-1 bg-slate-50 dark:bg-black/40 rounded-[2.5rem] border border-slate-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden group w-full transition-all duration-700 min-h-[500px] shadow-inner`}>
                                    {generatedImageSelfie ? (
                                        <div className={`relative w-full h-full flex items-center justify-center p-4 transition-all duration-700`}>
                                            <img src={generatedImageSelfie} alt="Try On" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-fade-in" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <button onClick={() => setIsZoomModalOpenSelfie(true)} className="p-4 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-all shadow-2xl scale-75 group-hover:scale-100">
                                                    <Eye className="w-8 h-8" />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-6 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                                <button onClick={handleDownloadSelfie} className="bg-white text-slate-900 px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-100 flex items-center gap-3 transition-all active:scale-95">
                                                    <Download className="w-[18px] h-[18px]" /> Simpan Gambar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 max-w-md">
                                            {isLoadingSelfie ? (
                                                <div className="flex flex-col items-center gap-6">
                                                    <div className="relative">
                                                        <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <ScanFace className="w-6 h-6 text-indigo-500 animate-pulse" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">Rendering...</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6 opacity-30 group-hover:opacity-50 transition-opacity">
                                                    <div className="flex justify-center -space-x-8 mb-4">
                                                        <div className="w-24 h-32 bg-slate-300 dark:bg-slate-700 rounded-2xl transform -rotate-12 border-4 border-white dark:border-slate-800 shadow-xl"></div>
                                                        <div className="w-24 h-32 bg-slate-800 dark:bg-white rounded-2xl transform rotate-12 border-4 border-white dark:border-slate-800 shadow-xl relative z-10"></div>
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Workspace Kosong</h3>
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tight max-w-xs mx-auto">Upload foto produk & konfigurasikan model untuk melihat hasil generate.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <ZoomModal isOpen={isZoomModalOpenSelfie} onClose={() => setIsZoomModalOpenSelfie(false)} imageUrl={generatedImageSelfie || ''} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PovStudio;

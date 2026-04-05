
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUsage } from '../contexts/UsageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { UploadedImage } from '../types';
import { generateSinglePhotoshootImage } from '../services/geminiService';
import { Download as DownloadIcon, Eye as ZoomIcon, RefreshCw, Image as ImageIcon, User, Camera, Square as SquareIcon, RectangleHorizontal as RectangleHorizontalIcon, RectangleVertical as RectangleVerticalIcon, Globe } from '../components/icons/LucideIcons';
import { ZoomModal } from '../components/ZoomModal';
import { auth, saveToHistory } from '../firebase';

type AspectRatio = '1:1' | '3:4' | '9:16' | '16:9';

type PremiumResult = {
    id: number;
    status: 'waiting' | 'loading' | 'done' | 'error';
    imageUrl?: string;
    error?: string;
};

const ETHNICITY_OPTIONS = [
    { id: 'indonesia', nameKey: 'goFamily.ethnicities.indonesia', prompt: 'Indonesian' },
    { id: 'asia', nameKey: 'goFamily.ethnicities.asia', prompt: 'East Asian' },
    { id: 'bule', nameKey: 'goFamily.ethnicities.bule', prompt: 'Caucasian' },
    { id: 'arab', nameKey: 'goFamily.ethnicities.arab', prompt: 'Middle Eastern' }
];

export const GoModelPremiumV2: React.FC = () => {
    const { t } = useLanguage();
    const { incrementUsage } = useUsage();
    
    // States
    const [productImage, setProductImage] = useState<UploadedImage | null>(null);
    const [gender, setGender] = useState('female');
    const [ethnicity, setEthnicity] = useState('indonesia');
    const [isHijab, setIsHijab] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');

    const [results, setResults] = useState<PremiumResult[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const handleUpload = (dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        setProductImage({ base64, mimeType });
        setResults(null);
        setError(null);
    };

    const handleGenerate = async () => {
        if (!productImage) {
            setError(t('errors.noProductImage'));
            return;
        }

        setIsGenerating(true);
        setError(null);
        setProgress(0);
        setResults(Array.from({ length: 4 }, (_, i) => ({ id: i, status: 'waiting' })));

        const selectedEthnicity = ETHNICITY_OPTIONS.find(e => e.id === ethnicity)?.prompt || 'Indonesian';
        const hijabText = isHijab ? 'wearing a stylish hijab' : '';
        
        const basePrompt = `ULTRA-REALISTIC FASHION PHOTOGRAPHY: A professional ${selectedEthnicity} ${gender} model ${hijabText} in a modern minimalist indoor room.
        CRITICAL: The photo is a NECK-DOWN shot. The model's head and face are NOT visible. The frame starts from the neck downwards.
        
        Wall: Clean white with a large arch design in the center. 
        Background: White wall shelf with simple decorations (small photo frame, decorative letters, etc.). 
        Lighting: Warm tone hidden behind the shelf, creating a cozy, soft, and comfortable atmosphere. 
        Furniture: White drawers or desk with a clean and modern design. 
        Floor: Beige carpet. 
        Overall vibe: Aesthetic, calm, Instagramable, soft neutral colors. 
        Model style: Feminine, calm, elegant. 
        Pose: Standing relaxed, one hand might be holding a phone as if taking a mirror selfie but the head is cut off from the frame.
        Vibe: Natural, modern, aesthetic like an influencer. 
        The model is wearing the EXACT clothing item from the input image. 
        High fidelity textures, cinematic lighting, 8k resolution, commercial fashion aesthetic. No text, no watermarks.
        NEGATIVE: No head, no face, no eyes, no mouth, no hair above the neck.`;

        for (let i = 0; i < 4; i++) {
            setResults(prev => {
                if (!prev) return prev;
                const next = [...prev];
                next[i].status = 'loading';
                return next;
            });

            try {
                const res = await generateSinglePhotoshootImage(productImage, basePrompt, "head, face, eyes, hair", aspectRatio);
                
                setResults(prev => {
                    if (!prev) return prev;
                    const next = [...prev];
                    next[i] = { id: i, status: 'done', imageUrl: res.imageUrl };
                    return next;
                });

                // Save to history
                if (auth.currentUser && res.imageUrl) {
                    await saveToHistory(auth.currentUser.uid, {
                        imageUrl: res.imageUrl,
                        type: "Go Model PREMIUM V2",
                        prompt: `Premium V2 Headless Photoshoot - ${selectedEthnicity} ${gender}`
                    });
                }
                
                incrementUsage();
            } catch (err: any) {
                setResults(prev => {
                    if (!prev) return prev;
                    const next = [...prev];
                    next[i] = { id: i, status: 'error', error: "Gagal Render" };
                    return next;
                });
            }
            setProgress(i + 1);
        }
        setIsGenerating(false);
    };

    const handleReset = () => {
        setProductImage(null);
        setResults(null);
        setError(null);
        setIsGenerating(false);
        setProgress(0);
    };

    return (
        <div className="w-full">
            <FeatureHeader
                title={t('goModelPremiumV2.page.title')}
                description={t('goModelPremiumV2.page.description')}
            />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <aside className="w-full lg:w-[420px] flex-shrink-0 lg:sticky lg:top-8 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    
                    <section>
                        <StepHeader step={1} title={t('goModelPremiumV2.sections.upload.title')} description={t('goModelPremiumV2.sections.upload.description')} />
                        <ImageUploader onImageUpload={handleUpload} uploadedImage={productImage ? `data:${productImage.mimeType};base64,${productImage.base64}` : null} label="Product" labelKey="uploader.productLabel" />
                    </section>

                    <section className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={2} title={t('goModelPremiumV2.sections.options.title')} description={t('goModelPremiumV2.sections.options.description')} />
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">Gender</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setGender('female')} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${gender === 'female' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-gray-500'}`}>
                                        <User className="w-4 h-4"/> <span className="text-xs font-bold">{t('goModelVip.sections.gender.female')}</span>
                                    </button>
                                    <button onClick={() => setGender('male')} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${gender === 'male' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-gray-500'}`}>
                                        <User className="w-4 h-4"/> <span className="text-xs font-bold">{t('goModelVip.sections.gender.male')}</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">Etnisitas</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ETHNICITY_OPTIONS.map(opt => (
                                        <button key={opt.id} onClick={() => setEthnicity(opt.id)} className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${ethnicity === opt.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-gray-500'}`}>
                                            <Globe className="w-3 h-3 opacity-50" />
                                            <span className="text-[10px] font-bold">{t(opt.nameKey)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {gender === 'female' && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                                    <span className="text-xs font-black uppercase">{t('goModelVip.sections.hijab')}</span>
                                    <button onClick={() => setIsHijab(!isHijab)} className={`w-12 h-6 rounded-full transition-all relative ${isHijab ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isHijab ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">Rasio Aspek</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['1:1', '3:4', '9:16', '16:9'] as AspectRatio[]).map(r => (
                                        <button key={r} onClick={() => setAspectRatio(r)} className={`p-2 rounded-lg flex flex-col items-center justify-center border transition-all ${aspectRatio === r ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                                            {r === '1:1' ? <SquareIcon className="w-4 h-4"/> : r === '16:9' ? <RectangleHorizontalIcon className="w-4 h-4"/> : <RectangleVerticalIcon className="w-4 h-4"/>}
                                            <span className="text-[9px] font-bold mt-1">{r}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="pt-4">
                        <button onClick={handleGenerate} disabled={isGenerating || !productImage} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                            {isGenerating ? <><Spinner className="h-5 w-5 text-white" /> Rendering ({progress}/4)...</> : <><Camera className="w-5 h-5"/> {t('goModelPremiumV2.generateButton')}</>}
                        </button>
                        {results && !isGenerating && (
                            <button onClick={handleReset} className="w-full mt-3 py-3 text-sm font-bold text-slate-500 flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4" /> Reset Semua
                            </button>
                        )}
                        {error && <p className="text-center text-xs font-bold text-red-500 mt-4 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                    </div>
                </aside>

                <section className="flex-1 bg-white dark:bg-gray-900/50 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-sm min-h-[600px]">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-white/10 pb-6">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">Premium V2 Model Gallery</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">4 Variasi model tanpa kepala mengenakan produk Anda.</p>
                        </div>
                    </div>

                    {!results && !isGenerating ? (
                        <div className="flex flex-col items-center justify-center h-96 text-slate-400 text-center">
                             <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-dashed border-slate-200 rotate-3">
                                <ImageIcon className="w-8 h-8 opacity-40 text-indigo-500" />
                             </div>
                            <p className="text-xs font-black uppercase tracking-widest">Workspace Kosong</p>
                        </div>
                    ) : (
                        <div className={`grid gap-6 animate-fade-in ${aspectRatio === '9:16' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                            {results?.map((result, index) => (
                                <div key={index} className={`group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md transition-all hover:shadow-xl bg-slate-100 dark:bg-black/20 ${aspectRatio === '1:1' ? 'aspect-square' : aspectRatio === '9:16' ? 'aspect-[9/16]' : aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[3/4]'}`}>
                                    {result.status === 'loading' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center animate-pulse">
                                            <Spinner className="h-8 w-8 text-indigo-500" />
                                            <span className="text-[10px] font-black uppercase text-indigo-500 mt-2 tracking-widest">Processing...</span>
                                        </div>
                                    )}
                                    {result.status === 'done' && result.imageUrl && (
                                        <>
                                            <img src={result.imageUrl} alt={`Result ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                                                <div className="flex gap-2 w-full">
                                                    <button onClick={() => { setZoomImage(result.imageUrl!); setIsZoomModalOpen(true); }} className="flex-1 bg-white/20 hover:bg-white/40 text-white p-2.5 rounded-xl backdrop-blur-md transition-all flex items-center justify-center"><ZoomIcon className="w-4 h-4" /></button>
                                                    <a href={result.imageUrl!} download={`premium-v2-model-${index+1}.png`} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center"><DownloadIcon className="w-5 h-5" /></a>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
            <ZoomModal isOpen={isZoomModalOpen} onClose={() => setIsZoomModalOpen(false)} imageUrl={zoomImage || ''} />
        </div>
    );
};

export default GoModelPremiumV2;

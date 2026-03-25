
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUsage } from '../contexts/UsageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { UploadedImage, SelfieVipOptions } from '../types';
import { generateSelfieVipPhotoshoot } from '../services/geminiService';
import { Download as DownloadIcon, Eye as ZoomIcon, RefreshCw, Clock, Image as ImageIcon, Users, User, Camera, Square as SquareIcon, RectangleHorizontal as RectangleHorizontalIcon, RectangleVertical as RectangleVerticalIcon, Globe } from '../components/icons/LucideIcons';
import { ZoomModal } from '../components/ZoomModal';
import { PromoCard } from '../components/PromoCard';
import { auth, saveToHistory } from '../firebase';

type AspectRatio = '1:1' | '3:4' | '9:16' | '16:9';

type SelfieResult = {
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

const THEME_OPTIONS = [
    { id: 'aestheticCafe', nameKey: 'goSelfieVip.themes.aestheticCafe', prompt: 'an aesthetic cafe with soft lighting and minimalist decor' },
    { id: 'fittingRoom', nameKey: 'goSelfieVip.themes.fittingRoom', prompt: 'a clean, modern clothing store fitting room' },
    { id: 'modernBedroom', nameKey: 'goSelfieVip.themes.modernBedroom', prompt: 'a modern, minimalist bedroom with natural light and simple furniture' },
    { id: 'luxuryLobby', nameKey: 'goSelfieVip.themes.luxuryLobby', prompt: 'a luxurious, bright hotel lobby with elegant decor' }
];

const POSE_OPTIONS = [
    { id: 'fullBody', nameKey: 'goSelfieVip.poses.fullBody', prompt: 'standing for a full-body mirror selfie' },
    { id: 'closeUp', nameKey: 'goSelfieVip.poses.closeUp', prompt: 'taking a close-up mirror selfie focusing on the upper body' },
    { id: 'sitting', nameKey: 'goSelfieVip.poses.sitting', prompt: 'sitting on a chair or stool for a relaxed mirror selfie' },
    { id: 'fromSide', nameKey: 'goSelfieVip.poses.fromSide', prompt: 'taking a mirror selfie from a slight side angle' }
];


export const GoSelfieVip: React.FC = () => {
    const { t } = useLanguage();
    const { incrementUsage } = useUsage();
    
    // States
    const [productImage, setProductImage] = useState<UploadedImage | null>(null);
    const [gender, setGender] = useState('female');
    const [ethnicity, setEthnicity] = useState('indonesia');
    const [isHijab, setIsHijab] = useState(false);
    const [pose, setPose] = useState('fullBody');
    const [faceVisibility, setFaceVisibility] = useState<'obstructed' | 'unobstructed'>('obstructed');
    const [theme, setTheme] = useState('aestheticCafe');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');

    const [results, setResults] = useState<SelfieResult[] | null>(null);
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
        const selectedPose = POSE_OPTIONS.find(p => p.id === pose)?.prompt || 'taking a full-body mirror selfie';
        const selectedTheme = THEME_OPTIONS.find(th => th.id === theme)?.prompt || 'an aesthetic cafe';


        for (let i = 0; i < 4; i++) {
            setResults(prev => {
                if (!prev) return prev;
                const next = [...prev];
                next[i].status = 'loading';
                return next;
            });

            try {
                const res = await generateSelfieVipPhotoshoot(productImage, {
                    gender,
                    ethnicity: selectedEthnicity,
                    isHijab,
                    pose: selectedPose,
                    faceVisibility,
                    theme: selectedTheme,
                    aspectRatio
                });
                
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
                        type: "Go Selfie VIP",
                        prompt: `VIP Selfie Photoshoot - ${selectedEthnicity} ${gender}`
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

    const getAspectRatioClass = (ratio: AspectRatio) => {
        switch (ratio) {
            case '1:1': return 'aspect-square';
            case '3:4': return 'aspect-[3/4]';
            case '9:16': return 'aspect-[9/16]';
            case '16:9': return 'aspect-video';
            default: return 'aspect-[3/4]';
        }
    };


    return (
        <div className="w-full">
            <FeatureHeader
                title={t('goSelfieVip.page.title')}
                description={t('goSelfieVip.page.description')}
            />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <aside className="w-full lg:w-[420px] flex-shrink-0 lg:sticky lg:top-8 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    
                    <section>
                        <StepHeader step={1} title={t('sections.upload.title')} description={t('uploader.productLabel')} />
                        <ImageUploader onImageUpload={handleUpload} uploadedImage={productImage ? `data:${productImage.mimeType};base64,${productImage.base64}` : null} label="Product" labelKey="uploader.productLabel" />
                    </section>

                    <section className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={2} title="Profil Model" />
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button onClick={() => setGender('female')} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${gender === 'female' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-gray-500'}`}>
                                <User className="w-4 h-4"/> <span className="text-xs font-bold">{t('goSelfieVip.sections.gender.female')}</span>
                            </button>
                            <button onClick={() => setGender('male')} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${gender === 'male' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-gray-500'}`}>
                                <User className="w-4 h-4"/> <span className="text-xs font-bold">{t('goSelfieVip.sections.gender.male')}</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {ETHNICITY_OPTIONS.map(opt => (
                                <button key={opt.id} onClick={() => setEthnicity(opt.id)} className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${ethnicity === opt.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-gray-500'}`}>
                                    <Globe className="w-3 h-3 opacity-50" />
                                    <span className="text-[10px] font-bold">{t(opt.nameKey)}</span>
                                </button>
                            ))}
                        </div>
                        
                        {gender === 'female' && (
                            <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                                <span className="text-xs font-black uppercase">{t('goSelfieVip.sections.hijab')}</span>
                                <button onClick={() => setIsHijab(!isHijab)} className={`w-12 h-6 rounded-full transition-all relative ${isHijab ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isHijab ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={3} title="Gaya & Lokasi" />
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">{t('goSelfieVip.sections.faceVisibility')}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setFaceVisibility('obstructed')} className={`p-2 rounded-xl border text-center transition-all ${faceVisibility === 'obstructed' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-gray-500'}`}>
                                        <span className="text-[10px] font-bold">{t('goSelfieVip.faceOptions.obstructed')}</span>
                                    </button>
                                    <button onClick={() => setFaceVisibility('unobstructed')} className={`p-2 rounded-xl border text-center transition-all ${faceVisibility === 'unobstructed' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-gray-500'}`}>
                                        <span className="text-[10px] font-bold">{t('goSelfieVip.faceOptions.unobstructed')}</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">{t('goSelfieVip.sections.pose')}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {POSE_OPTIONS.map(opt => (
                                        <button key={opt.id} onClick={() => setPose(opt.id)} className={`p-2 rounded-xl border text-left transition-all ${pose === opt.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-gray-500'}`}>
                                            <span className="text-[10px] font-bold">{t(opt.nameKey)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">{t('goSelfieVip.sections.theme')}</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {THEME_OPTIONS.map(opt => (
                                        <button key={opt.id} onClick={() => setTheme(opt.id)} className={`p-2 rounded-xl border text-left transition-all ${theme === opt.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-gray-500'}`}>
                                            <span className="text-[10px] font-bold">{t(opt.nameKey)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={4} title="Rasio Aspek" />
                        <div className="grid grid-cols-4 gap-2">
                            {(['1:1', '3:4', '9:16', '16:9'] as AspectRatio[]).map(r => (
                                <button key={r} onClick={() => setAspectRatio(r)} className={`p-2 rounded-lg flex flex-col items-center justify-center border transition-all ${aspectRatio === r ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                                    {r === '1:1' ? <SquareIcon className="w-4 h-4"/> : r === '16:9' ? <RectangleHorizontalIcon className="w-4 h-4"/> : <RectangleVerticalIcon className="w-4 h-4"/>}
                                    <span className="text-[9px] font-bold mt-1">{r}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="pt-4">
                        <button onClick={handleGenerate} disabled={isGenerating || !productImage} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                            {isGenerating ? <><Spinner className="h-5 w-5 text-white" /> Rendering ({progress}/4)...</> : <><Camera className="w-5 h-5"/> BUAT FOTO SELFIE VIP</>}
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
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">Selfie VIP Gallery</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">4 Variasi foto selfie dengan produk Anda.</p>
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
                                <div key={index} className={`group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md transition-all hover:shadow-xl bg-slate-100 dark:bg-black/20 ${getAspectRatioClass(aspectRatio)}`}>
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
                                                    <a href={result.imageUrl!} download={`go-selfie-vip-${index+1}.png`} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center"><DownloadIcon className="w-5 h-5" /></a>
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
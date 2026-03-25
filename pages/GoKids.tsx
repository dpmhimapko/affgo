import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { UploadedImage } from '../types';
import { generateKidsPhotoshoot } from '../services/geminiService';
import { Download as DownloadIcon, Eye as ZoomIcon, RefreshCw, Clock, Image as ImageIcon, Smile, Camera, Square as SquareIcon, RectangleHorizontal as RectangleHorizontalIcon, RectangleVertical as RectangleVerticalIcon, Globe, Shirt, User } from '../components/icons/LucideIcons';
import { ZoomModal } from '../components/ZoomModal';
import { PromoCard } from '../components/PromoCard';
import { auth, saveToHistory } from '../firebase';

type AspectRatio = '1:1' | '3:4' | '9:16' | '16:9';
type Ethnicity = 'indonesia' | 'asia' | 'bule' | 'arab';
type ProductType = 'baju' | 'celana' | 'sarung' | 'setelan' | 'dress';
type Gender = 'boy' | 'girl';
type Pose = 'formal' | 'casual' | 'playful';

const GENDER_OPTIONS: { id: Gender; nameKey: string; prompt: string; }[] = [
    { id: 'boy', nameKey: 'goKids.genders.boy', prompt: 'boy' },
    { id: 'girl', nameKey: 'goKids.genders.girl', prompt: 'girl' }
];

const POSE_OPTIONS: { id: Pose; nameKey: string; prompt: string; }[] = [
    { id: 'formal', nameKey: 'goKids.poses.formal', prompt: 'standing in a formal, neat pose, looking at the camera' },
    { id: 'casual', nameKey: 'goKids.poses.casual', prompt: 'standing in a relaxed, casual pose, not stiff, with a soft smile' },
    { id: 'playful', nameKey: 'goKids.poses.playful', prompt: 'in a cheerful, playful, and dynamic pose, smiling happily' }
];


const PRODUCT_TYPES: { id: ProductType; nameKey: string; }[] = [
    { id: 'baju', nameKey: 'goKids.types.baju' },
    { id: 'celana', nameKey: 'goKids.types.celana' },
    { id: 'sarung', nameKey: 'goKids.types.sarung' },
    { id: 'setelan', nameKey: 'goKids.types.setelan' },
    { id: 'dress', nameKey: 'goKids.types.dress' }
];

const THEME_OPTIONS = [
    { id: 'aestheticRoom', nameKey: 'goFamily.themes.aestheticRoom', prompt: 'a soft grey fur carpet in a modern minimalist room with monochrome art posters and ambient teal LED lighting, elegant purple accents, professional photography' },
    { id: 'modernWhite', nameKey: 'goFamily.themes.modernWhite', prompt: 'a modern high-end clean white photography studio with professional lighting' },
    { id: 'warmLiving', nameKey: 'goFamily.themes.warmLiving', prompt: 'a cozy, aesthetic modern living room with warm soft lighting' }
];

const ETHNICITY_OPTIONS = [
    { id: 'indonesia', nameKey: 'goFamily.ethnicities.indonesia', prompt: 'Indonesian elementary school child with natural skin tone' },
    { id: 'asia', nameKey: 'goFamily.ethnicities.asia', prompt: 'East Asian elementary school child' },
    { id: 'bule', nameKey: 'goFamily.ethnicities.bule', prompt: 'Caucasian Western elementary school child' },
    { id: 'arab', nameKey: 'goFamily.ethnicities.arab', prompt: 'Middle Eastern elementary school child' }
];

type KidsResult = {
    id: number;
    status: 'waiting' | 'loading' | 'done' | 'error';
    imageUrl?: string;
    error?: string;
};

export const GoKids: React.FC = () => {
    const { t } = useLanguage();
    
    // Asset State
    const [productImage, setProductImage] = useState<UploadedImage | null>(null);
    
    // Config States
    const [productType, setProductType] = useState<ProductType>('baju');
    const [theme, setTheme] = useState(THEME_OPTIONS[0].id);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [ethnicity, setEthnicity] = useState<Ethnicity>('indonesia');
    const [gender, setGender] = useState<Gender>('boy');
    const [pose, setPose] = useState<Pose>('casual');
    
    // Result States
    const [results, setResults] = useState<KidsResult[] | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    
    // Zoom state
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const handleUpload = (dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        setProductImage({ base64, mimeType });
        setResults(null);
        setError(null);
        setProgress(0);
    };

    const handleGenerate = async () => {
        if (!productImage) {
            setError("Harap unggah foto produk anak terlebih dahulu.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setProgress(0);
        
        // We generate 4 variations
        const initialResults: KidsResult[] = Array.from({ length: 4 }, (_, i) => ({ id: i, status: 'waiting' }));
        setResults(initialResults);

        const selectedTheme = THEME_OPTIONS.find(th => th.id === theme)?.prompt || THEME_OPTIONS[0].prompt;
        const selectedEthnicity = ETHNICITY_OPTIONS.find(e => e.id === ethnicity)?.prompt || ETHNICITY_OPTIONS[0].prompt;
        const typeName = PRODUCT_TYPES.find(p => p.id === productType)?.id || 'clothing';
        const selectedGender = GENDER_OPTIONS.find(g => g.id === gender)?.prompt || 'child';
        const selectedPose = POSE_OPTIONS.find(p => p.id === pose)?.prompt || 'standing in a relaxed pose';

        for (let i = 0; i < 4; i++) {
            setResults(prev => {
                if (!prev) return prev;
                const next = [...prev];
                next[i].status = 'loading';
                return next;
            });

            try {
                const res = await generateKidsPhotoshoot(
                    productImage,
                    typeName,
                    selectedEthnicity,
                    selectedTheme,
                    selectedGender,
                    selectedPose,
                    aspectRatio
                );
                
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
                        type: "Go Kids",
                        prompt: `Kids Photoshoot - ${ethnicity} ${gender}`
                    });
                }
            } catch (err: any) {
                console.error(`Error slot ${i}:`, err);
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
            default: return 'aspect-square';
        }
    };

    return (
        <div className="w-full">
            <FeatureHeader
                title={t('goKids.page.title')}
                description={t('goKids.page.description')}
            />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar */}
                <aside className="w-full lg:w-[400px] flex-shrink-0 lg:sticky lg:top-8 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    
                    <section>
                        <StepHeader step={1} title={t('sections.upload.title')} description={t('uploader.productLabel')} />
                        <ImageUploader 
                            onImageUpload={handleUpload} 
                            uploadedImage={productImage ? `data:${productImage.mimeType};base64,${productImage.base64}` : null} 
                            label="Product" 
                            labelKey="uploader.productLabel" 
                        />
                    </section>

                    <section className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={2} title={t('goKids.sections.type.title')} />
                        <div className="grid grid-cols-2 gap-2">
                            {PRODUCT_TYPES.map(opt => (
                                <button key={opt.id} onClick={() => setProductType(opt.id)} className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${productType === opt.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-500'}`}>
                                    <Shirt className="w-3 h-3 opacity-50" />
                                    <span className="text-[10px] font-bold">{t(opt.nameKey)}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                    
                    <section className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={3} title={t('goKids.sections.gender.title')} />
                        <div className="grid grid-cols-2 gap-2">
                            {GENDER_OPTIONS.map(opt => (
                                <button key={opt.id} onClick={() => setGender(opt.id)} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${gender === opt.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-500'}`}>
                                    <User className="w-4 h-4" />
                                    <span className="text-xs font-bold">{t(opt.nameKey)}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={4} title={t('goKids.sections.pose.title')} />
                        <div className="grid grid-cols-3 gap-2">
                            {POSE_OPTIONS.map(opt => (
                                <button key={opt.id} onClick={() => setPose(opt.id)} className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${pose === opt.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-500'}`}>
                                    <span className="text-xs font-bold">{t(opt.nameKey)}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={5} title={t('goKids.sections.ethnicity.title')} />
                        <div className="grid grid-cols-2 gap-2">
                            {ETHNICITY_OPTIONS.map(opt => (
                                <button key={opt.id} onClick={() => setEthnicity(opt.id as Ethnicity)} className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${ethnicity === opt.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-500'}`}>
                                    <Globe className="w-3 h-3 opacity-50" />
                                    <span className="text-[10px] font-bold">{t(opt.nameKey)}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={6} title="Ukuran & Tema" />
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">Rasio Aspek</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['1:1', '3:4', '9:16', '16:9'] as AspectRatio[]).map(r => (
                                        <button 
                                            key={r} 
                                            onClick={() => setAspectRatio(r)} 
                                            className={`p-2 rounded-lg flex flex-col items-center justify-center border transition-all ${aspectRatio === r ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500'}`}
                                        >
                                            {r === '1:1' ? <SquareIcon className="w-4 h-4"/> : r === '16:9' ? <RectangleHorizontalIcon className="w-4 h-4"/> : <RectangleVerticalIcon className="w-4 h-4"/>}
                                            <span className="text-[9px] font-bold mt-1">{r}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">Pilih Tema</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {THEME_OPTIONS.map(opt => (
                                        <button key={opt.id} onClick={() => setTheme(opt.id)} className={`p-3 rounded-xl border text-left transition-all ${theme === opt.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-500'}`}>
                                            <span className="text-[10px] font-bold block">{t(opt.nameKey)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="pt-4">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !productImage}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isGenerating ? <><Spinner className="h-5 w-5 text-white" /> Rendering ({progress}/4)...</> : <><Camera className="w-5 h-5"/> Buat Foto Anak</>}
                        </button>
                        
                        {results && !isGenerating && (
                            <button onClick={handleReset} className="w-full mt-3 py-3 text-sm font-bold text-slate-500 flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4" /> Reset Semua
                            </button>
                        )}
                        
                        {error && <p className="text-center text-xs font-bold text-red-500 mt-4 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                    </div>
                </aside>

                {/* Gallery */}
                <section className="flex-1 bg-white dark:bg-gray-900/50 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-sm min-h-[600px]">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-white/10 pb-6">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Kids Studio Gallery</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Visual pemotretan model anak {aspectRatio}.</p>
                        </div>
                        {isGenerating && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold animate-pulse">
                                <Clock className="w-3 h-3" /> Rendering...
                            </div>
                        )}
                    </div>

                    {!results && !isGenerating && (
                        <div className="flex flex-col items-center justify-center h-96 text-slate-400 text-center">
                             <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-dashed border-slate-200 rotate-3">
                                <Smile className="w-8 h-8 opacity-40 text-indigo-500" />
                             </div>
                            <p className="text-xs font-black uppercase tracking-widest">Hasil akan muncul di sini.</p>
                        </div>
                    )}

                    {results && (
                        <div className={`grid gap-6 animate-fade-in ${aspectRatio === '9:16' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                            {results.map((result, index) => (
                                <div key={index} className={`group relative ${getAspectRatioClass(aspectRatio)} bg-slate-100 dark:bg-black/20 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md transition-all hover:shadow-xl`}>
                                    {result.status === 'loading' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 animate-pulse">
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
                                                    <a href={result.imageUrl!} download={`go-kids-${index+1}.png`} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center"><DownloadIcon className="w-5 h-5" /></a>
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
            <PromoCard />
            <ZoomModal isOpen={isZoomModalOpen} onClose={() => setIsZoomModalOpen(false)} imageUrl={zoomImage || ''} />
        </div>
    );
};

export default GoKids;
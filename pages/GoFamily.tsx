
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { UploadedImage } from '../types';
import { generateFamilyPhotoshoot } from '../services/geminiService';
import { Download as DownloadIcon, Eye as ZoomIcon, RefreshCw, Clock, Image as ImageIcon, Users, User, Camera, Square as SquareIcon, RectangleHorizontal as RectangleHorizontalIcon, RectangleVertical as RectangleVerticalIcon, Globe } from '../components/icons/LucideIcons';
import { ZoomModal } from '../components/ZoomModal';
import { PromoCard } from '../components/PromoCard';

type FamilyMode = 'couple' | 'full';
type AspectRatio = '1:1' | '3:4' | '9:16' | '16:9';
type Ethnicity = 'indonesia' | 'asia' | 'bule' | 'arab';

const THEME_OPTIONS = [
    { id: 'modernWhite', nameKey: 'goFamily.themes.modernWhite', prompt: 'a modern high-end clean white photography studio with professional lighting' },
    { id: 'warmLiving', nameKey: 'goFamily.themes.warmLiving', prompt: 'a cozy, aesthetic modern living room with warm soft lighting' },
    { id: 'minimalistGarden', nameKey: 'goFamily.themes.minimalistGarden', prompt: 'a beautiful minimalist sunny garden with architectural elements' },
    { id: 'luxuriousHall', nameKey: 'goFamily.themes.luxuriousHall', prompt: 'a luxurious bright hall with marble floor and elegant decor' },
    { id: 'aestheticRoom', nameKey: 'goFamily.themes.aestheticRoom', prompt: 'a soft grey fur carpet in a modern minimalist room with monochrome art posters and ambient teal LED lighting, elegant purple accents, professional photography' }
];

const ETHNICITY_OPTIONS = [
    { id: 'indonesia', nameKey: 'goFamily.ethnicities.indonesia', prompt: 'Indonesian people with natural skin tone' },
    { id: 'asia', nameKey: 'goFamily.ethnicities.asia', prompt: 'East Asian people' },
    { id: 'bule', nameKey: 'goFamily.ethnicities.bule', prompt: 'Caucasian Western people' },
    { id: 'arab', nameKey: 'goFamily.ethnicities.arab', prompt: 'Middle Eastern people' }
];

type FamilyResult = {
    id: number;
    status: 'waiting' | 'loading' | 'done' | 'error';
    imageUrl?: string;
    error?: string;
};

export const GoFamily: React.FC = () => {
    const { t } = useLanguage();
    
    // Asset States
    const [fatherImage, setFatherImage] = useState<UploadedImage | null>(null);
    const [motherImage, setMotherImage] = useState<UploadedImage | null>(null);
    const [sonImage, setSonImage] = useState<UploadedImage | null>(null);
    const [daughterImage, setDaughterImage] = useState<UploadedImage | null>(null);
    
    // Config States
    const [mode, setMode] = useState<FamilyMode>('full');
    const [theme, setTheme] = useState(THEME_OPTIONS[0].id);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [ethnicity, setEthnicity] = useState<Ethnicity>('indonesia');
    const [isHijab, setIsHijab] = useState<boolean>(false);
    
    // Result States
    const [results, setResults] = useState<FamilyResult[] | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    
    // Zoom state
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    // Helper to extract base64 from Uploader
    const handleUpload = (dataUrl: string, mimeType: string, setter: (val: UploadedImage) => void) => {
        const base64 = dataUrl.split(',')[1];
        setter({ base64, mimeType });
        setResults(null);
        setError(null);
        setProgress(0);
    };

    const handleGenerate = async () => {
        // Validation
        if (!fatherImage || !motherImage) {
            setError("Harap unggah minimal foto produk Ayah & Ibu.");
            return;
        }
        if (mode === 'full' && (!sonImage && !daughterImage)) {
            setError("Untuk mode keluarga lengkap, harap unggah minimal satu foto produk Anak.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setProgress(0);
        
        // We generate 4 variations
        const initialResults: FamilyResult[] = Array.from({ length: 4 }, (_, i) => ({ id: i, status: 'waiting' }));
        setResults(initialResults);

        const selectedTheme = THEME_OPTIONS.find(th => th.id === theme)?.prompt || THEME_OPTIONS[0].prompt;
        const selectedEthnicity = ETHNICITY_OPTIONS.find(e => e.id === ethnicity)?.prompt || ETHNICITY_OPTIONS[0].prompt;

        for (let i = 0; i < 4; i++) {
            setResults(prev => {
                if (!prev) return prev;
                const next = [...prev];
                next[i].status = 'loading';
                return next;
            });

            try {
                const res = await generateFamilyPhotoshoot(
                    { father: fatherImage, mother: motherImage, son: sonImage, daughter: daughterImage },
                    mode,
                    selectedTheme,
                    aspectRatio,
                    isHijab,
                    selectedEthnicity
                );
                
                setResults(prev => {
                    if (!prev) return prev;
                    const next = [...prev];
                    next[i] = { id: i, status: 'done', imageUrl: res.imageUrl };
                    return next;
                });
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
        setFatherImage(null);
        setMotherImage(null);
        setSonImage(null);
        setDaughterImage(null);
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
                title={t('goFamily.page.title')}
                description={t('goFamily.page.description')}
            />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar */}
                <aside className="w-full lg:w-[420px] flex-shrink-0 lg:sticky lg:top-8 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    
                    <section>
                        <StepHeader step={1} title={t('goFamily.sections.upload.title')} description={t('goFamily.sections.upload.subtitle')} />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t('goFamily.labels.father')}</label>
                                <ImageUploader onImageUpload={(d,m) => handleUpload(d,m, setFatherImage)} uploadedImage={fatherImage ? `data:${fatherImage.mimeType};base64,${fatherImage.base64}` : null} label="Father" labelKey="goFamily.labels.father" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t('goFamily.labels.mother')}</label>
                                <ImageUploader onImageUpload={(d,m) => handleUpload(d,m, setMotherImage)} uploadedImage={motherImage ? `data:${motherImage.mimeType};base64,${motherImage.base64}` : null} label="Mother" labelKey="goFamily.labels.mother" />
                            </div>
                            {mode === 'full' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t('goFamily.labels.son')}</label>
                                        <ImageUploader onImageUpload={(d,m) => handleUpload(d,m, setSonImage)} uploadedImage={sonImage ? `data:${sonImage.mimeType};base64,${sonImage.base64}` : null} label="Son" labelKey="goFamily.labels.son" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t('goFamily.labels.daughter')}</label>
                                        <ImageUploader onImageUpload={(d,m) => handleUpload(d,m, setDaughterImage)} uploadedImage={daughterImage ? `data:${daughterImage.mimeType};base64,${daughterImage.base64}` : null} label="Daughter" labelKey="goFamily.labels.daughter" />
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    <section className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={2} title={t('goFamily.sections.setup.title')} />
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setMode('couple')} className={`p-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${mode === 'couple' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-600 dark:text-gray-400'}`}>
                                <User className="w-4 h-4"/> <span className="text-xs font-bold">{t('goFamily.modes.couple')}</span>
                            </button>
                            <button onClick={() => setMode('full')} className={`p-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${mode === 'full' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-600 dark:text-gray-400'}`}>
                                <Users className="w-4 h-4"/> <span className="text-xs font-bold">{t('goFamily.modes.full')}</span>
                            </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-700 dark:text-white uppercase italic">Mode Hijab</span>
                                <span className="text-[10px] text-slate-500 font-bold">Untuk Ibu & Anak Perempuan</span>
                            </div>
                            <button 
                                onClick={() => setIsHijab(!isHijab)}
                                className={`w-12 h-6 rounded-full transition-all relative ${isHijab ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isHijab ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </section>

                    <section className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={3} title={t('goFamily.sections.ethnicity.title')} />
                        <div className="grid grid-cols-2 gap-2">
                            {ETHNICITY_OPTIONS.map(opt => (
                                <button key={opt.id} onClick={() => setEthnicity(opt.id as Ethnicity)} className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${ethnicity === opt.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-500'}`}>
                                    <Globe className="w-3 h-3 opacity-50" />
                                    <span className="text-xs font-bold">{t(opt.nameKey)}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={4} title="Ukuran & Tema" />
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">Rasio Aspek</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['1:1', '3:4', '9:16', '16:9'] as AspectRatio[]).map(r => (
                                        <button 
                                            key={r} 
                                            onClick={() => setAspectRatio(r)} 
                                            className={`p-2 rounded-lg flex flex-col items-center justify-center border transition-all ${aspectRatio === r ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500'}`}
                                        >
                                            {r === '1:1' ? <SquareIcon className="w-4 h-4"/> : r === '16:9' ? <RectangleHorizontalIcon className="w-4 h-4"/> : <RectangleVerticalIcon className="w-4 h-4"/>}
                                            <span className="text-[9px] font-bold mt-1">{r}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">Pilih Tema</label>
                                <div className="grid grid-cols-2 gap-2">
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
                            disabled={isGenerating || !fatherImage || !motherImage}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isGenerating ? <><Spinner className="h-5 w-5 text-white" /> Rendering ({progress}/4)...</> : <><Camera className="w-5 h-5"/> Buat Foto Keluarga</>}
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
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Family Board</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Visual pemotretan set keluarga {aspectRatio}.</p>
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
                                <ImageIcon className="w-8 h-8 opacity-40" />
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
                                                    <a href={result.imageUrl!} download={`family-set-${index+1}.png`} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center"><DownloadIcon className="w-5 h-5" /></a>
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

export default GoFamily;

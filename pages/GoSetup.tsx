
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUsage } from '../contexts/UsageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { UploadedImage } from '../types';
import { generateSinglePhotoshootImage } from '../services/geminiService';
import { Download as DownloadIcon, Eye as ZoomIcon, Square as SquareIcon, RectangleHorizontal as RectangleHorizontalIcon, RectangleVertical as RectangleVerticalIcon, RefreshCw, Clock, Image as ImageIcon, Hand, Users } from '../components/icons/LucideIcons';
import { ZoomModal } from '../components/ZoomModal';
import { PromoCard } from '../components/PromoCard';
import { auth, saveToHistory } from '../firebase';

type AspectRatio = '1:1' | '3:4' | '9:16' | '16:9';
type Vibe = 'pink' | 'blue' | 'white' | 'brown' | 'purple' | 'green' | 'black';
type HandCount = '1' | '2';
type Gender = 'female' | 'male';
type Motion = 'subtleWiggle' | 'gentleTilt' | 'slowRotation' | 'stillLife';

const VIBE_OPTIONS: { id: Vibe; nameKey: string; color: string; prompt: string; }[] = [
    { 
        id: 'blue', 
        nameKey: 'goSetup.vibes.blue', 
        color: 'bg-blue-400',
        prompt: 'Aesthetic pastel blue and white tech setup, soft and clean minimalist futuristic vibe. Left: monitor with soft pastel blue wallpaper, white mechanical keyboard, soft LED digital clock. Table: white desk, white mouse, unique soft blue pastel mousepad. Right: game controllers (pastel blue/white), game console, white-blue headphones. Wall: posters, cards, geometric soft blue LED lines. Overall soft pastel lighting.' 
    },
    { 
        id: 'pink', 
        nameKey: 'goSetup.vibes.pink', 
        color: 'bg-pink-400',
        prompt: 'Aesthetic pastel pink and white gaming setup, cute and soft aesthetic. Left: monitor with soft pink heart wallpaper, pastel pink mechanical keyboard, cute soft digital clock. Table: white desk, pastel pink mouse, soft pink heart mousepad. Right: soft plushies, pastel pink controllers, pink headphones. Wall: cute posters, soft fairy lights, pastel pink neon heart. Overall soft pastel pink glow.' 
    },
    { 
        id: 'white', 
        nameKey: 'goSetup.vibes.white', 
        color: 'bg-slate-100',
        prompt: 'Clean minimalist soft white setup with bright natural soft lighting, all-white desk, white keyboard, and simple soft white decor. Left: monitor with abstract soft white wallpaper, white mechanical keyboard, white clock. Table: white desk, white mouse, white mousepad. Right: white speakers, white headphones, white plant pot. Wall: white acoustic panels, very soft white LED strips. High-key soft pastel atmosphere.' 
    },
    { 
        id: 'brown', 
        nameKey: 'goSetup.vibes.brown', 
        color: 'bg-amber-800',
        prompt: 'Cozy soft brown and pastel beige setup with warm light wooden desk, soft amber lighting, books, and vintage accessories. Left: monitor with soft nature wallpaper, light wooden keyboard, vintage clock. Table: light wood desk, soft beige leather mousepad, cup of coffee. Right: books, vintage camera, soft warm lamp. Wall: wooden shelves, dried flowers, soft warm amber LED.' 
    },
    { 
        id: 'purple', 
        nameKey: 'goSetup.vibes.purple', 
        color: 'bg-purple-500',
        prompt: 'Dreamy pastel purple and lavender setup with soft neon purple lighting, pastel purple keyboard, space themed monitor with soft colors. Left: monitor with soft lavender galaxy wallpaper, pastel purple backlit keyboard, soft neon clock. Table: white desk, soft purple RGB mousepad. Right: futuristic gadgets, pastel purple headphones, crystalline decor. Wall: soft purple neon strips, space posters.' 
    },
    { 
        id: 'green', 
        nameKey: 'goSetup.vibes.green', 
        color: 'bg-green-500',
        prompt: 'Natural soft mint green setup with many indoor plants, light wood desk, soft natural lighting, and botanical decor. Left: monitor with soft forest wallpaper, white keyboard, mint-themed accessories. Table: light wood desk, soft mint green mousepad. Right: terrariums, soft green headphones, nature books. Wall: ivy plants, botanical prints. Overall soft pastel green vibe.' 
    },
    { 
        id: 'black', 
        nameKey: 'goSetup.vibes.black', 
        color: 'bg-black',
        prompt: 'Soft matte black stealth setup with subtle pastel RGB lighting, black mechanical keyboard, and minimalist black accessories. Left: monitor with dark abstract wallpaper but soft contrast, black keyboard. Table: black desk, black mouse, black mousepad. Right: black speakers, black headphones, dark gadgets. Wall: dark acoustic foam, subtle soft pastel LED strips to create a soft dark aesthetic.' 
    }
];

type PhotoshootResult = {
    id: number;
    status: 'waiting' | 'loading' | 'done' | 'error';
    imageUrl?: string;
    videoPrompt?: string;
    error?: string;
};

export const GoSetup: React.FC = () => {
    const { t } = useLanguage();
    const { incrementUsage } = useUsage();
    
    const [sourceImage, setSourceImage] = useState<UploadedImage | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
    const [vibe, setVibe] = useState<Vibe>('blue');
    const [handCount, setHandCount] = useState<HandCount>('1');
    const [gender, setGender] = useState<Gender>('female');
    
    const [results, setResults] = useState<PhotoshootResult[] | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const handleImageUpload = (dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        setSourceImage({ base64, mimeType, name: 'source' });
        setResults(null);
        setError(null);
        setProgress(0);
    };

    const handleGenerate = async () => {
        if (!sourceImage) {
            setError(t('goAesthetic.errors.noImage'));
            return;
        }

        setIsGenerating(true);
        setError(null);
        setProgress(0);
        
        const initialResults: PhotoshootResult[] = [0, 1, 2, 3].map((i) => ({
            id: i,
            status: 'waiting'
        }));
        setResults(initialResults);

        const selectedVibe = VIBE_OPTIONS.find(v => v.id === vibe);
        const negativePrompt = " Ensure there is absolutely no text, writing, words, numbers, or watermarks in the final image. No stickers, high fidelity textures.";

        for (let i = 0; i < 4; i++) {
            setResults(prev => {
                if (!prev) return prev;
                const next = [...prev];
                next[i].status = 'loading';
                return next;
            });

            try {
                const handText = handCount === '1' ? 'one hand' : 'two hands';
                const personText = gender === 'female' ? 'a woman' : 'a man';
                const clothingText = vibe === 'blue' ? 'a blue knitted sweater' : 
                                    vibe === 'pink' ? 'a pink knitted sweater' : 
                                    vibe === 'white' ? 'a white linen sleeve' : 
                                    vibe === 'brown' ? 'a brown wool sweater' : 
                                    vibe === 'purple' ? 'a purple velvet sleeve' : 
                                    vibe === 'green' ? 'a sage green sweater' : 'a black techwear sleeve';

                const fullPrompt = `ULTRA-REALISTIC CLOSE-UP POV PRODUCT PHOTOGRAPHY: The camera angle is a close-up shot from a slightly angled front view, positioned at eye-level or slightly higher with a minor top-down angle. The EXACT product from the source image is the absolute central focus, held by ${handText} of ${personText} wearing ${clothingText}. CRITICAL: The hands MUST enter the frame strictly from the bottom-center and front of the image, creating a true first-person POV perspective. DO NOT have hands entering from the left or right sides. The product fills a significant portion of the frame with sharp detail. The lighting features a DRAMATIC AND VISIBLE BRIGHT SPOTLIGHT from the front and a CRISP WHITE OVERHEAD TOP-LIGHT that creates pronounced, visible highlights on the product's edges and surfaces to make it pop intensely. There is a strong lighting contrast between the brightly lit product and the slightly dimmed, subdued background. The background is a ${selectedVibe?.prompt}, and it MUST be HEAVILY blurred with a deep, creamy bokeh effect (shallow depth of field). 8k resolution, professional commercial photography. ${negativePrompt}`;

                const res = await generateSinglePhotoshootImage(
                    sourceImage,
                    fullPrompt,
                    "",
                    aspectRatio
                );

                setResults(prev => {
                    if (!prev) return prev;
                    const next = [...prev];
                    next[i] = { id: i, status: 'done', imageUrl: res.imageUrl };
                    return next;
                });
                incrementUsage();

                // Save to history
                if (auth.currentUser && res.imageUrl) {
                    await saveToHistory(auth.currentUser.uid, {
                        imageUrl: res.imageUrl,
                        type: "Go Setup",
                        prompt: `POV Setup Photoshoot - ${vibe} vibe`
                    });
                }
            } catch (err: any) {
                console.error(`Error slot ${i}:`, err);
                setResults(prev => {
                    if (!prev) return prev;
                    const next = [...prev];
                    next[i] = { 
                        id: i, 
                        status: 'error', 
                        error: err.message?.includes("deskripsi teks") ? "Safety Filter" : "Render Failed" 
                    };
                    return next;
                });
            }

            setProgress(i + 1);

            if (i < 3) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        setIsGenerating(false);
    };

    const handleZoom = (imageUrl: string) => {
        setZoomImage(imageUrl);
        setIsZoomModalOpen(true);
    };

    const handleDownload = (url: string, index: number) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `go-setup-${vibe}-${index + 1}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = () => {
        setSourceImage(null);
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
                title={t('goSetup.page.title')}
                description={t('goSetup.page.description')}
            />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <aside className="w-full lg:w-[400px] flex-shrink-0 lg:sticky lg:top-8 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    
                    <div>
                        <StepHeader 
                            step={1} 
                            title={t('sections.upload.title')}
                            description={t('uploader.productLabel')}
                        />
                        <ImageUploader 
                            onImageUpload={handleImageUpload}
                            uploadedImage={sourceImage ? `data:${sourceImage.mimeType};base64,${sourceImage.base64}` : null}
                            label={t('uploader.imageLabel')}
                            labelKey="uploader.productLabel"
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader 
                            step={2} 
                            title="Rasio Aspek"
                            description="Pilih dimensi foto yang Anda inginkan."
                        />
                        <div className="grid grid-cols-2 gap-2">
                            {(['1:1', '3:4', '9:16', '16:9'] as AspectRatio[]).map(r => (
                                <button 
                                    key={r} 
                                    onClick={() => setAspectRatio(r)} 
                                    disabled={isGenerating}
                                    className={`p-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
                                        aspectRatio === r 
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 border-indigo-500 dark:text-indigo-300 shadow-sm' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {r === '1:1' ? <SquareIcon className="w-4 h-4"/> : (r === '16:9' ? <RectangleHorizontalIcon className="w-4 h-4"/> : <RectangleVerticalIcon className="w-4 h-4"/>)}
                                    <span className="text-sm font-bold">{r}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader 
                            step={3} 
                            title={t('goSetup.sections.handCount.title')}
                            description={t('goSetup.sections.handCount.description')}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            {(['1', '2'] as HandCount[]).map(count => (
                                <button 
                                    key={count} 
                                    onClick={() => setHandCount(count)} 
                                    disabled={isGenerating}
                                    className={`p-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
                                        handCount === count 
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 border-indigo-500 dark:text-indigo-300 shadow-sm' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Hand className="w-4 h-4" />
                                    <span className="text-sm font-bold">{count} {t('goSetup.handOptions.' + (count === '1' ? 'one' : 'two'))}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader 
                            step={4} 
                            title={t('goSetup.sections.gender.title')}
                            description={t('goSetup.sections.gender.description')}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            {(['female', 'male'] as Gender[]).map(g => (
                                <button 
                                    key={g} 
                                    onClick={() => setGender(g)} 
                                    disabled={isGenerating}
                                    className={`p-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
                                        gender === g 
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 border-indigo-500 dark:text-indigo-300 shadow-sm' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm font-bold">{t('goSetup.genders.' + g)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader 
                            step={5} 
                            title={t('goSetup.sections.vibe.title')}
                            description={t('goSetup.sections.vibe.description')}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            {VIBE_OPTIONS.map(opt => (
                                <button 
                                    key={opt.id} 
                                    onClick={() => setVibe(opt.id)} 
                                    disabled={isGenerating}
                                    className={`p-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
                                        vibe === opt.id 
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 border-indigo-500 dark:text-indigo-300 shadow-sm' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className={`w-4 h-4 rounded-full border border-slate-300 ${opt.color}`} />
                                    <span className="text-sm font-bold">{t(opt.nameKey)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !sourceImage}
                            className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden"
                        >
                            {isGenerating ? (
                                <div className="flex items-center gap-3">
                                    <Spinner className="h-5 w-5 text-white" />
                                    <span className="tracking-wide">Rendering ({progress}/4)...</span>
                                </div>
                            ) : (
                                <span className="tracking-wide">{t('goSetup.generateButton')}</span>
                            )}
                        </button>
                        
                        {results && !isGenerating && (
                            <button
                                onClick={handleReset}
                                className="w-full mt-3 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Ulangi Sesi Baru
                            </button>
                        )}
                        
                        {error && (
                            <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>
                        )}
                    </div>
                </aside>

                <section className="flex-1 w-full bg-white dark:bg-gray-900/50 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-sm min-h-[500px]">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-white/10 pb-6">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Setup Gallery</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                {isGenerating ? `Mengerjakan...` : `4 Variasi Foto Setup di Ruangan Pilihan`}
                            </p>
                        </div>
                        {isGenerating && (
                             <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold animate-pulse border border-indigo-100 dark:border-indigo-800/30">
                                <Clock className="w-3 h-3" />
                                <span>Rendering...</span>
                             </div>
                        )}
                    </div>

                    {!results && !isGenerating && (
                        <div className="flex flex-col items-center justify-center h-96 text-slate-400 dark:text-slate-500 text-center">
                             <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-dashed border-slate-200 dark:border-white/10 rotate-3 transition-transform hover:rotate-6">
                                <ImageIcon className="w-8 h-8 opacity-40" />
                             </div>
                            <p className="text-sm font-bold opacity-70">Hasil foto akan muncul di sini.</p>
                        </div>
                    )}

                    {results && (
                        <div className="grid grid-cols-2 gap-4 animate-fade-in">
                            {results.map((result, index) => (
                                <div key={index} className={`group relative ${getAspectRatioClass(aspectRatio)} bg-slate-100 dark:bg-black/20 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl`}>
                                    {result.status === 'waiting' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                                            <Clock className="w-6 h-6 mb-1 opacity-50" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Antre</span>
                                        </div>
                                    )}
                                    {result.status === 'loading' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 animate-pulse">
                                            <Spinner className="h-8 w-8 text-indigo-500" />
                                            <span className="text-[8px] font-black uppercase text-indigo-500 mt-2 tracking-widest">Rendering</span>
                                        </div>
                                    )}
                                    {result.status === 'error' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/10 text-red-500 text-center">
                                            <RefreshCw className="w-6 h-6 mb-2 opacity-50" />
                                            <p className="text-[10px] font-bold uppercase">{result.error || "Gagal"}</p>
                                        </div>
                                    )}
                                    {result.status === 'done' && result.imageUrl && (
                                        <>
                                            <img src={result.imageUrl} alt={`Result ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 backdrop-blur-[2px]">
                                                <div className="flex gap-2 w-full">
                                                    <button onClick={() => handleZoom(result.imageUrl!)} className="flex-1 bg-white/20 hover:bg-white/40 text-white p-2 rounded-xl backdrop-blur-md transition-all flex items-center justify-center"><ZoomIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDownload(result.imageUrl!, index)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-all shadow-lg flex items-center justify-center"><DownloadIcon className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                            <div className="absolute top-2 left-2 pointer-events-none">
                                                <div className="bg-black/40 backdrop-blur-md text-white text-[8px] font-black px-2 py-0.5 rounded-md border border-white/10 uppercase tracking-widest shadow-lg">
                                                    {index + 1}
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
            <ZoomModal 
                isOpen={isZoomModalOpen}
                onClose={() => setIsZoomModalOpen(false)}
                imageUrl={zoomImage || ''}
            />
        </div>
    );
};

export default GoSetup;

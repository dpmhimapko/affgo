
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUsage } from '../contexts/UsageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { UploadedImage } from '../types';
import { generateSinglePhotoshootImage } from '../services/geminiService';
import { Download as DownloadIcon, Eye as ZoomIcon, Square as SquareIcon, RectangleHorizontal as RectangleHorizontalIcon, RectangleVertical as RectangleVerticalIcon, RefreshCw, Clock, Image as ImageIcon, Camera as CameraIcon } from '../components/icons/LucideIcons';
import { ZoomModal } from '../components/ZoomModal';
import { PromoCard } from '../components/PromoCard';
import { auth, saveToHistory } from '../firebase';

type AspectRatio = '1:1' | '3:4' | '9:16' | '16:9';
type Angle = 'eye-level' | 'high-angle' | 'close-up' | 'dutch-angle' | 'detail';

const ANGLE_OPTIONS: { id: Angle; nameKey: string; prompt: string; }[] = [
    { id: 'eye-level', nameKey: 'goKamarAesthetic.angles.eyeLevel', prompt: 'Eye-level shot,' },
    { id: 'high-angle', nameKey: 'goKamarAesthetic.angles.highAngle', prompt: 'High-angle top-down flat lay shot from a distance, showing the entire product clearly,' },
    { id: 'close-up', nameKey: 'goKamarAesthetic.angles.closeUp', prompt: 'Detailed close-up shot,' },
    { id: 'detail', nameKey: 'goKamarAesthetic.angles.detail', prompt: 'Extreme macro photography, focusing on fine textures and intricate product details,' },
    { id: 'dutch-angle', nameKey: 'goKamarAesthetic.angles.dutchAngle', prompt: 'Dutch angle shot,' }
];

type PhotoshootResult = {
    id: number;
    status: 'waiting' | 'loading' | 'done' | 'error';
    imageUrl?: string;
    error?: string;
};

const getKamarAestheticPrompts = () => [
    `Professional product photography of the EXACT product from the source image placed on a soft, thick furry carpet on the floor. The setting is a minimalist bedroom with a large modern mirror and a stylish shoe rack in the background. Bright purple LED lights glow softly from under the curtains. Natural sunlight streams in from a nearby window, creating beautiful sunlight reflections and soft, elegant shadows on the floor and walls. The texture of the clothing fabric is ultra-sharp, with every detail of the outfit clearly visible. 4K quality, relaxed and natural atmosphere.`,
    `A high-end aesthetic catalog photo. The EXACT product from the source image is laid out on a plush white shag rug. The room is a modern minimalist bedroom featuring a large full-length mirror and a neat shoe rack. Vivid purple LED lighting accents the area under the window curtains. Warm natural light from the window casts soft geometric shadows across the room. The photography is professional, capturing sharp fabric textures and clear product details in 4K resolution.`,
    `Cinematic product display in a minimalist aesthetic room. The EXACT product from the source image sits on a luxury furry carpet. In the background, a large mirror reflects the room's clean design, alongside a minimalist shoe rack. Soft purple LED strips provide a modern glow beneath the curtains. Natural window light creates a serene mood with soft sunlight shadows on the floor. Ultra-sharp 4K photography, showing every intricate detail and texture of the product.`,
    `A professional flat lay photoshoot of the EXACT product from the source image on a soft furry rug. The background shows a minimalist bedroom interior with a large mirror, a shoe rack, and bright purple LED lighting under the curtains. Natural sunlight enters from the side, creating soft, natural shadows and a cozy atmosphere. The image is ultra-sharp 4K, with high-fidelity textures and clear details, looking professional and natural.`
];

export const GoKamarAesthetic: React.FC = () => {
    const { t } = useLanguage();
    const { incrementUsage } = useUsage();
    
    // State
    const [sourceImage, setSourceImage] = useState<UploadedImage | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
    const [angle, setAngle] = useState<Angle>('high-angle');
    
    const [results, setResults] = useState<PhotoshootResult[] | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    
    // Zoom state
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    // Handlers
    const handleImageUpload = (dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        setSourceImage({ base64, mimeType, name: 'source' });
        setResults(null);
        setError(null);
        setProgress(0);
    };

    const handleGenerate = async () => {
        if (!sourceImage) {
            setError(t('goKamarAesthetic.errors.noImage'));
            return;
        }

        setIsGenerating(true);
        setError(null);
        setProgress(0);
        
        const prompts = getKamarAestheticPrompts();
        const initialResults: PhotoshootResult[] = prompts.map((_, i) => ({
            id: i,
            status: 'waiting'
        }));
        setResults(initialResults);

        const totalImages = prompts.length;
        const negativePrompt = " Ensure there is absolutely no text, writing, words, numbers, or watermarks in the final image. No stickers, no blurry textures, no distorted products.";
        const selectedAnglePrompt = ANGLE_OPTIONS.find(a => a.id === angle)?.prompt || '';

        for (let i = 0; i < totalImages; i++) {
            setResults(prev => {
                if (!prev) return prev;
                const next = [...prev];
                next[i].status = 'loading';
                return next;
            });

            try {
                const fullPrompt = `ULTRA-REALISTIC AESTHETIC PHOTOGRAPHY: ${selectedAnglePrompt} ${prompts[i]} ${negativePrompt}`;

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
                        type: "Go Kamar Aesthetic",
                        prompt: `Kamar Aesthetic - ${angle} angle`
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

            if (i < totalImages - 1) {
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
        link.download = `go-kamar-aesthetic-${index + 1}-${Date.now()}.png`;
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
            default: return 'aspect-[3/4]';
        }
    };

    return (
        <div className="w-full">
            <FeatureHeader
                title={t('goKamarAesthetic.page.title')}
                description={t('goKamarAesthetic.page.description')}
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
                            title={t('goKamarAesthetic.sections.angle.title')}
                            description={t('goKamarAesthetic.sections.angle.description')}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            {ANGLE_OPTIONS.map(opt => (
                                <button 
                                    key={opt.id} 
                                    onClick={() => setAngle(opt.id)} 
                                    disabled={isGenerating}
                                    className={`p-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
                                        angle === opt.id 
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 border-indigo-500 dark:text-indigo-300 shadow-sm' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <CameraIcon className="w-4 h-4"/>
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
                                <span className="tracking-wide">{t('goKamarAesthetic.generateButton')}</span>
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
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Kamar Aesthetic Gallery</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                {isGenerating ? `Mengerjakan...` : `4 Variasi Foto Kamar Minimalis & LED Ungu`}
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
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3 backdrop-blur-[1px]">
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

export default GoKamarAesthetic;

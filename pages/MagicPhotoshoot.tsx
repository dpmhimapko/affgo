
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { UploadedImage } from '../types';
import { generateSinglePhotoshootImage } from '../services/geminiService';
import { Download as DownloadIcon, Eye as ZoomIcon, Square as SquareIcon, RectangleHorizontal as RectangleHorizontalIcon, RectangleVertical as RectangleVerticalIcon, RefreshCw, Clock, Image as ImageIcon } from '../components/icons/LucideIcons';
import { ZoomModal } from '../components/ZoomModal';
import { PromoCard } from '../components/PromoCard';

type AspectRatio = '1:1' | '3:4' | '9:16' | '16:9';

type PhotoshootResult = {
    id: number;
    status: 'waiting' | 'loading' | 'done' | 'error';
    imageUrl?: string;
    error?: string;
};

const NEW_BASE_PROMPTS = [
    "Korean-style studio portrait, posing by gently leaning against a wall, with soft, cinematic morning light streaming from a large window, creating a serene mood.",
    "A chic Korean fashion photoshoot in a dynamic walking motion pose, illuminated with dreamy, soft-focus lighting and a gentle lens flare for a cinematic feel.",
    "Clean K-beauty style headshot with one hand gently touching the chin, featuring flawless, glowing 'glass skin' lighting that feels both cute and high-end.",
    "An aesthetic studio photo with a candid smile, posing while sitting on the floor, with playful, colorful gel lighting (pink and blue hues) casting soft shadows on a backdrop.",
    "K-drama inspired character portrait looking thoughtfully over their shoulder, with dramatic, moody cinematic lighting creating high contrast, using a vintage film camera as a prop.",
    "An elegant, classic black and white portrait with a powerful yet relaxed pose, using Rembrandt-style lighting for a dramatic, cinematic effect, sitting on a modern minimalist chair."
];

export const MagicPhotoshoot: React.FC = () => {
    const { t } = useLanguage();
    
    // State
    const [sourceImage, setSourceImage] = useState<UploadedImage | null>(null);
    const [customTheme, setCustomTheme] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
    
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
            setError(t('magicPhotoshoot.errors.noImage'));
            return;
        }

        setIsGenerating(true);
        setError(null);
        setProgress(0);
        
        const initialResults: PhotoshootResult[] = NEW_BASE_PROMPTS.map((_, i) => ({
            id: i,
            status: 'waiting'
        }));
        setResults(initialResults);

        const totalImages = NEW_BASE_PROMPTS.length;
        const negativePrompt = " High quality, photorealistic, masterwork. Ensure there is absolutely no text, writing, words, numbers, or watermarks in the final image.";

        for (let i = 0; i < totalImages; i++) {
            setResults(prev => {
                if (!prev) return prev;
                const next = [...prev];
                next[i].status = 'loading';
                return next;
            });

            try {
                let finalBasePrompt = NEW_BASE_PROMPTS[i];
                let fullPrompt = "";
                
                if (customTheme.trim()) {
                    fullPrompt = `A realistic, elegant Korean-style studio photoshoot of the person in the image, focusing on the theme of '${customTheme}'. ${finalBasePrompt}${negativePrompt}`;
                } else {
                    fullPrompt = `${finalBasePrompt}${negativePrompt}`;
                }

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
                await new Promise(resolve => setTimeout(resolve, 1200));
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
        link.download = `magic-photoshoot-${index + 1}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = () => {
        setSourceImage(null);
        setResults(null);
        setCustomTheme('');
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

    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";

    return (
        <div className="w-full">
            <FeatureHeader
                title={t('magicPhotoshoot.page.title')}
                description={t('magicPhotoshoot.page.description')}
            />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <aside className="w-full lg:w-[400px] flex-shrink-0 lg:sticky lg:top-8 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    
                    <div>
                        <StepHeader 
                            step={1} 
                            title={t('magicPhotoshoot.sections.upload.title')}
                            description={t('magicPhotoshoot.sections.upload.subtitle')}
                        />
                        <ImageUploader 
                            onImageUpload={handleImageUpload}
                            uploadedImage={sourceImage ? `data:${sourceImage.mimeType};base64,${sourceImage.base64}` : null}
                            label={t('uploader.imageLabel')}
                            labelKey="uploader.imageLabel"
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
                            title={t('magicPhotoshoot.sections.theme.title')}
                            description={t('magicPhotoshoot.sections.theme.subtitle')}
                        />
                        <textarea
                            rows={3}
                            className={inputClasses}
                            placeholder={t('magicPhotoshoot.form.customTheme.placeholder')}
                            value={customTheme}
                            onChange={(e) => setCustomTheme(e.target.value)}
                            disabled={isGenerating}
                        />
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
                                    <span className="tracking-wide">Sekuensial Render ({progress}/6)...</span>
                                </div>
                            ) : (
                                <span className="tracking-wide">{t('magicPhotoshoot.generateButton')}</span>
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

                <section className="flex-1 w-full bg-white dark:bg-gray-900/50 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm min-h-[500px]">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-white/10 pb-6">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Studio Gallery</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                {isGenerating ? `Mengerjakan Antrean Foto...` : `6 Variasi Photoshoot Premium`}
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
                            <p className="text-sm font-bold opacity-70">Harap unggah foto dan klik tombol generate untuk memulai antrean.</p>
                        </div>
                    )}

                    {results && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-in">
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

export default MagicPhotoshoot;

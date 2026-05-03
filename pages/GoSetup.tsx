
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUsage } from '../contexts/UsageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { UploadedImage } from '../types';
import { generateSinglePhotoshootImage } from '../services/geminiService';
import { Download as DownloadIcon, Eye as ZoomIcon, Square as SquareIcon, RectangleHorizontal as RectangleHorizontalIcon, RectangleVertical as RectangleVerticalIcon, RefreshCw, Clock, Image as ImageIcon, Hand, Users, Copy as CopyIcon, Check as CheckIcon, X as CloseIcon, FileText } from '../components/icons/LucideIcons';
import { ZoomModal } from '../components/ZoomModal';
import { PromoCard } from '../components/PromoCard';
import { auth, saveToHistory } from '../firebase';

type AspectRatio = '1:1' | '3:4' | '9:16' | '16:9';
type Vibe = 'pink' | 'blue' | 'white' | 'brown' | 'purple' | 'green' | 'black' | 'aesthetic';
type HandCount = '1' | '2' | 'compare';
type Gender = 'female' | 'male';
type Motion = 'subtleWiggle' | 'gentleTilt' | 'slowRotation' | 'stillLife' | 'cinematicShowcase';

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
    },
    { 
        id: 'aesthetic', 
        nameKey: 'goSetup.vibes.aesthetic', 
        color: 'bg-orange-100',
        prompt: 'Warm and soft aesthetic minimalist desk decoration. Center: pleated cream table lamp emitting a very bright, glowing, and intense warm yellow light. CRITICAL: The overall scene and room lighting MUST be bright white, clear, and professional, NOT yellow; the warm yellow light should only glow from the lamp itself. Right of lamp: transparent glass vase with three white tulips. Front of lamp: white bubble candle on a small round wooden base. Left: a clearly visible aesthetic poster with a beautiful artistic design in a small gold photo frame standing on a mini wooden easel. Bottom right: small pink glass container with lid. Table surface: white textured fabric with subtle patterns. Background: plain beige/cream wall. Overall bright, clean, and Instagramable aesthetic.' 
    }
];

const MOTION_OPTIONS: { id: Motion; nameKey: string; prompt: string; }[] = [
    { id: 'subtleWiggle', nameKey: 'goSetup.motions.subtleWiggle', prompt: 'subtle wiggle movement' },
    { id: 'gentleTilt', nameKey: 'goSetup.motions.gentleTilt', prompt: 'gentle tilting motion' },
    { id: 'slowRotation', nameKey: 'goSetup.motions.slowRotation', prompt: 'slow rotation' },
    { id: 'stillLife', nameKey: 'goSetup.motions.stillLife', prompt: 'still life cinematic shot' },
    { id: 'cinematicShowcase', nameKey: 'goSetup.motions.cinematicShowcase', prompt: 'cinematic product showcase: start with subtle wiggle, then move the product closer to the camera to show it, then subtle wiggle again. Keep the front of the product facing the camera at all times, DO NOT rotate or flip to show the back.' }
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
    
    const [sourceImages, setSourceImages] = useState<UploadedImage[]>([]);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
    const [vibe, setVibe] = useState<Vibe>('blue');
    const [handCount, setHandCount] = useState<HandCount>('1');
    const [gender, setGender] = useState<Gender>('female');
    const [motion, setMotion] = useState<Motion>('subtleWiggle');
    const [brief, setBrief] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    
    const [results, setResults] = useState<PhotoshootResult[] | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const handleImageUpload = (index: number, dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        const newImages = [...sourceImages];
        newImages[index] = { base64, mimeType, name: `source-${index}` };
        setSourceImages(newImages);
        setResults(null);
        setError(null);
        setProgress(0);
    };

    const removeImage = (index: number) => {
        const newImages = [...sourceImages];
        newImages.splice(index, 1);
        setSourceImages(newImages.filter(img => img !== undefined));
        setResults(null);
    };

    const handleGenerate = async () => {
        if (sourceImages.length === 0) {
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
        const selectedMotion = MOTION_OPTIONS.find(m => m.id === motion);
        const negativePrompt = " Ensure there is absolutely no text, writing, words, numbers, or watermarks in the final image. No stickers, high fidelity textures.";

        for (let i = 0; i < 4; i++) {
            setResults(prev => {
                if (!prev) return prev;
                const next = [...prev];
                next[i].status = 'loading';
                return next;
            });

            try {
                const personText = gender === 'female' ? 'a woman' : 'a man';
                const clothingText = vibe === 'blue' ? 'a blue knitted sweater' : 
                                    vibe === 'pink' ? 'a pink knitted sweater' : 
                                    vibe === 'white' ? 'a white linen sleeve' : 
                                    vibe === 'brown' ? 'a brown wool sweater' : 
                                    vibe === 'purple' ? 'a purple velvet sleeve' : 
                                    vibe === 'green' ? 'a sage green sweater' : 
                                    vibe === 'aesthetic' ? 'a cream-colored soft knitted sweater' : 'a black techwear sleeve';

                let fullPrompt = "";
                const productCount = sourceImages.length;

                if (productCount === 1) {
                    const handText = handCount === '1' ? 'one hand' : 'two hands';
                    fullPrompt = `ULTRA-REALISTIC CLOSE-UP POV PRODUCT PHOTOGRAPHY: The camera angle is a close-up shot from a slightly angled front view, positioned at eye-level or slightly higher with a minor top-down angle. The EXACT product from the source image is the absolute central focus, positioned precisely in the center of the frame. The product is held by ${handText} of ${personText} wearing ${clothingText}. CRITICAL: The hands MUST enter the frame strictly from the bottom-center and front of the image, lifting the product up to the center of the screen to create a true first-person POV perspective. DO NOT have hands entering from the left or right sides. The product fills a significant portion of the frame with sharp detail. The lighting is EXTREMELY BRIGHT AND VIBRANT, as if illuminated by high-wattage professional studio lamps. The scene features a POWERFUL FRONT KEY LIGHT and a BRILLIANT OVERHEAD TOP-LIGHT that eliminates deep shadows and creates intense, sparkling highlights on the product's surfaces, making it look luminous and crystal clear. The background is a ${selectedVibe?.prompt}, and it MUST be HEAVILY blurred with a deep, creamy bokeh effect (shallow depth of field). ${brief ? `ADDITIONAL USER REQUEST: ${brief}` : ''} 8k resolution, professional commercial photography. ${negativePrompt}`;
                } else if (productCount === 2) {
                    fullPrompt = `ULTRA-REALISTIC CLOSE-UP POV PRODUCT COMPARISON PHOTOGRAPHY: The camera angle is a close-up shot from a slightly angled front view, positioned at eye-level. Two different products from the source images are being compared. One product is held in the left hand and the other product is held in the right hand of ${personText} wearing ${clothingText}. CRITICAL: The products MUST be positioned in the center of the frame. The hands MUST enter the frame from the bottom-center, lifting the products up to the center to create a true first-person POV perspective. Both products fill a significant portion of the frame with sharp detail. The lighting is EXTREMELY BRIGHT AND VIBRANT, as if illuminated by high-wattage professional studio lamps. The background is a ${selectedVibe?.prompt}, and it MUST be HEAVILY blurred with a deep, creamy bokeh effect (shallow depth of field). ${brief ? `ADDITIONAL USER REQUEST: ${brief}` : ''} 8k resolution, professional commercial photography. ${negativePrompt}`;
                } else if (productCount === 3) {
                    fullPrompt = `ULTRA-REALISTIC CLOSE-UP POV PRODUCT PHOTOGRAPHY: A first-person POV shot of ${personText} wearing ${clothingText}. Two products are held in the hands (one in left, one in right) and lifted to the center of the frame. A THIRD product from the source images is placed neatly on the table in the background, positioned slightly behind and between the hands, clearly visible. The camera is focused on the products in the hands. The lighting is EXTREMELY BRIGHT AND VIBRANT. The background is a ${selectedVibe?.prompt}, and it MUST be HEAVILY blurred with a deep, creamy bokeh effect (shallow depth of field). ${brief ? `ADDITIONAL USER REQUEST: ${brief}` : ''} 8k resolution, professional commercial photography. ${negativePrompt}`;
                } else if (productCount === 4) {
                    fullPrompt = `ULTRA-REALISTIC CLOSE-UP POV PRODUCT PHOTOGRAPHY: A first-person POV shot of ${personText} wearing ${clothingText}. Two products are held in the hands (one in left, one in right) and lifted to the center of the frame. TWO ADDITIONAL products from the source images are placed neatly on the table in the background, one on the left and one on the right behind the hands, both clearly visible. The camera is focused on the products in the hands. The lighting is EXTREMELY BRIGHT AND VIBRANT. The background is a ${selectedVibe?.prompt}, and it MUST be HEAVILY blurred with a deep, creamy bokeh effect (shallow depth of field). ${brief ? `ADDITIONAL USER REQUEST: ${brief}` : ''} 8k resolution, professional commercial photography. ${negativePrompt}`;
                }

                const res = await generateSinglePhotoshootImage(
                    sourceImages,
                    fullPrompt,
                    "",
                    aspectRatio
                );

                const videoPrompt = `${selectedMotion?.prompt}, high-quality cinematic video, smooth motion, 4k.`;

                setResults(prev => {
                    if (!prev) return prev;
                    const next = [...prev];
                    next[i] = { id: i, status: 'done', imageUrl: res.imageUrl, videoPrompt: videoPrompt };
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
        setSourceImages([]);
        setBrief('');
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
                    
                    <div className="space-y-4">
                        <StepHeader 
                            step={1} 
                            title={t('sections.upload.title')}
                            description="Upload hingga 4 produk. 2 akan dipegang, sisanya di meja."
                        />
                        <div className="grid grid-cols-2 gap-3">
                            {[0, 1, 2, 3].map((idx) => (
                                <div key={idx} className="relative">
                                    <ImageUploader 
                                        onImageUpload={(dataUrl, mimeType) => handleImageUpload(idx, dataUrl, mimeType)}
                                        uploadedImage={sourceImages[idx] ? `data:${sourceImages[idx].mimeType};base64,${sourceImages[idx].base64}` : null}
                                        label={`Produk ${idx + 1}`}
                                        compact={true}
                                    />
                                    {sourceImages[idx] && (
                                        <button 
                                            onClick={() => removeImage(idx)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                        >
                                            <CloseIcon className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
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
                            {(['1', '2', 'compare'] as HandCount[]).map(count => (
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
                                    <span className="text-[10px] font-black uppercase">{t('goSetup.handOptions.' + (count === '1' ? 'one' : count === '2' ? 'two' : 'compare'))}</span>
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

                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader 
                            step={6} 
                            title={t('goSetup.sections.motion.title')}
                            description={t('goSetup.sections.motion.description')}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            {MOTION_OPTIONS.map(opt => (
                                <button 
                                    key={opt.id} 
                                    onClick={() => setMotion(opt.id)} 
                                    disabled={isGenerating}
                                    className={`p-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
                                        motion === opt.id 
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 border-indigo-500 dark:text-indigo-300 shadow-sm' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-bold">{t(opt.nameKey)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader 
                            step={7} 
                            title="Briefing Tambahan"
                            description="Tulis permintaan khusus Anda di sini."
                        />
                        <textarea
                            value={brief}
                            onChange={(e) => setBrief(e.target.value)}
                            placeholder="Contoh: Tambahkan hiasan bunga mawar di meja, atau buat pencahayaan lebih redup..."
                            disabled={isGenerating}
                            className="w-full h-24 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader 
                            step={7} 
                            title="Briefing Tambahan"
                            description="Tulis permintaan khusus Anda di sini."
                        />
                        <textarea
                            value={brief}
                            onChange={(e) => setBrief(e.target.value)}
                            placeholder="Contoh: Tambahkan hiasan bunga mawar di meja, atau buat pencahayaan lebih redup..."
                            disabled={isGenerating}
                            className="w-full h-24 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || sourceImages.length === 0}
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
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 backdrop-blur-[1px]">
                                                <div className="flex gap-2 w-full mb-2">
                                                    <button onClick={() => handleZoom(result.imageUrl!)} className="flex-1 bg-white/20 hover:bg-white/40 text-white p-2 rounded-xl backdrop-blur-md transition-all flex items-center justify-center"><ZoomIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDownload(result.imageUrl!, index)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-all shadow-lg flex items-center justify-center"><DownloadIcon className="w-4 h-4" /></button>
                                                </div>
                                                {result.videoPrompt && (
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(result.videoPrompt!);
                                                            setCopiedId(index);
                                                            setTimeout(() => setCopiedId(null), 2000);
                                                        }}
                                                        className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-xl backdrop-blur-md transition-all flex items-center justify-center gap-2 text-[10px] font-bold"
                                                    >
                                                        {copiedId === index ? <CheckIcon className="w-3 h-3 text-green-400" /> : <CopyIcon className="w-3 h-3" />}
                                                        {copiedId === index ? "Tersalin!" : "Salin Prompt Video"}
                                                    </button>
                                                )}
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

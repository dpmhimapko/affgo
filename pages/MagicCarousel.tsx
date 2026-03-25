
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadedImage } from '../types';
import { generateCarouselDetails, generateCarouselScript, generateCarouselSlide } from '../services/geminiService';
import { 
    Wand2, X, Square, RectangleHorizontal, RectangleVertical, Download, Sparkles, GalleryHorizontal,
    AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter, ChevronLeft, ChevronRight, PackagePlus,
    Type as TypeIcon, Settings, PenSquare
} from '../components/icons/LucideIcons';
import { InfoIcon } from '../components/icons/InfoIcon';
import Loader from '../components/Loader';
import UniversalModal from '../components/UniversalModal';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { PromoCard } from '../components/PromoCard';

declare const JSZip: any;
declare const saveAs: any;
declare const heic2any: any;

const convertHeicToJpg = async (file: File): Promise<File> => {
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type.toLowerCase() === 'image/heic';
    if (isHeic && typeof heic2any !== 'undefined') {
        try {
            const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
            const finalBlob = Array.isArray(result) ? result[0] : result;
            const fileName = file.name.replace(/\.heic$/i, '.jpg');
            return new File([finalBlob as Blob], fileName, { type: 'image/jpeg' });
        } catch (error) {
            console.error("HEIC conversion failed:", error);
            alert("Gagal mengonversi file HEIC. Harap gunakan JPG atau PNG.");
            throw new Error("HEIC conversion failed");
        }
    }
    return file;
};

const OptionButton: React.FC<{
    onClick: () => void;
    selected: boolean;
    children: React.ReactNode;
    className?: string;
    title?: string;
    style?: React.CSSProperties;
}> = ({ onClick, selected, children, className = '', title, style }) => (
    <button onClick={onClick} className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
        selected
            ? 'bg-violet-50 dark:bg-violet-900/30 border-violet-500 text-violet-700 dark:text-violet-300 shadow-sm'
            : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-violet-300'
    } ${className}`} title={title} style={style}>
        {children}
    </button>
);

const CarouselImageUploader: React.FC<{ onUpload: (file: File) => void }> = ({ onUpload }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) onUpload(e.target.files[0]);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) onUpload(e.dataTransfer.files[0]);
    };

    return (
        <label
            className={`w-full h-48 rounded-2xl border-2 border-dashed flex items-center justify-center relative cursor-pointer transition-all ${
                isDragging 
                ? 'border-violet-500 bg-violet-50/50' 
                : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-white/5 hover:border-violet-400 hover:bg-white dark:hover:bg-white/10'
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="text-center text-slate-500 p-2">
                <PackagePlus className="mx-auto h-10 w-10 mb-2" />
                <p className="text-sm font-semibold">Klik atau seret foto</p>
            </div>
            <input type="file" ref={inputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp, .heic, .HEIC" />
        </label>
    );
};

const MagicCarousel: React.FC = () => {
    const [productImage, setProductImage] = useState<UploadedImage & { dataUrl: string } | null>(null);
    const [productName, setProductName] = useState('');
    const [productDesc, setProductDesc] = useState('');
    const [slideCount, setSlideCount] = useState(5);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [visualStyle, setVisualStyle] = useState('Minimalis & Cerah');
    const [isTextMode, setIsTextMode] = useState(true);
    const [scriptType, setScriptType] = useState('showcase');
    const [customScriptType, setCustomScriptType] = useState('');
    const [script, setScript] = useState<string[]>(Array(5).fill(''));
    const [textPosition, setTextPosition] = useState('bottom-center');
    const [fontFamily, setFontFamily] = useState("'Poppins', sans-serif");
    const [fontColor, setFontColor] = useState('auto');
    const [autoFontColor, setAutoFontColor] = useState('#FFFFFF');
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [loadingMessage, setLoadingMessage] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [modal, setModal] = useState<{ isOpen: boolean, title: string, content: React.ReactNode }>({ isOpen: false, title: '', content: null });
    
    const [nameTooltipVisible, setNameTooltipVisible] = useState(false);
    const [scriptTooltipVisible, setScriptTooltipVisible] = useState(false);
    const nameTooltipTimeout = useRef<number | null>(null);
    const scriptTooltipTimeout = useRef<number | null>(null);

    const showTooltip = (setter: React.Dispatch<React.SetStateAction<boolean>>, timeoutRef: React.MutableRefObject<number | null>) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setter(true);
        timeoutRef.current = window.setTimeout(() => setter(false), 3000);
    };

    const isGenerateDisabled = useMemo(() => {
        if (!productImage || !productName.trim() || !productDesc.trim()) return true;
        return Object.values(isLoading).some(v => v);
    }, [productImage, productName, productDesc, isLoading]);

    const isAutoDetailsDisabled = !productImage || isLoading.details;
    const isAutoScriptDisabled = !productImage || !productName.trim() || !productDesc.trim() || isLoading.script;

    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";

    useEffect(() => {
        setScript(prev => {
            const newScript = Array(slideCount).fill('');
            prev.forEach((s, i) => { if (i < slideCount) newScript[i] = s; });
            return newScript;
        });
    }, [slideCount]);
    
     useEffect(() => {
        if (isAutoDetailsDisabled) {
            setNameTooltipVisible(false);
            if (nameTooltipTimeout.current) clearTimeout(nameTooltipTimeout.current);
        } else {
            showTooltip(setNameTooltipVisible, nameTooltipTimeout);
        }
    }, [isAutoDetailsDisabled]);

    useEffect(() => {
        if (isAutoScriptDisabled) {
            setScriptTooltipVisible(false);
            if (scriptTooltipTimeout.current) clearTimeout(scriptTooltipTimeout.current);
        } else {
            showTooltip(setScriptTooltipVisible, scriptTooltipTimeout);
        }
    }, [isAutoScriptDisabled]);

    const handleImageUpload = async (file: File) => {
        try {
            const processedFile = await convertHeicToJpg(file);
            const reader = new FileReader();
            reader.onload = e => {
                const dataUrl = e.target?.result as string;
                const [header, base64] = dataUrl.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
                setProductImage({ base64, mimeType, name: processedFile.name, dataUrl });
            };
            reader.readAsDataURL(processedFile);
        } catch (error) {
            console.error("Gagal memproses gambar:", error);
        }
    };
    
     const analyzeImageColor = async (imageData: UploadedImage & { dataUrl: string }) => {
        try {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                const sampleSize = 50;
                canvas.width = sampleSize;
                canvas.height = sampleSize;
                ctx.drawImage(img, img.width * 0.25, img.height * 0.7, img.width * 0.5, img.height * 0.3, 0, 0, sampleSize, sampleSize);
                const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
                let totalBrightness = 0;
                for (let i = 0; i < data.length; i += 4) {
                    totalBrightness += (0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
                }
                const avgBrightness = totalBrightness / (data.length / 4);
                setAutoFontColor(avgBrightness > 127.5 ? '#0f172a' : '#FFFFFF');
            };
            img.src = imageData.dataUrl;
        } catch (e) {
            setAutoFontColor('#FFFFFF');
        }
    };

    useEffect(() => {
        if (productImage) {
            analyzeImageColor(productImage);
        }
    }, [productImage]);

    const handleGenerateDetails = async () => {
        if (!productImage) return;
        setIsLoading(p => ({ ...p, details: true }));
        try {
            const details = await generateCarouselDetails(productImage);
            setProductName(details.productName);
            setProductDesc(details.shortDescription);
        } catch (e) {
             setModal({ isOpen: true, title: 'Gagal', content: <p>{e instanceof Error ? e.message : 'Terjadi kesalahan'}</p> });
        } finally {
            setIsLoading(p => ({ ...p, details: false }));
        }
    };
    
    const handleGenerateScript = async () => {
        if (isAutoScriptDisabled) return;
        setIsLoading(p => ({ ...p, script: true }));
        const type = scriptType === 'kustom' ? customScriptType : scriptType;
        try {
            const scripts = await generateCarouselScript(productName, productDesc, type, slideCount);
            setScript(scripts);
        } catch (e) {
            setModal({ isOpen: true, title: 'Gagal', content: <p>{e instanceof Error ? e.message : 'Terjadi kesalahan'}</p> });
        } finally {
            setIsLoading(p => ({ ...p, script: false }));
        }
    };

    const handleGenerateCarousel = async () => {
        if (isGenerateDisabled) return;
        setIsLoading(p => ({ ...p, carousel: true }));
        setResults([]);
        
        try {
            const slidesData: any[] = [];
            for (let i = 0; i < slideCount; i++) {
                setLoadingMessage(`Membuat Slide (${i + 1}/${slideCount})`);
                const result = await generateCarouselSlide(productImage!, i + 1, visualStyle, aspectRatio, isTextMode);
                slidesData.push({
                    src: result.imageUrl,
                    text: isTextMode ? (script[i] || '') : '',
                    position: textPosition,
                    font: fontFamily,
                    fontColor: fontColor === 'auto' ? autoFontColor : fontColor
                });
            }
            const carouselResult = {
                id: `carousel-${Date.now()}`,
                productName,
                style: visualStyle,
                aspectRatio,
                slides: slidesData,
            };
            setResults(prev => [...prev, carouselResult]);
        } catch (e) {
            setModal({ isOpen: true, title: 'Gagal Membuat Carousel', content: <p>{e instanceof Error ? e.message : 'Terjadi kesalahan'}</p> });
        } finally {
            setIsLoading(p => ({ ...p, carousel: false }));
            setLoadingMessage('');
        }
    };
    
    return (
        <div className="w-full">
            <FeatureHeader
                title="Go Carousel"
                description="Unggah satu foto produk, dan biarkan AI membuatkan satu set carousel yang menarik untuk media sosial atau marketplace Anda."
            />
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <aside className="lg:col-span-2 lg:sticky top-8 self-start space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col gap-6">
                        <div>
                            <StepHeader step={1} title="Unggah Gambar" />
                            {productImage ? (
                                <div className="relative">
                                    <img src={productImage.dataUrl} className="w-full h-48 object-contain rounded-2xl bg-slate-100 dark:bg-black/20" />
                                    <button onClick={() => setProductImage(null)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 z-10 shadow-md"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <CarouselImageUploader onUpload={handleImageUpload} />
                            )}
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <StepHeader step={2} title="Nama & Deskripsi" />
                                <div className="relative mb-6">
                                    <button onClick={handleGenerateDetails} disabled={isAutoDetailsDisabled} className="flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-800 transition disabled:opacity-50">
                                        {isLoading.details ? <div className="animate-spin w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full"></div> : <Wand2 className="w-4 h-4" />}
                                        <span>Otomatis</span>
                                    </button>
                                    <AnimatePresence>
                                    {nameTooltipVisible && (
                                        <motion.div initial={{opacity: 0, y:5}} animate={{opacity: 1, y:0}} exit={{opacity:0, y:5}} className="absolute bottom-full right-0 mb-2 p-2 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-10">
                                            Klik untuk buat nama & deskripsi otomatis
                                        </motion.div>
                                    )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="Nama Produk..." className={inputClasses} />
                                <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)} rows={2} placeholder="Deskripsi singkat produk..." className={inputClasses}></textarea>
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                            <StepHeader step={3} title="Pengaturan" />
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-xs mb-2 text-slate-600 dark:text-slate-400">Jumlah Slide</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[3, 5, 7].map(n => <OptionButton key={n} onClick={() => setSlideCount(n)} selected={slideCount === n} className="!p-2 text-sm flex items-center justify-center">{n}</OptionButton>)}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-xs mb-2 text-slate-600 dark:text-slate-400">Aspek Rasio</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            <OptionButton onClick={() => setAspectRatio('1:1')} selected={aspectRatio === '1:1'} className="!p-2 flex items-center justify-center"><Square className="w-4 h-4" /></OptionButton>
                                            <OptionButton onClick={() => setAspectRatio('16:9')} selected={aspectRatio === '16:9'} className="!p-2 flex items-center justify-center"><RectangleHorizontal className="w-4 h-4" /></OptionButton>
                                            <OptionButton onClick={() => setAspectRatio('9:16')} selected={aspectRatio === '9:16'} className="!p-2 flex items-center justify-center"><RectangleVertical className="w-4 h-4" /></OptionButton>
                                        </div>
                                    </div>
                                </div>
                                    <div>
                                    <h4 className="font-medium text-xs mb-2 text-slate-600 dark:text-slate-400">Tampilan</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                            {['Minimalis & Cerah', 'Elegan & Mewah', 'Modern & Gelap', 'Warna-warni & Ceria'].map(s => <OptionButton key={s} onClick={() => setVisualStyle(s)} selected={visualStyle === s} className="flex items-center justify-center text-center">{s.split(' &')[0]}</OptionButton>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <StepHeader step={4} title="Tulis Konten" />
                                    <label className="relative inline-flex items-center cursor-pointer mb-6">
                                    <input type="checkbox" checked={isTextMode} onChange={() => setIsTextMode(!isTextMode)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                                </label>
                            </div>
                            <AnimatePresence>
                            {isTextMode && (
                                <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="overflow-hidden space-y-3">
                                    <div className="flex justify-between items-center mt-2">
                                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Script Konten</h4>
                                            <div className="relative">
                                                <button onClick={handleGenerateScript} disabled={isAutoScriptDisabled} className="flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-800 transition disabled:opacity-50">
                                                    {isLoading.script ? <div className="animate-spin w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full"></div> : <Wand2 className="w-4 h-4" />}
                                                    <span>Buat Script</span>
                                                </button>
                                                <AnimatePresence>
                                                {scriptTooltipVisible && (
                                                    <motion.div initial={{opacity: 0, y:5}} animate={{opacity: 1, y:0}} exit={{opacity:0, y:5}} className="absolute bottom-full right-0 mb-2 p-2 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-10">
                                                        Klik untuk bikin konten slide otomatis
                                                    </motion.div>
                                                )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                            {['showcase', 'edukasi', 'storytelling', 'kustom'].map(s => <OptionButton key={s} onClick={() => setScriptType(s)} selected={scriptType === s} className="flex items-center justify-center">{s}</OptionButton>)}
                                        </div>
                                        {scriptType === 'kustom' && <input type="text" value={customScriptType} onChange={e => setCustomScriptType(e.target.value)} placeholder="Tulis jenis script kustom..." className={inputClasses} />}
                                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            {script.map((s, i) => (
                                                <div key={i}>
                                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Slide {i + 1}</label>
                                                    <textarea value={s} onChange={e => setScript(prev => { const next = [...prev]; next[i] = e.target.value; return next; })} rows={2} placeholder="Isi manual atau buat otomatis..." className={inputClasses} />
                                                </div>
                                            ))}
                                        </div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>

                        <AnimatePresence>
                        {isTextMode && (
                            <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="overflow-hidden space-y-3 pt-6 border-t border-gray-100 dark:border-white/10">
                                <StepHeader step={5} title="Atur Teks" />
                                <div className="grid grid-cols-1 gap-y-4">
                                    <div>
                                        <h4 className="font-medium text-xs mb-2 text-slate-600 dark:text-slate-400">Posisi Tulisan</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            <OptionButton onClick={() => setTextPosition('top-center')} selected={textPosition === 'top-center'} className="!p-2 flex items-center justify-center" title="Teks di Atas"><AlignHorizontalJustifyCenter className="w-4 h-4 -rotate-90" /></OptionButton>
                                            <OptionButton onClick={() => setTextPosition('middle-center')} selected={textPosition === 'middle-center'} className="!p-2 flex items-center justify-center" title="Teks di Tengah"><AlignVerticalJustifyCenter className="w-4 h-4" /></OptionButton>
                                            <OptionButton onClick={() => setTextPosition('bottom-center')} selected={textPosition === 'bottom-center'} className="!p-2 flex items-center justify-center" title="Teks di Bawah"><AlignHorizontalJustifyCenter className="w-4 h-4 rotate-90" /></OptionButton>
                                        </div>
                                    </div>
                                        <div>
                                        <h4 className="font-medium text-xs mb-2 text-slate-600 dark:text-slate-400">Jenis Font</h4>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <OptionButton onClick={() => setFontFamily("'Poppins', sans-serif")} selected={fontFamily.includes('Poppins')} style={{fontFamily: "'Poppins', sans-serif"}} className="flex items-center justify-center">Modern</OptionButton>
                                            <OptionButton onClick={() => setFontFamily("'Lora', serif")} selected={fontFamily.includes('Lora')} style={{fontFamily: "'Lora', serif"}} className="flex items-center justify-center">Elegan</OptionButton>
                                            <OptionButton onClick={() => setFontFamily("'Pacifico', cursive")} selected={fontFamily.includes('Pacifico')} style={{fontFamily: "'Pacifico', cursive"}} className="flex items-center justify-center">Santai</OptionButton>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-xs mb-2 text-slate-600 dark:text-slate-400">Warna Font</h4>
                                        <div className="grid grid-cols-4 gap-2 text-xs">
                                                <OptionButton onClick={() => setFontColor('auto')} selected={fontColor === 'auto'} className="gap-1 flex items-center justify-center"><Wand2 className="w-3 h-3"/> Auto</OptionButton>
                                                <OptionButton onClick={() => setFontColor('#FFFFFF')} selected={fontColor === '#FFFFFF'} style={{backgroundColor: '#FFFFFF', color: '#333', borderColor: '#cbd5e1'}} className="flex items-center justify-center">Putih</OptionButton>
                                                <OptionButton onClick={() => setFontColor('#0f172a')} selected={fontColor === '#0f172a'} style={{backgroundColor: '#0f172a', color: '#FFF'}} className="flex items-center justify-center">Hitam</OptionButton>
                                                <OptionButton onClick={() => setFontColor('#FFD700')} selected={fontColor === '#FFD700'} style={{backgroundColor: '#FFD700', color: '#333', borderColor: '#cbd5e1'}} className="flex items-center justify-center">Emas</OptionButton>
                                        </div>
                                        {fontColor === 'auto' && <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">Warna Otomatis: <span style={{backgroundColor: autoFontColor}} className="w-4 h-4 rounded border"></span></div>}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>

                        <button onClick={handleGenerateCarousel} disabled={isGenerateDisabled} className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5 mt-4">
                            {isLoading.carousel ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span className="tracking-wide">{loadingMessage}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="tracking-wide">Buat Carousel</span>
                                </div>
                            )}
                        </button>
                    </div>
                </aside>
                
                <section className="lg:col-span-3">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all shadow-sm h-full flex flex-col min-h-[500px]">
                        {results.length === 0 ? (
                            <div className="flex flex-grow flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
                                <GalleryHorizontal className="w-16 h-16 text-slate-400 dark:text-slate-600 mb-4 opacity-50" />
                                <h3 className="font-semibold text-lg text-slate-600 dark:text-slate-300">Hasil Carousel Anda</h3>
                                <p className="mt-1 text-sm">Carousel yang sudah jadi akan muncul di sini.</p>
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col gap-6">
                                {results.map(res => <CarouselResult key={res.id} result={res} />)}
                            </div>
                        )}
                    </div>
                </section>
            </div>
             <UniversalModal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} title={modal.title}>
                {modal.content}
            </UniversalModal>
            <PromoCard />
        </div>
    );
};

const CarouselResult: React.FC<{ result: any }> = ({ result }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const slides = result.slides || [];
    const totalSlides = slides.length;

    const goToSlide = (index: number) => {
        setCurrentIndex((index + totalSlides) % totalSlides);
    };

    const getPositionClasses = (position: string) => {
        let classes = 'p-6 md:p-8 lg:p-10 ';
        if (position.includes('top')) classes += 'items-start ';
        else if (position.includes('middle')) classes += 'items-center ';
        else classes += 'items-end ';
        classes += 'justify-center text-center';
        return classes;
    };

    const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    };

    const handleDownloadAll = async () => {
        if (typeof JSZip === 'undefined' || typeof saveAs === 'undefined') {
            alert("Library download sedang dimuat, harap tunggu sebentar atau muat ulang halaman.");
            return;
        }

        setIsDownloading(true);
        const zip = new JSZip();
        const folderName = result.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'carousel';
        const folder = zip.folder(folderName);

        try {
            const renderPromises = slides.map(async (slide: any, index: number) => {
                return new Promise<void>((resolve, reject) => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('Canvas context error');

                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        ctx.drawImage(img, 0, 0);

                        if (slide.text) {
                            const padding = canvas.width * 0.08;
                            const fontSize = canvas.width * 0.055;
                            const lineHeight = fontSize * 1.3;
                            ctx.font = `bold ${fontSize}px ${slide.font.split(',')[0].replace(/'/g, '')}, sans-serif`;
                            ctx.fillStyle = slide.fontColor;
                            ctx.textAlign = 'center';
                            ctx.shadowColor = 'rgba(0,0,0,0.7)';
                            ctx.shadowBlur = 10;
                            ctx.shadowOffsetX = 2;
                            ctx.shadowOffsetY = 2;

                            const maxWidth = canvas.width - (padding * 2);
                            const x = canvas.width / 2;
                            let y = canvas.height / 2;

                            if (slide.position.includes('top')) {
                                y = padding + fontSize;
                            } else if (slide.position.includes('bottom')) {
                                const words = slide.text.split(' ');
                                let linesCount = 1;
                                let line = '';
                                for(let n=0; n<words.length; n++){
                                    const testLine = line + words[n] + ' ';
                                    if(ctx.measureText(testLine).width > maxWidth && n > 0){
                                        linesCount++;
                                        line = words[n] + ' ';
                                    } else { line = testLine; }
                                }
                                y = canvas.height - padding - (linesCount - 1) * lineHeight;
                            } else {
                                const words = slide.text.split(' ');
                                let linesCount = 1;
                                let line = '';
                                for(let n=0; n<words.length; n++){
                                    const testLine = line + words[n] + ' ';
                                    if(ctx.measureText(testLine).width > maxWidth && n > 0){
                                        linesCount++;
                                        line = words[n] + ' ';
                                    } else { line = testLine; }
                                }
                                y = (canvas.height / 2) - ((linesCount - 1) * lineHeight / 2);
                            }

                            drawText(ctx, slide.text, x, y, maxWidth, lineHeight);
                        }

                        canvas.toBlob((blob) => {
                            if (blob) {
                                folder.file(`slide-${index + 1}.png`, blob);
                                resolve();
                            } else {
                                reject('Blob generation error');
                            }
                        }, 'image/png', 1.0);
                    };
                    img.onerror = () => reject('Image load error');
                    img.src = slide.src;
                });
            });

            await Promise.all(renderPromises);
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${folderName}_carousel.zip`);

        } catch (err) {
            console.error("Download error:", err);
            alert("Terjadi kesalahan saat menyiapkan file download.");
        } finally {
            setIsDownloading(false);
        }
    };

    const getAspectRatioClass = (ratio: string) => ({'1:1': 'aspect-square', '16:9': 'aspect-video', '9:16': 'aspect-[9/16]'}[ratio] || 'aspect-square');
    
    const isPortrait = result.aspectRatio === '9:16';
    const frameClass = isPortrait ? 'max-w-xs mx-auto p-2 bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg' : '';

    return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-3">
             <div className={frameClass}>
                <div className={`relative overflow-hidden ${isPortrait ? 'rounded-2xl' : 'rounded-2xl'} ${getAspectRatioClass(result.aspectRatio)} bg-slate-200 dark:bg-slate-800 shadow-md`}>
                    <div className="flex transition-transform duration-500 ease-in-out h-full" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {slides.map((slide: any, i: number) => (
                            <div key={i} className="relative w-full h-full flex-shrink-0 bg-black">
                                <img src={slide.src} alt={`Slide ${i+1}`} className="w-full h-full object-cover" />
                                {slide.text && (
                                    <div className={`absolute inset-0 flex pointer-events-none ${getPositionClasses(slide.position)}`}>
                                        <p className="text-lg lg:text-xl font-bold max-w-[90%]" style={{ color: slide.fontColor, fontFamily: slide.font, textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                                            {slide.text}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {totalSlides > 1 && (
                        <>
                            <button onClick={() => goToSlide(currentIndex - 1)} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white p-1.5 rounded-full hover:bg-black/70 backdrop-blur-sm"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={() => goToSlide(currentIndex + 1)} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white p-1.5 rounded-full hover:bg-black/70 backdrop-blur-sm"><ChevronRight className="w-5 h-5" /></button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {slides.map((_:any, i:number) => <div key={i} className={`w-2 h-2 rounded-full transition-all ${currentIndex === i ? 'bg-white scale-125' : 'bg-white/50'}`}></div>)}
                            </div>
                        </>
                    )}
                </div>
            </div>
             <div className="flex justify-between items-center mt-3 px-2">
                <div className="flex flex-col">
                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{result.productName}</h4>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Gaya {result.style}</span>
                </div>
                 <button 
                    onClick={handleDownloadAll} 
                    disabled={isDownloading}
                    className="p-2.5 bg-violet-600 text-white hover:bg-violet-700 disabled:bg-slate-400 rounded-xl shadow-md transition-all flex items-center gap-2 group active:scale-95" 
                    title="Unduh Semua Slide (ZIP)"
                >
                    {isDownloading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-xs font-black">UNDUH ZIP</span>
                 </button>
            </div>
        </motion.div>
    );
}

export default MagicCarousel;

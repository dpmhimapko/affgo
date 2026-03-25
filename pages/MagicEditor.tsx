
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadedImage } from '../types';
import { editImage } from '../services/geminiService';
import { Undo2, Redo2, Eraser, Trash2, Download, Send } from '../components/icons/MagicEditorIcons';
import { PenSquare, Image as ImageIcon, Sparkles, RefreshCw, X, Eye } from '../components/icons/LucideIcons';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { PromoCard } from '../components/PromoCard';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { ZoomModal } from '../components/ZoomModal';
import { useLanguage } from '../contexts/LanguageContext';

// --- Helper Components ---

const LoaderIcon: React.FC<{ light?: boolean }> = ({ light = false }) => (
    <div className={`w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent ${light ? 'text-white' : 'text-violet-600'}`}></div>
);

// --- Main Component ---
const MagicEditor: React.FC = () => {
    const { t } = useLanguage();
    
    // State
    const [uploadedImage, setUploadedImage] = useState<{ base64: string; mimeType: string; dataUrl: string; } | null>(null);
    const [brushSize, setBrushSize] = useState(40);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]); // Mask history for undo
    
    // UI States
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    // Refs for canvases and drawing state
    const containerRef = useRef<HTMLDivElement>(null);
    const imageCanvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const lastPosRef = useRef({ x: 0, y: 0 });

    // Handle initial image load into canvas
    const initCanvas = useCallback((dataUrl: string) => {
        const img = new Image();
        img.onload = () => {
            const canvas = imageCanvasRef.current;
            const maskCanvas = maskCanvasRef.current;
            if (!canvas || !maskCanvas) return;

            // Set canvas dimensions to match image
            canvas.width = img.width;
            canvas.height = img.height;
            maskCanvas.width = img.width;
            maskCanvas.height = img.height;

            const ctx = canvas.getContext('2d');
            const maskCtx = maskCanvas.getContext('2d');
            if (!ctx || !maskCtx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            // Clear mask
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
            setHistory([]);
        };
        img.src = dataUrl;
    }, []);

    const handleUpload = (dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        setUploadedImage({ base64, mimeType, dataUrl });
        setResultImage(null);
        setError(null);
        setPrompt('');
    };

    useEffect(() => {
        if (uploadedImage) {
            initCanvas(uploadedImage.dataUrl);
        }
    }, [uploadedImage, initCanvas]);

    // Drawing Logic
    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = maskCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        isDrawingRef.current = true;
        const { x, y } = getCoordinates(e);
        lastPosRef.current = { x, y };
        
        // Save current state for undo
        const maskCanvas = maskCanvasRef.current;
        if (maskCanvas) {
            setHistory(prev => [...prev, maskCanvas.toDataURL()]);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawingRef.current) return;
        const { x, y } = getCoordinates(e);
        const canvas = maskCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red for mask
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastPosRef.current = { x, y };
    };

    const stopDrawing = () => {
        isDrawingRef.current = false;
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const previousState = history[history.length - 1];
        const newHistory = history.slice(0, -1);
        
        const img = new Image();
        img.onload = () => {
            const ctx = maskCanvasRef.current?.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, maskCanvasRef.current!.width, maskCanvasRef.current!.height);
                ctx.drawImage(img, 0, 0);
                setHistory(newHistory);
            }
        };
        img.src = previousState;
    };

    const handleClearMask = () => {
        const maskCanvas = maskCanvasRef.current;
        const ctx = maskCanvas?.getContext('2d');
        if (maskCanvas && ctx) {
            setHistory(prev => [...prev, maskCanvas.toDataURL()]);
            ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        }
    };

    const handleGenerate = async () => {
        if (!uploadedImage || !prompt.trim()) return;

        setIsGenerating(true);
        setError(null);

        try {
            const maskCanvas = maskCanvasRef.current;
            if (!maskCanvas) throw new Error("Canvas mask tidak ditemukan.");

            const maskBase64 = maskCanvas.toDataURL('image/png').split(',')[1];
            
            const original: UploadedImage = { 
                base64: uploadedImage.base64, 
                mimeType: uploadedImage.mimeType 
            };
            const mask: UploadedImage = { 
                base64: maskBase64, 
                mimeType: 'image/png' 
            };

            const result = await editImage(original, mask, prompt);
            setResultImage(result.imageUrl);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Gagal mengedit gambar.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (resultImage) {
            const link = document.createElement('a');
            link.href = resultImage;
            link.download = `magic-editor-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleResetAll = () => {
        setUploadedImage(null);
        setResultImage(null);
        setPrompt('');
        setHistory([]);
        setError(null);
    };

    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";

    return (
        <div className="w-full">
            <FeatureHeader
                title="Go Editor"
                description="Edit bagian foto apa pun dengan kekuatan AI. Cukup warnai area yang ingin diubah dan tulis perintah Anda."
            />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Sidebar Controls */}
                <aside className="w-full lg:w-[400px] flex-shrink-0 lg:sticky lg:top-24 space-y-6">
                    <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col gap-6">
                        
                        {/* Step 1: Upload */}
                        <section>
                            <StepHeader step={1} title="Unggah Foto" description="Pilih gambar yang ingin Anda edit." />
                            <ImageUploader 
                                onImageUpload={handleUpload}
                                uploadedImage={uploadedImage?.dataUrl || null}
                                label="Upload Source"
                                labelKey="uploader.imageLabel"
                            />
                        </section>

                        {/* Step 2: Brush Settings */}
                        <section className="pt-6 border-t border-slate-100 dark:border-slate-700/50">
                            <StepHeader step={2} title="Atur Kuas" description="Sesuaikan ukuran sapuan kuas Anda." />
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brush Size: {brushSize}px</span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleUndo} 
                                            disabled={history.length === 0}
                                            className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 transition-all"
                                            title="Undo"
                                        >
                                            <Undo2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={handleClearMask} 
                                            disabled={!uploadedImage}
                                            className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 disabled:opacity-30 transition-all"
                                            title="Clear Selection"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <input 
                                    type="range" 
                                    min="5" 
                                    max="150" 
                                    value={brushSize} 
                                    onChange={(e) => setBrushSize(parseInt(e.target.value))} 
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                />
                            </div>
                        </section>

                        {/* Step 3: Prompt */}
                        <section className="pt-6 border-t border-slate-100 dark:border-slate-700/50">
                            <StepHeader step={3} title="Instruksi Edit" description="Apa yang harus AI lakukan di area merah?" />
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className={inputClasses}
                                rows={3}
                                placeholder="Contoh: 'Hapus orang ini', 'Ganti jadi kacamata hitam', 'Ubah warna baju jadi biru'..."
                            />
                        </section>

                        {/* Generate Button */}
                        <div className="pt-2">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !uploadedImage || !prompt.trim()}
                                className="w-full relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                {isGenerating ? (
                                    <div className="flex items-center gap-3">
                                        <LoaderIcon light />
                                        <span className="tracking-wide">Applying Magic...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        <span className="tracking-wide">Jalankan Perintah</span>
                                    </div>
                                )}
                            </button>
                            
                            {error && (
                                <p className="text-center text-xs font-bold text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                                    {error}
                                </p>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Workspace / Canvas Area */}
                <main className="flex-grow w-full bg-white/50 dark:bg-gray-900/30 backdrop-blur-xl p-4 md:p-8 rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-inner min-h-[600px] flex flex-col">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-white/10 pb-6 px-2">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Editor Canvas</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Interactive Brush Masking</p>
                        </div>
                        {uploadedImage && (
                            <button onClick={handleResetAll} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 flex items-center gap-1.5 transition-colors">
                                <RefreshCw className="w-3 h-3" /> Reset Editor
                            </button>
                        )}
                    </div>

                    <div className="flex-grow flex items-center justify-center relative overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 group/canvas">
                        {!uploadedImage ? (
                            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-center p-12">
                                <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-dashed border-slate-200 dark:border-white/10 rotate-3 transition-transform hover:rotate-0">
                                    <ImageIcon className="w-10 h-10 opacity-30" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-600 dark:text-slate-400">Workspace Kosong</h4>
                                <p className="text-sm font-medium mt-1 opacity-70">Unggah gambar di panel kiri untuk mulai mengedit.</p>
                            </div>
                        ) : (
                            <div 
                                className="relative max-w-full max-h-full cursor-crosshair shadow-2xl"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            >
                                <canvas ref={imageCanvasRef} className="max-w-full max-h-[70vh] block rounded-xl shadow-lg" />
                                <canvas ref={maskCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-60" />
                                
                                {/* Result Overlay */}
                                <AnimatePresence>
                                    {resultImage && (
                                        <motion.div 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }} 
                                            className="absolute inset-0 z-20 bg-slate-900 rounded-xl overflow-hidden"
                                        >
                                            <img src={resultImage} className="w-full h-full object-contain" alt="Result" />
                                            
                                            {/* Result Controls */}
                                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-4">
                                                <button 
                                                    onClick={() => setIsZoomOpen(true)}
                                                    className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl font-bold transition-all border border-white/20"
                                                >
                                                    <Eye className="w-4 h-4" /> Preview
                                                </button>
                                                <button 
                                                    onClick={handleDownload}
                                                    className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-xl"
                                                >
                                                    <Download className="w-4 h-4" /> Download
                                                </button>
                                                <button 
                                                    onClick={() => setResultImage(null)}
                                                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all border border-white/10"
                                                >
                                                    <X className="w-4 h-4" /> Tutup Hasil
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                        
                        {/* Overlay Controls */}
                        {uploadedImage && !resultImage && (
                            <div className="absolute top-4 right-4 pointer-events-none">
                                <span className="bg-black/50 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-[0.2em] shadow-lg">
                                    Editor Mode: {isDrawingRef.current ? 'Drawing' : 'Ready'}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {/* Footnote */}
                    {uploadedImage && (
                        <p className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-center italic">
                            💡 Gunakan kuas untuk menandai area yang ingin diganti atau dihapus.
                        </p>
                    )}
                </main>
            </div>

            <PromoCard />
            <ZoomModal isOpen={isZoomOpen} onClose={() => setIsZoomOpen(false)} imageUrl={resultImage || ''} />
        </div>
    );
};

export default MagicEditor;


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadedImage } from '../types';
import { enhanceVideoPrompt } from '../services/geminiService';
import { ImageUploader } from '../components/ImageUploader';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { Spinner } from '../components/Spinner';
import { Sparkles, Copy, ExternalLink, MessageSquare, PenSquare, Video, ChevronRight, Globe } from '../components/icons/LucideIcons';
import { PromoCard } from '../components/PromoCard';

const MagicVideoGenerator: React.FC = () => {
    const [inspirationImage, setInspirationImage] = useState<(UploadedImage & { dataUrl: string }) | null>(null);
    const [basicIdea, setBasicIdea] = useState('');
    const [dialogText, setDialogText] = useState('');
    const [includeDialog, setIncludeDialog] = useState(false);
    const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState(false);
    const [showVideoLinks, setShowVideoLinks] = useState(false);

    const handleImageUpload = (dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        setInspirationImage({ base64, mimeType, dataUrl });
        setEnhancedPrompt(null);
        setError(null);
        setShowVideoLinks(false);
    };

    const handleGenerate = async () => {
        if (!inspirationImage || !basicIdea.trim()) {
            setError("Harap unggah gambar dan tulis ide dasar Anda.");
            return;
        }
        if (includeDialog && !dialogText.trim()) {
            setError("Harap isi naskah dialog terlebih dahulu.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setEnhancedPrompt(null);
        setShowVideoLinks(false);

        try {
            const prompt = await enhanceVideoPrompt(inspirationImage, basicIdea, includeDialog, dialogText);
            setEnhancedPrompt(prompt);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal meningkatkan prompt.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (enhancedPrompt) {
            navigator.clipboard.writeText(enhancedPrompt);
            setCopyStatus(true);
            setTimeout(() => setCopyStatus(false), 2000);
        }
    };

    const isGenerateDisabled = !inspirationImage || !basicIdea.trim() || isLoading;
    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";

    return (
        <div className="w-full">
            <FeatureHeader
                title="Go Video Pro"
                description="Ubah ide menjadi prompt cinematic tingkat tinggi dalam satu baris padat dengan sinkronisasi bibir teknis."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Panel - Inputs */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all space-y-8 shadow-sm">
                    <div>
                        <StepHeader step={1} title="Unggah Gambar Inspirasi" description="Subjek dan suasana akan diekstrak untuk prompt teknis." />
                        <ImageUploader 
                            onImageUpload={handleImageUpload} 
                            uploadedImage={inspirationImage?.dataUrl || null} 
                            label="Upload Reference Image"
                            labelKey="uploader.referenceLabel"
                        />
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 dark:border-white/10 space-y-4">
                        <StepHeader step={2} title="Konfigurasi Adegan" description="Jelaskan gerakan kamera dan dialog jika ada." />
                        
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Ide Dasar Adegan</label>
                            <textarea
                                value={basicIdea}
                                onChange={e => setBasicIdea(e.target.value)}
                                rows={3}
                                placeholder="Contoh: Model menatap kamera, perlahan tersenyum dan melambaikan tangan..."
                                className={inputClasses}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Dialog Mode Toggle */}
                        <div className="flex items-center justify-between p-4 bg-violet-50 dark:bg-violet-900/10 rounded-2xl border border-violet-100 dark:border-violet-800/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-500 rounded-lg text-white">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-violet-200">Mode Dialog / VO</p>
                                    <p className="text-[10px] text-slate-500 dark:text-violet-400 uppercase tracking-wider font-bold">Lip-Sync Precision</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIncludeDialog(!includeDialog)}
                                className={`w-12 h-6 rounded-full transition-all relative ${includeDialog ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${includeDialog ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <AnimatePresence>
                            {includeDialog && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden space-y-2"
                                >
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-violet-500 mb-1 ml-1">Naskah Dialog (Bahasa Indonesia)</label>
                                    <textarea
                                        value={dialogText}
                                        onChange={e => setDialogText(e.target.value)}
                                        rows={2}
                                        placeholder="Tulis apa yang diucapkan model... (misal: 'Halo semuanya, selamat datang!')"
                                        className={inputClasses + " border-violet-200 dark:border-violet-800/50"}
                                        disabled={isLoading}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={handleGenerate} 
                            disabled={isGenerateDisabled} 
                            className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <Spinner className="h-5 w-5 text-white" />
                                    <span className="tracking-wide">Engineering...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="tracking-wide uppercase tracking-widest">Buat Prompt</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Panel - Output */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all shadow-sm lg:sticky lg:top-24 min-h-[32rem] flex flex-col">
                    <StepHeader step={3} title="Hasil Master Prompt" description="Salin ke generator video favorit Anda." />
                    
                    <div className="flex-grow bg-slate-50 dark:bg-black/40 rounded-2xl p-6 border border-slate-200 dark:border-white/5 min-h-[250px] overflow-hidden">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full">
                                    <Spinner className="h-10 w-10 text-violet-600 mb-4" />
                                    <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-[0.2em]">Analyzing Scene...</p>
                                </motion.div>
                            ) : error ? (
                                <motion.p key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-xl font-bold">{error}</motion.p>
                            ) : enhancedPrompt ? (
                                <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full text-sm text-slate-700 dark:text-slate-300 font-mono leading-relaxed overflow-y-auto custom-scrollbar pr-2">
                                    {enhancedPrompt}
                                </motion.div>
                            ) : (
                                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center text-slate-400 dark:text-slate-600">
                                    <div className="w-20 h-20 bg-slate-200/50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-dashed border-slate-300 dark:border-white/10 rotate-3">
                                        <PenSquare className="w-10 h-10 opacity-30" />
                                    </div>
                                    <p className="font-black uppercase tracking-widest text-xs">Ready for Engineering</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    
                    <AnimatePresence>
                        {enhancedPrompt && !isLoading && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-sm font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] transition-all shadow-xl">
                                        <Copy className="w-4 h-4" /> {copyStatus ? 'TERSALIN!' : 'SALIN PROMPT'}
                                    </button>
                                    <button 
                                        onClick={() => setShowVideoLinks(!showVideoLinks)} 
                                        className="flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-sm font-black bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xl hover:shadow-indigo-500/40"
                                    >
                                        <Video className="w-4 h-4" /> {showVideoLinks ? 'TUTUP PILIHAN' : 'BUAT VIDEO'}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {showVideoLinks && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="grid grid-cols-1 gap-3 overflow-hidden pt-2"
                                        >
                                            <div className="space-y-2">
                                                <a 
                                                    href="https://grok.com/" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 transition-all group shadow-sm"
                                                >
                                                    <div className="flex flex-col text-left">
                                                        <span className="text-sm font-black text-slate-800 dark:text-white">Buka Grok AI</span>
                                                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Free Recommended</span>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                </a>
                                                <div className="mx-2 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl flex gap-3">
                                                    <Globe className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                    <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed font-medium">
                                                        💡 <strong>Grok Tip:</strong> Jika akses Grok dibatasi atau diblokir pemerintah, Anda tetap dapat berkarya menggunakan VPN gratis seperti <strong>Urban VPN (<a href="https://www.urban-vpn.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-600 dark:hover:text-amber-500 transition-colors">https://www.urban-vpn.com/</a>)</strong> agar proses kreatif Anda tetap tanpa batas.
                                                    </p>
                                                </div>
                                            </div>

                                            <a 
                                                href="https://labs.google/fx/tools/flow" 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 transition-all group shadow-sm"
                                            >
                                                <div className="flex flex-col text-left">
                                                    <span className="text-sm font-black text-slate-800 dark:text-white">Buka Flow AI</span>
                                                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Generate Terbatas</span>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                            </a>
                                            
                                            <a 
                                                href="https://www.meta.ai/" 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 transition-all group shadow-sm"
                                            >
                                                <div className="flex flex-col text-left">
                                                    <span className="text-sm font-black text-slate-800 dark:text-white">Buka Meta AI</span>
                                                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Free (Ada Watermark)</span>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <PromoCard />
        </div>
    );
};

export default MagicVideoGenerator;

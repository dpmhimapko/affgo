
import React, { useReducer, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadedImage, StoryboardPanel } from '../types';
import { 
    generateStoryboardScenes, 
    visualizeStoryboardScene, 
    suggestNextStoryboardScenes,
    generateVideoAIPrompt
} from '../services/geminiService';
import { ImageUploader } from '../components/ImageUploader';
import Loader from '../components/Loader';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import UniversalModal from '../components/UniversalModal';
import { Sparkles, Download, FileText, Lightbulb, RefreshCw, X, Eye, Video, Copy, ChevronLeft, ChevronRight, RectangleHorizontal, Square, RectangleVertical } from '../components/icons/LucideIcons';
import { PromoCard } from '../components/PromoCard';

type AspectRatio = '16:9' | '9:16' | '1:1';

interface StoryboardState {
    referenceImage: (UploadedImage & { dataUrl: string }) | null;
    script: string;
    aspectRatio: AspectRatio;
    isLoading: boolean;
    error: string | null;
    mainStoryboard: StoryboardPanel[];
    suggestionBoard: StoryboardPanel[];
    isSuggestionLoading: boolean;
    suggestionError: string | null;
    isPromptLoading: boolean;
}

const initialState: StoryboardState = {
    referenceImage: null,
    script: '',
    aspectRatio: '16:9',
    isLoading: false,
    error: null,
    mainStoryboard: [],
    suggestionBoard: [],
    isSuggestionLoading: false,
    suggestionError: null,
    isPromptLoading: false,
};

type Action =
  | { type: 'SET_FIELD'; payload: { field: keyof StoryboardState; value: any } }
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_TEXT_SUCCESS'; payload: StoryboardPanel[] }
  | { type: 'UPDATE_PANEL_IMAGE'; payload: { index: number; imageUrl: string } }
  | { type: 'GENERATE_FINISH' }
  | { type: 'GENERATE_ERROR'; payload: string }
  | { type: 'SUGGEST_START' }
  | { type: 'SUGGEST_SUCCESS'; payload: StoryboardPanel[] }
  | { type: 'SUGGEST_ERROR'; payload: string }
  | { type: 'CHOOSE_SUGGESTION'; payload: StoryboardPanel }
  | { type: 'SET_PROMPT_LOADING'; payload: boolean }
  | { type: 'RESET' };

function reducer(state: StoryboardState, action: Action): StoryboardState {
  switch (action.type) {
    case 'SET_FIELD': return { ...state, [action.payload.field]: action.payload.value };
    case 'GENERATE_START': return { ...state, isLoading: true, error: null, mainStoryboard: [], suggestionBoard: [] };
    case 'GENERATE_TEXT_SUCCESS': return { ...state, mainStoryboard: action.payload };
    case 'UPDATE_PANEL_IMAGE': {
        const newStoryboard = [...state.mainStoryboard];
        if (newStoryboard[action.payload.index]) {
            newStoryboard[action.payload.index].imageUrl = action.payload.imageUrl;
        }
        return { ...state, mainStoryboard: newStoryboard };
    }
    case 'GENERATE_FINISH': return { ...state, isLoading: false };
    case 'GENERATE_ERROR': return { ...state, isLoading: false, error: action.payload };
    case 'SUGGEST_START': return { ...state, isSuggestionLoading: true, suggestionError: null, suggestionBoard: [] };
    case 'SUGGEST_SUCCESS': return { ...state, isSuggestionLoading: false, suggestionBoard: action.payload };
    case 'SUGGEST_ERROR': return { ...state, isSuggestionLoading: false, suggestionError: action.payload };
    case 'CHOOSE_SUGGESTION': return {
        ...state,
        mainStoryboard: [...state.mainStoryboard, action.payload],
        suggestionBoard: [],
    };
    case 'SET_PROMPT_LOADING': return { ...state, isPromptLoading: action.payload };
    case 'RESET': return initialState;
    default: return state;
  }
}

const MagicStoryboard: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { referenceImage, script, aspectRatio, isLoading, error, mainStoryboard, suggestionBoard, isSuggestionLoading, suggestionError, isPromptLoading } = state;
    
    const [promptModal, setPromptModal] = useState<{ isOpen: boolean; title: string; content: string }>({ isOpen: false, title: '', content: '' });

    const handleImageUpload = (dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        dispatch({ type: 'SET_FIELD', payload: { field: 'referenceImage', value: { base64, mimeType, dataUrl } } });
    };

    const handleGenerate = async () => {
        if (!script.trim()) return;
        dispatch({ type: 'GENERATE_START' });

        try {
            const scenes = await generateStoryboardScenes(script, referenceImage);
            dispatch({ type: 'GENERATE_TEXT_SUCCESS', payload: scenes });

            let previousImage: UploadedImage | null = null;
            for (let i = 0; i < scenes.length; i++) {
                const res = await visualizeStoryboardScene(scenes[i], aspectRatio, i, referenceImage, previousImage);
                dispatch({ type: 'UPDATE_PANEL_IMAGE', payload: { index: i, imageUrl: res.imageUrl } });
                previousImage = {
                    base64: res.imageUrl.split(',')[1],
                    mimeType: 'image/png',
                    name: `scene_${i}.png`
                };
            }
        } catch (err: any) {
            dispatch({ type: 'GENERATE_ERROR', payload: err.message || 'Gagal merender storyboard.' });
        } finally {
            dispatch({ type: 'GENERATE_FINISH' });
        }
    };

    const handleGetFullPrompt = async () => {
        if (mainStoryboard.length === 0) return;
        dispatch({ type: 'SET_PROMPT_LOADING', payload: true });
        try {
            const prompt = await generateVideoAIPrompt(mainStoryboard);
            setPromptModal({ isOpen: true, title: 'Master Cinematic Video Prompt', content: prompt });
        } catch (err: any) {
            alert(err.message);
        } finally {
            dispatch({ type: 'SET_PROMPT_LOADING', payload: false });
        }
    };

    const handleGetScenePrompt = async (panel: StoryboardPanel) => {
        dispatch({ type: 'SET_PROMPT_LOADING', payload: true });
        try {
            const prompt = await generateVideoAIPrompt(panel);
            setPromptModal({ isOpen: true, title: 'Single Scene Video Prompt', content: prompt });
        } catch (err: any) {
            alert(err.message);
        } finally {
            dispatch({ type: 'SET_PROMPT_LOADING', payload: false });
        }
    };

    const handleSuggestNext = async () => {
        const lastScene = mainStoryboard[mainStoryboard.length - 1];
        if (!lastScene || !lastScene.imageUrl) return;

        dispatch({ type: 'SUGGEST_START' });
        try {
            const options = await suggestNextStoryboardScenes(lastScene as any, referenceImage);
            const results = await Promise.all(options.map(opt => 
                visualizeStoryboardScene(opt, aspectRatio, mainStoryboard.length, referenceImage, {
                    base64: lastScene.imageUrl!.split(',')[1],
                    mimeType: 'image/png'
                })
            ));

            const finalSuggestions = options.map((opt, i) => ({ ...opt, imageUrl: results[i].imageUrl }));
            dispatch({ type: 'SUGGEST_SUCCESS', payload: finalSuggestions });
        } catch (err: any) {
            dispatch({ type: 'SUGGEST_ERROR', payload: 'Gagal mencari saran adegan.' });
        }
    };

    const handleDownload = (url: string, idx: number) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `storyboard-scene-${idx + 1}.png`;
        link.click();
    };

    const getAspectClass = (ratio: string) => {
        if (ratio === '9:16') return 'aspect-[9/16]';
        if (ratio === '1:1') return 'aspect-square';
        return 'aspect-video';
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-10">
            <FeatureHeader 
                title="Go Storyboard Pro"
                description="Ubah naskah mentah Anda menjadi panel visual sinematik dengan alur cerita yang logis dan konsistensi gaya tinggi."
            />

            <div className="space-y-8">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-2xl space-y-8">
                    <StepHeader step={1} title="Mulai di Sini" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Gambar Referensi (Opsional)</h4>
                            <ImageUploader 
                                onImageUpload={handleImageUpload} 
                                uploadedImage={referenceImage?.dataUrl || null} 
                                label="Upload Reference"
                                labelKey="uploader.imageLabel"
                            />
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Skrip Video</h4>
                            <textarea 
                                value={script} 
                                onChange={e => dispatch({ type: 'SET_FIELD', payload: { field: 'script', value: e.target.value } })}
                                placeholder="Contoh: Seorang astronot menemukan tanaman bercahaya di planet asing yang berkabut..."
                                rows={6}
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Rasio Aspek</h4>
                        <div className="flex gap-4">
                            {(['16:9', '9:16', '1:1'] as AspectRatio[]).map(r => (
                                <button 
                                    key={r}
                                    onClick={() => dispatch({ type: 'SET_FIELD', payload: { field: 'aspectRatio', value: r } })}
                                    className={`flex-1 py-4 px-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${
                                        aspectRatio === r 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' 
                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-400'
                                    }`}
                                >
                                    {r === '16:9' ? <RectangleHorizontal className="w-5 h-5"/> : r === '1:1' ? <Square className="w-5 h-5"/> : <RectangleVertical className="w-5 h-5"/>}
                                    <span className="font-black">{r}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !script.trim()} 
                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black rounded-3xl shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isLoading ? <RefreshCw className="animate-spin w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                        <span>GENERATE STORYBOARD</span>
                    </button>
                </div>

                <AnimatePresence>
                    {(mainStoryboard.length > 0 || isLoading) && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-2xl space-y-8"
                        >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
                                <StepHeader step={2} title="Hasil Storyboard" />
                                <button 
                                    onClick={handleGetFullPrompt}
                                    disabled={isLoading || isPromptLoading}
                                    className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    {isPromptLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                                    BUAT PROMPT VIDEO FULL
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {mainStoryboard.map((panel, idx) => (
                                    <motion.div 
                                        key={idx} 
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                        className="bg-slate-50 dark:bg-black/20 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/5 flex flex-col group shadow-sm"
                                    >
                                        <div className={`relative ${getAspectClass(aspectRatio)} bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-inner`}>
                                            {panel.imageUrl ? (
                                                <img src={panel.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Scene ${idx+1}`} />
                                            ) : (
                                                <div className="flex flex-col items-center gap-3">
                                                    <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rendering Scene...</span>
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black rounded-lg border border-white/10 shadow-lg">SCENE {idx+1}</div>
                                        </div>
                                        <div className="p-6 flex flex-col gap-4">
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium min-h-[60px]">{panel.narration}</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button 
                                                    onClick={() => handleGetScenePrompt(panel)}
                                                    disabled={!panel.imageUrl || isPromptLoading}
                                                    className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all active:scale-95"
                                                >
                                                    <FileText className="w-4 h-4" /> PROMPT
                                                </button>
                                                <button 
                                                    onClick={() => handleDownload(panel.imageUrl!, idx)}
                                                    disabled={!panel.imageUrl}
                                                    className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-95"
                                                >
                                                    <Download className="w-4 h-4" /> UNDUH
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl border border-red-100 dark:border-red-900/30 font-bold text-center animate-shake">{error}</div>}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {mainStoryboard.length >= 4 && !isLoading && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-2xl space-y-8"
                        >
                            <StepHeader step={3} title="Lanjutkan Cerita" description="Pilih opsi untuk mengembangkan adegan berikutnya secara organik." />
                            
                            {suggestionBoard.length === 0 ? (
                                <button 
                                    onClick={handleSuggestNext}
                                    disabled={isSuggestionLoading}
                                    className="w-full py-8 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group shadow-inner"
                                >
                                    {isSuggestionLoading ? <RefreshCw className="animate-spin w-8 h-8" /> : <Lightbulb className="w-8 h-8 group-hover:scale-110 transition-transform" />}
                                    <span className="font-black uppercase tracking-widest text-xs">Dapatkan 4 Opsi Adegan Berikutnya</span>
                                </button>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {suggestionBoard.map((opt, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => dispatch({ type: 'CHOOSE_SUGGESTION', payload: opt })}
                                            className="bg-slate-50 dark:bg-black/20 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col group text-left transition-all hover:scale-[1.02] hover:shadow-xl"
                                        >
                                            <div className={`relative ${getAspectClass(aspectRatio)} shadow-inner bg-slate-100 dark:bg-slate-800`}>
                                                <img src={opt.imageUrl} className="w-full h-full object-cover" alt="Option" />
                                                <div className="absolute inset-0 bg-indigo-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                                    <span className="bg-white text-indigo-600 px-4 py-2 rounded-full font-black text-[10px] shadow-2xl">PILIH ADEGAN</span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3 font-medium leading-relaxed">{opt.narration}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {suggestionError && <p className="text-red-500 text-center text-xs font-bold bg-red-50 p-2 rounded-lg">{suggestionError}</p>}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <UniversalModal isOpen={promptModal.isOpen} onClose={() => setPromptModal({ ...promptModal, isOpen: false })} title={promptModal.title}>
                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-black/40 p-5 rounded-2xl border border-slate-200 dark:border-white/10 text-sm font-mono leading-relaxed dark:text-slate-300 shadow-inner max-h-60 overflow-y-auto custom-scrollbar">
                        {promptModal.content}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium italic">Salin prompt sinematik di atas ke generator video AI (seperti Veo, Sora, atau Runway) untuk hasil pergerakan kamera profesional.</p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(promptModal.content);
                                alert("Prompt tersalin ke clipboard!");
                            }}
                            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Copy className="w-4 h-4" /> SALIN TEKS
                        </button>
                    </div>
                </div>
            </UniversalModal>

            <PromoCard />
        </div>
    );
};

export default MagicStoryboard;


import React, { useReducer, useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    generateVoiceover, 
    generateVoiceSample, 
    generateAIScript, 
    translateScript, 
    analyzeAndTagScript 
} from '../services/geminiService';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { RefreshCw, Wand2, Type as TypeIcon, Globe, Play, Music, Volume2, Save, AlertTriangle as AlertTriangleIcon, FileText, PenSquare } from '../components/icons/LucideIcons';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { PromoCard } from '../components/PromoCard';

declare const lamejs: any;

const VOICES = {
    "Pria": [
        "Kore", "Charon", "Puck", "Fenrir", "Enceladus", "Umbriel",
        "Algieba", "Algenib", "Rasalgethi", "Iapetus", "Orus", "Achernar",
        "Alnilam", "Schedar", "Gacrux", "Pulcherrima", "Zubenelgenubi",
        "Vindemiatrix", "Sadachbia", "Sadaltager", "Sulafat", "Achird", "Despina"
    ],
    "Wanita": [
        "Zephyr", "Leda", "Aoede", "Callirrhoe", "Autonoe", "Erinome", "Laomedeia"
    ]
};

const MOODS = [
    { id: 'Excited', name: 'Penuh Semangat', icon: '🔥' },
    { id: 'Professional', name: 'Serius & Wibawa', icon: '💼' },
    { id: 'Soft', name: 'Lembut & Ramah', icon: '🌸' },
    { id: 'Casual', name: 'Santai & Ngobrol', icon: '☕' },
    { id: 'Dramatic', name: 'Dramatis', icon: '🎭' },
    { id: 'Hurry', name: 'Mendesak/Cepat', icon: '⚡' }
];

const SPEED_LABELS = ['Sangat Lambat', 'Lambat', 'Normal', 'Cepat', 'Sangat Cepat'];
const PITCH_LABELS = ['Sangat Rendah', 'Rendah', 'Normal', 'Tinggi', 'Sangat Tinggi'];

const LANGUAGES = [
    { code: 'English', name: 'Inggris' }, { code: 'Japanese', name: 'Jepang' },
    { code: 'Korean', name: 'Korea' }, { code: 'Mandarin Chinese', name: 'Mandarin' },
    { code: 'Spanish', name: 'Spanyol' }, { code: 'French', name: 'Perancis' },
    { code: 'German', name: 'Jerman' }, { code: 'Arabic', name: 'Arab' },
    { code: 'Portuguese', name: 'Portugis' }, { code: 'Italian', name: 'Italia' },
    { code: 'Thai', name: 'Thailand' }, { code: 'Vietnamese', name: 'Vietnam' },
    { code: 'Malay', name: 'Melayu' }
];

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function pcmToMp3(pcm: Int16Array, sampleRate: number): Blob | null {
    if (typeof lamejs === 'undefined') return null;
    const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
    const mp3Data = [];
    const sampleBlockSize = 1152; 

    for (let i = 0; i < pcm.length; i += sampleBlockSize) {
        const sampleChunk = pcm.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) mp3Data.push(mp3buf);
    }
    const mp3buf = mp3encoder.flush(); 
    if (mp3buf.length > 0) mp3Data.push(mp3buf);

    return new Blob(mp3Data, { type: 'audio/mp3' });
}

function pcmToWav(pcm: Int16Array, sampleRate: number): Blob {
    const numChannels = 1;
    const bitsPerSample = 16;
    const dataSize = pcm.length * 2;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (v: DataView, o: number, s: string) => {
        for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < pcm.length; i++, offset += 2) {
        view.setInt16(offset, pcm[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
}

interface StudioState {
    currentStep: number;
    inputMode: 'generate' | 'manual';
    scriptType: 'jualan' | 'formal';
    scriptTone: string;
    scriptTopic: string;
    includeTags: boolean;
    script: string;
    translateLang: string;
    voice: string;
    speed: number;
    pitch: number;
    mood: string;
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
    audioUrl: string | null;
    mp3Blob: Blob | null;
    wavBlob: Blob | null;
}

const initialState: StudioState = {
    currentStep: 1,
    inputMode: 'generate',
    scriptType: 'jualan',
    scriptTone: 'Antusias',
    scriptTopic: '',
    includeTags: true,
    script: '',
    translateLang: 'English',
    voice: 'Kore',
    speed: 2,
    pitch: 2,
    mood: 'Excited',
    isLoading: false,
    loadingMessage: '',
    error: null,
    audioUrl: null,
    mp3Blob: null,
    wavBlob: null
};

type Action = 
    | { type: 'SET_FIELD'; payload: { field: keyof StudioState; value: any } }
    | { type: 'SET_STEP'; payload: number }
    | { type: 'START_LOADING'; payload: string }
    | { type: 'FINISH_LOADING' }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'RESET' };

function reducer(state: StudioState, action: Action): StudioState {
    switch (action.type) {
        case 'SET_FIELD': return { ...state, [action.payload.field]: action.payload.value };
        case 'SET_STEP': return { ...state, currentStep: action.payload };
        case 'START_LOADING': return { ...state, isLoading: true, loadingMessage: action.payload, error: null };
        case 'FINISH_LOADING': return { ...state, isLoading: false, loadingMessage: '' };
        case 'SET_ERROR': return { ...state, error: action.payload, isLoading: false };
        case 'RESET': return initialState;
        default: return state;
    }
}

const MagicVoiceStudio: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { currentStep, inputMode, scriptType, scriptTone, scriptTopic, includeTags, script, translateLang, voice, speed, pitch, mood, isLoading, loadingMessage, error, audioUrl, mp3Blob, wavBlob } = state;
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const setField = (field: keyof StudioState, value: any) => dispatch({ type: 'SET_FIELD', payload: { field, value } });

    const handleGenerateScript = async () => {
        if (!scriptTopic.trim()) return;
        dispatch({ type: 'START_LOADING', payload: 'Menyusun Naskah Ajaib...' });
        try {
            const result = await generateAIScript(
                scriptType === 'jualan' ? 'Jualan Produk' : 'Voice Over Formal',
                scriptTone,
                scriptTopic,
                includeTags
            );
            setField('script', result);
            dispatch({ type: 'SET_STEP', payload: 2 });
        } catch (e: any) {
            dispatch({ type: 'SET_ERROR', payload: e.message });
        } finally {
            dispatch({ type: 'FINISH_LOADING' });
        }
    };

    const handleProcessManualScript = async () => {
        if (!script.trim()) return;
        dispatch({ type: 'START_LOADING', payload: 'Menganalisis Emosi Script...' });
        try {
            const result = await analyzeAndTagScript(script);
            setField('script', result);
            dispatch({ type: 'SET_STEP', payload: 2 });
        } catch (e: any) {
            dispatch({ type: 'SET_ERROR', payload: e.message });
        } finally {
            dispatch({ type: 'FINISH_LOADING' });
        }
    };

    const handleTranslate = async () => {
        if (!script.trim()) return;
        dispatch({ type: 'START_LOADING', payload: 'Menerjemahkan...' });
        try {
            const result = await translateScript(script, translateLang);
            setField('script', result);
        } catch (e: any) {
            dispatch({ type: 'SET_ERROR', payload: e.message });
        } finally {
            dispatch({ type: 'FINISH_LOADING' });
        }
    };

    const handleAutoTag = async () => {
        if (!script.trim()) return;
        dispatch({ type: 'START_LOADING', payload: 'Menganalisis Emosi...' });
        try {
            const result = await analyzeAndTagScript(script);
            setField('script', result);
        } catch (e: any) {
            dispatch({ type: 'SET_ERROR', payload: e.message });
        } finally {
            dispatch({ type: 'FINISH_LOADING' });
        }
    };

    const handleProduce = async () => {
        if (!script.trim()) return;
        dispatch({ type: 'START_LOADING', payload: 'Merender Audio High-Definition...' });
        try {
            const { base64Audio, sampleRate } = await generateVoiceover(
                script.trim(),
                voice,
                SPEED_LABELS[speed],
                PITCH_LABELS[pitch],
                MOODS.find(m => m.id === mood)?.name
            );

            const pcmBuffer = base64ToArrayBuffer(base64Audio);
            const pcm16 = new Int16Array(pcmBuffer);
            const wav = pcmToWav(pcm16, sampleRate);
            const mp3 = pcmToMp3(pcm16, sampleRate);

            setField('wavBlob', wav);
            setField('mp3Blob', mp3);
            setField('audioUrl', URL.createObjectURL(wav));
            dispatch({ type: 'SET_STEP', payload: 4 });
        } catch (e: any) {
            dispatch({ type: 'SET_ERROR', payload: e.message });
        } finally {
            dispatch({ type: 'FINISH_LOADING' });
        }
    };

    const handlePreview = async () => {
        setIsPreviewLoading(true);
        try {
            const { base64Audio, sampleRate } = await generateVoiceSample(voice);
            const pcmBuffer = base64ToArrayBuffer(base64Audio);
            const pcm16 = new Int16Array(pcmBuffer);
            const wav = pcmToWav(pcm16, sampleRate);
            const url = URL.createObjectURL(wav);
            const audio = new Audio(url);
            audio.play();
            audio.onended = () => URL.revokeObjectURL(url);
        } catch (e: any) {
            dispatch({ type: 'SET_ERROR', payload: "Gagal memuat pratinjau suara." });
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleDownload = (blob: Blob | null, ext: string) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `magic_voiceover_${Date.now()}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all dark:text-white placeholder-gray-400";
    const labelClasses = "block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1";

    return (
        <div className="w-full">
            <FeatureHeader 
                title="Go Voice Studio" 
                description="Hasilkan naskah iklan kelas dunia dan ubah menjadi suara narator manusia dengan emosi nyata menggunakan teknologi Gemini Audio FX."
            />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl p-6 sm:p-10 rounded-[3rem] border border-white/40 dark:border-white/10 shadow-2xl relative">
                    <div className="flex justify-between items-center mb-12 px-4 sm:px-10 relative">
                         <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-100 dark:bg-slate-800 -z-10 -translate-y-1/2 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-indigo-600"
                                initial={{ width: '0%' }}
                                animate={{ width: `${(currentStep - 1) * 33.33}%` }}
                            />
                        </div>
                        {[1, 2, 3, 4].map(s => (
                            <button 
                                key={s}
                                onClick={() => s < currentStep && dispatch({ type: 'SET_STEP', payload: s })}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all border-4 ${
                                    currentStep === s 
                                    ? 'bg-indigo-600 border-indigo-100 dark:border-indigo-900 text-white scale-110 shadow-lg' 
                                    : s < currentStep 
                                        ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-900 text-white'
                                        : 'bg-white dark:bg-gray-800 border-slate-100 dark:border-slate-700 text-slate-300'
                                }`}
                            >
                                {s < currentStep ? '✓' : s}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="min-h-[400px]"
                        >
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <StepHeader step={1} title="Pilih Metode Naskah" description="Gunakan bantuan AI atau siapkan script Anda sendiri." />
                                    <div className="p-1.5 bg-gray-100/80 dark:bg-black/40 rounded-2xl flex gap-1 backdrop-blur-md border border-gray-200/50 dark:border-white/5">
                                        <button 
                                            onClick={() => setField('inputMode', 'generate')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                                                inputMode === 'generate'
                                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-md'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            <Wand2 className="w-4 h-4" /> Buat Otomatis
                                        </button>
                                        <button 
                                            onClick={() => setField('inputMode', 'manual')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                                                inputMode === 'manual'
                                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-md'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            <FileText className="w-4 h-4" /> Script Sendiri
                                        </button>
                                    </div>

                                    {inputMode === 'generate' ? (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelClasses}>Tipe Script</label>
                                                    <select value={scriptType} onChange={e => setField('scriptType', e.target.value)} className={inputClasses}>
                                                        <option value="jualan">Jualan Produk / Marketing</option>
                                                        <option value="formal">Informasi Formal / Tutorial</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Tone Bahasa</label>
                                                    <select value={scriptTone} onChange={e => setField('scriptTone', e.target.value)} className={inputClasses}>
                                                        <option>Antusias</option>
                                                        <option>Ramah & Menyapa</option>
                                                        <option>Santai (Casual)</option>
                                                        <option>Profesional</option>
                                                        <option>Mendesak (Urgent)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Topik / Deskripsi Produk</label>
                                                <textarea 
                                                    value={scriptTopic}
                                                    onChange={e => setField('scriptTopic', e.target.value)}
                                                    placeholder="Contoh: Kopi robusta Lampung, wangi kuat, kemasan 100gr, harga promo 25rb..."
                                                    className={inputClasses + " h-32"}
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                                <input 
                                                    type="checkbox" 
                                                    id="tags" 
                                                    checked={includeTags} 
                                                    onChange={e => setField('includeTags', e.target.checked)}
                                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="tags" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    Sisipkan Petunjuk Emosi [tag] Secara Otomatis
                                                </label>
                                            </div>
                                            <button 
                                                onClick={handleGenerateScript}
                                                disabled={isLoading || !scriptTopic.trim()}
                                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                            >
                                                {isLoading ? <RefreshCw className="animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                                                {isLoading ? loadingMessage : 'Generate AI Script'}
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                            <div>
                                                <label className={labelClasses}>Tempel Script Anda</label>
                                                <textarea 
                                                    value={script}
                                                    onChange={e => setField('script', e.target.value)}
                                                    placeholder="Tulis naskah Anda di sini..."
                                                    className={inputClasses + " h-64 font-mono leading-relaxed"}
                                                />
                                            </div>
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                                                <p className="text-xs text-blue-700 dark:text-blue-300 flex gap-2 font-medium">
                                                    <Wand2 className="w-4 h-4 flex-shrink-0" />
                                                    AI akan menganalisis script Anda and menambahkan petunjuk emosi [tag] tanpa mengubah isi teks sedikitpun.
                                                </p>
                                            </div>
                                            <button 
                                                onClick={handleProcessManualScript}
                                                disabled={isLoading || !script.trim()}
                                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                            >
                                                {isLoading ? <RefreshCw className="animate-spin" /> : <PenSquare className="w-5 h-5" />}
                                                {isLoading ? loadingMessage : 'Proses Script & Tambah Tag Emosi'}
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <StepHeader step={2} title="Editor Naskah" description="Perhalus naskah Anda atau terjemahkan ke bahasa lain." />
                                    <div className="relative group">
                                        <textarea 
                                            value={script}
                                            onChange={e => setField('script', e.target.value)}
                                            placeholder="Tulis atau edit naskah Anda di sini..."
                                            className={inputClasses + " h-64 font-mono text-sm leading-relaxed border-2 focus:border-indigo-500"}
                                        />
                                        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setField('script', '')} className="p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                            <label className={labelClasses}>Translation Tool</label>
                                            <div className="flex gap-2">
                                                <select value={translateLang} onChange={e => setField('translateLang', e.target.value)} className={inputClasses + " py-2 text-xs"}>
                                                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                                                </select>
                                                <button onClick={handleTranslate} disabled={isLoading || !script.trim()} className="px-4 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-all font-bold text-xs flex items-center gap-2">
                                                    <Globe className="w-4 h-4" /> Translate
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col justify-center">
                                            <label className={labelClasses}>Vocal Directing</label>
                                            <button onClick={handleAutoTag} disabled={isLoading || !script.trim()} className="w-full py-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-all font-bold text-xs flex items-center justify-center gap-2">
                                                <TypeIcon className="w-4 h-4" /> Tambah Tag Emosi Otomatis
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 transition-all">Kembali</button>
                                        <button onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })} disabled={!script.trim()} className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl transition-all disabled:opacity-50">Lanjutkan ke Suara</button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-8">
                                    <StepHeader step={3} title="Konfigurasi Suara" description="Pilih karakter narator dan atur performa vokalnya." />
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className={labelClasses}>Gaya Bicara & Emosi (Akting)</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {MOODS.map(m => (
                                                    <button 
                                                        key={m.id}
                                                        onClick={() => setField('mood', m.id)}
                                                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                                                            mood === m.id 
                                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' 
                                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-indigo-300'
                                                        }`}
                                                    >
                                                        <span className="text-xl">{m.icon}</span>
                                                        <span className="text-xs font-bold">{m.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="mt-2 text-[10px] text-slate-400 font-medium italic">💡 Tips: Pilihan ini akan memerintahkan AI untuk berakting sesuai situasi naskah Anda.</p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                                            <div className="flex-grow w-full">
                                                <label className={labelClasses}>Pilihan Karakter Narator</label>
                                                <select value={voice} onChange={e => setField('voice', e.target.value)} className={inputClasses + " text-base font-bold"}>
                                                    {Object.entries(VOICES).map(([group, list]) => (
                                                        <optgroup label={group} key={group}>
                                                            {list.map(v => <option key={v} value={v}>{v}</option>)}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                            </div>
                                            <button 
                                                onClick={handlePreview}
                                                disabled={isPreviewLoading}
                                                className="w-full sm:w-auto h-[46px] px-5 bg-[#1e293b] border-2 border-indigo-500/40 hover:border-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap shadow-lg shadow-indigo-500/10"
                                            >
                                                {isPreviewLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                                Dengarkan Contoh
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                                                <div className="flex justify-between items-center mb-4">
                                                    <label className={labelClasses}>Kecepatan Baca</label>
                                                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">{SPEED_LABELS[speed]}</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="4" step="1" 
                                                    value={speed} 
                                                    onChange={e => setField('speed', parseInt(e.target.value))}
                                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                            </div>
                                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                                                <div className="flex justify-between items-center mb-4">
                                                    <label className={labelClasses}>Nada (Pitch)</label>
                                                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">{PITCH_LABELS[pitch]}</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="4" step="1" 
                                                    value={pitch} 
                                                    onChange={e => setField('pitch', parseInt(e.target.value))}
                                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 transition-all">Kembali</button>
                                        <button 
                                            onClick={handleProduce} 
                                            disabled={isLoading}
                                            className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-black shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {isLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                                            {isLoading ? 'RENDERING AUDIO...' : 'GENERATE VOICE OVER'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-8 flex flex-col items-center py-10">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse-slow"></div>
                                        <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
                                            <Music className="w-12 h-12" />
                                        </div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Audio Siap Dipakai!</h3>
                                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Naskah Anda telah diubah menjadi suara narator berkualitas tinggi.</p>
                                    </div>

                                    {audioUrl && (
                                        <div className="w-full max-w-md bg-slate-50 dark:bg-black/40 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-inner">
                                            <audio controls src={audioUrl} className="w-full h-10 accent-indigo-600" />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                                        <button 
                                            onClick={() => handleDownload(mp3Blob, 'mp3')}
                                            className="group flex flex-col items-center justify-center gap-2 p-6 bg-white dark:bg-gray-800 border-2 border-indigo-500/20 hover:border-indigo-500 rounded-[2rem] transition-all shadow-lg hover:-translate-y-1"
                                        >
                                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <DownloadIcon className="w-6 h-6" />
                                            </div>
                                            <span className="font-black text-sm text-slate-900 dark:text-white">SAVE AS MP3</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Compressed HD</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDownload(wavBlob, 'wav')}
                                            className="group flex flex-col items-center justify-center gap-2 p-6 bg-white dark:bg-gray-800 border-2 border-violet-500/20 hover:border-violet-500 rounded-[2rem] transition-all shadow-lg hover:-translate-y-1"
                                        >
                                            <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/30 text-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Save className="w-6 h-6" />
                                            </div>
                                            <span className="font-black text-sm text-slate-900 dark:text-white">SAVE AS WAV</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Lossless Audio</span>
                                        </button>
                                    </div>

                                    <button 
                                        onClick={() => dispatch({ type: 'RESET' })}
                                        className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Buat Naskah Baru
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {error && (
                        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 animate-shake">
                            <AlertTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
                            <button onClick={() => dispatch({ type: 'SET_ERROR', payload: null })} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mt-12">
                <PromoCard />
            </div>
        </div>
    );
};

const X = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
);

export default MagicVoiceStudio;

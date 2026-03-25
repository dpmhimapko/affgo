
import React, { useState, useId } from 'react';
import { UploadedImage } from '../types';
import { generateContent, generateImage } from '../services/geminiService'; 
import { Upload, Lightbulb, Download, Type as TypeIcon } from '../components/icons/LucideIcons';
import Loader from '../components/Loader';
import UniversalModal from '../components/UniversalModal';
import { FeatureHeader } from '../components/FeatureHeader';
import { PromoCard } from '../components/PromoCard';

// Declare heic2any
declare const heic2any: any;

interface FusionImageData {
    base64: string;
    mimeType: string;
    url: string;
}

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
        }
    }
    return file;
};

const UploadBox: React.FC<{
    title: string;
    onUpload: (data: FusionImageData) => void;
    previewUrl: string | null;
}> = ({ title, onUpload, previewUrl }) => {
    const inputId = useId();

    const handleFile = async (file: File) => {
        if (file) {
            try {
                const processedFile = await convertHeicToJpg(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const url = e.target?.result as string;
                    const parts = url.split(',');
                    const mimeType = processedFile.type || 'image/jpeg';
                    const base64 = parts[1];
                    onUpload({ base64, mimeType, url });
                };
                reader.readAsDataURL(processedFile);
            } catch (err) {
                console.error("Upload failed", err);
            }
        }
    };
    
    return (
        <label htmlFor={inputId} className="cursor-pointer flex flex-col p-4 text-center bg-slate-100 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 h-80 group">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 shrink-0 uppercase tracking-wide">{title}</h3>
            <div className="flex-grow flex flex-col items-center justify-center min-h-0 relative">
                {previewUrl ? (
                    <img src={previewUrl} className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                ) : (
                    <div className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors">
                        <div className="w-12 h-12 mb-3 mx-auto"><Upload className="w-full h-full" /></div>
                        <p className="mt-2 text-sm font-medium">Klik untuk mengunggah</p>
                    </div>
                )}
            </div>
            <input id={inputId} type="file" className="sr-only" accept="image/png, image/jpeg, image/webp, .heic, .HEIC" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
        </label>
    );
};


const GoFusion: React.FC = () => {
    const [subjectData, setSubjectData] = useState<FusionImageData | null>(null);
    const [referenceData, setReferenceData] = useState<FusionImageData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [generatedData, setGeneratedData] = useState<{ src: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    
    const handleGenerate = async () => {
        if (!subjectData || !referenceData) return;

        setIsLoading(true);
        setError(null);
        setGeneratedData(null);
        
        try {
            setLoadingMessage('Menganalisis gambar referensi...');
            const analyzeSystemPrompt = "You are an expert in analyzing image styles. Describe the provided image in extreme detail, focusing on style, composition, lighting, mood, and subject matter. This description will be used as a prompt for another AI to recreate the image. Be very descriptive. Respond in English.";
            const promptFromReference = await generateContent(
                "Analyze this image for a new prompt.",
                [{ base64: referenceData.base64, mimeType: referenceData.mimeType, name: 'ref.jpg' }],
                { systemInstruction: analyzeSystemPrompt }
            );

            setLoadingMessage('Menciptakan gambar baru...');
            const finalPrompt = `Create a new image based on this detailed description: "${promptFromReference}". IMPORTANT: The main subject of this new image MUST be the person from the provided subject image. Ignore any description of a person in the text prompt and replace them with the person from the subject image.`;
            
            const result = await generateImage(
                finalPrompt,
                { base64: subjectData.base64, mimeType: subjectData.mimeType, name: 'subject.jpg' },
            );
            
            setGeneratedData({ src: result.imageUrl });

        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleViewPrompt = async () => {
        if (!generatedData) return;
        setModalContent(<Loader message="Membuat prompt..." />);
        setIsModalOpen(true);
        try {
            const [,base64Data] = generatedData.src.split(',');
            const systemPrompt = `You are a prompt engineering expert. Given an image, generate four different text-to-image prompts that could create it, tailored for specific models: Midjourney, Stable Diffusion, Leonardo AI, and a general one for Google's models. Respond ONLY with a valid JSON object with keys: "midjourney", "stableDiffusion", "leonardo", and "nanoBanana".`;
            const promptsJson = await generateContent(
                "Generate T2I prompts for this image.",
                [{ base64: base64Data, mimeType: 'image/png', name: 'gen.png' }],
                {
                    responseMimeType: 'application/json',
                    responseSchema: { type: 'OBJECT', properties: { "midjourney": { "type": "STRING" }, "stableDiffusion": { "type": "STRING" }, "leonardo": { "type": "STRING" }, "nanoBanana": { "type": "STRING" } }, required: ["midjourney", "stableDiffusion", "leonardo", "nanoBanana"] }
                }
            );
            
            const prompts = JSON.parse(promptsJson);

            const copyToClipboard = (text: string, title: string) => {
                navigator.clipboard.writeText(text);
                const button = document.getElementById(`copy-btn-${title.toLowerCase()}`);
                if (button) {
                    const originalText = button.innerHTML;
                    button.innerHTML = 'Tersalin!';
                    setTimeout(() => { button.innerHTML = originalText; }, 2000);
                }
            };
            
            setModalContent(
                 <div className="p-2 space-y-6">
                    {Object.entries(prompts).map(([title, prompt]) => (
                        <div key={title}>
                            <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 capitalize text-sm">{title.replace(/([A-Z])/g, ' $1').trim()}</h4>
                            <div className="whitespace-pre-wrap bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-slate-600 dark:text-slate-300 mb-3 max-h-40 overflow-y-auto text-xs font-mono border border-slate-200 dark:border-slate-700">{String(prompt).trim()}</div>
                            <button id={`copy-btn-${title.toLowerCase()}`} onClick={() => copyToClipboard(String(prompt), title)} className="w-full text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 py-2 px-4 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition active:scale-95">Salin Prompt</button>
                        </div>
                    ))}
                </div>
            );

        } catch(err) {
            setModalContent(<p className="p-6 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">{err instanceof Error ? err.message : 'Gagal memuat prompt.'}</p>);
        }
    };
    
    return (
        <>
        <div className="w-full mx-auto">
            <FeatureHeader 
                title="Go Fusion" 
                description="Gabungkan subjek & referensi foto menjadi karya baru yang menakjubkan." 
            />
            
            <div className="mb-8 p-6 bg-violet-50/80 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30 rounded-[2rem] backdrop-blur-sm">
                <h2 className="text-base font-bold text-violet-800 dark:text-violet-200 mb-3 flex items-center gap-2">
                    <div className="h-6 w-6 text-violet-500 dark:text-violet-400"><Lightbulb className="w-full h-full" /></div>
                    Cara Penggunaan
                </h2>
                <ol className="list-decimal list-inside text-sm text-violet-700 dark:text-violet-300 space-y-1.5 pl-2 font-medium">
                    <li>Unggah <span className="font-bold">"Gambar Subjek"</span> (orang yang ingin Anda gunakan).</li>
                    <li>Unggah <span className="font-bold">"Referensi Photoshoot"</span> (foto dengan gaya, pose, atau suasana yang Anda inginkan).</li>
                    <li>Klik <span className="font-bold">"Hasilkan Gambar"</span> untuk menggabungkan subjek dari foto pertama dengan gaya dari foto kedua.</li>
                </ol>
            </div>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all shadow-sm">
                <main>
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <UploadBox title="1. Unggah Gambar Subjek" onUpload={setSubjectData} previewUrl={subjectData?.url || null} />
                        <UploadBox title="2. Unggah Referensi Photoshoot" onUpload={setReferenceData} previewUrl={referenceData?.url || null} />
                    </div>
                    
                    <div className="text-center mb-10">
                        <button 
                            onClick={handleGenerate} 
                            disabled={!subjectData || !referenceData || isLoading} 
                            className="w-full max-w-md bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:from-indigo-500 hover:to-violet-500 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span className="tracking-wide">{loadingMessage}</span>
                                </div>
                            ) : (
                                <span className="tracking-wide text-lg">✨ Hasilkan Gambar</span>
                            )}
                        </button>
                    </div>

                    <div className="w-full min-h-[24rem] bg-slate-50 dark:bg-slate-800/30 rounded-3xl p-8 flex items-center justify-center border border-slate-200 dark:border-white/5">
                        {isLoading && <Loader message={loadingMessage} />}
                        {error && <p className="text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>}
                        {generatedData && (
                            <div className="w-full max-w-2xl text-center animate-fade-in">
                                <h3 className="text-xl font-bold text-center mb-6 text-slate-900 dark:text-white">Hasil Gambar Anda</h3>
                                <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 mb-8 bg-black/5 dark:bg-white/5">
                                    <img src={generatedData.src} className="w-full object-contain" />
                                </div>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <a 
                                        href={generatedData.src} 
                                        download="go_fusion_result.png" 
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors duration-300 active:scale-95 shadow-lg"
                                    >
                                      <Download className="w-5 h-5" /> Unduh Gambar
                                    </a>
                                    <button 
                                        onClick={handleViewPrompt} 
                                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300 active:scale-95 shadow-lg"
                                    >
                                      <TypeIcon className="w-5 h-5" /> Lihat Prompt
                                    </button>
                                </div>
                            </div>
                        )}
                        {!isLoading && !error && !generatedData && (
                            <div className="text-center text-slate-400 dark:text-slate-500">
                                <div className="w-20 h-20 bg-slate-200 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-dashed border-slate-300 dark:border-white/10 rotate-3 mx-auto">
                                    <Upload className="w-8 h-8 opacity-40" />
                                </div>
                                <p className="font-bold opacity-70">Hasil gambar akan muncul di sini.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <PromoCard />
        </div>
        <UniversalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="✨ Prompt Text-to-Image">
            {modalContent}
        </UniversalModal>
        </>
    );
};

export default GoFusion;

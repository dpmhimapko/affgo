
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateModelImages } from '../services/geminiService';
import { 
    Sparkles, 
    Square as SquareIcon, 
    RectangleHorizontal as RectangleHorizontalIcon, 
    RectangleVertical as RectangleVerticalIcon, 
    Download as DownloadIcon, 
    AlertTriangle,
    User,
    Shirt,
    Camera,
    Settings,
    UserPlus,
    RefreshCw
} from '../components/icons/LucideIcons';
import Loader from '../components/Loader';
import { FeatureHeader } from '../components/FeatureHeader';
import { PromoCard } from '../components/PromoCard';

type AspectRatio = '1:1' | '16:9' | '9:16';
type ResultItem = { state: 'loading' } | { state: 'error'; message: string } | { state: 'done'; imageUrl: string };

const FormField: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1">{label}</label>
        {children}
    </div>
);

const Step: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; delay: number }> = ({ icon, title, children, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm"
    >
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-white/10 pb-4">
            <div className="w-10 h-10 flex items-center justify-center bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 rounded-xl flex-shrink-0">
                {icon}
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{title}</h3>
        </div>
        <div className="space-y-5">
            {children}
        </div>
    </motion.div>
);

const GoModel: React.FC = () => {
    // State for form inputs - Hair and Clothing are empty by default as requested
    const [gender, setGender] = useState('woman');
    const [age, setAge] = useState('20 years');
    const [bodyType, setBodyType] = useState('fit and lean');
    const [ethnicity, setEthnicity] = useState('Asian skin tone');
    const [hair, setHair] = useState('');
    const [background, setBackground] = useState('macro photography studio');
    const [clothing, setClothing] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');

    // State for generation process
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Engineering Realism...');
    const [results, setResults] = useState<ResultItem[]>([]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setResults(Array(4).fill({ state: 'loading' }));

        // Transform GUI Data into deep structured JSON for maximum realism
        const createStructuredBlueprint = (index: number) => {
            return {
                "model_intent": "high_fidelity_commercial_portrait",
                "variation_context": {
                    "id": `v-hq-${Date.now()}-${index}`,
                    "seed_variation": index * 12345
                },
                "task_priority": {
                    "primary": `Ultra-detailed professional headshot of ${gender}, age ${age}, with ${bodyType} body characteristics.`,
                    "secondary": "Render extremely realistic skin texture with visible pores, fine lines, and natural skin imperfections."
                },
                "subject_blueprint": {
                    "entity": gender,
                    "age_group": age,
                    "attributes": {
                        "ethnicity": ethnicity,
                        "skin_fidelity": "raw, unretouched skin texture, organic pore structure, natural subsurface scattering",
                        "hair_style": hair || "natural hair texture",
                        "wardrobe": clothing || "minimalist neutral attire"
                    },
                    "composition": {
                        "pose": "front-facing professional headshot, slight natural turn",
                        "expression": "warm natural smile",
                        "framing": "medium-close headshot (bust up), ensure entire head, hair, and shoulders are perfectly within the frame boundaries, no cropping of the face or cranium"
                    }
                },
                "environment_blueprint": {
                    "setting": background,
                    "lighting_setup": {
                        "type": "soft diffused studio lighting",
                        "direction": "key light from 45 degrees, subtle fill",
                        "purpose": "reveal organic skin depth and volume without creating harsh digital shadows"
                    }
                },
                "style_constraints": {
                    "aesthetic": "hyper-photorealistic editorial",
                    "camera_specs": "85mm prime lens, f/2.8, eye-level angle",
                    "quality_tier": "4K high-definition RAW format",
                    "strict_exclusions": [
                        "cropped head",
                        "cut off forehead",
                        "skin smoothing filters",
                        "beauty foundation effect",
                        "digital retouching",
                        "unnatural blur",
                        "foundation makeup",
                        "airbrushing"
                    ]
                },
                "output_validation": {
                    "anatomical_integrity": "perfectly symmetrical and correct",
                    "success_metric": "visible skin grain and non-cropped headshot composition"
                }
            };
        };

        for (let i = 0; i < 4; i++) {
            setLoadingMessage(`Rendering HQ Variation (${i + 1}/4)...`);
            try {
                const blueprint = createStructuredBlueprint(i);
                const finalPromptJSON = JSON.stringify(blueprint, null, 2);
                
                // Call image generation via service
                const { imageUrls } = await generateModelImages(finalPromptJSON, aspectRatio, 1);
                
                if (imageUrls && imageUrls.length > 0) {
                    setResults(prev => {
                        const newResults = [...prev];
                        newResults[i] = { state: 'done', imageUrl: imageUrls[0] };
                        return newResults;
                    });
                } else {
                    throw new Error("AI returned no visual parts.");
                }
            } catch (error) {
                console.error(`Error in variation ${i}:`, error);
                setResults(prev => {
                    const newResults = [...prev];
                    newResults[i] = { state: 'error', message: "Gagal memuat visual realistis." };
                    return newResults;
                });
            }
        }

        setIsLoading(false);
        setLoadingMessage('Engineering Realism...');
    };

    const aspectClass = useMemo(() => {
        switch (aspectRatio) {
            case '1:1': return 'aspect-square';
            case '16:9': return 'aspect-video';
            case '9:16': return 'aspect-[9/16]';
            default: return 'aspect-square';
        }
    }, [aspectRatio]);

    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm appearance-none cursor-pointer";

    return (
        <div className="w-full mx-auto">
            <FeatureHeader 
                title="Go Model" 
                description="Ciptakan model AI fotorealistis dengan detail tekstur kulit ekstrem untuk kebutuhan photoshoot Anda."
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Configuration */}
                <div className="flex flex-col gap-6">
                    <Step icon={<User />} title="1. Atribut Model" delay={0.1}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Gender">
                                <div className="relative">
                                    <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClasses}>
                                        <option value="woman">Woman</option>
                                        <option value="man">Man</option>
                                        <option value="non-binary model">Non-binary Model</option>
                                    </select>
                                </div>
                            </FormField>
                             <FormField label="Usia">
                                <div className="relative">
                                    <select value={age} onChange={(e) => setAge(e.target.value)} className={inputClasses}>
                                        <option value="5-10 years">Child (5-10)</option>
                                        <option value="15-18 years">Teenager (15-18)</option>
                                        <option value="20 years">Young Adult (20s)</option>
                                        <option value="30-40 years">Adult (30s-40s)</option>
                                        <option value="50 years">Middle-Aged (50s)</option>
                                        <option value="65 years">Elderly (65+)</option>
                                    </select>
                                </div>
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Bentuk Tubuh">
                                <div className="relative">
                                    <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className={inputClasses}>
                                        <option value="standard proportional">Standar (Proporsional)</option>
                                        <option value="plus-size curvy">Gemuk (Plus-size)</option>
                                        <option value="slim slender">Kurus (Slim)</option>
                                        <option value="fit and lean">Seksi (Fit & Toned)</option>
                                        <option value="tall statuesque">Tinggi (Tall)</option>
                                        <option value="petite short">Pendek (Petite)</option>
                                    </select>
                                </div>
                            </FormField>
                            <FormField label="Etnis / Detail Kulit">
                                <div className="relative">
                                    <select value={ethnicity} onChange={(e) => setEthnicity(e.target.value)} className={inputClasses}>
                                        <option value="natural skin tone with visible pores">Natural Skin</option>
                                        <option value="Southeast Asian (Sawo Matang)">Asian (Sawo Matang)</option>
                                        <option value="East Asian (Kuning Langsat)">East Asian</option>
                                        <option value="Caucasian fair skin">Caucasian</option>
                                        <option value="African dark rich skin">African</option>
                                        <option value="Hispanic warm skin">Hispanic</option>
                                        <option value="Middle Eastern olive skin">Middle Eastern</option>
                                    </select>
                                </div>
                            </FormField>
                        </div>
                    </Step>

                    <Step icon={<Shirt />} title="2. Styling (Tulis Sendiri)" delay={0.2}>
                         <FormField label="Gaya Rambut">
                            <input 
                                type="text" 
                                value={hair} 
                                onChange={(e) => setHair(e.target.value)} 
                                className={inputClasses} 
                                placeholder="cth: long dark wavy hair, high ponytail..." 
                            />
                        </FormField>
                        <FormField label="Pakaian (Wardrobe)">
                            <textarea 
                                value={clothing} 
                                onChange={(e) => setClothing(e.target.value)} 
                                rows={2} 
                                className={inputClasses} 
                                placeholder="cth: white designer tank-top, casual denim jacket..." 
                            />
                        </FormField>
                    </Step>
                    
                    <Step icon={<Camera />} title="3. Scene & Output" delay={0.3}>
                        <FormField label="Setting Studio">
                            <div className="relative">
                                <select value={background} onChange={(e) => setBackground(e.target.value)} className={inputClasses}>
                                    <option value="macro photography studio">Macro Studio (Detailed)</option>
                                    <option value="plain white studio">Minimalist Studio</option>
                                    <option value="outdoor natural sunlight">Outdoor Natural</option>
                                    <option value="luxury interior closet">Modern Interior</option>
                                    <option value="tropical beach morning">Beach</option>
                                </select>
                            </div>
                        </FormField>
                         <FormField label="Rasio Aspek">
                            <div className="grid grid-cols-3 gap-3">
                               <button 
                                    onClick={() => setAspectRatio('9:16')} 
                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${aspectRatio === '9:16' ? 'bg-violet-50 dark:bg-violet-900/30 border-violet-500 text-violet-700 dark:text-violet-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-violet-300'}`}
                                >
                                    <RectangleVerticalIcon className="w-4 h-4" />
                                    <span className="text-sm font-bold">9:16</span>
                                </button>
                               <button 
                                    onClick={() => setAspectRatio('1:1')} 
                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${aspectRatio === '1:1' ? 'bg-violet-50 dark:bg-violet-900/30 border-violet-500 text-violet-700 dark:text-violet-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-violet-300'}`}
                                >
                                    <SquareIcon className="w-4 h-4" />
                                    <span className="text-sm font-bold">1:1</span>
                                </button>
                               <button 
                                    onClick={() => setAspectRatio('16:9')} 
                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${aspectRatio === '16:9' ? 'bg-violet-50 dark:bg-violet-900/30 border-violet-500 text-violet-700 dark:text-violet-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-violet-300'}`}
                                >
                                    <RectangleHorizontalIcon className="w-4 h-4" />
                                    <span className="text-sm font-bold">16:9</span>
                                </button>
                            </div>
                        </FormField>
                    </Step>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                        <button 
                            onClick={handleGenerate} 
                            disabled={isLoading} 
                            className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span className="tracking-wide">{loadingMessage}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="tracking-wide">Buat 4 Foto Realistis</span>
                                </div>
                            )}
                        </button>
                    </motion.div>
                </div>

                {/* Right Column: Results */}
                <div className="lg:sticky top-24">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm h-full">
                         <AnimatePresence mode="wait">
                            <motion.div
                                key={results.length > 0 ? 'results' : 'placeholder'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {results.length === 0 ? (
                                    <div className={`w-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50/50 dark:bg-white/5`}>
                                        <div className="w-20 h-20 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-4">
                                            <UserPlus className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">Ultra-Realistic Output</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs">Konfigurasikan atribut model untuk menghasilkan detail kulit yang nyata (Pori-pori, Garis halus).</p>
                                    </div>
                                ) : (
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {results.map((result, index) => (
                                            <div key={index} className={`relative rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/20 flex items-center justify-center ${aspectClass}`}>
                                                {result.state === 'loading' && <Loader message="Rendering HQ..." />}
                                                {result.state === 'error' && (
                                                    <div className="text-xs text-red-500 p-4 text-center flex flex-col items-center justify-center h-full w-full bg-red-50 dark:bg-red-900/20">
                                                        <AlertTriangle className="w-6 h-6 mb-2 opacity-50" />
                                                        <span>{result.message}</span>
                                                    </div>
                                                )}
                                                {result.state === 'done' && (
                                                    <div className="relative w-full h-full group">
                                                        <img src={result.imageUrl} alt="Generated model" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                                            <a href={result.imageUrl} download={`go_model_hd_${index}.png`} className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-colors shadow-lg" title="Unduh Gambar">
                                                                <DownloadIcon className="w-5 h-5" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                         </AnimatePresence>
                    </div>
                </div>
            </div>
            <PromoCard />
        </div>
    );
};

export default GoModel;

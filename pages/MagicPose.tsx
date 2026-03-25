
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadedImage } from '../types';
import { changeModelPose } from '../services/geminiService';
import { 
    User, Armchair, Footprints, Smile, Sparkles,
    Square as SquareIcon, RectangleHorizontal as RectangleHorizontalIcon, RectangleVertical as RectangleVerticalIcon
} from '../components/icons/LucideIcons';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { Spinner } from '../components/Spinner';
import { useLanguage } from '../contexts/LanguageContext';
import { PromoCard } from '../components/PromoCard';

type AspectRatio = '1:1' | '16:9' | '9:16';

const PRESET_POSES = [
    { name: 'Berdiri', icon: <User /> },
    { name: 'Duduk', icon: <Armchair /> },
    { name: 'Berjalan', icon: <Footprints /> },
    { name: 'Tertawa', icon: <Smile /> },
];

const PoseButton: React.FC<{ 
    label: string, 
    icon: React.ReactNode, 
    isActive: boolean, 
    onClick: () => void 
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 h-32 ${
            isActive
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-lg ring-1 ring-black/5 dark:ring-white/10 transform scale-[1.02] border-2 border-indigo-500'
                : 'bg-white/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/80 dark:hover:bg-white/10 border border-transparent hover:border-gray-200 dark:hover:border-white/10'
        }`}
    >
        <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''} [&>svg]:w-8 [&>svg]:h-8`}>
            {icon}
        </span>
        <span className="font-bold text-sm">{label}</span>
        {isActive && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500"></div>
        )}
    </button>
);

const MagicPose: React.FC = () => {
    const { t } = useLanguage();
    
    const [modelImage, setModelImage] = useState<(UploadedImage & { dataUrl: string }) | null>(null);
    const [selectedPose, setSelectedPose] = useState<string | null>(PRESET_POSES[0].name);
    const [customPose, setCustomPose] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    
    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (dataUrl: string, mimeType: string) => {
        const base64 = dataUrl.split(',')[1];
        setModelImage({ dataUrl, mimeType, base64 });
        setGeneratedImages(null);
        setSelectedImage(null);
        setError(null);
    };

    const handlePoseSelect = (pose: string) => {
        setSelectedPose(pose);
        setCustomPose('');
    };

    const handleCustomPoseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomPose(e.target.value);
        setSelectedPose(null);
    };

    const handleGenerate = async () => {
        const finalPose = selectedPose || customPose;
        if (!modelImage || !finalPose) {
            setError("Harap unggah gambar dan pilih atau tulis pose.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages(null);
        setSelectedImage(null);

        try {
            const promises = Array(4).fill(0).map(() => changeModelPose(modelImage, finalPose, aspectRatio));
            const results = await Promise.all(promises);
            const imageUrls = results.map(r => r.imageUrl);
            
            setGeneratedImages(imageUrls);
            if (imageUrls.length > 0) {
                setSelectedImage(imageUrls[0]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal mengubah pose.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setModelImage(null);
        setGeneratedImages(null);
        setSelectedImage(null);
        setIsLoading(false);
        setError(null);
    };

    const handleDownload = () => {
        if (selectedImage) {
            const link = document.createElement('a');
            link.href = selectedImage;
            link.download = `magic-pose-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const isGenerateDisabled = !modelImage || !(selectedPose || customPose.trim()) || isLoading;
    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";

    return (
        <div className="w-full">
            <FeatureHeader
                title="Go Pose"
                description="Unggah foto model, pilih atau jelaskan pose baru, dan biarkan AI mengubahnya secara ajaib."
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <aside className="lg:col-span-2 lg:sticky top-8 self-start space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        
                    <div>
                        <StepHeader step={1} title="Unggah Foto Model" description="Pastikan seluruh tubuh terlihat untuk hasil terbaik." />
                        <ImageUploader 
                            onImageUpload={handleImageUpload}
                            uploadedImage={modelImage?.dataUrl || null}
                            label="Model Image"
                            labelKey="uploader.imageLabel"
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={2} title="Pilih Pose Baru" description="Pilih preset atau jelaskan pose custom." />
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {PRESET_POSES.map(pose => (
                                <PoseButton
                                    key={pose.name}
                                    label={pose.name}
                                    icon={pose.icon}
                                    isActive={selectedPose === pose.name}
                                    onClick={() => handlePoseSelect(pose.name)}
                                />
                            ))}
                        </div>
                        <input
                            type="text"
                            value={customPose}
                            onChange={handleCustomPoseChange}
                            placeholder="Atau tulis pose kustom (misal: Melompat kegirangan)..."
                            className={inputClasses}
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader step={3} title="Rasio Aspek" />
                        <div className="grid grid-cols-3 gap-2">
                            {(['1:1', '16:9', '9:16'] as AspectRatio[]).map(r => (
                                <button 
                                    key={r} 
                                    onClick={() => setAspectRatio(r)} 
                                    className={`p-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
                                        aspectRatio === r 
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300 shadow-sm' 
                                        : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                                    }`}
                                >
                                    {r === '1:1' ? <SquareIcon className="w-4 h-4"/> : r === '16:9' ? <RectangleHorizontalIcon className="w-4 h-4"/> : <RectangleVerticalIcon className="w-4 h-4"/>}
                                    <span className="text-sm font-bold">{r}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={handleGenerate} 
                            disabled={isGenerateDisabled} 
                            className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <Spinner className="h-5 w-5 text-white" />
                                    <span className="tracking-wide">Membuat Pose...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="tracking-wide">Buat 4 Pose Baru</span>
                                </div>
                            )}
                        </button>
                        {error && <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>}
                    </div>
                </aside>

                <section className="lg:col-span-3">
                    <ResultDisplay
                        originalImage={modelImage?.dataUrl || null}
                        generatedImages={generatedImages}
                        selectedImage={selectedImage}
                        isLoading={isLoading}
                        error={error}
                        onDownload={handleDownload}
                        onReset={handleReset}
                        onSelectImage={setSelectedImage}
                    />
                </section>
            </div>
            <PromoCard />
        </div>
    );
};

export default MagicPose;

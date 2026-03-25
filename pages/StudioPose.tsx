import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import { Spinner } from '../components/Spinner';
import { FeatureHeader } from '../components/FeatureHeader';
import { generateStudioPoses } from '../services/geminiService';
import type { ImageData, PoseStudioOptions } from '../types';
import { PoseStudioMode } from '../types';
import { THEMES } from '../constants';
import { SmartIcon } from '../components/icons/SmartIcon';
import { CustomizeIcon } from '../components/icons/CustomizeIcon';
import { StepHeader } from '../components/StepHeader';

const ANGLES = ['eyeLevel', 'highAngle', 'lowAngle'];
const FRAMES = ['fullBody', 'mediumShot', 'cowboyShot', 'closeup'];

const ModeButton = ({ Icon, label, isActive, onClick }: { Icon: React.FC, label: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
      isActive
        ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-md ring-1 ring-black/5 dark:ring-white/10 transform scale-[1.02]'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
    }`}
  >
    <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
        <Icon />
    </span>
    <span>{label}</span>
  </button>
);

const PoseStyleOptions: React.FC<{
  onGenerate: (mode: PoseStudioMode, options: PoseStudioOptions) => void;
  isLoading: boolean;
  isModelImageUploaded: boolean;
}> = ({ onGenerate, isLoading, isModelImageUploaded }) => {
  const { t } = useLanguage();
  const [activeMode, setActiveMode] = useState<PoseStudioMode>(PoseStudioMode.SMART);
  const [theme, setTheme] = useState(THEMES[0].key);
  const [customTheme, setCustomTheme] = useState('');
  const [angle, setAngle] = useState(ANGLES[0]);
  const [framing, setFraming] = useState(FRAMES[0]);
  const [instructions, setInstructions] = useState('');
  
  useEffect(() => {
    setInstructions('');
  }, [activeMode]);

  const handleGenerateClick = () => {
    if (!isModelImageUploaded) return;
    const options: PoseStudioOptions = { theme, customTheme, angle, framing, instructions };
    onGenerate(activeMode, options);
  };

  const isButtonDisabled = isLoading || !isModelImageUploaded;
  
  const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm appearance-none";
  const labelClasses = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="p-1.5 bg-gray-100/80 dark:bg-black/40 rounded-2xl flex flex-col sm:flex-row gap-1 backdrop-blur-md border border-gray-200/50 dark:border-white/5">
        <ModeButton Icon={SmartIcon} label={t('poseStudio.modes.smart.title')} isActive={activeMode === PoseStudioMode.SMART} onClick={() => setActiveMode(PoseStudioMode.SMART)} />
        <ModeButton Icon={CustomizeIcon} label={t('poseStudio.modes.customize.title')} isActive={activeMode === PoseStudioMode.CUSTOMIZE} onClick={() => setActiveMode(PoseStudioMode.CUSTOMIZE)} />
      </div>

      <div className="min-h-[200px]">
        {activeMode === PoseStudioMode.SMART && (
           <div className="flex flex-col items-center justify-center text-center h-[240px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-8 bg-gray-50/30 dark:bg-white/5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20 text-indigo-600 dark:text-indigo-300 rounded-2xl flex items-center justify-center mb-4 shadow-inner ring-1 ring-indigo-500/20">
                <SmartIcon />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">{t('poseStudio.modes.smart.title')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">{t('poseStudio.modes.smart.description')}</p>
          </div>
        )}
        {activeMode === PoseStudioMode.CUSTOMIZE && (
          <div className="space-y-5 animate-fade-in">
             <div>
              <label htmlFor="theme" className={labelClasses}>{t('poseStudio.form.theme.label')}</label>
               <div className="relative group">
                <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} className={`${inputClasses} cursor-pointer`}>
                    {THEMES.map(tItem => <option key={tItem.key} value={tItem.key}>{t(`themes.${tItem.key}`)}</option>)}
                    <option value="Other">{t('options.customize.theme.other')}</option>
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            {theme === 'Other' && (
              <div>
                <label htmlFor="custom-theme" className={labelClasses}>{t('options.customize.customTheme.label')}</label>
                <input type="text" id="custom-theme" className={inputClasses} placeholder={t('options.customize.customTheme.placeholder')} value={customTheme} onChange={(e) => setCustomTheme(e.target.value)} />
              </div>
            )}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="angle" className={labelClasses}>{t('poseStudio.form.angle.label')}</label>
                    <div className="relative group">
                        <select id="angle" value={angle} onChange={(e) => setAngle(e.target.value)} className={`${inputClasses} cursor-pointer`}>
                            {ANGLES.map(a => <option key={a} value={a}>{t(`poseStudio.angles.${a}`)}</option>)}
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="framing" className={labelClasses}>{t('poseStudio.form.framing.label')}</label>
                    <div className="relative group">
                        <select id="framing" value={framing} onChange={(e) => setFraming(e.target.value)} className={`${inputClasses} cursor-pointer`}>
                            {FRAMES.map(f => <option key={f} value={f}>{t(`poseStudio.frames.${f}`)}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
             </div>
             <div>
              <label htmlFor="instructions" className={labelClasses}>{t('poseStudio.form.instructions.label')}</label>
              <textarea id="instructions" rows={2} className={inputClasses} placeholder={t('poseStudio.form.instructions.placeholder')} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
            </div>
          </div>
        )}
      </div>
      
      <div className="pt-2">
        <button
            onClick={handleGenerateClick}
            disabled={isButtonDisabled}
            className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_10px_40px_-5px_rgba(79,70,229,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
        >
            {isLoading ? (
                 <div className="flex items-center gap-3">
                    <Spinner className="h-5 w-5 text-white" />
                    <span className="tracking-wide">Generating Poses...</span>
                </div>
            ) : (
                <span className="tracking-wide">{t('poseStudio.generateButton')}</span>
            )}
        </button>
        {!isModelImageUploaded && (
             <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{t('poseStudio.errors.noModelImage')}</p>
        )}
      </div>
    </div>
  );
};

export const StudioPose: React.FC = () => {
    const { t } = useLanguage();
    const [modelImage, setModelImage] = useState<ImageData | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleModelImageUpload = (dataUrl: string, mimeType: string) => {
        setModelImage({ dataUrl, mimeType });
        setGeneratedImages(null);
        setSelectedImage(null);
        setError(null);
    };
    
    const handleGenerate = async (mode: PoseStudioMode, options: PoseStudioOptions) => {
        if (!modelImage) {
            setError(t('poseStudio.errors.noModelImage'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages(null);
        setSelectedImage(null);

        try {
            const result = await generateStudioPoses(modelImage, mode, options);
            setGeneratedImages(result.imageUrls);
            if (result.imageUrls && result.imageUrls.length > 0) {
                setSelectedImage(result.imageUrls[0]);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An unexpected error occurred.");
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
            link.download = `studio-pose-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleSelectImage = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    return (
      <div className="w-full">
        <FeatureHeader
          title={t('poseStudio.page.title')}
          description={t('poseStudio.page.description')}
        />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="xl:col-span-5 space-y-8">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all space-y-8">
                    <div>
                        <StepHeader 
                            step={1}
                            title={t('poseStudio.sections.uploadModel.title')}
                            description={t('poseStudio.sections.uploadModel.subtitle')}
                        />
                        <ImageUploader
                            onImageUpload={handleModelImageUpload}
                            uploadedImage={modelImage?.dataUrl || null}
                            label="Model with Product"
                            labelKey="uploader.modelLabel"
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                        <StepHeader 
                            step={2}
                            title={t('poseStudio.sections.chooseStyle.title')}
                            description={t('poseStudio.sections.chooseStyle.subtitle')}
                        />
                        <PoseStyleOptions
                            onGenerate={handleGenerate}
                            isLoading={isLoading}
                            isModelImageUploaded={!!modelImage}
                        />
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="xl:col-span-7 xl:sticky xl:top-24 h-fit">
                <ResultDisplay
                    originalImage={modelImage?.dataUrl || null}
                    generatedImages={generatedImages}
                    selectedImage={selectedImage}
                    isLoading={isLoading}
                    error={error}
                    onDownload={handleDownload}
                    onReset={handleReset}
                    onSelectImage={handleSelectImage}
                />
            </div>
        </div>
      </div>
    );
};
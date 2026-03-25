import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import type { ImageData } from '../types';
import { ImageEditorMode } from '../types';

import { ResizeIcon } from '../components/icons/ResizeIcon';
import { MagicBrushIcon } from '../components/icons/MagicBrushIcon';
import { ResizeControls } from '../components/ImageEditor/ResizeControls';
import { MagicBrushCanvas } from '../components/ImageEditor/MagicBrushCanvas';
import { Spinner } from '../components/Spinner';
import { StepHeader } from '../components/StepHeader';


const ToolButton = ({ Icon, label, isActive, onClick }: { Icon: React.FC, label: string, isActive: boolean, onClick: () => void }) => (
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


export const ImageEditor: React.FC = () => {
  const { t } = useLanguage();
  const [uploadedImage, setUploadedImage] = useState<ImageData | null>(null);
  const [activeTool, setActiveTool] = useState<ImageEditorMode>(ImageEditorMode.RESIZE);
  
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionTrigger, setActionTrigger] = useState<(() => void) | null>(null);

  const handleImageUpload = (dataUrl: string, mimeType: string) => {
    setUploadedImage({ dataUrl, mimeType });
    setGeneratedImages(null);
    setSelectedImage(null);
    setError(null);
  };
  
  const handleGenerate = async () => {
    if (actionTrigger) {
      actionTrigger();
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setGeneratedImages(null);
    setSelectedImage(null);
    setIsLoading(false);
    setError(null);
    setActionTrigger(null);
  };

  const handleDownload = () => {
    if (selectedImage) {
      const link = document.createElement('a');
      link.href = selectedImage;
      link.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const isGenerateDisabled = isLoading || !uploadedImage;

  return (
    <div className="w-full">
      <FeatureHeader
        title={t('imageEditor.page.title')}
        description={t('imageEditor.page.description')}
      />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-5 space-y-8">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all space-y-8">
                {/* Step 1: Upload */}
                <div>
                    <StepHeader 
                        step={1}
                        title={t('sections.upload.title')}
                        description={t('sections.upload.subtitle')}
                    />
                    <ImageUploader 
                        onImageUpload={handleImageUpload}
                        uploadedImage={uploadedImage?.dataUrl || null}
                        label="Upload Image"
                        labelKey="uploader.imageLabel"
                    />
                </div>

                {/* Step 2: Choose Tool */}
                <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                    <StepHeader 
                        step={2}
                        title={t('sections.tools.title')}
                        description={t('sections.tools.subtitle')}
                    />
                    <div className="p-1.5 bg-gray-100/80 dark:bg-black/40 rounded-2xl flex flex-col sm:flex-row gap-1 backdrop-blur-md border border-gray-200/50 dark:border-white/5">
                        <ToolButton Icon={ResizeIcon} label={t('imageEditor.tools.resize.title')} isActive={activeTool === ImageEditorMode.RESIZE} onClick={() => setActiveTool(ImageEditorMode.RESIZE)} />
                        <ToolButton Icon={MagicBrushIcon} label={t('imageEditor.tools.magicBrush.title')} isActive={activeTool === ImageEditorMode.MAGIC_BRUSH} onClick={() => setActiveTool(ImageEditorMode.MAGIC_BRUSH)} />
                    </div>
                </div>

                {/* Step 3: Tool Options */}
                <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                    <StepHeader 
                        step={3}
                        title={t('sections.tools.options.title')}
                        description={t('sections.tools.options.subtitle')}
                    />
                    
                    <div className="min-h-[150px]">
                    {activeTool === ImageEditorMode.RESIZE && uploadedImage && (
                        <ResizeControls 
                        originalImage={uploadedImage} 
                        setIsLoading={setIsLoading}
                        setError={setError}
                        setGeneratedImages={setGeneratedImages}
                        setSelectedImage={setSelectedImage}
                        setActionTrigger={setActionTrigger}
                        />
                    )}
                    {activeTool === ImageEditorMode.MAGIC_BRUSH && uploadedImage && (
                        <MagicBrushCanvas
                        originalImage={uploadedImage} 
                        setIsLoading={setIsLoading}
                        setError={setError}
                        setGeneratedImages={setGeneratedImages}
                        setSelectedImage={setSelectedImage}
                        setActionTrigger={setActionTrigger}
                        />
                    )}
                    {!uploadedImage && (
                         <div className="flex flex-col items-center justify-center text-center h-[150px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-gray-50/30 dark:bg-white/5">
                            <p className="text-gray-400 dark:text-gray-500 font-medium">{t('errors.noImage')}</p>
                        </div>
                    )}
                    </div>
                    
                    <div className="pt-6 mt-2">
                         <button
                            onClick={handleGenerate}
                            disabled={isGenerateDisabled}
                            className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_10px_40px_-5px_rgba(79,70,229,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                 <div className="flex items-center gap-3">
                                    <Spinner className="h-5 w-5 text-white" />
                                    <span className="tracking-wide">Applying Edit...</span>
                                </div>
                            ) : (
                                <span className="tracking-wide">{t('imageEditor.generateButton')}</span>
                            )}
                        </button>
                        {error && !isLoading && (
                             <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-7 xl:sticky xl:top-24 h-fit">
            <ResultDisplay
            originalImage={uploadedImage?.dataUrl || null}
            generatedImages={generatedImages}
            selectedImage={selectedImage}
            isLoading={isLoading}
            error={error}
            onDownload={handleDownload}
            onReset={handleReset}
            onSelectImage={setSelectedImage}
            loadingTitleKey='results.loading.titleEditor'
            resultTitleKey='results.titleEditor'
            resultDescriptionKey='results.descriptionEditor'
            />
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import { generateAdImage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import type { ImageData, AdCopyOptions } from '../types';
import { Spinner } from '../components/Spinner';
import { AICopywriterModal } from '../components/AICopywriterModal';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { FeatureHeader } from '../components/FeatureHeader';
import { StepHeader } from '../components/StepHeader';
import { PromoCard } from '../components/PromoCard';

export const AdCreator: React.FC = () => {
  const { t } = useLanguage();
  const [productImage, setProductImage] = useState<ImageData | null>(null);
  const [referenceImage, setReferenceImage] = useState<ImageData | null>(null);
  const [adCopy, setAdCopy] = useState<AdCopyOptions>({
    headline: '',
    description: '',
    cta: '',
    instructions: '',
  });
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopywriterModalOpen, setIsCopywriterModalOpen] = useState(false);


  const handleProductImageUpload = (dataUrl: string, mimeType: string) => {
    setProductImage({ dataUrl, mimeType });
    setGeneratedImages(null);
    setSelectedImage(null);
    setError(null);
  };

  const handleReferenceImageUpload = (dataUrl: string, mimeType: string) => {
    setReferenceImage({ dataUrl, mimeType });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdCopy(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectCopy = (text: string, field: keyof Omit<AdCopyOptions, 'instructions'>) => {
    setAdCopy(prev => ({ ...prev, [field]: text }));
    setIsCopywriterModalOpen(false);
  };

  const handleGenerate = async () => {
    if (!productImage) {
      setError(t('adCreator.errors.noProductImage'));
      return;
    }
    if (!adCopy.headline.trim()) {
      setError(t('adCreator.errors.noHeadline'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages(null);
    setSelectedImage(null);

    try {
      const result = await generateAdImage(productImage, adCopy, referenceImage);
      setGeneratedImages(result.imageUrls);
      if (result.imageUrls && result.imageUrls.length > 0) {
        setSelectedImage(result.imageUrls[0]);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setProductImage(null);
    setReferenceImage(null);
    setAdCopy({ headline: '', description: '', cta: '', instructions: '' });
    setGeneratedImages(null);
    setSelectedImage(null);
    setIsLoading(false);
    setError(null);
  };

  const handleDownload = () => {
    if (selectedImage) {
      const link = document.createElement('a');
      link.href = selectedImage;
      link.download = `ad-poster-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isGenerateDisabled = isLoading || !productImage || !adCopy.headline.trim();

  const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";
  const labelClasses = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";

  return (
    <div className="w-full">
        <FeatureHeader
          title={t('adCreator.page.title')}
          description={t('adCreator.page.description')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column: Upload and Options */}
          <aside className="lg:col-span-2 lg:sticky top-8 self-start space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                {/* Product Upload */}
                <div>
                    <StepHeader 
                        step={1}
                        title={t('sections.upload.title')}
                        description={t('sections.upload.subtitle')}
                    />
                    <ImageUploader 
                        onImageUpload={handleProductImageUpload}
                        uploadedImage={productImage?.dataUrl || null}
                        label="Upload Product Image"
                        labelKey="uploader.productLabel"
                    />
                </div>
                
                {/* Ad Copy Form */}
                <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                     <div className="flex items-center justify-between gap-4 mb-2">
                        <StepHeader 
                            step={2}
                            title={t('adCreator.sections.addCopy.title')}
                            description={t('adCreator.sections.addCopy.subtitle')}
                        />
                        <button
                            onClick={() => setIsCopywriterModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors shadow-sm mb-6"
                        >
                        <SparklesIcon className="w-4 h-4" />
                        {t('adCreator.copywriter.button').split(' ')[0]}
                        </button>
                    </div>
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="headline" className={labelClasses}>{t('adCreator.form.headline.label')}</label>
                            <input
                                type="text"
                                name="headline"
                                id="headline"
                                value={adCopy.headline}
                                onChange={handleInputChange}
                                className={inputClasses}
                                placeholder={t('adCreator.form.headline.placeholder')}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className={labelClasses}>{t('adCreator.form.description.label')}</label>
                            <textarea
                                name="description"
                                id="description"
                                rows={3}
                                value={adCopy.description}
                                onChange={handleInputChange}
                                className={inputClasses}
                                placeholder={t('adCreator.form.description.placeholder')}
                            />
                        </div>
                        <div>
                            <label htmlFor="cta" className={labelClasses}>{t('adCreator.form.cta.label')}</label>
                            <input
                                type="text"
                                name="cta"
                                id="cta"
                                value={adCopy.cta}
                                onChange={handleInputChange}
                                className={inputClasses}
                                placeholder={t('adCreator.form.cta.placeholder')}
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>{t('adCreator.form.reference.label')}</label>
                             <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-3 rounded-xl mb-4">
                                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed flex gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {t('adCreator.form.reference.description')}
                                </p>
                            </div>
                            <ImageUploader 
                                onImageUpload={handleReferenceImageUpload}
                                uploadedImage={referenceImage?.dataUrl || null}
                                label="Upload Style Reference"
                                labelKey="uploader.styleReferenceLabel"
                            />
                        </div>
                        <div>
                            <label htmlFor="instructions" className={labelClasses}>{t('adCreator.form.instructions.label')}</label>
                            <textarea
                                name="instructions"
                                id="instructions"
                                rows={2}
                                value={adCopy.instructions}
                                onChange={handleInputChange}
                                className={inputClasses}
                                placeholder={t('adCreator.form.instructions.placeholder')}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="pt-4">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerateDisabled}
                        className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden"
                      >
                        {isLoading ? (
                             <div className="flex items-center gap-3">
                                <Spinner className="h-5 w-5 text-white" />
                                <span className="tracking-wide">Generating Ad...</span>
                            </div>
                        ) : (
                             <span className="tracking-wide">{t('adCreator.generateButton')}</span>
                        )}
                      </button>
                      {error && (
                         <p className="text-center text-sm text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">{error}</p>
                      )}
                </div>
          </aside>

          {/* Right Column: Result Display */}
          <section className="lg:col-span-3">
            <ResultDisplay
                originalImage={productImage?.dataUrl || null}
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
      <AICopywriterModal 
        isOpen={isCopywriterModalOpen}
        onClose={() => setIsCopywriterModalOpen(false)}
        onSelectCopy={handleSelectCopy}
      />
      <PromoCard />
    </div>
  );
}
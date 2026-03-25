import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureHeader } from '../components/FeatureHeader';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { generateVideo, suggestMotionPrompt } from '../services/geminiService';
import type { ImageData } from '../types';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { InfoIcon } from '../components/icons/InfoIcon';
import { StepHeader } from '../components/StepHeader';
import { PromoCard } from '../components/PromoCard';

export const VideoStudio: React.FC = () => {
  const { t } = useLanguage();
  const [image, setImage] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicPromptLoading, setIsMagicPromptLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      try {
        const messages = JSON.parse(t('videoStudio.loading.messages'));
        let messageIndex = 0;
        setLoadingMessage(messages[messageIndex]);
        interval = window.setInterval(() => {
          messageIndex = (messageIndex + 1) % messages.length;
          setLoadingMessage(messages[messageIndex]);
        }, 5000);
      } catch(e) {
        console.error("Failed to parse loading messages:", e);
        setLoadingMessage(t('videoStudio.loading.title'));
      }
    }
    return () => clearInterval(interval);
  }, [isLoading, t]);

  const handleImageUpload = (dataUrl: string, mimeType: string) => {
    setImage({ dataUrl, mimeType });
    setVideoUrl(null);
    setError(null);
  };

  const handleMagicPrompt = async () => {
    if (!image) return;
  
    setIsMagicPromptLoading(true);
    setError(null);
    try {
      const suggestedPrompt = await suggestMotionPrompt(image);
      setPrompt(suggestedPrompt);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to generate a magic prompt.");
    } finally {
      setIsMagicPromptLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!image) {
      setError(t('videoStudio.errors.noImage'));
      return;
    }
    if (!prompt.trim()) {
      setError(t('videoStudio.errors.noPrompt'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const downloadLink = await generateVideo(prompt, image);
      if (downloadLink) {
        // Fetching video with API key is required by the Veo API.
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch video: ${response.statusText}. Details: ${errorText}`);
        }
        const videoBlob = await response.blob();
        const objectUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(objectUrl);
      } else {
        throw new Error("Video generation failed to return a valid link.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPrompt('');
    setIsLoading(false);
    setError(null);
    if(videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
  };
  
  const handleDownload = () => {
    if (videoUrl) {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = `generated-video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const isGenerateDisabled = isLoading || !prompt.trim() || !image;
  
  const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";

  const renderResultContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full p-8">
           <div className="relative mb-6">
             <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-2xl animate-pulse-slow"></div>
             <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-xl">
                <Spinner className="h-10 w-10 text-indigo-600" />
             </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 animate-pulse">{t('videoStudio.loading.title')}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto leading-relaxed mb-4">{loadingMessage}</p>
          <div className="inline-flex items-center text-left justify-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 px-4 py-2 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg backdrop-blur-sm">
            <InfoIcon className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{t('notes.navigationWarning')}</span>
          </div>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center text-center h-full p-8">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-red-100 dark:border-red-900/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('results.error.title')}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 max-w-sm leading-relaxed">{error}</p>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-white dark:bg-gray-800 text-slate-700 dark:text-white border border-slate-200 dark:border-gray-600 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700 transition-all font-semibold shadow-sm hover:shadow-md"
          >
            {t('results.error.button')}
          </button>
        </div>
      );
    }

    if (videoUrl) {
      return (
          <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain rounded-lg" />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 dark:text-slate-500 p-8">
         <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-dashed border-slate-200 dark:border-white/10 rotate-3 transition-transform hover:rotate-6">
            <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
         </div>
        <p className="text-sm font-bold opacity-70 tracking-wide">{t('videoStudio.results.placeholder')}</p>
      </div>
    );
  };

  return (
    <div className="w-full">
      <FeatureHeader
        title={t('sidebar.videoStudio')}
        description={t('videoStudio.page.description')}
      />
      <div className="mb-8 p-4 bg-yellow-50/80 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-2xl flex gap-4 items-start">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-yellow-700 dark:text-yellow-400">
          <InfoIcon className="w-5 h-5" />
        </div>
        <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed font-medium">
          {t('videoStudio.quotaWarning')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Panel - Inputs */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all space-y-8 shadow-sm">
          <div>
            <StepHeader step={1} title={t('videoStudio.sections.upload.title')} description={t('videoStudio.sections.upload.subtitle')} />
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              uploadedImage={image?.dataUrl || null} 
              label={t('uploader.imageLabel')}
            />
          </div>
          
          <div className="pt-6 border-t border-gray-100 dark:border-white/10 space-y-4">
            <StepHeader step={2} title={t('videoStudio.sections.prompt.title')} description={t('videoStudio.sections.prompt.subtitle')} />
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('videoStudio.form.prompt.label')}</label>
                <button 
                  onClick={handleMagicPrompt}
                  disabled={isMagicPromptLoading || !image}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
                >
                  {isMagicPromptLoading ? <Spinner className="w-3 h-3" /> : <SparklesIcon className="w-3 h-3" />}
                  {t('videoStudio.form.goPrompt.label')}
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={4}
                placeholder={t('videoStudio.form.prompt.placeholder')}
                className={inputClasses}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleGenerate} 
              disabled={isGenerateDisabled} 
              className="w-full group relative flex justify-center items-center py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Spinner className="h-5 w-5 text-white" />
                  <span className="tracking-wide">{t('videoStudio.loading.title')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span className="tracking-wide uppercase tracking-widest">{t('videoStudio.generateButton')}</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/40 dark:border-white/5 transition-all shadow-sm lg:sticky lg:top-24 min-h-[32rem] flex flex-col">
          <StepHeader step={3} title={t('videoStudio.results.title')} description={t('videoStudio.results.description')} />
          
          <div className="flex-grow bg-slate-50 dark:bg-black/40 rounded-2xl p-4 border border-slate-200 dark:border-white/5 min-h-[300px] overflow-hidden">
            {renderResultContent()}
          </div>
          
          {videoUrl && !isLoading && (
            <div className="mt-6">
              <button 
                onClick={handleDownload} 
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-sm font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] transition-all shadow-xl"
              >
                <DownloadIcon className="w-4 h-4" /> {t('videoStudio.results.downloadButton')}
              </button>
            </div>
          )}
        </div>
      </div>
      <PromoCard />
    </div>
  );
};

import React, { useState } from 'react';
import { Spinner } from './Spinner';
import { DownloadIcon } from './icons/DownloadIcon';
import { ZoomIcon } from './icons/ZoomIcon';
import { ZoomModal } from './ZoomModal';
import { useLanguage } from '../contexts/LanguageContext';
// Fix: Added missing imports for Image as ImageIcon and RefreshCw
import { Image as ImageIcon, RefreshCw } from './icons/LucideIcons';

interface ResultDisplayProps {
  originalImage: string | null;
  generatedImages: string[] | null;
  selectedImage: string | null;
  isLoading: boolean;
  error: string | null;
  onDownload: () => void;
  onReset: () => void;
  onSelectImage: (imageUrl: string) => void;
  loadingTitleKey?: string;
  resultTitleKey?: string;
  resultDescriptionKey?: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  generatedImages,
  selectedImage,
  isLoading,
  error,
  onDownload,
  onReset,
  onSelectImage,
  loadingTitleKey = 'results.loading.title',
  resultTitleKey = 'results.title',
  resultDescriptionKey = 'results.description',
}) => {
  const { t } = useLanguage();
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col h-fit sticky top-24">
        <div className="bg-white p-6 rounded-[2.5rem] border-4 border-cartoon-dark shadow-cartoon-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 bg-cartoon-pink border-2 border-cartoon-dark rounded-2xl flex items-center justify-center font-black text-white shadow-cartoon">
                    GO
                </div>
                <div>
                    <h2 className="text-xl font-black text-cartoon-dark uppercase italic">{t(resultTitleKey).substring(3)}</h2>
                    <p className="text-xs text-slate-500 font-bold">{t(resultDescriptionKey)}</p>
                </div>
            </div>

            {/* Main Area */}
            <div className="w-full h-[450px] rounded-3xl overflow-hidden border-4 border-cartoon-dark bg-slate-50 shadow-inner relative group">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Spinner className="h-12 w-12 text-cartoon-blue mb-4" />
                    <p className="font-black animate-pulse uppercase italic">{t(loadingTitleKey)}</p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <p className="text-red-500 font-black mb-4">{error}</p>
                    <button onClick={onReset} className="px-6 py-2 bg-cartoon-dark text-white rounded-full font-black uppercase shadow-cartoon">Try Again</button>
                  </div>
                ) : !selectedImage ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-black uppercase">{t('results.placeholder')}</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4 cursor-zoom-in" onClick={() => setIsZoomModalOpen(true)}>
                    <img src={selectedImage} className="max-w-full max-h-full object-contain rounded-xl border-2 border-cartoon-dark" alt="Result" />
                  </div>
                )}
            </div>

            {/* Thumbnails */}
            {generatedImages && generatedImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                    {generatedImages.map((img, i) => (
                        <button key={i} onClick={() => onSelectImage(img)} className={`w-14 h-14 rounded-xl border-2 shrink-0 overflow-hidden transition-all ${selectedImage === img ? 'border-cartoon-blue scale-110 shadow-cartoon-hover' : 'border-cartoon-dark opacity-50'}`}>
                            <img src={img} className="w-full h-full object-cover" alt="Variant" />
                        </button>
                    ))}
                </div>
            )}

            {/* Actions */}
            {selectedImage && !isLoading && !error && (
                <div className="flex gap-4 mt-6">
                    <button onClick={onDownload} className="flex-1 flex items-center justify-center gap-2 py-4 bg-cartoon-blue text-white rounded-2xl border-4 border-cartoon-dark shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-black uppercase italic">
                        <DownloadIcon className="w-5 h-5" /> {t('results.downloadButton')}
                    </button>
                    <button onClick={onReset} className="px-6 py-4 bg-cartoon-yellow text-cartoon-dark rounded-2xl border-4 border-cartoon-dark shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-black">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
      </div>
      <ZoomModal isOpen={isZoomModalOpen} onClose={() => setIsZoomModalOpen(false)} imageUrl={selectedImage || ''} />
    </>
  );
};

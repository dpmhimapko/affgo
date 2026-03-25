import React, { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { resizeImage } from '../../services/geminiService';
import type { ImageData } from '../../types';

interface ResizeControlsProps {
    originalImage: ImageData;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setGeneratedImages: (images: string[] | null) => void;
    setSelectedImage: (image: string | null) => void;
    setActionTrigger: (trigger: (() => void) | null) => void;
}

export const ResizeControls: React.FC<ResizeControlsProps> = ({
    originalImage,
    setIsLoading,
    setError,
    setGeneratedImages,
    setSelectedImage,
    setActionTrigger,
}) => {
    const { t } = useLanguage();
    const [selectedRatio, setSelectedRatio] = React.useState('1:1');

    const aspectRatios = {
        '1:1': { name: t('imageEditor.tools.resize.ar_1_1'), value: 1 / 1 },
        '4:3': { name: t('imageEditor.tools.resize.ar_4_3'), value: 4 / 3 },
        '3:4': { name: t('imageEditor.tools.resize.ar_3_4'), value: 3 / 4 },
        '16:9': { name: t('imageEditor.tools.resize.ar_16_9'), value: 16 / 9 },
        '9:16': { name: t('imageEditor.tools.resize.ar_9_16'), value: 9 / 16 },
        '3:2': { name: t('imageEditor.tools.resize.ar_3_2'), value: 3 / 2 },
        '2:3': { name: t('imageEditor.tools.resize.ar_2_3'), value: 2 / 3 },
    };

    const prepareAndRunResize = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedImages(null);
        setSelectedImage(null);

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');

            const img = new Image();
            img.src = originalImage.dataUrl;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            
            const ratioValue = aspectRatios[selectedRatio].value;

            let newWidth, newHeight;
            const originalRatio = img.width / img.height;

            if (originalRatio > ratioValue) { // original is wider than target
                newWidth = img.width;
                newHeight = img.width / ratioValue;
            } else { // original is taller or same as target
                newHeight = img.height;
                newWidth = img.height * ratioValue;
            }
            
            // Ensure dimensions are even for better performance with some models/GPUs
            canvas.width = Math.round(newWidth / 2) * 2;
            canvas.height = Math.round(newHeight / 2) * 2;

            const x = (canvas.width - img.width) / 2;
            const y = (canvas.height - img.height) / 2;
            
            ctx.drawImage(img, x, y);
            
            const imageForResize: ImageData = {
                dataUrl: canvas.toDataURL('image/png'),
                mimeType: 'image/png',
            };
            
            const result = await resizeImage(imageForResize);
            setGeneratedImages(result.imageUrls);
            if (result.imageUrls.length > 0) {
                setSelectedImage(result.imageUrls[0]);
            }

        } catch (e: any) {
            console.error(e);
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setActionTrigger(() => prepareAndRunResize);
        // Cleanup the trigger when the component unmounts or the tool changes
        return () => setActionTrigger(null);
    }, [originalImage, selectedRatio]);

    return (
        <div className="animate-fade-in space-y-5">
             <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-4 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed flex gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t('imageEditor.tools.resize.description')}
                </p>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider ml-1">{t('imageEditor.tools.resize.label')}</label>
                <div className="grid grid-cols-4 gap-2">
                    {Object.entries(aspectRatios).map(([key, { name }]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedRatio(key)}
                            className={`px-3 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 border ${
                                selectedRatio === key
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg transform scale-105'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:text-indigo-500'
                            }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { editImageWithMask } from '../../services/geminiService';
import type { ImageData } from '../../types';

interface MagicBrushCanvasProps {
    originalImage: ImageData;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setGeneratedImages: (images: string[] | null) => void;
    setSelectedImage: (image: string | null) => void;
    setActionTrigger: (trigger: (() => void) | null) => void;
}

export const MagicBrushCanvas: React.FC<MagicBrushCanvasProps> = ({
    originalImage,
    setIsLoading,
    setError,
    setGeneratedImages,
    setSelectedImage,
    setActionTrigger,
}) => {
    const { t } = useLanguage();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(40);
    const [prompt, setPrompt] = useState('');
    const [history, setHistory] = useState<ImageData[]>([]);
    
    const drawImage = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const img = new Image();
        img.src = originalImage.dataUrl;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            setHistory([{ dataUrl: canvas.toDataURL(), mimeType: 'image/png' }]);
        };
    }, [originalImage]);

    useEffect(() => {
        drawImage();
    }, [drawImage]);

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        
        const { x, y } = getCoords(e);
        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(x, y);
        // Also draw a single point on mousedown for better click behavior
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'; // Semi-transparent red
        ctx.lineWidth = brushSize;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        
        const { x, y } = getCoords(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !isDrawing) return;
        
        ctx.closePath();
        setIsDrawing(false);
        if (canvas) {
            const newImageData = { dataUrl: canvas.toDataURL(), mimeType: 'image/png' };
            setHistory(prev => [...prev, newImageData]);
        }
    };
    
    const handleUndo = () => {
        if (history.length <= 1) return;
        
        const newHistory = history.slice(0, -1);
        const lastVersion = newHistory[newHistory.length - 1];
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !lastVersion) return;
        
        const img = new Image();
        img.src = lastVersion.dataUrl;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            setHistory(newHistory);
        };
    };
    
    const handleClear = () => {
        drawImage();
    };

    const runMagicBrush = async () => {
        if (history.length <= 1) {
            setError(t('imageEditor.errors.noMask'));
            return;
        }
        if (!prompt.trim()) {
            setError(t('imageEditor.errors.noPrompt'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages(null);
        setSelectedImage(null);
        
        try {
            const canvas = canvasRef.current;
            if (!canvas) throw new Error("Canvas not found");

            const maskedImage: ImageData = {
                dataUrl: canvas.toDataURL('image/png'),
                mimeType: 'image/png'
            };

            const result = await editImageWithMask(maskedImage, prompt);
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
        setActionTrigger(() => runMagicBrush);
        return () => setActionTrigger(null);
    }, [prompt, history]);

    // Update cursor size to match the real brush size, accounting for canvas scaling
    useEffect(() => {
        const updateCursorSize = () => {
            const canvas = canvasRef.current;
            const cursor = cursorRef.current;
            
            if (canvas && cursor && canvas.width > 0) {
                const rect = canvas.getBoundingClientRect();
                if (rect.width > 0) {
                    // Calculate the scaling factor between the canvas's drawing resolution and its displayed size
                    const scale = rect.width / canvas.width;
                    // Apply the scale to the brush size to get the correct visual size for the cursor
                    const displayedBrushSize = brushSize * scale;

                    cursor.style.width = `${displayedBrushSize}px`;
                    cursor.style.height = `${displayedBrushSize}px`;
                }
            }
        };

        updateCursorSize();
        // Add an event listener to handle window resizing
        window.addEventListener('resize', updateCursorSize);
        // Clean up the event listener
        return () => {
            window.removeEventListener('resize', updateCursorSize);
        };
    }, [brushSize, history]); // Re-run when brush size changes or when a new image is loaded

    // Combined handler for moving the cursor and drawing
    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (cursorRef.current && canvasRef.current && canvasRef.current.parentElement) {
            const containerRect = canvasRef.current.parentElement.getBoundingClientRect();
            const x = e.clientX - containerRect.left;
            const y = e.clientY - containerRect.top;
            
            cursorRef.current.style.left = `${x}px`;
            cursorRef.current.style.top = `${y}px`;
        }
        draw(e);
    };

    // Handlers to show/hide custom cursor
    const handleCanvasMouseEnter = () => {
        if (cursorRef.current) {
            cursorRef.current.style.display = 'block';
        }
    };

    const handleCanvasMouseLeave = () => {
        if (cursorRef.current) {
            cursorRef.current.style.display = 'none';
        }
        stopDrawing(); // Also stop drawing if the mouse leaves
    };
    
    const inputClasses = "w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all placeholder-gray-400 dark:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm";
    const labelClasses = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";

    return (
      <div className="space-y-5 animate-fade-in">
          <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-4 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed flex gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t('imageEditor.tools.magicBrush.description')}
                </p>
          </div>
          <div 
            className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-black/20 shadow-inner"
            style={{ cursor: 'none' }}
            onMouseEnter={handleCanvasMouseEnter}
            onMouseLeave={handleCanvasMouseLeave}
            onMouseMove={handleCanvasMouseMove}
          >
              <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full object-contain"
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
              />
              <div
                ref={cursorRef}
                className="absolute rounded-full bg-red-500/30 border border-red-500 pointer-events-none z-10"
                style={{ display: 'none', transform: 'translate(-50%, -50%)' }}
              />
          </div>
          <div className="space-y-4">
               <div>
                  <label htmlFor="prompt" className={labelClasses}>{t('imageEditor.tools.magicBrush.promptLabel')}</label>
                  <input
                      type="text"
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={t('imageEditor.tools.magicBrush.promptPlaceholder')}
                      className={inputClasses}
                  />
              </div>
              <div>
                  <label htmlFor="brushSize" className={labelClasses}>{t('imageEditor.tools.magicBrush.brushSize')}: {brushSize}px</label>
                  <input
                      type="range"
                      id="brushSize"
                      min="5"
                      max="100"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                  />
              </div>
              <div className="flex gap-3 pt-2">
                   <button onClick={handleUndo} disabled={history.length <= 1} className="flex-1 py-2 px-3 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all">{t('imageEditor.tools.magicBrush.undo')}</button>
                   <button onClick={handleClear} disabled={history.length <= 1} className="flex-1 py-2 px-3 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all">{t('imageEditor.tools.magicBrush.clear')}</button>
              </div>
          </div>
      </div>
    );
};
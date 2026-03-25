
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface GenerationModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({ 
    isOpen, 
    title = "Sedang Memproses...", 
    description = "AI sedang menganalisis komposisi, mengatur pencahayaan, dan merender hasil terbaik untuk Anda." 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-white/20 flex flex-col items-center text-center relative overflow-hidden transform animate-slide-up">
        
        {/* Animated Top Border */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-[shimmer_2s_infinite]"></div>
        
        {/* Icon Animation */}
        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-purple-50 dark:border-purple-500/20 border-b-purple-500 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
            <SparklesIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-pulse" />
        </div>

        {/* Text Content */}
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            {title}
        </h3>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
            {description}
        </p>

        {/* Bouncing Dots */}
        <div className="flex gap-2 justify-center mb-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        </div>
        
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-4">Jangan Tutup Halaman Ini</p>
      </div>
    </div>
  );
};

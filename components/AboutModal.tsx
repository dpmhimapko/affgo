
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AppLogoIcon } from './icons/AppLogoIcon';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const featuresList = [
    { label: t('sidebar.productStudio'), desc: t('about.productStudio') },
    { label: t('sidebar.listingStudio'), desc: t('about.listingStudio') },
    { label: t('sidebar.perspectiveStudio'), desc: t('about.perspectiveStudio') },
    { label: t('sidebar.povStudio'), desc: t('about.povStudio') },
    { label: t('sidebar.mirrorStudio'), desc: t('about.mirrorStudio') },
    { label: t('sidebar.virtualTryOn'), desc: t('about.virtualTryOn') },
    { label: t('sidebar.lifestylePhotoshoot'), desc: t('about.lifestylePhotoshoot') },
    { label: t('sidebar.mergeProduct'), desc: t('about.mergeProduct') },
    { label: t('sidebar.adCreator'), desc: t('about.adCreator') },
    { label: t('sidebar.magicGenEditor'), desc: t('about.imageEditor') },
    { label: t('sidebar.magicPose'), desc: t('about.poseStudio') },
    { label: t('sidebar.digitalImaging'), desc: t('about.digitalImaging') },
  ];

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-white/20 dark:border-white/10 transform animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-white/5 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cartoon-blue border-2 border-cartoon-dark flex items-center justify-center shadow-cartoon">
                    <AppLogoIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-cartoon-dark italic uppercase tracking-tighter">
                        Affiliate <span className="text-cartoon-blue">Go</span>
                    </h2>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" 
                aria-label="Close"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300 font-bold">
                {t('about.description')}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{t('about.techStack')}</h3>
            <div className="flex flex-wrap gap-2">
              {['React 19', 'TypeScript', 'Tailwind CSS', 'Google Gemini API', 'Vite'].map((tech) => (
                <span key={tech} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold border-2 border-cartoon-dark shadow-cartoon-hover">
                    {tech}
                </span>
              ))}
            </div>
          </div>

           <div>
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{t('about.geminiModels')}</h3>
            <div className="grid gap-3">
                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border-2 border-cartoon-dark shadow-cartoon-hover flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-cartoon-blue mt-1.5 flex-shrink-0"></div>
                    <div>
                        <p className="text-sm font-black text-cartoon-dark dark:text-white uppercase">gemini-2.5-flash-image</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-bold">{t('about.geminiFlashImage')}</p>
                    </div>
                </div>
                 <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border-2 border-cartoon-dark shadow-cartoon-hover flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-cartoon-pink mt-1.5 flex-shrink-0"></div>
                    <div>
                        <p className="text-sm font-black text-cartoon-dark dark:text-white uppercase">gemini-2.5-flash</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-bold">{t('about.geminiFlash')}</p>
                    </div>
                </div>
            </div>
          </div>
          
          <div>
             <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Features & Capabilities</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featuresList.map((feature, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-2 border-cartoon-dark shadow-cartoon-hover group">
                        <p className="text-sm font-black text-cartoon-dark dark:text-slate-200 uppercase italic transition-colors">{feature.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-bold">{feature.desc}</p>
                    </div>
                ))}
             </div>
          </div>
        </div>

        <div className="px-8 py-5 border-t-4 border-cartoon-dark bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-cartoon-dark text-white text-sm font-black rounded-2xl shadow-cartoon hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-cartoon-hover transition-all uppercase italic"
          >
            {t('about.closeButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

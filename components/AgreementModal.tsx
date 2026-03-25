
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ShieldCheckIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);

const GavelIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m14 13-5 5 5 5 5-5-5-5z"/><path d="m16 16 3-3"/><path d="m7 21 3-3"/><path d="m15 11 1 1"/><path d="m4 4 10 10"/><path d="m2 2 4 4"/></svg>
);

const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
  </svg>
);

interface AgreementModalProps {
  onAgree: () => void;
}

const AgreementModal: React.FC<AgreementModalProps> = ({ onAgree }) => {
  const [slide, setSlide] = useState(1);
  const [canProceed, setCanProceed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (canProceed) return;
    const content = contentRef.current;
    if (content) {
      const isScrolledToBottom = content.scrollHeight - content.scrollTop <= content.clientHeight + 20;
      if (isScrolledToBottom) {
        setCanProceed(true);
      }
    }
  };

  useEffect(() => {
    // Reset proceed state when changing slides to force reading/scrolling
    setCanProceed(false);
    const checkScrollNeeded = () => {
        const content = contentRef.current;
        if (content && (content.scrollHeight <= content.clientHeight)) {
            setCanProceed(true);
        }
    };
    const timeoutId = setTimeout(checkScrollNeeded, 200);
    window.addEventListener('resize', checkScrollNeeded);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkScrollNeeded);
    };
  }, [slide]);
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 w-full max-w-xl max-h-[85vh] rounded-[3rem] flex flex-col overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border-4 border-cartoon-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
            ref={contentRef}
            onScroll={handleScroll}
            className="overflow-y-auto flex-grow custom-scrollbar"
        >
            <AnimatePresence mode="wait">
                {slide === 1 ? (
                    <motion.div 
                        key="slide1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-8 md:p-10 space-y-8"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-cartoon-blue border-4 border-cartoon-dark text-white rounded-3xl flex items-center justify-center mb-6 shadow-cartoon rotate-3">
                                <ShieldCheckIcon className="w-10 h-10"/>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Wassup, Creator! 🔥</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base font-bold">Dikit lagi kita gaskeun karyamu jadi makin goks!</p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border-2 border-cartoon-dark shadow-cartoon-hover">
                                <h3 className="font-black text-slate-800 dark:text-white mb-4 text-xs uppercase tracking-[0.2em] italic">
                                    Aturan Main Kita:
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-4 text-sm text-slate-600 dark:text-slate-300 font-bold">
                                        <div className="mt-1 w-2 h-2 bg-cartoon-blue rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                        <span>Aplikasi ini bikinan <strong className="text-cartoon-blue uppercase italic">Ardra</strong>. Jadi jangan diaku-akuin ya, hargain karya orang cuy!</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-sm text-slate-600 dark:text-slate-300 font-bold">
                                        <div className="mt-1 w-2 h-2 bg-cartoon-blue rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                        <span>Lu bebas pake buat bikin konten apa aja, asal jangan buat <strong className="text-slate-900 dark:text-white">hal-hal yang aneh</strong> atau negatif.</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-sm text-slate-600 dark:text-slate-300 font-bold">
                                        <div className="mt-1 w-2 h-2 bg-cartoon-blue rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                        <span>Gunakan aplikasi secara <strong className="text-slate-900 dark:text-white uppercase">Bijak & Humble</strong>, biar rejeki lu makin lancar jaya!</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium text-center italic">
                                *Dengan lanjut, berarti lu setuju sama aturan di atas. No debat!
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="slide2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-8 md:p-10 space-y-8"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-red-500 border-4 border-cartoon-dark text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-cartoon animate-bounce-slow">
                                <WarningIcon className="w-12 h-12"/>
                            </div>
                            <h1 className="text-4xl font-black text-red-600 dark:text-red-500 tracking-tighter italic uppercase drop-shadow-sm">WARNING KERAS! 🛑</h1>
                            <p className="text-slate-700 dark:text-slate-300 mt-3 text-base md:text-lg font-black uppercase">Jangan Main Api Sama Hukum!</p>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-[2.5rem] border-4 border-red-500/30 shadow-inner space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shrink-0">
                                    <GavelIcon className="w-6 h-6" />
                                </div>
                                <p className="text-sm md:text-base text-red-900 dark:text-red-200 font-black leading-relaxed uppercase italic">
                                    Dilarang keras buat kloning, jual lagi, atau nyolong daleman aplikasi ini!
                                </p>
                            </div>
                            
                            <p className="text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                                Kita serius banget soal ini. Kalo ada yang nekat nyalahgunain atau ngerugiin owner (<strong className="text-red-600">Ardra</strong>), siap-siap aja urusan panjang sama <strong className="text-red-600">Hukum & Tim Legal</strong> kita.
                            </p>

                            <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border-2 border-red-500/20 text-center">
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Criminal & Civil Law Action Guaranteed</span>
                            </div>
                        </div>
                        
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium text-center">
                            Masih mau lanjut? Pastiin lu udah baca & paham resikonya kalo melanggar.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div className="p-8 border-t-4 border-cartoon-dark text-center flex-shrink-0 bg-white dark:bg-gray-900 z-10">
            {slide === 1 ? (
                <button
                    onClick={() => setSlide(2)}
                    disabled={!canProceed}
                    className="w-full py-4 px-6 rounded-2xl text-lg font-black text-white bg-cartoon-blue border-4 border-cartoon-dark hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-cartoon-hover shadow-cartoon transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase italic tracking-widest"
                >
                    Paham, Lanjut!
                </button>
            ) : (
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onAgree}
                        disabled={!canProceed}
                        className="w-full py-5 px-6 rounded-2xl text-xl font-black text-white bg-slate-900 dark:bg-white dark:text-slate-900 border-4 border-cartoon-dark hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-cartoon-hover shadow-cartoon transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase italic tracking-widest animate-pulse hover:animate-none"
                    >
                        Gaskeun, Gw Setuju!
                    </button>
                    <button 
                        onClick={() => setSlide(1)}
                        className="text-xs font-black text-slate-400 hover:text-cartoon-blue transition-colors uppercase tracking-widest"
                    >
                        Baca Ulang Peraturan
                    </button>
                </div>
            )}
            
            <AnimatePresence>
            {!canProceed && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center justify-center gap-2 mt-4 text-slate-400 dark:text-slate-500 text-xs font-black uppercase italic"
                >
                    <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                    <span>Scroll sampe bawah dulu bro!</span>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AgreementModal;

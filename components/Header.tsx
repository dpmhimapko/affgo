
import React, { useState, useEffect } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { AppLogoIcon } from './icons/AppLogoIcon';
import { useUsage } from '../contexts/UsageContext';
import { Maximize, Minimize } from './icons/LucideIcons';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { sessionUsage, SESSION_LIMIT } = useUsage();
  const usagePercentage = (sessionUsage / SESSION_LIMIT) * 100;
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-4 pb-2">
      <div className="max-w-[1380px] mx-auto bg-white border-4 border-cartoon-dark rounded-3xl shadow-cartoon-lg transition-all duration-300">
        <div className="flex items-center justify-between h-16 px-6">
          
          <div className="flex items-center gap-4">
             <button
              onClick={onMenuClick}
              className="p-2 md:hidden rounded-xl border-2 border-cartoon-dark bg-cartoon-yellow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-cartoon-hover shadow-cartoon transition-all"
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>

            <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer select-none">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cartoon-blue border-2 border-cartoon-dark shadow-cartoon group-hover:rotate-6 transition-transform shrink-0">
                <AppLogoIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg sm:text-2xl font-black tracking-tighter text-cartoon-dark leading-none italic uppercase truncate">
                  AFFILIATE <span className="text-cartoon-blue">GO</span>
                </span>
                <span className="text-[8px] sm:text-[10px] font-black uppercase text-cartoon-blue/60 tracking-widest leading-none mt-0.5 sm:mt-1">by Ahdan</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl border-2 border-cartoon-dark bg-white hover:bg-slate-50 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-cartoon-hover shadow-cartoon transition-all flex items-center justify-center"
              title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>

            <div className="hidden sm:flex items-center gap-4">
              <div className="px-4 py-1.5 bg-cartoon-yellow border-2 border-cartoon-dark rounded-full shadow-cartoon transform -rotate-1 hidden lg:block">
                 <span className="text-xs font-black uppercase italic">Ahdan's Studio Edition</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

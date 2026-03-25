import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { AppLogoIcon } from './icons/AppLogoIcon';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

const FeatureItem: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
    <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
        <div className="mt-1 p-2 bg-indigo-500/20 rounded-xl flex-shrink-0 border border-indigo-500/30 group-hover:scale-110 transition-transform">
             <SparklesIcon className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-left">
            <span className="block font-bold text-white text-sm mb-1 group-hover:text-indigo-200 transition-colors">{title}</span>
            <span className="text-slate-400 text-xs leading-relaxed">{desc}</span>
        </div>
    </div>
);

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, featureName = "Fitur Pro" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-3xl overflow-hidden flex flex-col rounded-[2.5rem] relative transform animate-slide-up shadow-2xl">
        
        {/* Cinematic Background */}
        <div className="absolute inset-0 bg-[#0f172a]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        {/* Decorative Border */}
        <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-white/10 pointer-events-none z-50"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50 z-50"></div>

        {/* Close Button */}
        <button 
            onClick={onClose} 
            className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-black/20 hover:bg-white/10 text-slate-400 hover:text-white transition-all backdrop-blur-sm border border-white/5 group"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        {/* Main Content Area */}
        <div className="relative z-10 flex flex-col items-center text-center pt-12 px-6 md:px-12 pb-8 overflow-y-auto custom-scrollbar max-h-[85vh]">
            
            {/* Header Icon */}
            <div className="relative mb-6 group cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-2xl ring-1 ring-white/20 transform group-hover:scale-105 transition-transform duration-500">
                    <AppLogoIcon className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-3 -right-3 px-3 py-1 bg-white text-indigo-900 text-xs font-black rounded-full shadow-lg border-2 border-indigo-900 transform rotate-12">
                    PRO
                </div>
            </div>

            {/* Title & Date */}
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 drop-shadow-xl">
                Holaa! 👋
            </h2>
            <div className="max-w-lg mx-auto mb-8">
                <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-4">
                    Fitur <span className="font-bold text-indigo-300 border-b border-indigo-500/50">{featureName}</span> akan rilis gratis pada:
                </p>
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-800/80 border border-slate-700 backdrop-blur-md mb-6">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                    <span className="text-sm md:text-base font-bold text-white tracking-wide">31 Januari 2026</span>
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20 uppercase tracking-wider">Gratis Update</span>
                </div>
                
                {/* Updated Card Style: Brighter, Solid, High Contrast */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 border border-indigo-400/50 shadow-lg shadow-indigo-500/20 transform hover:-translate-y-1 transition-transform duration-300">
                    <p className="text-sm md:text-base text-white leading-relaxed font-medium">
                        🚀 Mau akses duluan sebelum tanggal 31 Januari? <br className="hidden md:block"/>
                        <span className="font-extrabold text-yellow-300">Upgrade sekarang</span> dan nikmati kecanggihannya tanpa perlu menunggu lama!
                    </p>
                </div>
            </div>

            {/* Feature Showcase Grid */}
            <div className="w-full bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-3xl p-1 border border-white/10 mb-8">
                <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-[1.3rem] p-6">
                    <div className="flex items-center justify-center gap-2 mb-6 opacity-90">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-indigo-500/50"></div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Unlock All Access</p>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-indigo-500/50"></div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-6">
                        Upgrade ke <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Magic Photo Studio 6.1 Pro</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                        <FeatureItem title="Magic POV Studio" desc="Foto produk realistis dari sudut pandang tangan." />
                        <FeatureItem title="Magic Lifestyle" desc="Pemotretan lifestyle natural dengan model AI." />
                        <FeatureItem title="Magic Listing" desc="Infografis produk profesional untuk marketplace." />
                        <FeatureItem title="Magic Background" desc="Ganti latar belakang produk secara instan." />
                        <FeatureItem title="Magic Photoshoot" desc="Ubah foto biasa jadi potret studio Cinematic." />
                        <FeatureItem title="Magic Mockup" desc="Tempel desain ke produk nyata dalam sekejap." />
                    </div>
                </div>
            </div>

            {/* Pricing & CTA */}
            <div className="w-full flex flex-col items-center gap-6">
                
                {/* Centered Price - Removed animation/shimmer, made solid white */}
                <div className="flex flex-col items-center text-center">
                    <p className="text-sm font-medium text-indigo-200 mb-1">Hanya nambah</p>
                    <span className="text-6xl md:text-7xl font-black text-white tracking-tighter drop-shadow-xl mb-2">
                        47rb
                    </span>
                    <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">
                        Dapatkan akses duluan daripada temanmu! 🚀
                    </p>
                </div>

                <a 
                    href="https://growwithdedy.com/c/checkout?variant_ids=414075&qty=1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="relative w-full md:w-3/4 group overflow-hidden rounded-2xl p-0.5 transition-transform active:scale-[0.98] hover:-translate-y-1 duration-300"
                >
                    <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 h-full w-full rounded-xl flex items-center justify-center gap-3 py-4 md:py-5 px-8 shadow-xl">
                        <div className="absolute inset-0 bg-white/10 group-hover:opacity-0 transition-opacity"></div>
                        <SparklesIcon className="w-6 h-6 text-white animate-pulse" />
                        <span className="text-xl font-extrabold text-white tracking-wide text-shadow">Upgrade Sekarang</span>
                    </div>
                </a>
                
                <div className="flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/QRIS_logo.svg/1200px-QRIS_logo.svg.png" alt="QRIS" className="h-4 object-contain brightness-0 invert" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/2560px-Logo_dana_blue.svg.png" alt="DANA" className="h-3 object-contain brightness-0 invert" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/2560px-Logo_ovo_purple.svg.png" alt="OVO" className="h-3 object-contain brightness-0 invert" />
                    <span className="text-[10px] text-slate-400 font-medium">+ Bank Transfer</span>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
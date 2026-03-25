
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-12 mb-8 px-4 relative z-30">
      <div className="max-w-[1380px] mx-auto py-6 bg-white border-4 border-cartoon-dark rounded-3xl shadow-cartoon text-center">
        <p className="text-sm font-black uppercase tracking-widest text-cartoon-dark italic mb-1">
          AFFILIATE <span className="text-cartoon-blue">GO</span> &copy; 2026
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          DESIGNED & OWNED BY <span className="text-cartoon-blue">AHDAN</span>
        </p>
      </div>
    </footer>
  );
};

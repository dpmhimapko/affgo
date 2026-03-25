import React from 'react';

interface FeatureHeaderProps {
  title: string;
  description: string;
}

export const FeatureHeader: React.FC<FeatureHeaderProps> = ({ title, description }) => {
  return (
    <div className="relative mb-8 rounded-[2.5rem] p-8 overflow-hidden bg-white border-4 border-cartoon-dark shadow-cartoon-lg animate-fade-in group">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-cartoon-blue/10 rounded-full border-2 border-cartoon-dark/5 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-24 h-24 bg-cartoon-pink/10 rounded-full border-2 border-cartoon-dark/5 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-cartoon-dark tracking-tight uppercase italic">
              {title}
            </h1>
            <div className="h-2 w-24 bg-cartoon-yellow border-2 border-cartoon-dark rounded-full mt-2"></div>
          </div>
        </div>
        
        <p className="text-sm md:text-base text-slate-600 font-bold leading-relaxed max-w-3xl">
          {description}
        </p>
      </div>
    </div>
  );
};
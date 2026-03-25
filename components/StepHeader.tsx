
import React from 'react';

interface StepHeaderProps {
  step: number | string;
  title: string;
  description?: string;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ step, title, description }) => {
  const cleanTitle = title.replace(/^\d+\.\s*/, '');

  return (
    <div className="flex items-center gap-4 mb-6 group">
      <div className="flex-shrink-0 w-10 h-10 bg-cartoon-yellow border-2 border-cartoon-dark rounded-2xl flex items-center justify-center font-black text-lg shadow-cartoon group-hover:rotate-12 transition-transform">
         {step}
      </div>
      
      <div>
         <h2 className="text-xl font-black text-cartoon-dark tracking-tight leading-tight uppercase italic">
            {cleanTitle}
         </h2>
         {description && (
            <p className="text-xs text-slate-500 font-bold mt-0.5">
                {description}
            </p>
         )}
      </div>
    </div>
  );
};

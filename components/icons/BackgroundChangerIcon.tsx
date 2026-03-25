import React from 'react';

export const BackgroundChangerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 19a2 2 0 01-2 2H7a2 2 0 01-2-2V7" strokeDasharray="4 4" opacity="0.5" />
    <rect x="9" y="9" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.2" stroke="none" />
  </svg>
);

import React from 'react';

export const MirrorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" style={{display: 'none'}} /> 
    {/* Using a rectangle with reflection lines for Mirror */}
    <rect x="5" y="3" width="14" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 3v18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15h10" opacity="0.3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 9h10" opacity="0.3" />
  </svg>
);

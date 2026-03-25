import React from 'react';

export const LifestylePhotoshootIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {/* Viewfinder lines */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 3h2a2 2 0 012 2v2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 17v2a2 2 0 01-2 2h-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21H5a2 2 0 01-2-2v-2" />
    
    {/* User icon inside, scaled and centered */}
    <g transform="translate(6, 6) scale(0.5)">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </g>
  </svg>
);
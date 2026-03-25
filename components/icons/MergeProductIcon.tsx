import React from 'react';

export const MergeProductIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {/* Back rectangle */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16V6a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
    {/* Front rectangle, slightly offset */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 20V10a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2z" />
  </svg>
);
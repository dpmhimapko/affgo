
import React from 'react';

export const AppLogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Fast lines for "GO" effect */}
    <path d="M2 7h3M2 12h5M2 17h3" />
    {/* Bubbly Bag Shape */}
    <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2H9V5Z" />
    <path d="M8 7h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
    {/* Lightning Bolt on the bag */}
    <path d="m11 11 2 2-1 3 3-3-2-2 1-3-3 3Z" fill="currentColor" stroke="none" />
  </svg>
);

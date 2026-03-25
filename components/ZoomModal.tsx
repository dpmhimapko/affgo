import React from 'react';

interface ZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export const ZoomModal: React.FC<ZoomModalProps> = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fade-in" 
      onClick={onClose}
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
        aria-label="Close"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <div 
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image
      >
        <img 
          src={imageUrl} 
          alt="Zoomed product view" 
          className="object-contain max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

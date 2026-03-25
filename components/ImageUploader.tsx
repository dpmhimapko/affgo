
import React, { useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { UploadIcon } from './icons/UploadIcon';

declare const heic2any: any;

interface ImageUploaderProps {
  onImageUpload: (dataUrl: string, mimeType: string) => void;
  uploadedImage: string | null;
  label: string; 
  labelKey: string;
}

const convertHeicToJpg = async (file: File): Promise<File> => {
  const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type.toLowerCase() === 'image/heic';
  if (isHeic && typeof heic2any !== 'undefined') {
      try {
          const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
          const finalBlob = Array.isArray(result) ? result[0] : result;
          return new File([finalBlob as Blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      } catch (error) {
          console.error("HEIC failed", error);
      }
  }
  return file;
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, uploadedImage, labelKey }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useLanguage();

  const handleFileChange = useCallback(async (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      try {
        const processedFile = await convertHeicToJpg(file);
        const reader = new FileReader();
        reader.onloadend = () => onImageUpload(reader.result as string, processedFile.type || 'image/jpeg');
        reader.readAsDataURL(processedFile);
      } catch (e) { console.error(e); }
    }
  }, [onImageUpload]);

  return (
    <div className="w-full">
      <label
        className={`relative block w-full aspect-video rounded-[2rem] border-4 border-dashed transition-all cursor-pointer overflow-hidden
        ${isDragging 
            ? 'border-cartoon-blue bg-cartoon-yellow/20 scale-[1.02]' 
            : 'border-cartoon-dark bg-white hover:border-cartoon-blue hover:bg-cartoon-yellow/5 shadow-cartoon-lg hover:shadow-cartoon'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files); }}
      >
        {uploadedImage ? (
          <div className="w-full h-full relative p-4">
            <img src={uploadedImage} alt="preview" className="object-contain w-full h-full rounded-2xl border-2 border-cartoon-dark" />
            <div className="absolute inset-0 flex items-center justify-center bg-cartoon-dark/20 opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-cartoon-yellow border-2 border-cartoon-dark px-4 py-2 rounded-full shadow-cartoon font-black text-xs uppercase">Ganti Foto</div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="p-3 rounded-2xl bg-cartoon-yellow border-2 border-cartoon-dark shadow-cartoon mb-3">
                <UploadIcon className="h-6 w-6 text-cartoon-dark" />
            </div>
            <p className="font-black text-cartoon-dark uppercase text-xs">{t(labelKey)}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">PNG, JPG (Maks 10MB)</p>
          </div>
        )}
        <input type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files)} accept="image/*" />
      </label>
    </div>
  );
};

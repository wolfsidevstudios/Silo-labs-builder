import React, { useState, useRef } from 'react';
import SiloMaxModalBase from './SiloMaxModalBase';
import ImageLibraryModal from './ImageLibraryModal';
import { SavedImage } from '../types';
import { saveImage } from '../services/imageService';

interface SiloMaxImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddImage: (image: { data: string; mimeType: string }) => void;
}

const SiloMaxImageModal: React.FC<SiloMaxImageModalProps> = ({ isOpen, onClose, onAddImage }) => {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const [header, base64Data] = dataUrl.split(',');
          const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
          
          saveImage({ data: base64Data, mimeType }); // Also save to library
          onAddImage({ data: base64Data, mimeType });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectFromLibrary = (images: SavedImage[]) => {
    if (images.length > 0) {
        onAddImage(images[0]); // Add the first selected image
    }
    setIsLibraryOpen(false);
  };
  
  return (
    <>
      <ImageLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} onSelectImages={handleSelectFromLibrary} />
      <SiloMaxModalBase isOpen={isOpen} onClose={onClose} title="Add Image">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
        />
        <div className="space-y-4">
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-center px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-semibold transition-colors"
            >
                Upload from Computer
            </button>
            <button
                onClick={() => setIsLibraryOpen(true)}
                className="w-full text-center px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-semibold transition-colors"
            >
                Select from Library
            </button>
        </div>
      </SiloMaxModalBase>
    </>
  );
};

export default SiloMaxImageModal;

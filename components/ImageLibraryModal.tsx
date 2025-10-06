import React, { useState, useEffect } from 'react';
import { SavedImage } from '../types';
import { getImages } from '../services/imageService';
import CheckIcon from './icons/CheckIcon';
import ImageIcon from './icons/ImageIcon';

interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImages: (images: SavedImage[]) => void;
}

const ImageLibraryModal: React.FC<ImageLibraryModalProps> = ({ isOpen, onClose, onSelectImages }) => {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setImages(getImages());
      setSelectedImageIds(new Set()); // Reset selection when modal opens
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSelection = (id: string) => {
    const newSelection = new Set(selectedImageIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedImageIds(newSelection);
  };

  const handleSelectClick = () => {
    const selectedImages = images.filter(img => selectedImageIds.has(img.id));
    onSelectImages(selectedImages);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl m-4 w-full max-w-4xl h-[80vh] flex flex-col transform transition-transform duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Select from Library</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelectClick}
              disabled={selectedImageIds.size === 0}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
              Select {selectedImageIds.size > 0 ? `(${selectedImageIds.size})` : ''}
            </button>
          </div>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <ImageIcon className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold text-slate-300">Your Library is Empty</h3>
                <p>Upload images from the "My Work" page to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {images.map(image => {
                const isSelected = selectedImageIds.has(image.id);
                return (
                  <div
                    key={image.id}
                    onClick={() => handleToggleSelection(image.id)}
                    className={`relative group aspect-square bg-slate-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        isSelected ? 'ring-4 ring-indigo-500' : 'ring-0'
                    }`}
                  >
                    <img
                      src={`data:${image.mimeType};base64,${image.data}`}
                      alt={`Library item ${image.id}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {isSelected && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                <CheckIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ImageLibraryModal;
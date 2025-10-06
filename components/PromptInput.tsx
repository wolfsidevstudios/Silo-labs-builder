import React, { useRef, useState, useEffect } from 'react';
import ArrowUpIcon from './icons/ArrowUpIcon';
import SparklesIcon from './icons/SparklesIcon';
import MousePointerClickIcon from './icons/MousePointerClickIcon';
import PlusIcon from './icons/PlusIcon';
import XIcon from './icons/XIcon';
import GiphyIcon from './icons/GiphyIcon';
import ImageIcon from './icons/ImageIcon';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBoostUi: () => void;
  isLoading: boolean;
  isVisualEditMode: boolean;
  onToggleVisualEditMode: () => void;
  uploadedImages: { previewUrl: string }[];
  onImagesUpload: (files: FileList) => void;
  onImageRemove: (index: number) => void;
  onOpenImageLibrary: () => void;
  isGiphyConnected: boolean;
  onAddGifClick: () => void;
  isUnsplashConnected: boolean;
  onAddStockPhotoClick: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, onBoostUi, isLoading, isVisualEditMode, onToggleVisualEditMode, uploadedImages, onImagesUpload, onImageRemove, onOpenImageLibrary, isGiphyConnected, onAddGifClick, isUnsplashConnected, onAddStockPhotoClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const uploadMenuRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onImagesUpload(files);
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target as Node)) {
        setIsUploadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <form onSubmit={onSubmit} className="p-4">
      <div className="flex items-center mb-3 ml-2">
            <div className="relative" ref={uploadMenuRef}>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" multiple />
                <button
                    type="button"
                    onClick={() => setIsUploadMenuOpen(prev => !prev)}
                    disabled={isLoading}
                    className="flex items-center justify-center h-10 w-10 bg-white/5 border border-white/10 rounded-full text-indigo-300 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Add Image"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
                {isUploadMenuOpen && (
                    <div className="absolute bottom-12 -left-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg w-48 animate-fade-in-up-sm">
                        <button
                            type="button"
                            onClick={() => { fileInputRef.current?.click(); setIsUploadMenuOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-t-lg"
                        >
                            Upload from computer
                        </button>
                        <button
                            type="button"
                            onClick={() => { onOpenImageLibrary(); setIsUploadMenuOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-b-lg"
                        >
                            Select from library
                        </button>
                    </div>
                )}
            </div>
            <button
                type="button"
                onClick={onBoostUi}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-indigo-300 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
            >
                <SparklesIcon className="w-4 h-4" />
                <span>Boost</span>
            </button>
            <button
                type="button"
                onClick={onToggleVisualEditMode}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2 ${
                    isVisualEditMode
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-white/5 border-white/10 text-indigo-300 hover:bg-white/10'
                }`}
                title="Toggle Visual Edit Mode"
            >
                <MousePointerClickIcon className="w-4 h-4" />
                <span>Edit</span>
            </button>
            <button
                type="button"
                onClick={onAddGifClick}
                disabled={isLoading || !isGiphyConnected}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-indigo-300 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                title={isGiphyConnected ? "Add GIF from Giphy" : "Connect to Giphy in Settings"}
            >
                <GiphyIcon className="w-4 h-4" />
                <span>GIFs</span>
            </button>
             <button
                type="button"
                onClick={onAddStockPhotoClick}
                disabled={isLoading || !isUnsplashConnected}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-indigo-300 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                title={isUnsplashConnected ? "Add stock photo from Unsplash" : "Connect to Unsplash in Settings"}
            >
                <ImageIcon className="w-4 h-4" />
                <span>Photos</span>
            </button>
        </div>
      {uploadedImages.length > 0 && (
        <div className="px-4 pb-3">
            <div className="flex flex-wrap gap-3">
                {uploadedImages.map((image, index) => (
                    <div key={index} className="relative inline-block bg-slate-800 p-2 rounded-lg border border-slate-700">
                        <img src={image.previewUrl} alt={`Upload preview ${index + 1}`} className="h-20 w-auto rounded-md object-cover" />
                        <button
                            type="button"
                            onClick={() => onImageRemove(index)}
                            disabled={isLoading}
                            className="absolute -top-2 -right-2 bg-slate-600 hover:bg-slate-500 text-white rounded-full p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Remove image ${index + 1}`}
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Use this image as a hero background"
          className="w-full h-36 p-6 pr-20 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-[0_0_120px_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(255,255,255,0.05)] transition-all resize-none"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={isLoading || (!prompt.trim() && uploadedImages.length === 0)}
          className="absolute right-4 bottom-4 h-12 w-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed group"
          aria-label="Generate app"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
          ) : (
            <ArrowUpIcon className="w-6 h-6 text-black transition-transform group-hover:scale-110" />
          )}
        </button>
      </div>
      <style>{`
        @keyframes fade-in-up-sm {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up-sm {
          animation: fade-in-up-sm 0.2s ease-out forwards;
        }
      `}</style>
    </form>
  );
};

export default PromptInput;
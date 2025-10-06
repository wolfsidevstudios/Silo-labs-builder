
import React, { useRef } from 'react';
import ArrowUpIcon from './icons/ArrowUpIcon';
import SparklesIcon from './icons/SparklesIcon';
import MousePointerClickIcon from './icons/MousePointerClickIcon';
import PlusIcon from './icons/PlusIcon';
import XIcon from './icons/XIcon';

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
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, onBoostUi, isLoading, isVisualEditMode, onToggleVisualEditMode, uploadedImages, onImagesUpload, onImageRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onImagesUpload(files);
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-4">
      <div className="flex items-center mb-3 ml-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" multiple />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center justify-center h-10 w-10 bg-white/5 border border-white/10 rounded-full text-indigo-300 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Upload Image"
            >
                <PlusIcon className="w-5 h-5" />
            </button>
            <button
                type="button"
                onClick={onBoostUi}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-indigo-300 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
            >
                <SparklesIcon className="w-4 h-4" />
                <span>Boost UI</span>
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
    </form>
  );
};

export default PromptInput;
import React, { useRef, useState, useEffect } from 'react';
import ArrowUpIcon from './icons/ArrowUpIcon';
import SparklesIcon from './icons/SparklesIcon';
import MousePointerClickIcon from './icons/MousePointerClickIcon';
import PlusIcon from './icons/PlusIcon';
import XIcon from './icons/XIcon';
import FilmIcon from './icons/FilmIcon'; // A more generic icon for media
import GiphyIcon from './icons/GiphyIcon';
import UnsplashIcon from './icons/UnsplashIcon';
import YouTubeIcon from './icons/YouTubeIcon';
import MaxVibeIcon from './icons/MaxVibeIcon';


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
  isYouTubeConnected: boolean;
  onAddYouTubeVideoClick: () => void;
  onStartMaxAgent: () => void;
  isMaxAgentRunning: boolean;
  hasFiles: boolean;
  onToggleMaxVibe: () => void;
  isMaxVibeRunning: boolean;
  promptInputRef: React.RefObject<HTMLTextAreaElement>;
  submitButtonRef: React.RefObject<HTMLButtonElement>;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, onBoostUi, isLoading, isVisualEditMode, onToggleVisualEditMode, uploadedImages, onImagesUpload, onImageRemove, onOpenImageLibrary, isGiphyConnected, onAddGifClick, isUnsplashConnected, onAddStockPhotoClick, isYouTubeConnected, onAddYouTubeVideoClick, onStartMaxAgent, isMaxAgentRunning, hasFiles, onToggleMaxVibe, isMaxVibeRunning, promptInputRef, submitButtonRef }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const mediaMenuRef = useRef<HTMLDivElement>(null);
  const [inputStyle, setInputStyle] = useState('glossy');

  useEffect(() => {
    setInputStyle(localStorage.getItem('input_bar_style') || 'glossy');
  }, []);

  useEffect(() => {
    if (promptInputRef.current && inputStyle === 'dynamic') {
      const textarea = promptInputRef.current;
      textarea.style.height = 'auto'; // Reset height to calculate new scrollHeight
      const maxHeight = 224; // Corresponds to max-h-56
      const scrollHeight = textarea.scrollHeight;

      if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
      }
    } else if (promptInputRef.current) {
        // Reset styles for non-dynamic inputs
        promptInputRef.current.style.height = '';
        promptInputRef.current.style.overflowY = '';
    }
  }, [prompt, inputStyle, promptInputRef]);


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
      if (mediaMenuRef.current && !mediaMenuRef.current.contains(event.target as Node)) {
        setIsMediaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const anyMediaConnected = isGiphyConnected || isUnsplashConnected || isYouTubeConnected;
  
  const glossyClasses = "w-full h-36 p-6 pr-20 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-[0_0_120px_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(255,255,255,0.05)] transition-all resize-none";
  const transparentClasses = "w-full h-36 p-6 pr-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg shadow-black/20 transition-all resize-none";
  const dynamicPillClasses = "w-full min-h-[56px] max-h-56 py-4 px-6 pr-20 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-[0_0_120px_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(255,255,255,0.05)] transition-all resize-none overflow-hidden";
  
  const inputClasses = inputStyle === 'dynamic' 
    ? dynamicPillClasses 
    : inputStyle === 'transparent' 
    ? transparentClasses 
    : glossyClasses;

  return (
    <form onSubmit={onSubmit} className="p-4">
      {hasFiles && (
        <div className="mb-3 flex justify-center gap-4">
            <button
                type="button"
                onClick={onStartMaxAgent}
                disabled={isLoading || isMaxAgentRunning || isMaxVibeRunning}
                className="px-6 py-2 bg-white text-black font-bold text-sm rounded-full shadow-lg hover:bg-gray-200 transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:text-gray-800 disabled:cursor-not-allowed"
            >
                {isMaxAgentRunning ? 'MAX is running...' : 'MAX'}
            </button>
            <button
                type="button"
                onClick={onToggleMaxVibe}
                disabled={isLoading || isMaxAgentRunning}
                className={`px-6 py-2 font-bold text-sm rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 ${isMaxVibeRunning ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-cyan-500 text-black hover:bg-cyan-400'} disabled:bg-gray-600 disabled:text-gray-800 disabled:cursor-not-allowed`}
            >
                <MaxVibeIcon className="w-4 h-4" />
                {isMaxVibeRunning ? 'Stop Vibe' : 'MAX Vibe'}
            </button>
        </div>
      )}
      <div className="flex items-center flex-wrap gap-y-2 mb-3 ml-2">
            <div className="relative" ref={uploadMenuRef}>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" multiple />
                <button
                    type="button"
                    onClick={() => setIsUploadMenuOpen(prev => !prev)}
                    disabled={isLoading || isMaxAgentRunning || isMaxVibeRunning}
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
             <div className="relative" ref={mediaMenuRef}>
                <button
                    type="button"
                    onClick={() => setIsMediaMenuOpen(prev => !prev)}
                    disabled={isLoading || isMaxAgentRunning || isMaxVibeRunning}
                    className="flex items-center justify-center h-10 w-10 bg-white/5 border border-white/10 rounded-full text-indigo-300 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                    title="Add Media from Services"
                >
                    <FilmIcon className="w-5 h-5" />
                </button>
                {isMediaMenuOpen && (
                    <div className="absolute bottom-12 -left-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg w-56 animate-fade-in-up-sm">
                        {isGiphyConnected && <button type="button" onClick={() => { onAddGifClick(); setIsMediaMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-t-lg"><GiphyIcon className="w-4 h-4" /> Add GIF from Giphy</button>}
                        {isUnsplashConnected && <button type="button" onClick={() => { onAddStockPhotoClick(); setIsMediaMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50"><UnsplashIcon className="w-4 h-4" /> Add Photo from Unsplash</button>}
                        {isYouTubeConnected && <button type="button" onClick={() => { onAddYouTubeVideoClick(); setIsMediaMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50"><YouTubeIcon className="w-4 h-4" /> Add Video from YouTube</button>}
                        {!anyMediaConnected && <p className="px-4 py-3 text-sm text-slate-500 text-center">Connect media apps in Settings to add stock photos, GIFs, and more.</p>}
                    </div>
                )}
            </div>
            <button
                type="button"
                onClick={onBoostUi}
                disabled={isLoading || isMaxAgentRunning || isMaxVibeRunning}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-indigo-300 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
            >
                <SparklesIcon className="w-4 h-4" />
                <span>Boost</span>
            </button>
            <button
                type="button"
                onClick={onToggleVisualEditMode}
                disabled={isLoading || isMaxAgentRunning || isMaxVibeRunning}
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
                            disabled={isLoading || isMaxAgentRunning || isMaxVibeRunning}
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
          ref={promptInputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Use this image as a hero background"
          className={inputClasses}
          disabled={isLoading || isMaxAgentRunning || isMaxVibeRunning}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
            }
          }}
        />
        <button
          ref={submitButtonRef}
          type="submit"
          disabled={isLoading || isMaxAgentRunning || isMaxVibeRunning || (!prompt.trim() && uploadedImages.length === 0)}
          className={`absolute h-12 w-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed group ${inputStyle === 'dynamic' ? 'right-2 top-2' : 'right-4 bottom-4'}`}
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

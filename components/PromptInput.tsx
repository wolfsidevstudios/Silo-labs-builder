import React from 'react';
import ArrowUpIcon from './icons/ArrowUpIcon';
import SparklesIcon from './icons/SparklesIcon';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBoostUi: () => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, onBoostUi, isLoading }) => {
  return (
    <form onSubmit={onSubmit} className="p-4">
      <div className="flex justify-start mb-3 ml-2">
            <button
                type="button"
                onClick={onBoostUi}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-indigo-300 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <SparklesIcon className="w-4 h-4" />
                <span>Boost UI</span>
            </button>
        </div>
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., add a dark mode toggle"
          className="w-full h-36 p-6 pr-20 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-[0_0_120px_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(255,255,0.05)] transition-all resize-none"
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
          disabled={isLoading || !prompt.trim()}
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
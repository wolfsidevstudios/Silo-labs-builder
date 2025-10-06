import React, { useState } from 'react';
import ArrowUpIcon from './icons/ArrowUpIcon';
import XIcon from './icons/XIcon';

interface VisualEditBarProps {
  selector: string;
  onSubmit: (prompt: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const VisualEditBar: React.FC<VisualEditBarProps> = ({ selector, onSubmit, onCancel, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            onSubmit(prompt);
            setPrompt('');
        }
    };

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl z-20 px-4 animate-fade-in-up">
            <div className="bg-slate-900/70 backdrop-blur-lg border border-white/10 rounded-full shadow-2xl p-2 flex items-center gap-2">
                <button 
                    onClick={onCancel} 
                    className="p-2 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                    aria-label="Cancel edit"
                >
                    <XIcon className="w-5 h-5" />
                </button>
                <div className="flex-grow flex items-center gap-2 min-w-0">
                    <p className="text-xs text-slate-400 px-1 truncate flex-shrink min-w-0" title={selector}>
                        Editing: <span className="font-mono text-slate-200">{selector}</span>
                    </p>
                    <form onSubmit={handleSubmit} className="flex-grow flex items-center">
                        <input 
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Your edit request..."
                            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none px-2 text-sm"
                            disabled={isLoading}
                            autoFocus
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !prompt.trim()} 
                            className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 disabled:bg-slate-600 transition-colors flex-shrink-0"
                            aria-label="Submit edit"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            ) : (
                                <ArrowUpIcon className="w-5 h-5 text-white" />
                            )}
                        </button>
                    </form>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px) translateX(-50%); }
                    to { opacity: 1; transform: translateY(0) translateX(-50%); }
                }
                .animate-fade-in-up { 
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default VisualEditBar;
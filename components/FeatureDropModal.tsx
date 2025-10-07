import React from 'react';
import XIcon from './icons/XIcon';
import SparklesIcon from './icons/SparklesIcon';
import ZapIcon from './icons/ZapIcon';
import GiftIcon from './icons/GiftIcon';

// Simple SVG components for logos to be used within this component
const SpotifyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="12" fill="#1DB954"/>
    <path d="M7.5 12.3c3.5-2 6.8-2.3 9.8-1.3.4.1.5.6.4 1-.1.4-.6.5-1 .4-2.7-.9-5.7-.6-8.8 1.1-.4.3-.9.1-1.2-.3-.3-.4-.1-.9.3-1.2z" fill="black"/>
    <path d="M7.2 14.8c3-1.7 6-1.9 8.6-1.1.4.1.6.5.5.9-.1.4-.5.6-.9.5-2.3-.7-5-.5-7.6 1-.3.2-.8 0-1-.3-.2-.3 0-.8.3-1z" fill="black"/>
    <path d="M7 17.2c2.5-1.4 5-1.5 7.1-.8.3.1.5.4.4.7-.1.3-.4.5-.7.4-1.9-.6-4-.5-6.2 1-.3.2-.7 0-.8-.2s0-.7.2-.8z" fill="black"/>
  </svg>
);

const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GiphyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="12" fill="white"/>
    <rect x="6" y="9" width="3" height="6" fill="#00FF99"/>
    <rect x="10.5" y="9" width="3" height="6" fill="#9933FF"/>
    <rect x="15" y="9" width="3" height="6" fill="#00CCFF"/>
  </svg>
);


interface FeatureDropModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeatureDropModal: React.FC<FeatureDropModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feature-drop-title"
    >
      <div
        className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-indigo-500/20 p-4 md:p-6 m-4 max-w-5xl w-full text-center transform transition-transform duration-300 scale-95 animate-scale-in flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-full p-2 z-10"
          aria-label="Close feature drop modal"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
            <SparklesIcon className="w-8 h-8 text-indigo-400"/>
            <h2 id="feature-drop-title" className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                This Month's Feature Drop
            </h2>
        </div>
        
        <div className="w-full h-auto p-4 md:p-6 bg-black/30 rounded-2xl border border-white/5">
            <div className="w-full grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4 text-white text-left">
                {/* From Prompt to App */}
                <div className="md:col-span-2 md:row-span-1 bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div><h3 className="text-lg md:text-xl font-bold text-white">From Prompt to App</h3></div>
                    <div className="mt-4 bg-black/50 p-3 rounded-lg text-xs text-slate-400 font-mono">
                      <p className="text-white/80 animate-pulse" style={{ animationDelay: '0.5s' }}>e.g. a photo gallery with a memory layout.</p>
                      <div className="flex gap-1 mt-2">
                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-slate-300">a weather app</span>
                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-slate-300">a recipe finder</span>
                      </div>
                    </div>
                </div>

                {/* Create API Apps */}
                <div className="md:col-span-1 md:row-span-1 bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-white/10 flex flex-col justify-center items-center text-center">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <SpotifyIcon className="w-7 h-7" />
                        <GoogleIcon className="w-7 h-7" />
                        <GiphyIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Create API powered apps</h3>
                </div>

                {/* Faster Apps */}
                <div className="md:col-span-1 md:row-span-2 bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-white/10 flex flex-col justify-center items-center text-center">
                    <ZapIcon className="w-16 h-16 text-white mb-4"/>
                    <h3 className="text-lg font-bold text-white">Faster and better apps</h3>
                </div>

                {/* Gemini 2.5 Pro */}
                <div className="md:col-span-1 md:row-span-1 bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-white/10 flex flex-col justify-center items-center">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">Gemini 2.5 Pro</h3>
                </div>

                {/* October Drop */}
                <div className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-blue-500 to-indigo-700 p-4 md:p-6 rounded-2xl border border-white/10 flex flex-col justify-center items-center text-center">
                     <h3 className="text-4xl md:text-5xl font-bold text-white">October drop.</h3>
                </div>

                {/* Affiliate Program */}
                <div className="md:col-span-4 md:row-span-1 bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <GiftIcon className="w-10 h-10 text-indigo-300 flex-shrink-0" />
                        <div>
                             <h3 className="text-lg font-bold text-white">Affiliate Program</h3>
                             <p className="text-sm text-slate-400">Share your tracking URL to get <strong>1 free generation</strong> per sign-up.</p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="p-2 pr-24 bg-black/50 rounded-full text-xs text-indigo-300 font-mono truncate">https://silo.../?ref=...</div>
                        <button className="absolute right-1 top-1 h-6 px-3 bg-indigo-600 rounded-full text-xs font-semibold">Copy URL</button>
                    </div>
                </div>
            </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scale-in {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default FeatureDropModal;

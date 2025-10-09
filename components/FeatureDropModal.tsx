import React, { useState } from 'react';
import XIcon from './icons/XIcon';
import SparklesIcon from './icons/SparklesIcon';
import WeatherApiIcon from './icons/WeatherApiIcon';
import TmdbIcon from './icons/TmdbIcon';
import YouTubeIcon from './icons/YouTubeIcon';
import MapboxIcon from './icons/MapboxIcon';
import ExchangeRateApiIcon from './icons/ExchangeRateApiIcon';
import OpenWeatherMapIcon from './icons/OpenWeatherMapIcon';
import FinancialModelingPrepIcon from './icons/FinancialModelingPrepIcon';
import NewsApiIcon from './icons/NewsApiIcon';
import RawgIcon from './icons/RawgIcon';
import WordsApiIcon from './icons/WordsApiIcon';
import SpotifyIcon from './icons/SpotifyIcon';
import GiphyIcon from './icons/GiphyIcon';
import ZapIcon from './icons/ZapIcon';
import GiftIcon from './icons/GiftIcon';
import GoogleIcon from './icons/GoogleIcon';
import BeakerIcon from './icons/BeakerIcon';
import DiamondIcon from './icons/DiamondIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import MaxVibeShowcase from './MaxVibeShowcase';


interface FeatureDropModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const apiIntegrations = [
  { name: 'WeatherAPI', icon: WeatherApiIcon },
  { name: 'TMDB', icon: TmdbIcon },
  { name: 'YouTube', icon: YouTubeIcon },
  { name: 'Mapbox', icon: MapboxIcon },
  { name: 'OpenWeatherMap', icon: OpenWeatherMapIcon },
  { name: 'ExchangeRate', icon: ExchangeRateApiIcon },
  { name: 'Financial Modeling', icon: FinancialModelingPrepIcon },
  { name: 'NewsAPI', icon: NewsApiIcon },
  { name: 'RAWG Games', icon: RawgIcon },
  { name: 'WordsAPI', icon: WordsApiIcon },
];

const Part1Content = () => (
    <div className="w-full space-y-3 animate-fade-in">
        <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 p-4 bg-black/30 rounded-xl flex flex-col justify-center">
                <h3 className="font-bold text-white text-lg">From Prompt to App</h3>
                <div className="mt-2 text-left bg-black/50 p-3 rounded-lg border border-white/10 text-xs text-slate-400">e.g., a photo gallery with a masonry layout...</div>
            </div>
             <div className="p-4 bg-black/30 rounded-xl flex flex-col items-center justify-center text-center">
                <h3 className="font-bold text-white text-sm">Create API apps</h3>
                <div className="flex items-center gap-3 mt-2">
                    <SpotifyIcon className="w-6 h-6 text-green-500" />
                    <GoogleIcon className="w-5 h-5 text-white" />
                    <GiphyIcon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
         <div className="grid grid-cols-3 gap-3">
             <div className="p-4 bg-black/30 rounded-xl flex flex-col items-center justify-center">
                <h3 className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">Gemini 2.5 Pro</h3>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <h3 className="font-bold text-white text-xl">October drop.</h3>
            </div>
             <div className="p-4 bg-black/30 rounded-xl flex flex-col items-center justify-center text-center">
                <ZapIcon className="w-7 h-7 text-yellow-300" />
                <h3 className="font-semibold text-white text-xs mt-1">faster and better apps</h3>
            </div>
        </div>
        <div className="p-4 bg-black/30 rounded-xl flex items-center gap-4">
            <GiftIcon className="w-10 h-10 text-indigo-400 flex-shrink-0" />
            <div>
                <h3 className="font-bold text-white">Affiliate Program</h3>
                <p className="text-xs text-slate-400">Share your tracking URL to get 1 free generation per sign-up and earn cash back.</p>
            </div>
        </div>
    </div>
);

const Part2Content = () => (
     <div className="w-full p-4 bg-black/30 rounded-2xl border border-white/5 animate-fade-in">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {apiIntegrations.map((api, index) => (
                <div key={api.name} className="flex flex-col items-center justify-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                    <api.icon className="w-8 h-8 text-white" />
                    <span className="text-xs text-slate-300 text-center">{api.name}</span>
                </div>
            ))}
        </div>
    </div>
);

const Part3Content = () => (
    <div className="w-full p-8 bg-black/30 rounded-2xl border border-dashed border-slate-700 animate-fade-in flex flex-col items-center justify-center text-center py-16">
       <BeakerIcon className="w-12 h-12 text-indigo-400 mb-4" />
       <h3 className="font-bold text-white text-xl">The AI Revolution is Coming</h3>
       <p className="text-slate-400 mt-2 max-w-sm">
           Directly integrate Gemini into your apps, create agents, and unlock powerful new AI capabilities. Stay tuned.
       </p>
   </div>
);

const Part4Content = () => (
    <div className="w-full p-8 bg-black/30 rounded-2xl border border-dashed border-slate-700 animate-fade-in flex flex-col items-center justify-center text-center py-12">
       <div className="flex items-center gap-4 mb-4">
            <DiamondIcon className="w-12 h-12 text-purple-400" />
            <ZapIcon className="w-12 h-12 text-cyan-400" />
       </div>
       <h3 className="font-bold text-white text-xl">The Future is Coming: Gemini 3.0</h3>
       <p className="text-slate-400 mt-2 max-w-md">
           We are committed to providing the most powerful tools. We're already preparing to integrate the next generation of AI, including Gemini 3.0 Pro and Flash models, as soon as they are released.
       </p>
   </div>
);

const Part5Content = () => (
    <div className="w-full animate-fade-in flex flex-col items-center justify-center text-center">
       <h3 className="font-bold text-white text-xl">Introducing: MAX Vibe</h3>
       <p className="text-slate-400 mt-2 mb-4 max-w-md">
         Activate the Vibe Coder and watch as MAX autonomously improves your app. It thinks of new features, writes the prompts, and builds them for you.
       </p>
       <MaxVibeShowcase />
   </div>
);

const Part6Content = () => (
    <div className="w-full p-8 bg-black/30 rounded-2xl border border-dashed border-cyan-500 animate-fade-in flex flex-col items-center justify-center text-center py-12">
       <div className="flex items-center gap-4">
         <BrainCircuitIcon className="w-12 h-12 text-indigo-300" />
         <span className="text-2xl font-bold text-slate-400">&rarr;</span>
         <div className="relative">
            <svg width="64" height="64" viewBox="0 0 24 24" className="w-16 h-16 text-slate-500">
                <rect x="3" y="8" width="18" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"></rect>
                <path d="M7 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
            </svg>
            <span className="absolute top-1/2 left-8 font-mono text-cyan-400 animate-pulse">test...</span>
         </div>
       </div>
       <h3 className="font-bold text-white text-xl mt-6">Silo MAX 1.01: The Interactive Agent</h3>
       <p className="text-slate-400 mt-4 max-w-md">
           This might seem like a small update, but it's a major leap. MAX can now test your input fields, autonomously typing random text to ensure your forms and search bars work as expected. It's one step closer to a fully-aware testing agent.
       </p>
   </div>
);

const Part7Content = () => (
    <div className="w-full p-8 bg-black/30 rounded-2xl border border-dashed border-green-500 animate-fade-in flex flex-col items-center justify-center text-center py-12">
       <div className="flex items-center gap-4">
         <div className="relative">
            <svg width="64" height="64" viewBox="0 0 24 24" className="w-16 h-16 text-slate-500">
                <rect x="3" y="8" width="18" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"></rect>
                <path d="M7 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
            </svg>
            <span className="absolute top-1/2 left-8 font-mono text-cyan-400 animate-pulse">query...</span>
         </div>
         <span className="text-2xl font-bold text-slate-400">&rarr;</span>
         <div className="relative">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                <ArrowUpIcon className="w-8 h-8 text-green-400"/>
            </div>
         </div>
       </div>
       <h3 className="font-bold text-white text-xl mt-6">Silo MAX 1.02: Smart Submission</h3>
       <p className="text-slate-400 mt-4 max-w-md">
            MAX is getting smarter. After typing into an input field, it now intelligently looks for the nearest submission button—like "Search," "Send," or "Go"—and clicks it. Your agent can now complete entire workflows, from data entry to action.
       </p>
   </div>
);


const FeatureDropModal: React.FC<FeatureDropModalProps> = ({ isOpen, onClose }) => {
  const [activePart, setActivePart] = useState<'part1' | 'part2' | 'part3' | 'part4' | 'part5' | 'part6' | 'part7'>('part5');

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
        className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-indigo-500/20 p-6 md:p-8 m-4 max-w-3xl w-full text-center transform transition-transform duration-300 scale-95 animate-scale-in flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-full p-2 z-10"
          aria-label="Close feature drop modal"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
            <SparklesIcon className="w-8 h-8 text-indigo-400"/>
            <h2 id="feature-drop-title" className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                October Drop.
            </h2>
        </div>
        <p className="font-semibold text-slate-300 mb-8">
            {activePart === 'part1' ? 'Part I: The Foundation' 
             : activePart === 'part2' ? 'Part II: The API Update' 
             : activePart === 'part3' ? 'Part III: The AI Revolution'
             : activePart === 'part4' ? 'Part IV: The Next Generation'
             : activePart === 'part5' ? 'Part V: The Vibe Coder'
             : activePart === 'part6' ? 'Part VI: MAX 1.01'
             : 'Part VII: MAX 1.02'}
        </p>

        {activePart === 'part1' ? <Part1Content /> 
         : activePart === 'part2' ? <Part2Content /> 
         : activePart === 'part3' ? <Part3Content />
         : activePart === 'part4' ? <Part4Content />
         : activePart === 'part5' ? <Part5Content />
         : activePart === 'part6' ? <Part6Content />
         : <Part7Content />}
        
        <div className="mt-8 bg-slate-900/50 p-1 rounded-full flex items-center border border-slate-700/50 flex-wrap justify-center">
            <button onClick={() => setActivePart('part1')} className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${activePart === 'part1' ? 'bg-white text-black' : 'text-slate-300'}`}>Part I</button>
            <button onClick={() => setActivePart('part2')} className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${activePart === 'part2' ? 'bg-white text-black' : 'text-slate-300'}`}>Part II</button>
            <button onClick={() => setActivePart('part3')} className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${activePart === 'part3' ? 'bg-white text-black' : 'text-slate-300'}`}>Part III</button>
            <button onClick={() => setActivePart('part4')} className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${activePart === 'part4' ? 'bg-white text-black' : 'text-slate-300'}`}>Part IV</button>
            <button onClick={() => setActivePart('part5')} className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${activePart === 'part5' ? 'bg-white text-black' : 'text-slate-300'}`}>Part V</button>
            <button onClick={() => setActivePart('part6')} className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${activePart === 'part6' ? 'bg-white text-black' : 'text-slate-300'}`}>Part VI</button>
            <button onClick={() => setActivePart('part7')} className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${activePart === 'part7' ? 'bg-white text-black' : 'text-slate-300'}`}>Part VII</button>
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
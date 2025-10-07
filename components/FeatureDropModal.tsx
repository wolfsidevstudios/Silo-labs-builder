import React from 'react';
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
        className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-indigo-500/20 p-6 md:p-8 m-4 max-w-2xl w-full text-center transform transition-transform duration-300 scale-95 animate-scale-in flex flex-col items-center"
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
        <p className="font-semibold text-slate-300 mb-8">Part II: The API Update</p>
        
        <p className="text-slate-400 mb-6">Build even more powerful apps with 10 new API integrations!</p>

        <div className="w-full p-4 bg-black/30 rounded-2xl border border-white/5">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {apiIntegrations.map((api, index) => (
                    <div key={api.name} className="flex flex-col items-center justify-center gap-2 p-2 bg-slate-800/50 rounded-lg animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`}}>
                        <api.icon className="w-8 h-8 text-white" />
                        <span className="text-xs text-slate-300 text-center">{api.name}</span>
                    </div>
                ))}
            </div>
        </div>
         <p className="text-slate-500 text-sm mt-6">Connect them all in the Settings page.</p>
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
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default FeatureDropModal;
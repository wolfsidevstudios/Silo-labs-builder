import React, { useState } from 'react';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import BrainCircuitIcon from '../components/icons/BrainCircuitIcon';

interface HomePageProps {
  onGenerate: (prompt: string, isLisaActive: boolean) => void;
}

const suggestionPrompts = [
  "a simple pomodoro timer",
  "a weather app with a 5-day forecast",
  "a responsive photo gallery",
  "a markdown note-taking app",
  "a real-time crypto price tracker",
  "a recipe finder with a search bar",
];

const BackgroundSvg = () => (
    <svg viewBox="0 0 1920 1920" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full object-fill z-0 opacity-70">
      <defs>
        <filter id="new_blur_1" x="-800" y="-800" width="3000" height="3000" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="400" result="effect1_foregroundBlur" />
        </filter>
        <filter id="new_blur_2" x="-800" y="-800" width="3000" height="3000" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="350" result="effect1_foregroundBlur" />
        </filter>
        <filter id="new_blur_3" x="-800" y="-800" width="3000" height="3000" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="450" result="effect1_foregroundBlur" />
        </filter>
        <filter id="new_blur_4" x="-800" y="-800" width="3000" height="3000" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="300" result="effect1_foregroundBlur" />
        </filter>
      </defs>
      <rect width="1920" height="1920" fill="black" />
      <g filter="url(#new_blur_1)">
        <circle cx="300" cy="400" r="600" fill="#614CF3" />
      </g>
      <g filter="url(#new_blur_2)">
        <circle cx="1600" cy="500" r="700" fill="#FF7449" />
      </g>
      <g filter="url(#new_blur_3)">
        <circle cx="1500" cy="1700" r="800" fill="#6DE5FF" />
      </g>
      <g filter="url(#new_blur_4)">
        <circle cx="200" cy="1800" r="500" fill="#E94560" />
      </g>
    </svg>
);


const HomePage: React.FC<HomePageProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isLisaActive, setIsLisaActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, isLisaActive);
    }
  };

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      <BackgroundSvg />
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white pl-[4.5rem]">
        <main className="flex flex-col items-center justify-center w-full flex-grow text-center">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text mb-6 animate-fade-in-down">
            From Prompt to App
          </h1>
          
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setIsLisaActive(prev => !prev)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                isLisaActive
                  ? 'bg-white border-white text-black shadow-lg shadow-white/20'
                  : 'bg-white/5 border-white/10 text-indigo-300'
              }`}
            >
              <BrainCircuitIcon className={`w-5 h-5 transition-colors ${isLisaActive ? 'text-indigo-500' : ''}`} />
              Lisa Agent {isLisaActive ? 'Active' : 'Inactive'}
            </button>
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="relative w-full max-w-2xl animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., a photo gallery with a masonry layout..."
              className="w-full h-48 p-6 pr-20 bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-[0_0_150px_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(255,255,255,0.05)] transition-all resize-none"
              aria-label="App prompt"
               onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                  }
               }}
            />
            <button
              type="submit"
              className="absolute right-4 bottom-4 h-12 w-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed group"
              disabled={!prompt.trim()}
              aria-label="Generate app"
            >
              <ArrowUpIcon className="w-6 h-6 text-black transition-transform group-hover:scale-110" />
            </button>
          </form>
          
          <div 
            className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-2xl animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            {suggestionPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => setPrompt(p)}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300 hover:bg-white/10 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </main>
      </div>

       <style>{`
        @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.6s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default HomePage;
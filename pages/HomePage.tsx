import React, { useState } from 'react';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';

interface HomePageProps {
  onGenerate: (prompt: string) => void;
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
    <svg viewBox="0 0 1920 1920" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full object-cover z-0 opacity-70">
      <g clipPath="url(#clip0_121_37)">
        <path fill="#000000" d="M0 0h1920v1920H0Z"></path>
        <g filter="url(#filter0_f_121_37)">
          <path fill="#614CF3" d="M-627.84 122.513a1049.17 922.217 0 1 0 2098.34 0 1049.17 922.217 0 1 0-2098.34 0"></path>
        </g>
        <g filter="url(#filter1_f_121_37)">
          <path fill="#000000" d="M966.394 83.9955a794.776 651.157 0 1 0 1589.552 0 794.776 651.157 0 1 0-1589.552 0"></path>
        </g>
        <g filter="url(#filter2_f_121_37)">
          <path fill="#6DE5FF" d="M762 1296a785 762 0 1 0 1570 0 785 762 0 1 0-1570 0"></path>
        </g>
        <g filter="url(#filter3_f_121_37)">
          <path fill="#0c0c0b" d="M-327 1770.81a957.066 656.814 0 1 0 1914.132 0 957.066 656.814 0 1 0-1914.132 0"></path>
        </g>
        <g filter="url(#filter4_f_121_37)">
          <path fill="#FF7449" d="M-1183.796 840.867a779.106 773.499 0 1 0 1558.212 0 779.106 773.499 0 1 0-1558.212 0"></path>
        </g>
      </g>
      <defs>
        <filter id="filter0_f_121_37" x="-1427.84" y="-1599.7" width="3698.34" height="3444.43" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur stdDeviation="400" result="effect1_foregroundBlur_121_37"></feGaussianBlur>
        </filter>
        <filter id="filter1_f_121_37" x="166.391" y="-1367.16" width="3189.55" height="2902.31" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur stdDeviation="400" result="effect1_foregroundBlur_121_37"></feGaussianBlur>
        </filter>
        <filter id="filter2_f_121_37" x="-38" y="-266" width="3170" height="3124" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur stdDeviation="400" result="effect1_foregroundBlur_121_37"></feGaussianBlur>
        </filter>
        <filter id="filter3_f_121_37" x="-1127" y="314" width="3514.13" height="2913.63" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur stdDeviation="400" result="effect1_foregroundBlur_121_37"></feGaussianBlur>
        </filter>
        <filter id="filter4_f_121_37" x="-1983.8" y="-732.632" width="3158.21" height="3147" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur stdDeviation="400" result="effect1_foregroundBlur_121_37"></feGaussianBlur>
        </filter>
        <clipPath id="clip0_121_37">
          <path fill="#ffffff" d="M0 0h1920v1920H0Z"></path>
        </clipPath>
      </defs>
    </svg>
);


const HomePage: React.FC<HomePageProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      <BackgroundSvg />
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white pl-[4.5rem]">
        <main className="flex flex-col items-center justify-center w-full flex-grow text-center">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text mb-12 animate-fade-in-down">
            From Prompt to App
          </h1>
          
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
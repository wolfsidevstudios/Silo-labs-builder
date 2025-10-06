import React, { useState } from 'react';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import TrialCountdownBar from '../components/TrialCountdownBar';

interface HomePageProps {
  onGenerate: (prompt: string) => void;
  isTrialActive: boolean;
  trialEndTime: number | null;
}

const suggestionPrompts = [
  "a simple pomodoro timer",
  "a weather app with a 5-day forecast",
  "a responsive photo gallery",
  "a markdown note-taking app",
  "a real-time crypto price tracker",
  "a recipe finder with a search bar",
];

const HomePage: React.FC<HomePageProps> = ({ onGenerate, isTrialActive, trialEndTime }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <main className="flex flex-col items-center justify-center w-full flex-grow text-center">
        {isTrialActive && trialEndTime && <TrialCountdownBar endTime={trialEndTime} />}
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

       <footer className="w-full text-center p-4 text-xs text-gray-600">
          Built with Gemini
      </footer>
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
import React, { useState, useRef, useEffect } from 'react';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import BrainCircuitIcon from '../components/icons/BrainCircuitIcon';
import RocketIcon from '../components/icons/RocketIcon';
import GitHubRepoSelectionModal from '../components/GitHubRepoSelectionModal';
import { GitHubRepo, AppMode } from '../types';
import HomePageBackground from '../components/HomePageBackground';
import ExpoIcon from '../components/icons/ExpoIcon';
import SmartphoneIcon from '../components/icons/SmartphoneIcon';


interface HomePageProps {
  onGenerate: (prompt: string, isLisaActive: boolean, appMode: AppMode) => void;
  onStartCodePilot: (repo: GitHubRepo) => void;
}

const suggestionPrompts = [
  "a simple pomodoro timer",
  "a weather app with a 5-day forecast",
  "a responsive photo gallery",
  "a markdown note-taking app",
  "a real-time crypto price tracker",
  "a recipe finder with a search bar",
];

const HomePage: React.FC<HomePageProps> = ({ onGenerate, onStartCodePilot }) => {
  const [prompt, setPrompt] = useState('');
  const [isLisaActive, setIsLisaActive] = useState(false);
  const [isExpoMode, setIsExpoMode] = useState(false);
  const [isMobileWebAppMode, setIsMobileWebAppMode] = useState(false);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [inputStyle, setInputStyle] = useState('glossy');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInputStyle(localStorage.getItem('input_bar_style') || 'glossy');
  }, []);

  useEffect(() => {
    if (textareaRef.current && inputStyle === 'dynamic') {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto'; // Reset height
      const maxHeight = 256; // Corresponds to max-h-64
      const scrollHeight = textarea.scrollHeight;

      if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
      }
    } else if (textareaRef.current) {
        // Reset styles for non-dynamic inputs
        textareaRef.current.style.height = '';
        textareaRef.current.style.overflowY = '';
    }
  }, [prompt, inputStyle]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      let mode: AppMode = 'web';
      if (isExpoMode) mode = 'expo';
      else if (isMobileWebAppMode) mode = 'mobile-web';
      onGenerate(prompt, isLisaActive, mode);
    }
  };

  const handleRepoSelected = (repo: GitHubRepo) => {
    setIsRepoModalOpen(false);
    onStartCodePilot(repo);
  };
  
  const handleToggleExpo = () => {
    setIsExpoMode(prev => {
      if (!prev) setIsMobileWebAppMode(false); // Turn off mobile web if turning on expo
      return !prev;
    });
  };

  const handleToggleMobileWeb = () => {
    setIsMobileWebAppMode(prev => {
      if (!prev) setIsExpoMode(false); // Turn off expo if turning on mobile web
      return !prev;
    });
  };

  const glossyClasses = "w-full h-48 p-6 pr-20 bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-[0_0_150px_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(255,255,255,0.05)] transition-all resize-none";
  const transparentClasses = "w-full h-48 p-6 pr-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg shadow-black/20 transition-all resize-none";
  const dynamicPillClasses = "w-full min-h-[56px] max-h-64 py-4 px-6 pr-20 bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-[0_0_150px_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(255,255,255,0.05)] transition-all resize-none overflow-hidden";

  const inputClasses = inputStyle === 'dynamic' 
      ? dynamicPillClasses 
      : inputStyle === 'transparent' 
      ? transparentClasses 
      : glossyClasses;

  return (
    <>
      <GitHubRepoSelectionModal
        isOpen={isRepoModalOpen}
        onClose={() => setIsRepoModalOpen(false)}
        onSelectRepo={handleRepoSelected}
      />
      <div className="relative h-screen w-screen bg-black overflow-hidden">
        <HomePageBackground />
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white pl-[4.5rem]">
          <main className="flex flex-col items-center justify-center w-full flex-grow text-center">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text mb-6 animate-fade-in-down">
              From Prompt to App
            </h1>
            
            <div className="mb-6 flex items-center justify-center gap-2 flex-wrap">
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
               <button
                type="button"
                onClick={handleToggleMobileWeb}
                className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isMobileWebAppMode
                    ? 'bg-white border-white text-black shadow-lg shadow-white/20'
                    : 'bg-white/5 border-white/10 text-cyan-300'
                }`}
              >
                <SmartphoneIcon className={`w-5 h-5 transition-colors ${isMobileWebAppMode ? 'text-black' : ''}`} />
                Mobile Web App {isMobileWebAppMode ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                onClick={handleToggleExpo}
                className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isExpoMode
                    ? 'bg-white border-white text-black shadow-lg shadow-white/20'
                    : 'bg-white/5 border-white/10 text-cyan-300'
                }`}
              >
                <ExpoIcon className={`w-5 h-5 transition-colors ${isExpoMode ? 'text-black' : ''}`} />
                Expo App Mode {isExpoMode ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                onClick={() => setIsRepoModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 bg-white/5 border-white/10 text-cyan-300"
              >
                <RocketIcon className="w-5 h-5" />
                Code Pilot
              </button>
            </div>

            <form 
              onSubmit={handleSubmit} 
              className="relative w-full max-w-2xl animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., a photo gallery with a masonry layout..."
                className={inputClasses}
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
                className={`absolute h-12 w-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed group ${inputStyle === 'dynamic' ? 'right-2 top-2' : 'right-4 bottom-4'}`}
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
    </>
  );
};

export default HomePage;
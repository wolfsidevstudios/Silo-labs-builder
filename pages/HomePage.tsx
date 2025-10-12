import React, { useState, useRef, useEffect } from 'react';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import BrainCircuitIcon from '../components/icons/BrainCircuitIcon';
import RocketIcon from '../components/icons/RocketIcon';
import GitHubRepoSelectionModal from '../components/GitHubRepoSelectionModal';
import { GitHubRepo, AppMode } from '../types';
import HomePageBackground from '../components/HomePageBackground';
import ExpoIcon from '../components/icons/ExpoIcon';
import ReactIcon from '../components/icons/ReactIcon';
import SparklesIcon from '../components/icons/SparklesIcon';


interface HomePageProps {
  onGenerate: (prompt: string, isLisaActive: boolean, appMode: AppMode) => void;
  onStartCodePilot: (repo: GitHubRepo) => void;
}

const suggestionPrompts = [
  { short: "AI Chatbot", long: "An AI-powered chatbot interface using the Gemini API. Include a chat history display area, a user input field, and a send button. When a message is sent, display the user's message and then the AI's response." },
  { short: "Weather App", long: "A clean, modern weather application using the WeatherAPI.com API. It should have an input field for a city name, display the current temperature, weather condition (e.g., 'Sunny'), and a 3-day forecast." },
  { short: "Movie Finder", long: "A movie search application using the TMDB API. Include a search bar to look for movies by title. Display the results in a grid of movie posters. Each result should show the movie title and its poster image." },
  { short: "Image Generator", long: "An AI image generator using the OpenAI DALL-E 3 API. Provide a text area for a prompt and a 'Generate' button. When clicked, display the generated image below." },
  { short: "Stock Tracker", long: "A real-time stock price tracker using the Financial Modeling Prep API. The user should be able to enter a stock symbol (e.g., AAPL) and see the current price and daily change." },
  { short: "Recipe Finder", long: "A recipe finder application. Include a search bar for ingredients or dish names. Display search results as cards with a photo, title, and a brief description." },
];

const HomePage: React.FC<HomePageProps> = ({ onGenerate, onStartCodePilot }) => {
  const [prompt, setPrompt] = useState('');
  const [isLisaActive, setIsLisaActive] = useState(false);
  const [isExpoMode, setIsExpoMode] = useState(false);
  const [isReactTsMode, setIsReactTsMode] = useState(false);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [inputStyle, setInputStyle] = useState('glossy');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const suggestionsMenuRef = useRef<HTMLDivElement>(null);
  const suggestionsButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsMenuRef.current &&
        !suggestionsMenuRef.current.contains(event.target as Node) &&
        suggestionsButtonRef.current &&
        !suggestionsButtonRef.current.contains(event.target as Node)
      ) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      let mode: AppMode = 'web';
      if (isExpoMode) mode = 'expo';
      else if (isReactTsMode) mode = 'react-ts';
      onGenerate(prompt, isLisaActive, mode);
    }
  };

  const handleRepoSelected = (repo: GitHubRepo) => {
    setIsRepoModalOpen(false);
    onStartCodePilot(repo);
  };
  
  const handleToggleExpo = () => {
    setIsExpoMode(prev => {
      if (!prev) setIsReactTsMode(false); // Turn off react-ts if turning on expo
      return !prev;
    });
  };

  const handleToggleReactTs = () => {
    setIsReactTsMode(prev => {
      if (!prev) setIsExpoMode(false); // Turn off expo if turning on react-ts
      return !prev;
    });
  };

  const glossyClasses = "w-full h-48 p-6 pr-40 bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-[0_0_150px_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(255,255,255,0.05)] transition-all resize-none";
  const transparentClasses = "w-full h-48 p-6 pr-40 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg shadow-black/20 transition-all resize-none";
  const dynamicPillClasses = "w-full min-h-[56px] max-h-64 py-4 px-6 pr-40 bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-[0_0_150px_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(255,255,255,0.05)] transition-all resize-none overflow-hidden";

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
            
            <div className="mb-8 flex justify-center">
                <div className="bg-white/5 border border-white/10 rounded-full p-1 flex items-center gap-1 backdrop-blur-sm">
                    <button
                        type="button"
                        onClick={() => setIsLisaActive(prev => !prev)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                            isLisaActive ? 'bg-white text-black shadow-md' : 'text-slate-300 hover:bg-white/10'
                        }`}
                    >
                        <BrainCircuitIcon className={`w-5 h-5 transition-colors ${isLisaActive ? 'text-indigo-500' : 'text-indigo-300'}`} />
                        Lisa Agent
                    </button>
                    <button
                        type="button"
                        onClick={handleToggleReactTs}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                            isReactTsMode ? 'bg-white text-black shadow-md' : 'text-slate-300 hover:bg-white/10'
                        }`}
                    >
                        <ReactIcon className={`w-5 h-5 ${isReactTsMode ? '' : 'text-cyan-300'}`} />
                        React + TS
                    </button>
                     <button
                        type="button"
                        onClick={handleToggleExpo}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                            isExpoMode ? 'bg-white text-black shadow-md' : 'text-slate-300 hover:bg-white/10'
                        }`}
                    >
                        <ExpoIcon className={`w-5 h-5 ${isExpoMode ? '' : 'text-cyan-300'}`} />
                        Expo
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <button
                        type="button"
                        onClick={() => setIsRepoModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors"
                    >
                        <RocketIcon className="w-5 h-5 text-cyan-300" />
                        Code Pilot
                    </button>
                </div>
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
              <div className={`absolute flex items-center gap-2 ${inputStyle === 'dynamic' ? 'right-2 top-2' : 'right-4 bottom-4'}`}>
                <div className="relative">
                  <button
                    ref={suggestionsButtonRef}
                    type="button"
                    onClick={() => setIsSuggestionsOpen(prev => !prev)}
                    className="h-12 px-5 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full text-sm text-slate-200 hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <SparklesIcon className="w-5 h-5" />
                    <span>Prompts</span>
                  </button>
                  {isSuggestionsOpen && (
                    <div
                      ref={suggestionsMenuRef}
                      className="absolute bottom-full right-0 mb-2 bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-lg w-72 animate-fade-in-up-sm"
                    >
                      <div className="p-2">
                        <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Suggestions</p>
                        <div className="mt-1">
                          {suggestionPrompts.map((p, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setPrompt(p.long);
                                setIsSuggestionsOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors"
                            >
                              {p.short}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="h-12 w-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed group"
                  disabled={!prompt.trim()}
                  aria-label="Generate app"
                >
                  <ArrowUpIcon className="w-6 h-6 text-black transition-transform group-hover:scale-110" />
                </button>
              </div>
            </form>
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
          @keyframes fade-in-up-sm {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up-sm {
            animation: fade-in-up-sm 0.2s ease-out forwards;
          }
        `}</style>
      </div>
    </>
  );
};

export default HomePage;

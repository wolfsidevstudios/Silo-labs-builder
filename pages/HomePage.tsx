import React, { useState, useRef, useEffect } from 'react';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import BrainCircuitIcon from '../components/icons/BrainCircuitIcon';
import RocketIcon from '../components/icons/RocketIcon';
import GitHubRepoSelectionModal from '../components/GitHubRepoSelectionModal';
import { GitHubRepo, AppMode } from '../types';
import HomePageBackground from '../components/HomePageBackground';
import ExpoIcon from '../components/icons/ExpoIcon';
import ReactIcon from '../components/icons/ReactIcon';
import FlutterIcon from '../components/icons/FlutterIcon';
import NextjsIcon from '../components/icons/NextjsIcon';
import AngularIcon from '../components/icons/AngularIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import ZapIcon from '../components/icons/ZapIcon';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';
import CheckIcon from '../components/icons/CheckIcon';


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

const faqData = [
  {
    q: "What is Silo Build?",
    a: "Silo Build is an AI-powered application builder that allows you to generate complete web and mobile applications from simple text prompts. It's designed for rapid prototyping, learning, and bringing ideas to life without extensive coding."
  },
  {
    q: "What kind of apps can I build?",
    a: "You can build a wide variety of applications, including interactive web apps (PWAs), mobile apps using Expo (React Native), and full-stack projects with React+TS, Next.js, and more. The AI can integrate with numerous third-party APIs to add powerful features to your apps."
  },
  {
    q: "Do I need to know how to code?",
    a: "No coding knowledge is required to get started! You can generate your first app just by describing it. However, familiarity with HTML, CSS, JavaScript, and React will help you understand, customize, and extend the generated code."
  },
  {
    q: "How does the AI work?",
    a: "Silo Build uses advanced generative AI models, including Google's Gemini family. When you enter a prompt, the AI acts as an expert software engineer, planning the architecture, writing the code, and designing the UI to create a fully functional application based on your request."
  }
];


const HomePage: React.FC<HomePageProps> = ({ onGenerate, onStartCodePilot }) => {
  const [prompt, setPrompt] = useState('');
  const [isLisaActive, setIsLisaActive] = useState(false);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [inputStyle, setInputStyle] = useState('glossy');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const suggestionsMenuRef = useRef<HTMLDivElement>(null);
  const suggestionsButtonRef = useRef<HTMLButtonElement>(null);
  const [isModesMenuOpen, setIsModesMenuOpen] = useState(false);
  const modesMenuRef = useRef<HTMLDivElement>(null);
  const modesButtonRef = useRef<HTMLButtonElement>(null);
  
  const [activeMode, setActiveMode] = useState<AppMode>('web');


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
      if (
        modesMenuRef.current &&
        !modesMenuRef.current.contains(event.target as Node) &&
        modesButtonRef.current &&
        !modesButtonRef.current.contains(event.target as Node)
      ) {
        setIsModesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, isLisaActive, activeMode);
    }
  };

  const handleRepoSelected = (repo: GitHubRepo) => {
    setIsRepoModalOpen(false);
    onStartCodePilot(repo);
  };
  
  const handleModeChange = (mode: AppMode) => {
    setActiveMode(prev => prev === mode ? 'web' : mode);
  };

  const glossyClasses = "w-full h-48 p-6 pl-44 pr-40 bg-white rounded-3xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl shadow-black/20 transition-all resize-none";
  const transparentClasses = "w-full h-48 p-6 pl-44 pr-40 bg-white/90 backdrop-blur-md border border-white/20 rounded-3xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl shadow-black/20 transition-all resize-none";
  const dynamicPillClasses = "w-full min-h-[56px] max-h-64 py-4 px-6 pl-44 pr-40 bg-white rounded-full text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl shadow-black/20 transition-all resize-none overflow-hidden";

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
      <div className="relative min-h-screen w-screen bg-black overflow-y-auto">
        <HomePageBackground />
        <div className="relative z-10 w-full flex flex-col items-center justify-center p-4 pt-24 md:pt-32 pb-16 selection:bg-indigo-500 selection:text-white pl-[4.5rem]">
          <main className="flex flex-col items-center justify-center w-full mb-24 md:mb-32">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text mb-6 animate-fade-in-down">
              From Prompt to App
            </h1>
            
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
                className={`${inputClasses} text-left`}
                aria-label="App prompt"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
              />
              <div className={`absolute flex items-center gap-2 ${inputStyle === 'dynamic' ? 'left-3 top-2' : 'left-4 bottom-4'}`}>
                <div className="relative">
                    <button
                        ref={modesButtonRef}
                        type="button"
                        onClick={() => setIsModesMenuOpen(prev => !prev)}
                        className="relative bg-slate-100 p-2 pl-4 pr-3 flex items-center gap-2 rounded-full text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                        <ZapIcon className="w-5 h-5 text-indigo-500" />
                        <span className="font-semibold text-sm">Modes & Agents</span>
                        <ChevronDownIcon className="w-4 h-4 text-slate-500" />
                        {(isLisaActive || activeMode !== 'web') && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                            </span>
                        )}
                    </button>
                    {isModesMenuOpen && (
                        <div
                            ref={modesMenuRef}
                            className="absolute bottom-full left-0 mb-2 bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-lg w-64 animate-fade-in-up-sm"
                        >
                            <div className="p-2 space-y-1">
                                <button onClick={() => setIsLisaActive(prev => !prev)} className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <BrainCircuitIcon className="w-5 h-5 text-indigo-300" />
                                        <span>Lisa Agent</span>
                                    </div>
                                    {isLisaActive && <CheckIcon className="w-5 h-5 text-indigo-400" />}
                                </button>
                                <div className="!my-2 h-px bg-slate-700"></div>
                                <button onClick={() => handleModeChange('react-ts')} className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <ReactIcon className="w-5 h-5 text-cyan-300" />
                                        <span>React + TS</span>
                                    </div>
                                    {activeMode === 'react-ts' && <CheckIcon className="w-5 h-5 text-indigo-400" />}
                                </button>
                                <button onClick={() => handleModeChange('nextjs')} className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <NextjsIcon className="w-5 h-5 text-cyan-300" />
                                        <span>Next.js</span>
                                    </div>
                                    {activeMode === 'nextjs' && <CheckIcon className="w-5 h-5 text-indigo-400" />}
                                </button>
                                <button onClick={() => handleModeChange('angular')} className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <AngularIcon className="w-5 h-5 text-cyan-300" />
                                        <span>Angular</span>
                                    </div>
                                    {activeMode === 'angular' && <CheckIcon className="w-5 h-5 text-indigo-400" />}
                                </button>
                                <button onClick={() => handleModeChange('expo')} className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <ExpoIcon className="w-5 h-5 text-cyan-300" />
                                        <span>Expo</span>
                                    </div>
                                    {activeMode === 'expo' && <CheckIcon className="w-5 h-5 text-indigo-400" />}
                                </button>
                                <button onClick={() => handleModeChange('flutter')} className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FlutterIcon className="w-5 h-5 text-cyan-300" />
                                        <span>Flutter</span>
                                    </div>
                                    {activeMode === 'flutter' && <CheckIcon className="w-5 h-5 text-indigo-400" />}
                                </button>
                                <div className="!my-2 h-px bg-slate-700"></div>
                                <button onClick={() => { setIsRepoModalOpen(true); setIsModesMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors">
                                    <RocketIcon className="w-5 h-5 text-cyan-300" />
                                    <span>Code Pilot</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
              </div>
              <div className={`absolute flex items-center gap-2 ${inputStyle === 'dynamic' ? 'right-2 top-2' : 'right-4 bottom-4'}`}>
                <div className="relative">
                  <button
                    ref={suggestionsButtonRef}
                    type="button"
                    onClick={() => setIsSuggestionsOpen(prev => !prev)}
                    className="h-12 px-5 bg-slate-100 rounded-full text-sm text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-2"
                  >
                    <SparklesIcon className="w-5 h-5 text-slate-600" />
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
                  className="h-12 w-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed group"
                  disabled={!prompt.trim()}
                  aria-label="Generate app"
                >
                  <ArrowUpIcon className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
                </button>
              </div>
            </form>
          </main>

          <div className="w-full max-w-5xl mx-auto mt-24 md:mt-32">
              <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text mb-12">
                  Frequently Asked Questions
              </h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
                  {faqData.map((item, index) => (
                      <div key={index}>
                          <h3 className="text-lg font-semibold text-white mb-2">{item.q}</h3>
                          <p className="text-slate-400">{item.a}</p>
                      </div>
                  ))}
              </div>
          </div>

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

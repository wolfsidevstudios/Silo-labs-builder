import React, { useState, useEffect, useRef } from 'react';
import CursorIcon from './icons/CursorIcon';
import ClockIcon from './icons/ClockIcon';
import { generateImprovementPrompt } from '../services/geminiService';
import { AppMode } from '../types';

import { getApiKey as getGiphyApiKey } from '../services/giphyService';
import { getAccessKey as getUnsplashAccessKey } from '../services/unsplashService';
import { getApiKey as getOpenAiApiKey } from '../services/openaiService';
import { getApiKey as getPexelsApiKey } from '../services/pexelsService';
import { getApiKey as getFreeSoundApiKey } from '../services/freesoundService';
import { getClientCredentials as getSpotifyCredentials } from '../services/spotifyService';
import { getApiKey as getStabilityApiKey } from '../services/stabilityService';
import { getApiKey as getStreamlineApiKey } from '../services/streamlineService';
import { getApiKey as getWeatherApiKey } from '../services/weatherApiService';
import { getApiKey as getOpenWeatherMapApiKey } from '../services/openWeatherMapService';
import { getApiKey as getTmdbApiKey } from '../services/tmdbService';
import { getApiKey as getYouTubeApiKey } from '../services/youtubeService';
import { getApiKey as getMapboxApiKey } from '../services/mapboxService';
import { getApiKey as getExchangeRateApiKey } from '../services/exchangeRateApiService';
import { getApiKey as getFmpApiKey } from '../services/financialModelingPrepService';
import { getApiKey as getNewsApiKey } from '../services/newsApiService';
import { getApiKey as getRawgApiKey } from '../services/rawgService';
import { getApiKey as getWordsApiKey } from '../services/wordsApiService';


// Map API names (as they might appear in prompts) to their checker functions
const apiKeyCheckers: Record<string, () => any | null> = {
  'Giphy': getGiphyApiKey,
  'Unsplash': getUnsplashAccessKey,
  'OpenAI': getOpenAiApiKey,
  'DALL-E': getOpenAiApiKey,
  'Pexels': getPexelsApiKey,
  'FreeSound': getFreeSoundApiKey,
  'Spotify': getSpotifyCredentials,
  'Stability': getStabilityApiKey,
  'Streamline': getStreamlineApiKey,
  'WeatherAPI.com': getWeatherApiKey,
  'OpenWeatherMap': getOpenWeatherMapApiKey,
  'TMDB': getTmdbApiKey,
  'YouTube': getYouTubeApiKey,
  'Mapbox': getMapboxApiKey,
  'ExchangeRate-API': getExchangeRateApiKey,
  'Financial Modeling Prep': getFmpApiKey,
  'NewsAPI': getNewsApiKey,
  'RAWG': getRawgApiKey,
  'WordsAPI': getWordsApiKey,
};

const checkForApiKeyInPrompt = (prompt: string): string | null => {
    for (const key in apiKeyCheckers) {
        if (new RegExp(`\\b${key}\\b`, 'i').test(prompt)) {
            if (!apiKeyCheckers[key]()) {
                return key; // Return the name of the missing key's service
            }
        }
    }
    return null;
};


interface ElementRefs {
  promptInput: React.RefObject<HTMLElement>;
  submitButton: React.RefObject<HTMLElement>;
  viewSwitcherCode: React.RefObject<HTMLElement>;
  viewSwitcherPreview: React.RefObject<HTMLElement>;
  githubButton: React.RefObject<HTMLElement>;
  deployButton: React.RefObject<HTMLElement>;
  settingsButton: React.RefObject<HTMLElement>;
  terminalToggle: React.RefObject<HTMLElement>;
  terminalInput: React.RefObject<HTMLElement>;
}

interface AgentActions {
  setPrompt: (p: string) => void;
  submit: () => void;
  switchView: (view: 'code' | 'preview') => void;
  openGitHubModal: () => void;
  openDeployModal: () => void;
  openSettingsModal: () => void;
  runCommandInTerminal: (command: string) => Promise<void>;
  openTerminal: () => void;
}

interface MaxVibeAgentCursorProps {
  initialCode: string;
  promptHistory: string[];
  isGenerating: boolean;
  onStop: () => void;
  appMode: AppMode;
  actions: AgentActions;
  elementRefs: ElementRefs;
}

type AgentStatus = 'Thinking...' | 'Typing prompt...' | 'Submitting...' | 'Switching view...' | 'Waiting for user input...' | 'Deploying...' | string;

const MaxVibeAgentCursor: React.FC<MaxVibeAgentCursorProps> = ({ initialCode, promptHistory, isGenerating, onStop, appMode, actions, elementRefs }) => {
  const [position, setPosition] = useState({ top: window.innerHeight / 2, left: window.innerWidth / 2 });
  const [status, setStatus] = useState<AgentStatus>('Initializing MAX Vibe...');
  const [elapsedTime, setElapsedTime] = useState(0);
  const isActive = useRef(true);
  const appCodeRef = useRef(initialCode);
  const promptHistoryRef = useRef(promptHistory);
  const hasRunInitialCommand = useRef(false);
  
  useEffect(() => {
    appCodeRef.current = initialCode;
  }, [initialCode]);
  
  useEffect(() => {
    promptHistoryRef.current = promptHistory;
  }, [promptHistory]);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const moveToElement = async (ref: React.RefObject<HTMLElement>, duration = 1000) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({ top: rect.top + rect.height / 2, left: rect.left + rect.width / 2 });
      await wait(duration);
    }
  };

  const typeText = async (text: string) => {
    let currentText = '';
    for (const char of text) {
      if (!isActive.current) return;
      currentText += char;
      actions.setPrompt(currentText);
      await wait(50); // Typing speed
    }
  };

  useEffect(() => {
    const timerId = setInterval(() => {
        setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    isActive.current = true;

    const runInitialExpoCommand = async () => {
        setStatus('Starting Expo dev server...');
        await moveToElement(elementRefs.terminalToggle);
        actions.openTerminal();
        await wait(500);
        await moveToElement(elementRefs.terminalInput);
        await actions.runCommandInTerminal('npx expo start');
        setStatus('Expo server is running. Starting main loop...');
        await wait(2000);
        hasRunInitialCommand.current = true;
    };

    const improvementLoop = async () => {
      await wait(2000);
      
      while(isActive.current) {
        // Optional: Look at the code
        if (Math.random() > 0.5) {
            setStatus('Reviewing the code...');
            await moveToElement(elementRefs.viewSwitcherCode);
            actions.switchView('code');
            await wait(5000); // "Read" for 5s
            await moveToElement(elementRefs.viewSwitcherPreview);
            actions.switchView('preview');
            await wait(1000);
        }

        // 1. Generate new prompt
        setStatus('Analyzing app for improvements...');
        const newPrompt = await generateImprovementPrompt(appCodeRef.current, promptHistoryRef.current);
        
        // 1a. Check for required API keys
        const missingKey = checkForApiKeyInPrompt(newPrompt);
        if (missingKey) {
            setStatus(`I need the ${missingKey} API key. Please add it in Settings, and I'll continue.`);
            // Poll for the key
            while (isActive.current) {
                const isKeyAdded = !!apiKeyCheckers[missingKey]();
                if (isKeyAdded) {
                    setStatus(`${missingKey} key found! Resuming...`);
                    await wait(2000);
                    break; // Exit polling loop
                }
                await wait(5000); // Wait 5s before checking again
            }
            if(!isActive.current) return; // if stopped while waiting
        }

        // 2. Type the prompt
        setStatus(`Adding feature: "${newPrompt}"`);
        await moveToElement(elementRefs.promptInput);
        await typeText(newPrompt);
        await wait(1000);

        // 3. Submit
        setStatus('Submitting new prompt...');
        await moveToElement(elementRefs.submitButton);
        actions.submit();
        
        // The loop will now pause because `isGenerating` becomes true.
        // The useEffect dependency on `isGenerating` will handle restarting the loop.
        return; 
      }
    };
    
    // This effect runs the main loop. It waits for generation to finish.
    const startAgent = async () => {
        if (isGenerating) {
            setStatus('Building...');
            return;
        }

        if (appMode === 'expo' && !hasRunInitialCommand.current) {
            await runInitialExpoCommand();
        }

        // Don't start improvement loop for Expo until there's code
        if (appMode === 'expo' && !appCodeRef.current) {
            setStatus("Waiting for initial app generation...");
            return;
        }

        improvementLoop();
    };

    startAgent();

    return () => {
      isActive.current = false;
    };
  }, [isGenerating]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  return (
    <>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full font-semibold z-30 pointer-events-none flex items-center gap-4">
        <span>MAX Vibe: {status}</span>
        <span className="flex items-center gap-1.5 text-slate-400 text-sm font-mono">
            <ClockIcon className="w-4 h-4" />
            {formatTime(elapsedTime)}
        </span>
      </div>
      <div
        className="absolute w-8 h-8 pointer-events-none z-50"
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px`, 
          transform: 'translate(-4px, -2px)',
          transition: 'top 1s ease-in-out, left 1s ease-in-out'
        }}
      >
        <CursorIcon className="w-full h-full text-cyan-400" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}/>
      </div>
    </>
  );
};

export default MaxVibeAgentCursor;
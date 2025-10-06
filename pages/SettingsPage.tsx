import React, { useState, useEffect } from 'react';
import EyeIcon from '../components/icons/EyeIcon';
import EyeOffIcon from '../components/icons/EyeOffIcon';
import TrashIcon from '../components/icons/TrashIcon';
import KeyIcon from '../components/icons/KeyIcon';
import { THEMES } from '../data/themes';
import ThemeTemplateCard from '../components/ThemeTemplateCard';
import { Secret } from '../types';
import { getSecrets, addSecret, removeSecret, identifyTool, Tool } from '../services/secretsService';

interface SettingsPageProps {
  isPro: boolean;
  onUpgradeClick: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isPro, onUpgradeClick }) => {
  const [apiKey, setApiKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('none');
  
  // State for secrets
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [newSecretName, setNewSecretName] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  const [isSecretValueVisible, setIsSecretValueVisible] = useState(false);
  const [secretError, setSecretError] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
    const storedTheme = localStorage.getItem('ui_theme_template');
    if (storedTheme) {
      setSelectedTheme(storedTheme);
    } else {
      localStorage.setItem('ui_theme_template', 'none'); // Default to none
    }
    setSecrets(getSecrets());
  }, []);

  const handleSaveApiKey = () => {
    if (saveStatus !== 'idle') return;

    setSaveStatus('saving');
    localStorage.setItem('gemini_api_key', apiKey);
    
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 500);
  };
  
  const handleAddSecret = () => {
    setSecretError(null);
    if (!newSecretName.trim() || !newSecretValue.trim()) {
        setSecretError("Both name and value are required.");
        return;
    }
    if (!/^[A-Z_][A-Z0-9_]*$/.test(newSecretName)) {
        setSecretError("Name must be uppercase letters, numbers, and underscores, and cannot start with a number.");
        return;
    }
    
    try {
        addSecret({ name: newSecretName.trim(), value: newSecretValue.trim() });
        setSecrets(getSecrets());
        setNewSecretName('');
        setNewSecretValue('');
    } catch (error) {
        if (error instanceof Error) {
            setSecretError(error.message);
        }
    }
  };
  
  const handleRemoveSecret = (name: string) => {
      removeSecret(name);
      setSecrets(getSecrets());
  };

  const handleSelectTheme = (themeId: string) => {
    if (themeId === 'none') {
        setSelectedTheme('none');
        localStorage.setItem('ui_theme_template', 'none');
        return;
    }
    
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;

    if (theme.isPro && !isPro) {
      onUpgradeClick();
      return;
    }
    setSelectedTheme(theme.id);
    localStorage.setItem('ui_theme_template', theme.id);
  };

  const getButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved!';
      default:
        return 'Save Key';
    }
  };
  
  const standardThemes = THEMES.filter(t => !t.id.includes('holiday'));
  const holidayThemes = THEMES.filter(t => t.id.includes('holiday'));


  return (
    <div className="min-h-screen w-screen bg-black flex flex-col items-center p-4 pl-20 selection:bg-indigo-500 selection:text-white overflow-y-auto">
      <main className="w-full max-w-5xl px-4 py-12">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text mb-12 text-center animate-fade-in-down">
          Settings
        </h1>
        
        {/* API Key Section */}
        <div 
          className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-[0_0_120px_rgba(255,255,255,0.1)] animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <h2 className="text-2xl font-bold text-slate-100 mb-4">API Keys</h2>
          <div className="flex flex-col gap-2">
            <label htmlFor="api-key-input" className="font-semibold text-slate-300">
              Gemini API Key
            </label>
            <p className="text-sm text-slate-500 mb-4">
              Your key is stored securely in your browser's local storage and is never sent to our servers.
            </p>
            <div className="relative">
              <input
                id="api-key-input"
                type={isKeyVisible ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key here"
                className="w-full p-3 pr-12 bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-full shadow-inner shadow-black/20 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                onClick={() => setIsKeyVisible(!isKeyVisible)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label={isKeyVisible ? 'Hide API key' : 'Show API key'}
              >
                {isKeyVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="mt-6 text-right">
            <button
              onClick={handleSaveApiKey}
              disabled={saveStatus !== 'idle'}
              className={`px-5 py-2 font-semibold rounded-lg transition-all duration-200 ease-in-out ${
                saveStatus === 'saved'
                  ? 'bg-green-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 disabled:cursor-not-allowed text-white'
              }`}
            >
              {getButtonText()}
            </button>
          </div>
        </div>
        
        {/* Custom Secrets Section */}
        <div 
            className="mt-16 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-[0_0_120px_rgba(255,255,255,0.1)] animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
        >
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Custom Secrets</h2>
            <p className="text-sm text-slate-500 mb-6">
              Add secrets for your apps (e.g., third-party API keys). They will be available as environment variables in your app's preview.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="flex flex-col gap-2">
                    <label htmlFor="secret-name" className="font-semibold text-sm text-slate-400">Secret Name</label>
                    <input
                        id="secret-name"
                        type="text"
                        value={newSecretName}
                        onChange={(e) => setNewSecretName(e.target.value)}
                        placeholder="E.g., OPENAI_API_KEY"
                        className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner shadow-black/20 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="secret-value" className="font-semibold text-sm text-slate-400">Secret Value</label>
                    <div className="relative">
                        <input
                            id="secret-value"
                            type={isSecretValueVisible ? 'text' : 'password'}
                            value={newSecretValue}
                            onChange={(e) => setNewSecretValue(e.target.value)}
                            placeholder="Enter secret value"
                            className="w-full p-3 pr-12 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner shadow-black/20 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        <button
                            onClick={() => setIsSecretValueVisible(!isSecretValueVisible)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                            aria-label={isSecretValueVisible ? 'Hide secret' : 'Show secret'}
                        >
                            {isSecretValueVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
            {secretError && <p className="text-red-400 text-sm mt-3">{secretError}</p>}
            <div className="mt-6 text-right">
                <button
                  onClick={handleAddSecret}
                  className="px-5 py-2 font-semibold rounded-lg transition-all duration-200 ease-in-out bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 disabled:cursor-not-allowed text-white"
                >
                  Add Secret
                </button>
            </div>
            
            {secrets.length > 0 && (
                <div className="mt-8 border-t border-slate-700 pt-6">
                    <h3 className="font-semibold text-slate-300 mb-4">Saved Secrets</h3>
                    <div className="space-y-3">
                        {secrets.map(secret => {
                            const tool = identifyTool(secret);
                            const IconComponent = tool.icon;
                            return (
                                <div key={secret.name} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <IconComponent className="w-6 h-6 text-slate-400" />
                                        <div>
                                            <p className="font-mono text-sm text-slate-200">{secret.name}</p>
                                            <p className="text-xs text-slate-500">{tool.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveSecret(secret.name)}
                                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                        aria-label={`Remove ${secret.name}`}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
        
        {/* UI Theme Templates Section */}
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-100 mb-2">UI Theme Templates</h2>
            <p className="text-base text-slate-400 mb-8 max-w-2xl mx-auto">
              Choose a theme to guide the AI's design. The generated app will use these colors, fonts, and styles.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
                onClick={() => handleSelectTheme('none')}
                className={`relative bg-slate-800/50 border rounded-lg p-4 flex flex-col gap-4 transition-all duration-200 justify-center items-center text-center h-full min-h-[250px] ${
                selectedTheme === 'none' ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-700'
                } cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10`}
            >
                <h3 className="font-bold text-lg text-white">No Theme</h3>
                <p className="text-sm text-slate-400">Let the AI decide the design. Good for maximum creativity.</p>
            </div>
            {standardThemes.map(theme => (
              <ThemeTemplateCard
                key={theme.id}
                theme={theme}
                isSelected={selectedTheme === theme.id}
                onSelect={handleSelectTheme}
                isProUser={isPro}
              />
            ))}
          </div>
        </div>

         {/* Holiday Packs Section */}
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Holiday Packs</h2>
             <p className="text-base text-slate-400 mb-8 max-w-2xl mx-auto">
              Get in the spirit with seasonal themes for your apps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {holidayThemes.map(theme => (
              <ThemeTemplateCard
                key={theme.id}
                theme={theme}
                isSelected={selectedTheme === theme.id}
                onSelect={handleSelectTheme}
                isProUser={isPro}
              />
            ))}
          </div>
        </div>

      </main>
      
      <footer className="w-full text-center p-4 text-xs text-gray-600 mt-auto">
          API keys are required for app generation
      </footer>
       <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto+Mono:wght@400;700&family=Lora:wght@400;700&family=Playfair+Display:wght@700&family=Mountains+of+Christmas:wght@700&family=Great+Vibes&display=swap');
        
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

export default SettingsPage;

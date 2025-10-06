import React, { useState, useEffect } from 'react';
import { getApiKey as getGiphyKey } from '../services/giphyService';
import { getSecrets } from '../services/secretsService';
import { Secret } from '../types';
import TrashIcon from '../components/icons/TrashIcon';
import PlusIcon from '../components/icons/PlusIcon';
import RocketIcon from '../components/icons/RocketIcon';
// Fix: Import CheckIcon component.
import CheckIcon from '../components/icons/CheckIcon';

interface StudioPageProps {
  onGenerate: (prompt: string) => void;
}

const StudioPage: React.FC<StudioPageProps> = ({ onGenerate }) => {
  const [mainGoal, setMainGoal] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);
  const [styleNotes, setStyleNotes] = useState('');
  
  const [useGiphy, setUseGiphy] = useState(false);
  const [useGemini, setUseGemini] = useState(false);
  const [selectedSecrets, setSelectedSecrets] = useState<Set<string>>(new Set());

  const [isGiphyConnected, setIsGiphyConnected] = useState(false);
  const [isGeminiConnected, setIsGeminiConnected] = useState(false);
  const [availableSecrets, setAvailableSecrets] = useState<Secret[]>([]);

  useEffect(() => {
    setIsGiphyConnected(!!getGiphyKey());
    setIsGeminiConnected(!!localStorage.getItem('gemini_api_key'));
    setAvailableSecrets(getSecrets());
  }, []);
  
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => setFeatures([...features, '']);
  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };
  
  const handleSecretToggle = (secretName: string) => {
    const newSelection = new Set(selectedSecrets);
    if (newSelection.has(secretName)) {
        newSelection.delete(secretName);
    } else {
        newSelection.add(secretName);
    }
    setSelectedSecrets(newSelection);
  };

  const compilePrompt = (): string => {
    let prompt = `Create an application with the following goal: ${mainGoal.trim()}\n\n`;
    
    const validFeatures = features.map(f => f.trim()).filter(f => f);
    if (validFeatures.length > 0) {
      prompt += "It must include these features:\n";
      validFeatures.forEach(f => {
        prompt += `- ${f}\n`;
      });
      prompt += "\n";
    }

    if (styleNotes.trim()) {
      prompt += `The visual style should be: ${styleNotes.trim()}\n\n`;
    }

    const integrations = [];
    if (useGiphy) integrations.push("Use the Giphy API for any GIF-related functionality.");
    if (useGemini) integrations.push("Use the Gemini API for any AI-powered features (like chatbots, summarizers, etc.).");
    if (selectedSecrets.size > 0) {
        integrations.push(`Make use of the following custom secrets, available via process.env: ${Array.from(selectedSecrets).join(', ')}.`);
    }

    if (integrations.length > 0) {
        prompt += "Please integrate the following APIs and secrets:\n";
        integrations.forEach(i => {
            prompt += `- ${i}\n`;
        });
    }

    return prompt;
  };

  const handleGenerateClick = () => {
    if (!mainGoal.trim()) {
        alert("Please describe the main goal of your app.");
        return;
    }
    const fullPrompt = compilePrompt();
    onGenerate(fullPrompt);
  };

  return (
    <div className="min-h-screen w-screen bg-black flex flex-col items-center p-4 pl-20 selection:bg-indigo-500 selection:text-white overflow-y-auto">
      <main className="w-full max-w-5xl px-4 py-12">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text mb-4 text-center animate-fade-in-down">
          Creative Studio
        </h1>
        <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto text-center animate-fade-in-down" style={{animationDelay: '0.2s'}}>
            Use this guided builder to craft a detailed prompt for the AI.
        </p>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-[0_0_120px_rgba(255,255,255,0.1)] animate-fade-in-up space-y-8" style={{ animationDelay: '0.4s' }}>
            {/* Main Goal */}
            <div>
                <label htmlFor="main-goal" className="block text-xl font-bold text-slate-100 mb-3">1. Main Goal</label>
                <textarea
                    id="main-goal"
                    value={mainGoal}
                    onChange={(e) => setMainGoal(e.target.value)}
                    placeholder="e.g., A minimalist pomodoro timer to boost productivity."
                    className="w-full p-4 h-24 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            
            {/* Features */}
            <div>
                 <label className="block text-xl font-bold text-slate-100 mb-3">2. Key Features</label>
                 <div className="space-y-3">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                placeholder={`e.g., A customizable timer for work/break sessions`}
                                className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button onClick={() => removeFeature(index)} disabled={features.length <= 1} className="p-2 text-slate-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                 </div>
                 <button onClick={addFeature} className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10">
                    <PlusIcon className="w-4 h-4" />
                    Add Feature
                 </button>
            </div>
            
            {/* Styling */}
            <div>
                <label htmlFor="style-notes" className="block text-xl font-bold text-slate-100 mb-3">3. Styling Notes</label>
                <textarea
                    id="style-notes"
                    value={styleNotes}
                    onChange={(e) => setStyleNotes(e.target.value)}
                    placeholder="e.g., Use a dark theme with neon green accents. The font should be a retro pixel font."
                    className="w-full p-4 h-24 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            
            {/* Integrations */}
            <div>
                <label className="block text-xl font-bold text-slate-100 mb-4">4. Integrations & Secrets</label>
                <div className="space-y-4">
                    <IntegrationToggle
                        label="Enable Giphy API"
                        description="Allows the AI to build GIF search features."
                        isConnected={isGiphyConnected}
                        isEnabled={useGiphy}
                        onToggle={() => setUseGiphy(!useGiphy)}
                    />
                     <IntegrationToggle
                        label="Enable Gemini API"
                        description="Allows the AI to build chatbots, summarizers, etc."
                        isConnected={isGeminiConnected}
                        isEnabled={useGemini}
                        onToggle={() => setUseGemini(!useGemini)}
                    />
                    {availableSecrets.length > 0 && (
                        <div className="pt-4 border-t border-slate-800">
                             <h3 className="font-semibold text-slate-300 mb-3">Select Custom Secrets</h3>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {availableSecrets.map(secret => (
                                    <SecretCheckbox key={secret.name} name={secret.name} isSelected={selectedSecrets.has(secret.name)} onToggle={handleSecretToggle} />
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        <div className="mt-12 text-center">
            <button
                onClick={handleGenerateClick}
                className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full text-lg transition-all transform hover:scale-105"
            >
                <RocketIcon className="w-6 h-6" />
                Generate App
            </button>
        </div>
      </main>
      <style>{`.animate-fade-in-down { animation: fade-in-down 0.6s ease-out forwards; } .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; } @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};


const IntegrationToggle: React.FC<{label: string, description: string, isConnected: boolean, isEnabled: boolean, onToggle: () => void}> = ({ label, description, isConnected, isEnabled, onToggle }) => (
    <div
        onClick={isConnected ? onToggle : undefined}
        className={`flex items-center justify-between p-4 bg-slate-800/50 rounded-lg ${isConnected ? 'cursor-pointer hover:bg-slate-800' : 'opacity-50'}`}
      >
        <div>
          <h3 className={`font-semibold ${isConnected ? 'text-slate-200' : 'text-slate-500'}`}>{label} {!isConnected && <span className="text-xs text-slate-500">(Not Connected)</span>}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <div className={`relative w-12 h-6 rounded-full transition-colors ${isEnabled && isConnected ? 'bg-indigo-600' : 'bg-slate-700'}`}>
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isEnabled && isConnected ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
      </div>
);

const SecretCheckbox: React.FC<{name: string, isSelected: boolean, onToggle: (name: string) => void}> = ({ name, isSelected, onToggle }) => (
    <label className={`flex items-center gap-2 p-3 rounded-md transition-colors cursor-pointer ${isSelected ? 'bg-indigo-600/20 text-indigo-300' : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300'}`}>
        <input type="checkbox" checked={isSelected} onChange={() => onToggle(name)} className="hidden" />
        <div className={`w-5 h-5 border-2 rounded flex-shrink-0 flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600'}`}>
            {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
        </div>
        <span className="font-mono text-sm truncate">{name}</span>
    </label>
);

export default StudioPage;
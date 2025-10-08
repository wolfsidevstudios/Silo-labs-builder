import React, { useState, useEffect } from 'react';
import XIcon from './icons/XIcon';
import PaintBrushIcon from './icons/PaintBrushIcon';
import SparklesIcon from './icons/SparklesIcon';
import KeyIcon from './icons/KeyIcon';
import ZapIcon from './icons/ZapIcon';
import TrashIcon from './icons/TrashIcon';
import EyeIcon from './icons/EyeIcon';
import EyeOffIcon from './icons/EyeOffIcon';
import { Secret } from '../types';

type ProjectSettings = {
  name: string;
  description?: string;
  iconUrl?: string;
  thumbnailUrl?: string;
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  secrets: Secret[];
}

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ProjectSettings) => void;
  project: ProjectSettings;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ isOpen, onClose, onSave, project }) => {
  const [activeSection, setActiveSection] = useState('customization');
  const [settings, setSettings] = useState<ProjectSettings>(project);

  // Secret form state
  const [newSecretName, setNewSecretName] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  const [isSecretValueVisible, setIsSecretValueVisible] = useState(false);
  const [secretError, setSecretError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(project);
      setActiveSection('customization');
    }
  }, [project, isOpen]);
  
  if (!isOpen) return null;

  const handleSave = () => { onSave(settings); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'iconUrl' | 'thumbnailUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSecret = () => {
    setSecretError(null);
    if (!newSecretName.trim() || !newSecretValue.trim()) { setSecretError("Both name and value are required."); return; }
    if (!/^[A-Z_][A-Z0-9_]*$/.test(newSecretName)) { setSecretError("Name must be uppercase letters, numbers, and underscores, and cannot start with a number."); return; }
    if (settings.secrets.some(s => s.name === newSecretName.trim())) { setSecretError("A secret with this name already exists for this project."); return; }
    
    setSettings(prev => ({ ...prev, secrets: [...prev.secrets, { name: newSecretName.trim(), value: newSecretValue.trim() }] }));
    setNewSecretName('');
    setNewSecretValue('');
  };

  const handleRemoveSecret = (name: string) => {
    setSettings(prev => ({ ...prev, secrets: prev.secrets.filter(s => s.name !== name) }));
  };

  const sections = [
    { id: 'customization', label: 'Customization', icon: PaintBrushIcon },
    { id: 'ai-settings', label: 'AI Settings', icon: SparklesIcon },
    { id: 'secrets', label: 'API Secrets', icon: KeyIcon },
    { id: 'integrations', label: 'Integrations', icon: ZapIcon },
  ];

  const renderSection = () => {
    switch(activeSection) {
      case 'customization':
        return (
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Project Customization</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                <input type="text" value={settings.name} onChange={e => setSettings(p => ({...p, name: e.target.value}))} className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea value={settings.description} onChange={e => setSettings(p => ({...p, description: e.target.value}))} rows={3} className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg resize-none"/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">App Icon</label>
                  <div className="flex items-center gap-4">
                    <img src={settings.iconUrl || 'https://via.placeholder.com/128/1F2937/FFFFFF?text=Icon'} alt="Icon preview" className="w-20 h-20 rounded-xl object-cover bg-slate-800"/>
                    <input type="file" id="icon-upload" onChange={e => handleImageUpload(e, 'iconUrl')} accept="image/*" className="hidden"/>
                    <label htmlFor="icon-upload" className="cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg">Upload</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Thumbnail</label>
                  <div className="flex items-center gap-4">
                    <img src={settings.thumbnailUrl || 'https://via.placeholder.com/240x150/1F2937/FFFFFF?text=Thumbnail'} alt="Thumbnail preview" className="w-40 h-24 rounded-xl object-cover bg-slate-800"/>
                    <input type="file" id="thumb-upload" onChange={e => handleImageUpload(e, 'thumbnailUrl')} accept="image/*" className="hidden"/>
                    <label htmlFor="thumb-upload" className="cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg">Upload</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'ai-settings':
        return (
            <div>
                <h3 className="text-xl font-bold text-white mb-6">AI Settings</h3>
                <label className="block text-sm font-medium text-slate-300 mb-2">Generation Model</label>
                <div className="relative bg-slate-900/50 p-1 rounded-full flex items-center border border-slate-700/50 max-w-xs text-center">
                    <div className="absolute top-1 left-1 h-8 w-[calc(50%-4px)] bg-indigo-600 rounded-full transition-transform duration-300 ease-in-out shadow-lg" style={{ transform: `translateX(${settings.model === 'gemini-2.5-flash' ? '0' : 'calc(100% + 4px)'})` }} />
                    <button onClick={() => setSettings(p => ({...p, model: 'gemini-2.5-flash'}))} className="relative z-10 w-1/2 py-1.5 text-sm font-semibold rounded-full text-white">2.5 Flash</button>
                    <button onClick={() => setSettings(p => ({...p, model: 'gemini-2.5-pro'}))} className="relative z-10 w-1/2 py-1.5 text-sm font-semibold rounded-full text-white">2.5 Pro</button>
                </div>
            </div>
        );
      case 'secrets':
         return (
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Project API Secrets</h3>
              <p className="text-sm text-slate-500 mb-6">These secrets are specific to this project and will override global secrets with the same name.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-4">
                <input value={newSecretName} onChange={(e) => setNewSecretName(e.target.value)} placeholder="Secret Name (e.g., OPENAI_API_KEY)" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg"/>
                <div className="relative">
                  <input type={isSecretValueVisible ? 'text' : 'password'} value={newSecretValue} onChange={(e) => setNewSecretValue(e.target.value)} placeholder="Secret Value" className="w-full p-3 pr-12 bg-white/[0.05] border border-white/10 rounded-lg"/>
                  <button onClick={() => setIsSecretValueVisible(!isSecretValueVisible)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-slate-400 hover:text-white">{isSecretValueVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}</button>
                </div>
              </div>
              {secretError && <p className="text-red-400 text-sm mt-3">{secretError}</p>}
              <div className="text-right"><button onClick={handleAddSecret} className="px-5 py-2 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white">Add Secret</button></div>
              {settings.secrets.length > 0 && (
                <div className="mt-8 border-t border-slate-700 pt-6 space-y-3">
                  {settings.secrets.map(secret => (<div key={secret.name} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg"><p className="font-mono text-sm text-slate-200">{secret.name}</p><button onClick={() => handleRemoveSecret(secret.name)} className="p-2 text-slate-500 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button></div>))}
                </div>
              )}
            </div>
        );
      case 'integrations':
        return (
            <div>
                <h3 className="text-xl font-bold text-white mb-2">Integrations</h3>
                <p className="text-sm text-slate-500 mb-6">Integrations are managed globally for your account. You can connect services like GitHub, Netlify, Giphy, and more in the main application settings.</p>
                <a href="/?page=settings" onClick={(e) => { e.preventDefault(); onClose(); window.history.pushState(null, '', '/'); window.location.reload(); /* Simplistic nav for demo */ }} className="inline-block px-5 py-2 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white">Go to Global Settings</a>
            </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="relative overflow-hidden bg-black/50 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl m-4 w-full h-full max-w-7xl max-h-[90vh] flex flex-row-reverse transform transition-transform duration-300 scale-95 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 -z-10 swirl-background opacity-50"></div>
        <button onClick={onClose} className="absolute top-6 right-6 z-20 p-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-full"><XIcon className="w-5 h-5" /></button>
        
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 p-6 border-l border-white/10">
            <h2 className="text-2xl font-bold text-white mb-8">Project Settings</h2>
            <nav className="space-y-2">
                {sections.map(section => (
                    <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeSection === section.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}>
                        <section.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-semibold">{section.label}</span>
                    </button>
                ))}
            </nav>
            <div className="mt-auto pt-6">
                <button onClick={handleSave} className="w-full px-5 py-3 font-semibold rounded-lg bg-white hover:bg-gray-200 text-black transition-colors">Save & Close</button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-8 overflow-y-auto">
          {renderSection()}
        </main>
      </div>
       <style>{`
        .swirl-background { background-image: radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.1) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.1) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(355, 98%, 76%, 0.1) 0px, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 68%, 0.1) 0px, transparent 50%), radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 0.1) 0px, transparent 50%), radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 0.1) 0px, transparent 50%), radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 0.1) 0px, transparent 50%); }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ProjectSettingsModal;

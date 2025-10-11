import React from 'react';
import EyeIcon from './icons/EyeIcon';
import CodeIcon from './icons/CodeIcon';
import GitHubIcon from './icons/GitHubIcon';
import DownloadIcon from './icons/DownloadIcon';
import LockIcon from './icons/LockIcon';
import RocketIcon from './icons/RocketIcon';
import SettingsIcon from './icons/SettingsIcon';
import HistoryIcon from './icons/HistoryIcon';
import XIcon from './icons/XIcon';
import TerminalIcon from './icons/TerminalIcon';

type View = 'preview' | 'code';

interface ViewSwitcherProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isGitHubConnected: boolean;
  onGitHubClick: () => void;
  isNetlifyConnected: boolean;
  onDeployClick: () => void;
  isDeployed: boolean;
  hasFiles: boolean;
  isPro: boolean;
  onDownloadClick: () => void;
  onSettingsClick: () => void;
  onHistoryClick: () => void;
  codeButtonRef: React.RefObject<HTMLButtonElement>;
  previewButtonRef: React.RefObject<HTMLButtonElement>;
  githubButtonRef: React.RefObject<HTMLButtonElement>;
  deployButtonRef: React.RefObject<HTMLButtonElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  historyButtonRef: React.RefObject<HTMLButtonElement>;
  isMaxVibeRunning: boolean;
  onStopMaxVibe: () => void;
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
  terminalButtonRef: React.RefObject<HTMLButtonElement>;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ 
    activeView, setActiveView, 
    isGitHubConnected, onGitHubClick, 
    isNetlifyConnected, onDeployClick, isDeployed,
    hasFiles, isPro, onDownloadClick,
    onSettingsClick, onHistoryClick,
    codeButtonRef, previewButtonRef, githubButtonRef, deployButtonRef, settingsButtonRef, historyButtonRef,
    isMaxVibeRunning, onStopMaxVibe,
    isTerminalOpen, onToggleTerminal, terminalButtonRef,
}) => {
  const buttonSize = 36; // Corresponds to h-9/w-9 in Tailwind (2.25rem)

  const getDeployTitle = () => {
    if (isMaxVibeRunning) return "Agent is running";
    if (!isNetlifyConnected) return "Connect to Netlify in Settings";
    if (!hasFiles) return "Generate an app first";
    return isDeployed ? "Redeploy to Netlify" : "Deploy to Netlify";
  };
  
  const getDownloadTitle = () => {
    if (isMaxVibeRunning) return "Agent is running";
    if (!isPro) return "Upgrade to Pro to download code";
    if (!hasFiles) return "Generate an app first";
    return "Download code (.html)";
  };

  return (
    <div className="relative z-30 flex-shrink-0 flex items-center justify-between px-4 py-2 flex-wrap gap-y-2">
      <div className="relative bg-slate-900/50 backdrop-blur-sm p-1 rounded-full flex items-center border border-slate-700/50">
        {/* Glossy sliding indicator */}
        <div
          className="absolute top-1 left-1 h-9 w-9 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-lg"
          style={{ transform: `translateX(${activeView === 'preview' ? 0 : buttonSize}px)` }}
        />
        
        {/* Buttons */}
        <button
          ref={previewButtonRef}
          onClick={() => setActiveView('preview')}
          className="relative z-10 flex items-center justify-center h-9 w-9 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-pressed={activeView === 'preview'}
          title="Switch to Preview"
          disabled={isMaxVibeRunning}
        >
          <EyeIcon className={`w-5 h-5 transition-colors ${activeView === 'preview' ? 'text-slate-900' : 'text-slate-400 hover:text-white'}`} />
        </button>
        <button
          ref={codeButtonRef}
          onClick={() => setActiveView('code')}
          className="relative z-10 flex items-center justify-center h-9 w-9 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-pressed={activeView === 'code'}
          title="Switch to Code"
          disabled={isMaxVibeRunning}
        >
          <CodeIcon className={`w-5 h-5 transition-colors ${activeView === 'code' ? 'text-slate-900' : 'text-slate-400 hover:text-white'}`} />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        <button
            ref={terminalButtonRef}
            onClick={onToggleTerminal}
            disabled={isMaxVibeRunning}
            className={`flex items-center justify-center h-9 w-9 border rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isTerminalOpen 
                ? 'bg-slate-600 border-slate-500 text-white' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={isMaxVibeRunning ? "Agent is running" : "Toggle Terminal"}
        >
            <TerminalIcon className="w-5 h-5" />
        </button>
        <button
            ref={historyButtonRef}
            onClick={onHistoryClick}
            disabled={!hasFiles || isMaxVibeRunning}
            className="flex items-center justify-center h-9 w-9 bg-slate-800 border border-slate-700 rounded-full text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={!hasFiles ? "Generate an app first" : isMaxVibeRunning ? "Agent is running" : "Project History"}
        >
            <HistoryIcon className="w-5 h-5" />
        </button>
        <button
            ref={settingsButtonRef}
            onClick={onSettingsClick}
            disabled={!hasFiles || isMaxVibeRunning}
            className="flex items-center justify-center h-9 w-9 bg-slate-800 border border-slate-700 rounded-full text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={!hasFiles ? "Generate an app first" : isMaxVibeRunning ? "Agent is running" : "Project Settings"}
        >
            <SettingsIcon className="w-5 h-5" />
        </button>
         <button
            onClick={onDownloadClick}
            disabled={!hasFiles || !isPro || isMaxVibeRunning}
            className="relative flex items-center justify-center h-9 w-9 bg-slate-800 border border-slate-700 rounded-full text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={getDownloadTitle()}
        >
            <DownloadIcon className="w-5 h-5" />
            {!isPro && (
                <div className="absolute bottom-0 right-0 p-0.5 bg-slate-800 rounded-full">
                    <LockIcon className="w-2.5 h-2.5 text-yellow-400" />
                </div>
            )}
        </button>
        <button
            ref={githubButtonRef}
            onClick={onGitHubClick}
            disabled={!isGitHubConnected || !hasFiles || isMaxVibeRunning}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={!isGitHubConnected ? "Connect to GitHub in Settings" : !hasFiles ? "Generate an app first" : isMaxVibeRunning ? "Agent is running" : "Save to GitHub"}
        >
            <GitHubIcon className="w-5 h-5" />
        </button>
        <button
            ref={deployButtonRef}
            onClick={onDeployClick}
            disabled={!isNetlifyConnected || !hasFiles || isMaxVibeRunning}
            className="px-5 py-2 bg-white text-black font-semibold rounded-full text-sm hover:bg-gray-200 transition-colors disabled:bg-gray-500 disabled:text-gray-800 disabled:cursor-not-allowed"
            title={getDeployTitle()}
        >
          {isDeployed ? "Redeploy" : "Deploy"}
        </button>
        {isMaxVibeRunning && (
          <button
            onClick={onStopMaxVibe}
            className="px-5 py-2 bg-red-600 text-white font-semibold rounded-full text-sm hover:bg-red-500 transition-colors flex items-center gap-2"
            title="Stop MAX Vibe Agent"
          >
            <XIcon className="w-4 h-4" />
            Stop
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewSwitcher;

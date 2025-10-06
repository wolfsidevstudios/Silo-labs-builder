import React from 'react';
import EyeIcon from './icons/EyeIcon';
import CodeIcon from './icons/CodeIcon';
import GitHubIcon from './icons/GitHubIcon';

type View = 'preview' | 'code';

interface ViewSwitcherProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isGitHubConnected: boolean;
  onGitHubClick: () => void;
  hasFiles: boolean;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeView, setActiveView, isGitHubConnected, onGitHubClick, hasFiles }) => {
  const buttonSize = 36; // Corresponds to h-9/w-9 in Tailwind (2.25rem)

  return (
    <div className="flex-shrink-0 flex items-center justify-between px-4 py-2">
      <div className="relative bg-slate-900/50 backdrop-blur-sm p-1 rounded-full flex items-center border border-slate-700/50">
        {/* Glossy sliding indicator */}
        <div
          className="absolute top-1 left-1 h-9 w-9 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-lg"
          style={{ transform: `translateX(${activeView === 'preview' ? 0 : buttonSize}px)` }}
        />
        
        {/* Buttons */}
        <button
          onClick={() => setActiveView('preview')}
          className="relative z-10 flex items-center justify-center h-9 w-9 rounded-full transition-colors"
          aria-pressed={activeView === 'preview'}
          title="Switch to Preview"
        >
          <EyeIcon className={`w-5 h-5 transition-colors ${activeView === 'preview' ? 'text-slate-900' : 'text-slate-400 hover:text-white'}`} />
        </button>
        <button
          onClick={() => setActiveView('code')}
          className="relative z-10 flex items-center justify-center h-9 w-9 rounded-full transition-colors"
          aria-pressed={activeView === 'code'}
          title="Switch to Code"
        >
          <CodeIcon className={`w-5 h-5 transition-colors ${activeView === 'code' ? 'text-slate-900' : 'text-slate-400 hover:text-white'}`} />
        </button>
      </div>

      <button
        onClick={onGitHubClick}
        disabled={!isGitHubConnected || !hasFiles}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300 hover:bg-slate-700 hover:border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800"
        title={!isGitHubConnected ? "Connect to GitHub in Settings" : !hasFiles ? "Generate an app first" : "Save to GitHub"}
      >
        <GitHubIcon className="w-4 h-4" />
        <span>Save to GitHub</span>
      </button>
    </div>
  );
};

export default ViewSwitcher;

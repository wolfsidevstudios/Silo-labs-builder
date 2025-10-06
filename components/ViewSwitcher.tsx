import React from 'react';
import EyeIcon from './icons/EyeIcon';
import CodeIcon from './icons/CodeIcon';

type View = 'preview' | 'code';

interface ViewSwitcherProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeView, setActiveView }) => {
  const buttonSize = 36; // Corresponds to h-9/w-9 in Tailwind (2.25rem)

  return (
    <div className="flex-shrink-0 flex items-center justify-start px-4 py-2">
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
          aria-label="Switch to preview view"
        >
          <EyeIcon className={`w-5 h-5 transition-colors ${activeView === 'preview' ? 'text-slate-900' : 'text-slate-400 hover:text-white'}`} />
        </button>
        <button
          onClick={() => setActiveView('code')}
          className="relative z-10 flex items-center justify-center h-9 w-9 rounded-full transition-colors"
          aria-pressed={activeView === 'code'}
          title="Switch to Code"
          aria-label="Switch to code view"
        >
          <CodeIcon className={`w-5 h-5 transition-colors ${activeView === 'code' ? 'text-slate-900' : 'text-slate-400 hover:text-white'}`} />
        </button>
      </div>
    </div>
  );
};

export default ViewSwitcher;
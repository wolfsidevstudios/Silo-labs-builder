import React from 'react';
import EyeIcon from './icons/EyeIcon';
import CodeIcon from './icons/CodeIcon';

type View = 'preview' | 'code';

interface ViewSwitcherProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeView, setActiveView }) => {
  return (
    <div className="flex-shrink-0 flex items-center justify-center p-2">
      <div className="bg-slate-800 p-1 rounded-lg flex gap-1">
        <button
          onClick={() => setActiveView('preview')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
            activeView === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'
          }`}
        >
          <EyeIcon className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={() => setActiveView('code')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
            activeView === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'
          }`}
        >
          <CodeIcon className="w-4 h-4" />
          Code
        </button>
      </div>
    </div>
  );
};

export default ViewSwitcher;

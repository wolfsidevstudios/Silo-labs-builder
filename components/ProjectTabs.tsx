import React from 'react';
import PlusIcon from './icons/PlusIcon';
import XIcon from './icons/XIcon';

interface ProjectTab {
  id: string;
  name: string;
}

interface ProjectTabsProps {
  tabs: ProjectTab[];
  activeTabId: string | null;
  onSelectTab: (tabId: string) => void;
  onAddTab: () => void;
  onCloseTab: (tabId: string) => void;
}

const ProjectTabs: React.FC<ProjectTabsProps> = ({ tabs, activeTabId, onSelectTab, onAddTab, onCloseTab }) => {
  return (
    <div className="flex items-center p-2 bg-black">
      <nav className="flex-grow flex items-center gap-2 overflow-x-auto" aria-label="Tabs">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`relative group flex items-center gap-2 py-1.5 px-4 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out flex-shrink-0 ${
              activeTabId === tab.id
                ? 'bg-white/10 backdrop-blur-sm border border-white/15 shadow-md text-white'
                : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="truncate max-w-xs">{tab.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className="p-1 rounded-full text-slate-500 hover:bg-white/10 hover:text-white transition-colors opacity-50 group-hover:opacity-100"
              aria-label={`Close tab ${tab.name}`}
            >
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </nav>
      <div className="flex-shrink-0 p-2">
        <button
          onClick={onAddTab}
          className="h-8 w-8 flex items-center justify-center bg-white/5 text-slate-400 rounded-full hover:bg-white/10 hover:text-white transition-colors"
          aria-label="New project tab"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      <style>{`
        nav::-webkit-scrollbar {
          height: 4px;
        }
        nav::-webkit-scrollbar-track {
          background: transparent;
        }
        nav::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default ProjectTabs;

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
    <div className="flex items-center border-b border-slate-800 pl-4 bg-slate-900">
      <nav className="flex-grow flex items-center -mb-px" aria-label="Tabs">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`relative group flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-medium cursor-pointer transition-colors ${
              activeTabId === tab.id
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            <span className="truncate max-w-xs">{tab.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className="p-1 rounded-full text-slate-500 hover:bg-slate-700 hover:text-white transition-colors opacity-50 group-hover:opacity-100"
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
          className="h-8 w-8 flex items-center justify-center bg-slate-800/50 text-slate-400 rounded-full hover:bg-slate-700 hover:text-white transition-colors"
          aria-label="New project tab"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProjectTabs;

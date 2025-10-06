import React from 'react';
import HomeIcon from './icons/HomeIcon';
import ProjectsIcon from './icons/ProjectsIcon';
import SettingsIcon from './icons/SettingsIcon';
import DiamondIcon from './icons/DiamondIcon';

export type SidebarPage = 'home' | 'projects' | 'settings';

interface SidebarProps {
  activePage: SidebarPage | null;
  onNavigate: (page: SidebarPage) => void;
  onUpgradeClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onUpgradeClick }) => {
  const navItems = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'projects', icon: ProjectsIcon, label: 'Projects' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2">
      <nav className="flex flex-col items-center gap-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as SidebarPage)}
            aria-label={item.label}
            title={item.label}
            className={`p-3 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 ${
              activePage === item.id
                ? 'bg-white text-black shadow-lg'
                : 'text-white hover:bg-white/20'
            }`}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </nav>

      <div className="my-2 w-8 border-t border-white/20"></div>

       <button
            onClick={onUpgradeClick}
            aria-label="Upgrade to Pro"
            title="Upgrade to Pro"
            className="p-3 rounded-full text-white hover:bg-indigo-500/50 transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
        >
            <DiamondIcon className="w-6 h-6" />
        </button>
    </div>
  );
};

export default Sidebar;

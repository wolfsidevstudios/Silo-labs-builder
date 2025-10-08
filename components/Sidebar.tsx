import React from 'react';
import HomeIcon from './icons/HomeIcon';
import ProjectsIcon from './icons/ProjectsIcon';
import SettingsIcon from './icons/SettingsIcon';
import ZapIcon from './icons/ZapIcon';
import BellIcon from './icons/BellIcon';

export type SidebarPage = 'home' | 'projects' | 'settings' | 'plans' | 'news';

interface SidebarProps {
  activePage: SidebarPage | null;
  onNavigate: (page: SidebarPage) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const navItems = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'projects', icon: ProjectsIcon, label: 'Projects' },
    { id: 'news', icon: BellIcon, label: 'News' },
    { id: 'plans', icon: ZapIcon, label: 'Plans' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id as SidebarPage)}
          aria-label={item.label}
          title={item.label}
          className={`p-3 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 ${
            activePage === item.id
              ? 'bg-white text-black shadow-lg'
              : 'text-white bg-slate-900/50 backdrop-blur-md border border-slate-700/50 hover:bg-white/20'
          }`}
        >
          <item.icon className="w-6 h-6" />
        </button>
      ))}
    </div>
  );
};

export default Sidebar;

import React from 'react';
import { Theme } from '../types';

interface ThemeTemplateCardProps {
  theme: Theme;
  isSelected: boolean;
  onSelect: (themeId: string) => void;
}

const ThemeTemplateCard: React.FC<ThemeTemplateCardProps> = ({ theme, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(theme.id)}
      className={`bg-slate-800/50 border rounded-lg p-4 flex flex-col gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 ${
        isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-700'
      }`}
    >
      <h3 className="font-bold text-lg text-white">{theme.name}</h3>

      {/* Font & Colors */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-300" style={{ fontFamily: theme.fontFamily }}>
          Aa - {theme.fontFamily.split(',')[0].replace(/'/g, '')}
        </p>
        <div className="flex items-center gap-1.5">
          {Object.entries(theme.colors).map(([name, color]) => (
            <div
              key={name}
              title={name}
              style={{ backgroundColor: color }}
              className="w-5 h-5 rounded-full border border-slate-500/50"
            />
          ))}
        </div>
      </div>
      
      {/* Visual Previews */}
      <div 
        className="mt-2 p-4 rounded-md flex flex-col items-center justify-center gap-4 aspect-video"
        style={{ backgroundColor: theme.colors.background }}
      >
        {/* Navbar Preview */}
        <div 
            className="w-full flex items-center justify-center rounded-md text-xs shadow-md"
            style={theme.navbar.style}
        >
          <span style={theme.navbar.textStyle}>Navigation</span>
        </div>
        
        {/* Button Preview */}
        <button
            className="text-xs transition-transform duration-200 ease-in-out group-hover:scale-105"
            style={theme.button.style}
        >
          Button
        </button>
      </div>
    </div>
  );
};

export default ThemeTemplateCard;

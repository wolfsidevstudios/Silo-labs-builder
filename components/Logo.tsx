import React from 'react';
import SiloLogoIcon from './icons/SiloLogoIcon';

interface LogoProps {
  type: 'full' | 'icon';
}

const Logo: React.FC<LogoProps> = ({ type }) => {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <SiloLogoIcon className="w-8 h-8 text-white" />
      {type === 'full' && (
        <h1 className="text-xl font-bold text-white tracking-wider">Silo Build</h1>
      )}
    </div>
  );
};

export default Logo;

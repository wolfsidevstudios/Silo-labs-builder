import React from 'react';

interface LogoProps {
  type: 'full' | 'icon';
}

const Logo: React.FC<LogoProps> = ({ type }) => {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <img src="https://i.ibb.co/DgYbPJ9z/IMG-3953.png" alt="Silo Build Logo" className="w-9 h-9 rounded-full" />
      {type === 'full' && (
        <h1 className="text-3xl font-bold text-white tracking-wider">Silo Build</h1>
      )}
    </div>
  );
};

export default Logo;

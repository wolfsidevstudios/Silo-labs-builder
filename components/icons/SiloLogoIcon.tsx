import React from 'react';

const SiloLogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="12" fill="black"/>
    <path d="M12 2C6.477 2 2 6.477 2 12h10V2z" fill="white"/>
    <path d="M12 22c5.523 0 10-4.477 10-10H12v10z" fill="white"/>
  </svg>
);

export default SiloLogoIcon;

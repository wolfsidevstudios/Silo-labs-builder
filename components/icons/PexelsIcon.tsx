import React from 'react';

const PexelsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M5.5 4h13v16h-13zM0 4h3v16H0z" />
  </svg>
);

export default PexelsIcon;

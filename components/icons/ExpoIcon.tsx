import React from 'react';

const ExpoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.5 8.5v4M12.5 16.5v-1" />
    <path d="M17 12h-1" />
    <path d="M12 2a10 10 0 1 0 10 10" />
    <path d="M8 12h1" />
  </svg>
);

export default ExpoIcon;

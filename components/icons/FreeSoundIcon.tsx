import React from 'react';

const FreeSoundIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 10v4" />
    <path d="M7 8v8" />
    <path d="M11 6v12" />
    <path d="M15 8v8" />
    <path d="M19 10v4" />
  </svg>
);

export default FreeSoundIcon;

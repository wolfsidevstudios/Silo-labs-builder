import React from 'react';

const RawgIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M6 12h12M12 6v12" />
    <path d="M4 16c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h1" />
    <path d="M20 8c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2h-1" />
    <path d="M12 18a2 2 0 100-4 2 2 0 000 4z" />
    <path d="M12 10a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

export default RawgIcon;
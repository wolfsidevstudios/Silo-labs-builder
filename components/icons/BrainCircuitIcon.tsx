import React from 'react';

const BrainCircuitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 2a10 10 0 0 0-3.38.64 1 1 0 0 0-.62 1.63 8 8 0 0 1-2.22 5.03 8 8 0 0 1-5.03 2.22 1 1 0 0 0-1.63.62A10 10 0 0 0 12 22a10 10 0 0 0 3.38-.64 1 1 0 0 0 .62-1.63 8 8 0 0 1 2.22-5.03 8 8 0 0 1 5.03-2.22 1 1 0 0 0 1.63-.62A10 10 0 0 0 12 2Z" />
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path d="M12 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    <path d="M12 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" />
    <path d="M12 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" />
  </svg>
);

export default BrainCircuitIcon;
import React from 'react';

const MousePointerClickIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M9 9l5 12 1.8-5.2L21 14l-3.6-3.6Z" />
    <path d="M14.5 14.5 9 9" />
    <path d="m7 2-3.1 3.1c-1.2 1.2-1.2 3.1 0 4.2l1.4 1.4" />
    <path d="M12.6 7.5 10 5" />
  </svg>
);

export default MousePointerClickIcon;
import React from 'react';

const AutoFixIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 3c-1.5 0-2.8.5-4 1.3L3.5 6.8a.5.5 0 0 0 0 .7l4.5 4.5" />
    <path d="M12 21c1.5 0 2.8-.5 4-1.3l4.5-2.5a.5.5 0 0 0 0-.7l-4.5-4.5" />
    <path d="M21 12c0-1.5-.5-2.8-1.3-4l-2.5-4.5a.5.5 0 0 0-.7 0L12 8" />
    <path d="M3 12c0 1.5.5 2.8 1.3 4l2.5 4.5a.5.5 0 0 0 .7 0L12 16" />
    <path d="M12 8v8" />
  </svg>
);

export default AutoFixIcon;
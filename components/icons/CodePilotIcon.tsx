import React from 'react';

const CodePilotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M15 18H9" />
    <path d="M19.33 13.67 18 12l1.33-1.67" />
    <path d="M4.67 13.67 6 12 4.67 10.33" />
    <path d="M12 2 8 6v4c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V6l-4-4Z" />
    <path d="M12 12v10" />
  </svg>
);

export default CodePilotIcon;

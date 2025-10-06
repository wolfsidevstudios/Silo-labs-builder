import React from 'react';

const PartyPopperIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M5.8 11.3 2 22l10.7-3.8" />
    <path d="M13.4 10.6 22 2l-3.8 10.7" />
    <path d="m9.2 14.8 5.6-5.6" />
    <path d="M12.5 5.5 11 4" />
    <path d="m5.5 12.5-1.5 1.5" />
    <path d="M20 12.5 18.5 11" />
    <path d="m12.5 20-1.5-1.5" />
  </svg>
);

export default PartyPopperIcon;

import React from 'react';

const AccessibilityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <circle cx="12" cy="4" r="2" />
    <path d="M12 18h.01" />
    <path d="M15 22v-4h-3v4" />
    <path d="M12 14v4" />
    <path d="M9 22v-4h3v4" />
    <path d="M9 14a5 5 0 1 0 6 0" />
    <path d="M12 6v8" />
  </svg>
);

export default AccessibilityIcon;

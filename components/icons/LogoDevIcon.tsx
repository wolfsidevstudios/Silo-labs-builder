
import React from 'react';

const LogoDevIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M7 15V9h4" />
    <path d="M17 15v-2.4a3.2 3.2 0 0 0-3.2-3.2H11" />
  </svg>
);

export default LogoDevIcon;

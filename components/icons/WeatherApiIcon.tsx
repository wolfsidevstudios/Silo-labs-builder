import React from 'react';

const WeatherApiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 2v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="M20 12h2" />
    <path d="m19.07 4.93-1.41 1.41" />
    <path d="M12 20a8 8 0 0 0 5.66-2.34" />
    <path d="M4.34 17.66A8 8 0 0 0 12 20" />
    <path d="M2 12h2" />
  </svg>
);

export default WeatherApiIcon;
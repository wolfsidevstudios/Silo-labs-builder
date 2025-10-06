import React from 'react';

const UnsplashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M10.5 9V0H0v9h10.5zm13.5 15V10.5h-10.5V24h10.5z" />
  </svg>
);

export default UnsplashIcon;

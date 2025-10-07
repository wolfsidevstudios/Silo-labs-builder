import React from 'react';

const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5.03,16.42 5.03,12.5C5.03,8.58 8.36,5.73 12.19,5.73C14.02,5.73 15.64,6.37 16.84,7.48L18.82,5.48C16.94,3.82 14.7,2.73 12.19,2.73C6.7,2.73 2.6,7.22 2.6,12.5C2.6,17.78 6.7,22.27 12.19,22.27C17.9,22.27 21.5,18.33 21.5,12.71C21.5,12.08 21.44,11.59 21.35,11.1Z"
    />
  </svg>
);

export default GoogleIcon;

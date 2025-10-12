import React from 'react';

const FlutterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M14.314 0L6.039 8.275 12.181 14.418 22.52 4.078z" />
    <path d="M14.314 9.725L9.936 14.102 14.314 18.48 22.52 10.275z" />
    <path d="M14.314 18.48l-4.378 4.379h8.756l4.378-4.379z" />
  </svg>
);

export default FlutterIcon;
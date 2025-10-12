import React from 'react';

const NextjsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.12 15.61l-3.3-5.71h2.29l2.16 3.74 2.16-3.74h2.29l-3.3 5.71-1.15-2z" />
    <path d="M12.98 17.61l1.15-2-1.15-2-1.15 2z" />
  </svg>
);

export default NextjsIcon;
import React from 'react';

const MapboxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 .6C5.7.6.6 5.7.6 12s5.1 11.4 11.4 11.4 11.4-5.1 11.4-11.4S18.3.6 12 .6zm0 2.4c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zM12 6L9 7.5v9L15 18V9L12 6zm-1.5 2.15L12 9l1.5-.85v6.5l-1.5.85v-6.5z" />
  </svg>
);

export default MapboxIcon;
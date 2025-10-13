
import React from 'react';

const TripoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2L4.5 6.5v9L12 20l7.5-4.5v-9L12 2zm0 2.31L18 7.5l-6 3.5-6-3.5L12 4.31zM6 8.41l6 3.5v7.18l-6-3.5V8.41zm12 0v7.18l-6 3.5V11.91l6-3.5z"/>
  </svg>
);

export default TripoIcon;
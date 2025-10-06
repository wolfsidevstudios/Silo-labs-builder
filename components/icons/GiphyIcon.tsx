import React from 'react';

const GiphyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M0 11.2h5.1V0H0v11.2zm6.4 11.3h5.1V6.4H6.4v16.1zM18.9 0v11.2h5.1V0h-5.1zm-6.4 16.2h5.1V6.4h-5.1v9.8z" />
  </svg>
);

export default GiphyIcon;

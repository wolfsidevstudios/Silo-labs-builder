import React from 'react';

const UserSearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <circle cx="10" cy="10" r="5" />
    <path d="M17.5 17.5L14 14" />
    <path d="M2 20a10 10 0 0 1 11.5-8" />
  </svg>
);

export default UserSearchIcon;
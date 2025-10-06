import React from 'react';

const RocketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.18-.65-.87-2.2-.86-3.05-.05-.85.8-.86 2.3-.05 3.18Z" />
    <path d="M12 12c3.33 3.33 5 5 5 5s-1.67-1.67-5-5-5-5-5-5 1.67 1.67 5 5Z" />
    <path d="M17.5 7.5c1.6-1.5 5-2 5-2s-.5 3.5-2 5c-.84.7-2.3.7-3.18-.05-.87-.65-.86-2.2-.05-3.05.8-.85 2.3-.86 3.18-.05Z" />
  </svg>
);

export default RocketIcon;

import React, { useState, useEffect } from 'react';

const BackgroundSvg = () => (
    <svg viewBox="0 0 1920 1920" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full object-fill z-0 opacity-70">
      <defs>
        <filter id="new_blur_1" x="-800" y="-800" width="3000" height="3000" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="400" result="effect1_foregroundBlur" />
        </filter>
        <filter id="new_blur_2" x="-800" y="-800" width="3000" height="3000" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="350" result="effect1_foregroundBlur" />
        </filter>
        <filter id="new_blur_3" x="-800" y="-800" width="3000" height="3000" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="450" result="effect1_foregroundBlur" />
        </filter>
        <filter id="new_blur_4" x="-800" y="-800" width="3000" height="3000" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="300" result="effect1_foregroundBlur" />
        </filter>
      </defs>
      <rect width="1920" height="1920" fill="black" />
      <g filter="url(#new_blur_1)">
        <circle cx="300" cy="400" r="600" fill="#614CF3" />
      </g>
      <g filter="url(#new_blur_2)">
        <circle cx="1600" cy="500" r="700" fill="#FF7449" />
      </g>
      <g filter="url(#new_blur_3)">
        <circle cx="1500" cy="1700" r="800" fill="#6DE5FF" />
      </g>
      <g filter="url(#new_blur_4)">
        <circle cx="200" cy="1800" r="500" fill="#E94560" />
      </g>
    </svg>
);

const HomePageBackground: React.FC = () => {
    const [background, setBackground] = useState('default');

    useEffect(() => {
        const storedBg = localStorage.getItem('home_background') || 'default';
        setBackground(storedBg);
        
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'home_background') {
                setBackground(e.newValue || 'default');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    switch (background) {
        case 'gradient-1':
            return <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />;
        case 'gradient-2':
            return <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-tr from-cyan-900 via-blue-900 to-slate-900" />;
        case 'solid-dark':
            return <div className="absolute inset-0 w-full h-full z-0 bg-gray-900" />;
        case 'default':
        default:
            return <BackgroundSvg />;
    }
};

export default HomePageBackground;

import React, { useState, useEffect } from 'react';
import LimitedEditionBackground from './LimitedEditionBackground';

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

const ImageBackground: React.FC = () => (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
        <img
            src="https://i.ibb.co/ZzRwdfdj/Google-AI-Studio-2025-10-12-T01-49-15-585-Z.png"
            alt="Abstract background with glowing lines and particles"
            className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
    </div>
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

    const commonClass = "absolute inset-0 w-full h-full z-0";

    switch (background) {
        case 'animated-gradient':
            return <BackgroundSvg />;
        case 'limited-edition':
            return <LimitedEditionBackground />;
        case 'limited-edition-2':
            return <div className={`${commonClass} bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900`} />;
        case 'limited-edition-3':
            return <div className={`${commonClass} bg-gradient-to-tr from-emerald-900 via-cyan-900 to-slate-900`} />;
        case 'limited-edition-4':
            return <div className={`${commonClass} bg-gradient-to-bl from-black via-yellow-900 to-orange-800`} />;
        case 'gradient-1':
            return <div className={`${commonClass} bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900`} />;
        case 'gradient-2':
            return <div className={`${commonClass} bg-gradient-to-tr from-cyan-900 via-blue-900 to-slate-900`} />;
        case 'gradient-3':
            return <div className={`${commonClass} bg-gradient-to-br from-orange-800 via-pink-900 to-purple-900`} />;
        case 'gradient-4':
            return <div className={`${commonClass} bg-gradient-to-bl from-green-900 via-teal-900 to-blue-900`} />;
        case 'gradient-5':
            return <div className={`${commonClass} bg-gradient-to-t from-black via-fuchsia-900 to-blue-900`} />;
        case 'gradient-6':
            return <div className={`${commonClass} bg-gradient-to-br from-gray-900 via-red-900 to-rose-900`} />;
        case 'gradient-7':
            return <div className={`${commonClass} bg-gradient-to-tr from-slate-900 via-purple-800 to-indigo-700`} />;
        case 'solid-black':
            return <div className={`${commonClass} bg-black`} />;
        case 'solid-dark':
            return <div className={`${commonClass} bg-gray-900`} />;
        case 'solid-blue':
            return <div className={`${commonClass} bg-blue-950`} />;
        case 'solid-purple':
            return <div className={`${commonClass} bg-purple-950`} />;
        case 'solid-green':
            return <div className={`${commonClass} bg-green-950`} />;
        case 'light-swirl':
            return (
                <>
                    <div className="absolute inset-0 w-full h-full bg-white overflow-hidden">
                        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sky-100 rounded-full filter blur-3xl opacity-70 animate-blob"></div>
                        <div className="absolute bottom-[-10%] right-[5%] w-[40%] h-[40%] bg-cyan-100 rounded-full filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                        <div className="absolute top-[20%] right-[-15%] w-[30%] h-[30%] bg-blue-100 rounded-full filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
                    </div>
                    <style>{`
                        @keyframes blob {
                            0% { transform: translate(0px, 0px) scale(1); }
                            33% { transform: translate(30px, -50px) scale(1.1); }
                            66% { transform: translate(-20px, 20px) scale(0.9); }
                            100% { transform: translate(0px, 0px) scale(1); }
                        }
                        .animate-blob {
                            animation: blob 10s infinite ease-in-out;
                        }
                        .animation-delay-2000 { animation-delay: 2s; }
                        .animation-delay-4000 { animation-delay: 4s; }
                    `}</style>
                </>
            );
        case 'pattern-1':
            return (
              <div className={`${commonClass} bg-gray-900 bg-[linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5`} />
            );
        case 'pattern-2':
             return (
              <div className={`${commonClass} bg-blue-950 opacity-20 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cpath%20d%3D%22M25%2025h2v50h-2zM25%2025h50v2h-50zM75%2075h-2v-50h2zM75%2075h-50v-2h50z%22%20fill%3D%22%2300ffff%22%2F%3E%3Cpath%20d%3D%22M25%2050h25v2h-25zM50%2025h2v25h-2z%22%20fill%3D%22%2300ffff%22%2F%3E%3C%2Fsvg%3E')] bg-repeat bg-center`} />
            );
        case 'pattern-3':
            return (
                <div className={`${commonClass} bg-gray-900`}>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.cyan.500/.2)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.cyan.500/.2)_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,theme(colors.gray.900)_70%)]"></div>
                </div>
            );
        case 'pattern-4':
            return (
                <div className={`${commonClass} bg-gray-900 bg-[radial-gradient(theme(colors.slate.700)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]`} />
            );
        case 'default':
        default:
            return <ImageBackground />;
    }
};

export default HomePageBackground;
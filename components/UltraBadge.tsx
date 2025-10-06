import React from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface UltraBadgeProps {
    isVisible: boolean;
}

const UltraBadge: React.FC<UltraBadgeProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed top-4 left-4 z-50 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 animate-fade-in-down">
            <SparklesIcon className="w-4 h-4" />
            <span>Ultra</span>
             <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default UltraBadge;

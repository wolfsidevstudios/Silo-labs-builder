import React, { useState, useEffect } from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface TrialCountdownBarProps {
  endTime: number;
  isInline?: boolean;
}

const TrialCountdownBar: React.FC<TrialCountdownBarProps> = ({ endTime, isInline = false }) => {
  const totalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in ms, assuming this is the new standard
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = endTime - Date.now();
      if (newTimeLeft <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        // Force a page reload to reset trial status globally
        window.location.reload();
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const formattedTime = `${String(days)}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const progressPercentage = (timeLeft / totalDuration) * 100;

  return (
    <div className={`w-full bg-slate-800 rounded-full p-1 relative overflow-hidden ${!isInline ? 'max-w-2xl my-4 animate-fade-in-down' : ''}`}>
        <div className="absolute inset-0 flex items-center justify-between px-4 z-10 pointer-events-none">
            <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">Pro Trial Active</span>
            </div>
            <span className="text-white font-mono text-sm">{formattedTime}</span>
        </div>
        <div 
            className="bg-gradient-to-r from-indigo-500 to-green-400 h-8 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${Math.max(progressPercentage, 0)}%` }}
        />
       {!isInline && <style>{`
        @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
       `}</style>}
    </div>
  );
};

export default TrialCountdownBar;
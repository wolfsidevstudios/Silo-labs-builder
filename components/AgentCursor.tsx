import React from 'react';
import MousePointerClickIcon from './icons/MousePointerClickIcon';

const AgentCursor: React.FC = () => {
  return (
    <>
      <div className="absolute inset-0 bg-black/30 pointer-events-none z-20 flex items-center justify-center">
        <p className="bg-black/50 text-white px-4 py-2 rounded-full font-semibold">
            MAX is testing your app...
        </p>
      </div>
      <div className="absolute w-8 h-8 pointer-events-none z-30 agent-cursor">
        <MousePointerClickIcon className="w-full h-full text-indigo-500" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}/>
      </div>
      <style>{`
        @keyframes agent-path {
          0% { top: 15%; left: 10%; transform: scale(1); }
          10% { top: 15%; left: 85%; }
          15% { top: 18%; left: 82%; transform: scale(0.8); } /* Click */
          20% { top: 15%; left: 85%; transform: scale(1); }
          25% { top: 50%; left: 80%; }
          35% { top: 50%; left: 15%; }
          40% { top: 48%; left: 18%; transform: scale(0.8); } /* Click */
          45% { top: 50%; left: 15%; transform: scale(1); }
          50% { top: 85%; left: 20%; }
          60% { top: 85%; left: 70%; }
          65% { top: 82%; left: 68%; transform: scale(0.8); } /* Click */
          70% { top: 85%; left: 70%; transform: scale(1); }
          80% { top: 30%; left: 45%; }
          90% { top: 60%; left: 55%; }
          100% { top: 15%; left: 10%; transform: scale(1); }
        }

        .agent-cursor {
          animation: agent-path 8s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default AgentCursor;
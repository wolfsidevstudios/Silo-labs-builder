import React, { useState, useEffect, useRef } from 'react';
import MousePointerClickIcon from './icons/MousePointerClickIcon';

interface AgentCursorProps {
  targets: { top: number; left: number; width: number; height: number }[];
}

const AgentCursor: React.FC<AgentCursorProps> = ({ targets }) => {
  const [position, setPosition] = useState({ top: -50, left: -50 });
  const [isClicking, setIsClicking] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const currentTargetIndex = useRef(0);

  useEffect(() => {
    if (targets.length === 0) {
        // Hide cursor if no targets
        setPosition({ top: -50, left: -50 });
        return;
    };

    let timeoutId: number;

    const moveToNextTarget = () => {
      // Pick a random target to make it less predictable
      currentTargetIndex.current = Math.floor(Math.random() * targets.length);
      const target = targets[currentTargetIndex.current];

      if (!target || !cursorRef.current) return;
      
      const targetX = target.left + target.width / 2;
      const targetY = target.top + target.height / 2;
      
      setPosition({ top: targetY, left: targetX });

      // After arriving, simulate a click
      timeoutId = window.setTimeout(() => {
        setIsClicking(true);
        timeoutId = window.setTimeout(() => {
          setIsClicking(false);
          // Schedule the next move
          timeoutId = window.setTimeout(moveToNextTarget, 700); // Wait before moving again
        }, 300); // Click duration
      }, 1200); // Travel time (from transition) + pause
    };

    // Start the first move after a short delay
    const startTimeout = setTimeout(moveToNextTarget, 500);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeoutId);
    };
  }, [targets]);

  return (
    <>
      <div className="absolute inset-0 bg-black/30 pointer-events-none z-20 flex items-center justify-center">
        <p className="bg-black/50 text-white px-4 py-2 rounded-full font-semibold">
            MAX is testing your app...
        </p>
      </div>
      <div
        ref={cursorRef}
        className="absolute w-8 h-8 pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2"
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px`, 
          transform: `scale(${isClicking ? 0.8 : 1})`,
          transition: 'top 1s ease-in-out, left 1s ease-in-out, transform 0.15s ease-in-out',
        }}
      >
        <MousePointerClickIcon className="w-full h-full text-indigo-500" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}/>
      </div>
    </>
  );
};

export default AgentCursor;

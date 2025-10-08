import React, { useState, useEffect, useRef } from 'react';
import CursorIcon from './icons/CursorIcon';

interface AgentCursorProps {
  targets: { id: number; top: number; left: number; width: number; height: number; tagName: string; text: string; type: string; href?: string; }[];
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

const generateRandomText = () => {
    const texts = [
        'Hello World',
        'Testing agent 1.03',
        'Silo MAX',
        'Gemini 3.0',
        'Autonomous input test',
        'San Francisco',
        'How does this work?',
        Math.random().toString(36).substring(7),
    ];
    return texts[Math.floor(Math.random() * texts.length)];
};


const AgentCursor: React.FC<AgentCursorProps> = ({ targets, iframeRef }) => {
  const [position, setPosition] = useState({ top: 50, left: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [actionText, setActionText] = useState('Initializing...');
  const isActive = useRef(true);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    isActive.current = true;

    const performActions = async () => {
      if (!iframeRef.current?.contentWindow) return;

      await wait(1000);

      while (isActive.current) {
        if (targets.length === 0) {
            setActionText('Scanning page...');
            await wait(2000);
            continue; // Wait for targets to appear from the iframe
        }

        const actionRoll = Math.random();
        
        const navigationTargets = targets.filter(t => t.type === 'navigate');
        const inputTargets = targets.filter(t => t.type === 'input');
        const clickTargets = targets.filter(t => t.type === 'click');

        if (actionRoll < 0.25 && navigationTargets.length > 0) { // 25% chance to navigate
            const target = navigationTargets[Math.floor(Math.random() * navigationTargets.length)];
            
            setActionText(`Navigating to ${target.href}...`);
            setPosition({ top: target.top + target.height / 2, left: target.left + target.width / 2 });
            await wait(1200);

            if (!isActive.current) return;
            
            setIsClicking(true);
            iframeRef.current.contentWindow.postMessage({
                type: 'MAX_AGENT_ACTION', action: 'click', payload: { id: target.id },
            }, '*');
            await wait(300);
            setIsClicking(false);
            
            setActionText('Loading page...');
            await wait(3000); // Wait for page to potentially load

        } else if (actionRoll < 0.50) { // 25% chance to scroll
          setActionText('Scrolling...');
          const scrollAmount = (Math.random() - 0.5) * 800; // Scroll up or down
          iframeRef.current.contentWindow.postMessage(
            { type: 'MAX_AGENT_ACTION', action: 'scroll', payload: { amount: scrollAmount } }, '*'
          );
          await wait(1500);

        } else if (actionRoll < 0.75 && inputTargets.length > 0) { // 25% chance to type
            const target = inputTargets[Math.floor(Math.random() * inputTargets.length)];

            setActionText('Moving to input...');
            setPosition({ top: target.top + target.height / 2, left: target.left + target.width / 2 });
            await wait(1200);

            if (!isActive.current) return;

            setActionText('Typing...');
            const randomText = generateRandomText();
            iframeRef.current.contentWindow.postMessage(
              { type: 'MAX_AGENT_ACTION', action: 'type', payload: { id: target.id, text: randomText } }, '*'
            );
            await wait(randomText.length * 50 + 500);

            if (!isActive.current) return;

            // Look for and click a submit button near the input
            const submitKeywords = ['submit', 'search', 'go', 'add', 'post', 'ok', '>', '->', 'send'];
            const potentialButtons = targets.filter(
              (t) => (t.tagName === 'BUTTON' || t.tagName === 'A' || t.tagName === 'INPUT') && submitKeywords.some((kw) => t.text.includes(kw))
            );

            if (potentialButtons.length > 0) {
              // Find the button geometrically closest to the input field
              let closestButton = potentialButtons[0];
              let minDistance = Infinity;
              const inputCenterX = target.left + target.width / 2;
              const inputCenterY = target.top + target.height / 2;

              for (const btn of potentialButtons) {
                const btnCenterX = btn.left + btn.width / 2;
                const btnCenterY = btn.top + btn.height / 2;
                const distance = Math.sqrt(Math.pow(btnCenterX - inputCenterX, 2) + Math.pow(btnCenterY - inputCenterY, 2));
                if (distance < minDistance) {
                  minDistance = distance;
                  closestButton = btn;
                }
              }

              setActionText('Submitting...');
              setPosition({ top: closestButton.top + closestButton.height / 2, left: closestButton.left + closestButton.width / 2 });
              await wait(1200);

              if (!isActive.current) return;
              setIsClicking(true);
              iframeRef.current.contentWindow.postMessage(
                { type: 'MAX_AGENT_ACTION', action: 'click', payload: { id: closestButton.id } }, '*'
              );
              await wait(300);
              setIsClicking(false);
            }
        } else if (clickTargets.length > 0) { // 25% chance to click a generic element
            const target = clickTargets[Math.floor(Math.random() * clickTargets.length)];

            setActionText('Clicking element...');
            setPosition({ top: target.top + target.height / 2, left: target.left + target.width / 2 });
            await wait(1200);

            if (!isActive.current) return;

            setIsClicking(true);
            iframeRef.current.contentWindow.postMessage(
              { type: 'MAX_AGENT_ACTION', action: 'click', payload: { id: target.id } }, '*'
            );
            await wait(300);
            setIsClicking(false);
        }

        setActionText('Thinking...');
        await wait(2000);
        if (!isActive.current) return;
      }
    };

    performActions();

    return () => {
      isActive.current = false;
    };
  }, [targets, iframeRef]);

  return (
    <>
      <div className="absolute inset-0 bg-black/30 pointer-events-none z-20 flex items-center justify-center">
        <p className="bg-black/50 text-white px-4 py-2 rounded-full font-semibold">
            MAX: {actionText}
        </p>
      </div>
      <div
        className="absolute w-8 h-8 pointer-events-none z-30"
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px`, 
          transform: `scale(${isClicking ? 0.8 : 1})`,
          transformOrigin: 'top left',
          transition: 'top 1s ease-in-out, left 1s ease-in-out, transform 0.15s ease-in-out',
        }}
      >
        <CursorIcon className="w-full h-full text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}/>
      </div>
    </>
  );
};

export default AgentCursor;
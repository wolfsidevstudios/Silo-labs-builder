import React, { useState, useEffect, useRef } from 'react';
import CursorIcon from './icons/CursorIcon';
import { TestStep } from '../types';

interface AgentCursorProps {
  targets: { id: number; top: number; left: number; width: number; height: number; tagName: string; text: string; type: string; href?: string; selector: string; }[];
  iframeRef: React.RefObject<HTMLIFrameElement>;
  testPlan: TestStep[] | null;
  onComplete: () => void;
}

const AgentCursor: React.FC<AgentCursorProps> = ({ targets, iframeRef, testPlan, onComplete }) => {
  const [position, setPosition] = useState({ top: 50, left: 50 });
  const [isClicking, setIsClicking] = useState(false);
  const [actionText, setActionText] = useState('Initializing...');
  const isActive = useRef(true);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    isActive.current = true;

    const performTestPlanActions = async () => {
        if (!iframeRef.current?.contentWindow || !testPlan) return;

        await wait(1500);
        setActionText('Starting test plan...');
        await wait(1000);

        for (const step of testPlan) {
            if (!isActive.current) return;
            
            setActionText(step.description);

            const target = targets.find(t => t.selector === step.targetSelector);
            
            if (!target) {
                console.warn(`MAX couldn't find target: ${step.targetSelector}`);
                setActionText(`Cannot find: ${step.targetSelector}`);
                await wait(2000);
                continue;
            }
            
            setPosition({ top: target.top + target.height / 2, left: target.left + target.width / 2 });
            await wait(1200);
            if (!isActive.current) return;

            if (step.action === 'click' || step.action === 'navigate') {
                setIsClicking(true);
                iframeRef.current.contentWindow.postMessage({ type: 'MAX_AGENT_ACTION', action: 'click', payload: { id: target.id } }, '*');
                await wait(300);
                setIsClicking(false);
            } else if (step.action === 'type' && step.payload?.text) {
                 const typingPromise = new Promise<void>(resolve => {
                    const handler = (event: MessageEvent) => {
                        if (event.data.type === 'MAX_AGENT_EVENT' && event.data.event === 'typingComplete' && event.data.payload.id === target.id) {
                            window.removeEventListener('message', handler);
                            resolve();
                        }
                    };
                    window.addEventListener('message', handler);
                });
                iframeRef.current.contentWindow.postMessage({ type: 'MAX_AGENT_ACTION', action: 'type', payload: { id: target.id, text: step.payload.text } }, '*');
                await typingPromise;
            } else if (step.action === 'scroll' && step.payload?.amount) {
                iframeRef.current.contentWindow.postMessage({ type: 'MAX_AGENT_ACTION', action: 'scroll', payload: { amount: step.payload.amount } }, '*');
            }
            
            await wait(1500);
        }
        setActionText('Test plan complete!');
        await wait(2000);
    };
    
    const runAgent = async () => {
        // testPlan is null while the analysis is running.
        if (testPlan === null) {
            setActionText('Analyzing app...');
            return; // Wait for useEffect to re-run when testPlan prop is updated.
        }

        if (testPlan.length > 0) {
            await performTestPlanActions();
        } else {
            setActionText('No test steps found. Analysis complete.');
            await wait(3000);
        }

        // If the component is still active, signal completion.
        if (isActive.current) {
            onComplete();
        }
    };

    runAgent();

    return () => {
      isActive.current = false;
    };
  }, [targets, iframeRef, testPlan, onComplete]);

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

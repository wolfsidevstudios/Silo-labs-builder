import React, { useState, useEffect, useRef } from 'react';
import CursorIcon from './icons/CursorIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';

const beforeHtml = `
<body class="bg-gray-100 font-sans p-4 md:p-8">
  <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
    <div class="p-8">
      <h1 class="text-2xl font-bold text-gray-900">My Todos</h1>
      <div class="flex mt-4">
        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" placeholder="Add a new todo...">
        <button class="flex-shrink-0 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2">Add</button>
      </div>
      <ul class="mt-4">
        <li class="flex items-center justify-between py-2 border-b">
          <span class="text-gray-700">Learn about AI</span>
          <input type="checkbox" />
        </li>
        <li class="flex items-center justify-between py-2 border-b">
          <span class="text-gray-700 line-through">Build an app</span>
          <input type="checkbox" checked />
        </li>
      </ul>
    </div>
  </div>
  <script src="https://cdn.tailwindcss.com"></script>
</body>
`;

const afterHtml = `
<body class="bg-gray-100 font-sans p-4 md:p-8">
  <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
    <div class="p-8">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">My Todos</h1>
        <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 text-sm rounded animate-pulse">Clear Completed</button>
      </div>
      <div class="flex mt-4">
        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" placeholder="Add a new todo...">
        <button class="flex-shrink-0 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2">Add</button>
      </div>
      <ul class="mt-4">
        <li class="flex items-center justify-between py-2 border-b">
          <span class="text-gray-700">Learn about AI</span>
          <input type="checkbox" />
        </li>
        <li class="flex items-center justify-between py-2 border-b">
          <span class="text-gray-700 line-through">Build an app</span>
          <input type="checkbox" checked />
        </li>
      </ul>
    </div>
  </div>
  <script src="https://cdn.tailwindcss.com"></script>
</body>
`;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const PROMPT_TO_TYPE = "Add a button to clear completed tasks";

const MaxVibeShowcase: React.FC = () => {
    const [step, setStep] = useState(0);
    const [status, setStatus] = useState("Initializing...");
    const [cursorPos, setCursorPos] = useState({ top: 120, left: 300 });
    const [typedPrompt, setTypedPrompt] = useState('');
    const [previewState, setPreviewState] = useState<'before' | 'building' | 'after'>('before');
    const [isClicking, setIsClicking] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const promptRef = useRef<HTMLDivElement>(null);
    const submitRef = useRef<HTMLButtonElement>(null);

    const moveToElement = async (elRef: React.RefObject<HTMLElement>) => {
        if (!containerRef.current || !elRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const elRect = elRef.current.getBoundingClientRect();
        setCursorPos({
            top: elRect.top - containerRect.top + elRect.height / 2,
            left: elRect.left - containerRect.left + elRect.width / 2,
        });
        await wait(1000);
    };

    useEffect(() => {
        const animationSequence = async () => {
            if (step === 0) {
                setStatus("Analyzing app for improvements...");
                setPreviewState('before');
                setTypedPrompt('');
                await wait(2000);
                setStep(1);
            } else if (step === 1) {
                setStatus(`Adding feature: "${PROMPT_TO_TYPE}"`);
                await moveToElement(promptRef);
                setStep(2);
            } else if (step === 2) {
                // Typing animation
                for (let i = 0; i < PROMPT_TO_TYPE.length; i++) {
                    setTypedPrompt(PROMPT_TO_TYPE.substring(0, i + 1));
                    await wait(60);
                }
                await wait(500);
                setStep(3);
            } else if (step === 3) {
                setStatus("Submitting new feature...");
                await moveToElement(submitRef);
                setIsClicking(true);
                await wait(200);
                setIsClicking(false);
                setStep(4);
            } else if (step === 4) {
                setStatus("Building new feature...");
                setPreviewState('building');
                await wait(3000);
                setStep(5);
            } else if (step === 5) {
                setStatus("Feature implemented!");
                setPreviewState('after');
                await wait(4000);
                setStep(0); // Loop
            }
        };
        animationSequence();
    }, [step]);

    return (
        <div ref={containerRef} className="relative w-full aspect-[16/9] bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden flex flex-col p-1 gap-1">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full font-semibold z-30 pointer-events-none text-xs shadow-md">
                MAX Vibe: {status}
            </div>
            <div className="flex-grow flex gap-1 h-full overflow-hidden">
                {/* Fake Chat/Code Pane */}
                <div className="w-1/3 bg-slate-900/50 rounded-md p-2">
                    <div className="h-4 w-2/3 bg-slate-700 rounded-full mb-3"></div>
                    <div className="space-y-2">
                        <div className="h-3 w-full bg-slate-700/50 rounded-full"></div>
                        <div className="h-3 w-5/6 bg-slate-700/50 rounded-full"></div>
                    </div>
                </div>
                {/* Fake Preview Pane */}
                <div className="w-2/3 bg-slate-900/50 rounded-md relative">
                    <iframe
                        srcDoc={previewState === 'after' ? afterHtml : beforeHtml}
                        className="w-full h-full border-0 rounded-md"
                        sandbox="allow-scripts"
                        scrolling="no"
                    />
                    {previewState === 'building' && (
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
                             <div className="w-8 h-8 border-4 border-t-transparent border-indigo-400 rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </div>
            {/* Fake Prompt Pane */}
            <div className="h-1/4 bg-slate-900/50 rounded-md p-2 relative">
                <div ref={promptRef} className="h-full w-full bg-slate-800 rounded-md p-2 text-left text-xs text-slate-300">
                    {typedPrompt}
                    <span className="animate-pulse">|</span>
                </div>
                <button ref={submitRef} className={`absolute right-3 bottom-3 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${typedPrompt ? 'bg-white' : 'bg-gray-600'}`}>
                    <ArrowUpIcon className="w-4 h-4 text-black" />
                </button>
            </div>

            {/* Cursor */}
            <div
                className="absolute w-6 h-6 pointer-events-none z-40"
                style={{
                    top: `${cursorPos.top}px`,
                    left: `${cursorPos.left}px`,
                    transform: `scale(${isClicking ? 0.8 : 1})`,
                    transformOrigin: 'top left',
                    transition: 'top 0.8s ease-in-out, left 0.8s ease-in-out, transform 0.15s ease-in-out',
                }}
            >
                <CursorIcon className="w-full h-full text-cyan-400" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }} />
            </div>
        </div>
    );
};

export default MaxVibeShowcase;

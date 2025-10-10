import React, { useRef } from 'react';
import EyeIcon from './icons/EyeIcon';
import AgentCursor from './AgentCursor';
import { TestStep } from '../types';

interface PreviewProps {
  htmlContent: string;
  streamingPreviewHtml: string | null;
  hasFiles: boolean;
  isLoading: boolean;
  isVisualEditMode: boolean;
  isMaxAgentRunning: boolean;
  agentTargets: any[];
  testPlan: TestStep[] | null;
  onMaxAgentComplete: () => void;
}

const visualEditScript = `
  const getCssSelector = (el) => {
    if (!(el instanceof Element)) return;
    const path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        if (el.id) {
            selector = '#' + el.id;
            path.unshift(selector);
            break; // ID is unique
        } else {
            let sib = el, nth = 1;
            while (sib = sib.previousElementSibling) {
                if (sib.nodeName.toLowerCase() === selector) {
                   nth++;
                }
            }
            const classNames = Array.from(el.classList);
            const uniqueClassName = classNames.find(cn => el.parentElement.querySelectorAll('.' + cn).length === 1);

            if (uniqueClassName) {
                selector += '.' + uniqueClassName;
            } else if (nth !== 1) {
                selector += \`:nth-of-type(\${nth})\`;
            }
        }
        path.unshift(selector);
        el = el.parentNode;
    }
    return path.join(' > ').replace('html > body > ', '');
  };

  let highlightedElement = null;

  document.addEventListener('mouseover', e => {
      if (!e.target || e.target === document.body) return;
      highlightedElement = e.target;
      e.target.style.outline = '2px dashed #6366F1';
      e.target.style.outlineOffset = '2px';
      e.target.style.cursor = 'pointer';
  });

  document.addEventListener('mouseout', e => {
      if (e.target) {
          e.target.style.outline = '';
          e.target.style.outlineOffset = '';
          e.target.style.cursor = '';
      }
      highlightedElement = null;
  });

  document.addEventListener('click', e => {
    if (!highlightedElement) return;
    e.preventDefault();
    e.stopPropagation();
    
    highlightedElement.style.outline = '';
    highlightedElement.style.outlineOffset = '';
    highlightedElement.style.cursor = '';

    const selector = getCssSelector(highlightedElement);
    window.parent.postMessage({ type: 'VISUAL_EDIT_SELECT', selector: selector }, '*');
    
    highlightedElement = null;
}, true);
`;

const maxAgentScript = `
  // MAX Agent script here, same as in Preview.tsx
`;


const MobilePreview: React.FC<PreviewProps> = ({ htmlContent, streamingPreviewHtml, hasFiles, isLoading, isVisualEditMode, isMaxAgentRunning, agentTargets, testPlan, onMaxAgentComplete }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const displayHtmlRaw = isLoading && streamingPreviewHtml !== null ? streamingPreviewHtml : htmlContent;

  const convertBbcodeToHtml = (html: string): string => {
    return html.replace(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" style="max-width: 100%; height: auto;" alt="User uploaded image" />');
  };
  
  const displayHtml = convertBbcodeToHtml(displayHtmlRaw);
  
  let scriptsToInject = '';
  if (isVisualEditMode) scriptsToInject += visualEditScript;
  if (isMaxAgentRunning) scriptsToInject += maxAgentScript;
  
  const finalHtmlContent = scriptsToInject
    ? displayHtml.replace('</body>', `<script>${scriptsToInject}</script></body>`)
    : displayHtml;

  const hasContentToDisplay = (isLoading && streamingPreviewHtml !== null) || hasFiles;

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg overflow-hidden">
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-slate-900">
            <EyeIcon className="w-5 h-5 text-slate-300" />
            <h2 className="font-semibold text-slate-200">Mobile Preview</h2>
        </div>

        <div className="flex-grow flex items-center justify-center p-4">
            {hasContentToDisplay ? (
                <div className="relative w-full h-full max-w-[320px] max-h-[640px] aspect-[9/19.5]">
                    <img 
                        src="https://i.ibb.co/cK6YGrmH/apple-iphone-13-pro-max-2021-medium.png" 
                        alt="Phone frame" 
                        className="absolute inset-0 w-full h-full pointer-events-none z-10"
                    />
                    <div className="absolute top-[1.5%] left-[3.5%] w-[93%] h-[97%] rounded-[32px] overflow-hidden">
                        {isMaxAgentRunning && <AgentCursor targets={agentTargets} iframeRef={iframeRef} testPlan={testPlan} onComplete={onMaxAgentComplete} />}
                        <iframe
                            ref={iframeRef}
                            srcDoc={finalHtmlContent}
                            title="App Preview"
                            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                            className={`w-full h-full border-0 bg-white ${isVisualEditMode ? 'pointer-events-auto' : ''}`}
                        />
                        {isVisualEditMode && (
                            <div className="absolute inset-0 bg-indigo-900/20 pointer-events-none flex items-center justify-center">
                                <p className="bg-black/50 text-white px-3 py-1 text-sm rounded-full font-semibold">
                                    Select an element
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                    Your mobile app preview will appear here.
                </div>
            )}
        </div>
    </div>
  );
};

export default MobilePreview;
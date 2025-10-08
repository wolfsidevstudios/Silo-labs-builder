import React, { useRef } from 'react';
import EyeIcon from './icons/EyeIcon';
import AgentCursor from './AgentCursor';

interface PreviewProps {
  htmlContent: string;
  streamingPreviewHtml: string | null;
  hasFiles: boolean;
  isLoading: boolean;
  isVisualEditMode: boolean;
  isMaxAgentRunning: boolean;
  agentTargets: any[];
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
    
    // Clear styles before sending message
    highlightedElement.style.outline = '';
    highlightedElement.style.outlineOffset = '';
    highlightedElement.style.cursor = '';

    const selector = getCssSelector(highlightedElement);
    window.parent.postMessage({ type: 'VISUAL_EDIT_SELECT', selector: selector }, '*');
    
    highlightedElement = null;
}, true);
`;

const maxAgentScript = `
  try {
    // Action listener for commands from the parent window
    window.addEventListener('message', (event) => {
        if (event.data.type === 'MAX_AGENT_ACTION') {
            const { action, payload } = event.data;
            const el = document.querySelector('[data-max-agent-id="' + payload.id + '"]');
            if (!el) return;

            if (action === 'click') {
                if (typeof el.click === 'function') {
                  el.focus();
                  el.click();
                }
            } else if (action === 'scroll') {
                window.scrollBy({ top: payload.amount, left: 0, behavior: 'smooth' });
            } else if (action === 'type') {
                if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
                    el.focus();
                    el.value = ''; // Clear existing value
                    let i = 0;
                    const text = payload.text;
                    const interval = setInterval(() => {
                        if (i < text.length) {
                            el.value += text.charAt(i);
                            i++;
                        } else {
                            clearInterval(interval);
                            // Dispatch events to trigger any framework-level state updates
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }, 50); // 50ms per character
                }
            }
        }
    });

    const getInteractiveElements = () => {
      const selectors = 'a, button, input:not([type="hidden"]), textarea, [role="button"], [onclick]';
      const elements = Array.from(document.querySelectorAll(selectors));
      return elements
        .filter(el => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.pointerEvents !== 'none';
        })
        .map((el, index) => {
          el.setAttribute('data-max-agent-id', String(index));
          const rect = el.getBoundingClientRect();
          
          let type = 'click'; // default
          let href = null;
          const tagName = el.tagName.toUpperCase();

          if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
              type = 'input';
          } else if (tagName === 'A') {
              const elHref = el.getAttribute('href');
              // Ensure it's a valid, non-fragment, non-JS link
              if (elHref && !elHref.startsWith('#') && !elHref.startsWith('javascript:')) {
                  type = 'navigate';
                  href = elHref;
              }
          }

          return {
            id: index, // Send ID back to parent
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            tagName: el.tagName,
            text: (el.innerText || el.value || '').trim().toLowerCase(),
            type: type,
            href: href,
          };
        });
    };
    
    // Use a timeout to ensure the DOM is fully rendered before scanning
    setTimeout(() => {
        const elements = getInteractiveElements();
        window.parent.postMessage({ type: 'MAX_AGENT_ELEMENTS', elements: elements }, '*');
    }, 500); // Increased timeout to be safer
  } catch(e) {
    window.parent.postMessage({ type: 'MAX_AGENT_ELEMENTS', elements: [] }, '*');
  }
`;


const Preview: React.FC<PreviewProps> = ({ htmlContent, streamingPreviewHtml, hasFiles, isLoading, isVisualEditMode, isMaxAgentRunning, agentTargets }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const displayHtmlRaw = isLoading && streamingPreviewHtml !== null ? streamingPreviewHtml : htmlContent;

  const convertBbcodeToHtml = (html: string): string => {
    // This regex looks for [img]...[/img] and captures the content inside.
    // The 'g' flag ensures all occurrences are replaced.
    // The 'i' flag makes it case-insensitive ([IMG] would also work).
    return html.replace(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" style="max-width: 100%; height: auto;" alt="User uploaded image" />');
  };
  
  const displayHtml = convertBbcodeToHtml(displayHtmlRaw);
  
  let scriptsToInject = '';
  if (isVisualEditMode) {
      scriptsToInject += visualEditScript;
  }
  if (isMaxAgentRunning) {
      scriptsToInject += maxAgentScript;
  }
  
  const finalHtmlContent = scriptsToInject
    ? displayHtml.replace('</body>', `<script>${scriptsToInject}</script></body>`)
    : displayHtml;

  const hasContentToDisplay = (isLoading && streamingPreviewHtml !== null) || hasFiles;

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg overflow-hidden">
        <div className="relative flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-slate-900 overflow-hidden">
            <div 
                className={`absolute top-1/2 right-0 w-2/3 h-[300%] ${isLoading ? 'bg-fuchsia-500 animate-pulse' : 'bg-gradient-to-r from-fuchsia-600 to-pink-600'} opacity-25 blur-3xl transform -translate-y-1/2 -rotate-[25deg] transition-all duration-500`}
                aria-hidden="true" 
            />
            <EyeIcon className="relative z-10 w-5 h-5 text-slate-300" />
            <h2 className="relative z-10 font-semibold text-slate-200">Live Preview</h2>
        </div>

        <div className={`flex-grow relative ${isLoading ? 'p-2' : ''}`}>
            {isLoading && (
                <div className="absolute inset-0 animate-glowing-border rounded-lg"></div>
            )}
            
            <div className="w-full h-full relative z-10 bg-slate-800 rounded-md overflow-hidden">
                {isMaxAgentRunning && <AgentCursor targets={agentTargets} iframeRef={iframeRef} />}
                {hasContentToDisplay ? (
                    <iframe
                        ref={iframeRef}
                        srcDoc={finalHtmlContent}
                        title="App Preview"
                        sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                        className={`w-full h-full border-0 bg-white ${isVisualEditMode ? 'pointer-events-auto' : ''}`}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                        Your app preview will appear here.
                    </div>
                )}
                 {isVisualEditMode && (
                    <div className="absolute inset-0 bg-indigo-900/20 pointer-events-none rounded-md flex items-center justify-center">
                        <p className="bg-black/50 text-white px-4 py-2 rounded-full font-semibold">
                            Select an element to edit
                        </p>
                    </div>
                )}
            </div>
        </div>
        
        {isLoading && (
            <style>{`
                @keyframes glowing-border-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .animate-glowing-border {
                    background: conic-gradient(
                        from 180deg at 50% 50%,
                        #d946ef, /* fuchsia-500 */
                        #ec4899, /* pink-500 */
                        #f97316, /* orange-500 */
                        #eab308, /* yellow-500 */
                        #ec4899, /* pink-500 */
                        #d946ef  /* fuchsia-500 */
                    );
                    animation: glowing-border-spin 4s linear infinite;
                    filter: blur(8px);
                    opacity: 0.9;
                }
            `}</style>
        )}
    </div>
  );
};

export default Preview;
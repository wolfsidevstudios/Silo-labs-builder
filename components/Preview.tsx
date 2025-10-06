
import React from 'react';
import EyeIcon from './icons/EyeIcon';

interface PreviewProps {
  htmlContent: string;
  streamingPreviewHtml: string | null;
  hasFiles: boolean;
  isLoading: boolean;
  isVisualEditMode: boolean;
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

const Preview: React.FC<PreviewProps> = ({ htmlContent, streamingPreviewHtml, hasFiles, isLoading, isVisualEditMode }) => {
  const displayHtmlRaw = isLoading && streamingPreviewHtml !== null ? streamingPreviewHtml : htmlContent;

  const convertBbcodeToHtml = (html: string): string => {
    // This regex looks for [img]...[/img] and captures the content inside.
    // The 'g' flag ensures all occurrences are replaced.
    // The 'i' flag makes it case-insensitive ([IMG] would also work).
    return html.replace(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" style="max-width: 100%; height: auto;" alt="User uploaded image" />');
  };
  
  const displayHtml = convertBbcodeToHtml(displayHtmlRaw);

  const enhancedHtmlContent = isVisualEditMode
    ? displayHtml.replace('</body>', `<script>${visualEditScript}</script></body>`)
    : displayHtml;
  
  const hasContentToDisplay = (isLoading && streamingPreviewHtml !== null) || hasFiles;

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 p-3 bg-slate-900 border-b border-slate-700">
            <EyeIcon className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-300">Live Preview</h2>
        </div>

        <div className={`flex-grow relative ${isLoading ? 'p-2' : ''}`}>
            {isLoading && (
                <div className="absolute inset-0 animate-glowing-border rounded-lg"></div>
            )}
            
            <div className="w-full h-full relative z-10 bg-slate-800 rounded-md overflow-hidden">
                {hasContentToDisplay ? (
                    <iframe
                        srcDoc={enhancedHtmlContent}
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
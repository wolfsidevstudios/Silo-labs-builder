import React from 'react';
import EyeIcon from './icons/EyeIcon';

interface PreviewProps {
  htmlContent: string;
  hasFiles: boolean;
  isLoading: boolean;
}

const Preview: React.FC<PreviewProps> = ({ htmlContent, hasFiles, isLoading }) => {
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
                {hasFiles ? (
                    <iframe
                        srcDoc={htmlContent}
                        title="App Preview"
                        sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                        className="w-full h-full border-0 bg-white"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                        Your app preview will appear here.
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
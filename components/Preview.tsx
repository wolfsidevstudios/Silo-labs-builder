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
        <div className="flex items-center gap-2 p-3 bg-slate-900/50 border-b border-slate-700">
            <EyeIcon className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-300">Live Preview</h2>
        </div>

        <div className={`
            flex-grow 
            ${isLoading ? 'p-1 bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-300 animate-gradient-border' : ''}
        `}>
            {hasFiles ? (
                <iframe
                    srcDoc={htmlContent}
                    title="App Preview"
                    sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                    className="w-full h-full border-0 bg-white"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800">
                    Your app preview will appear here.
                </div>
            )}
        </div>
        
        {isLoading && (
            <style>{`
                @keyframes gradient-border-animation {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes pulse-glow-shadow {
                    0% { box-shadow: inset 0 0 5px 1px rgba(255, 255, 255, 0.2); }
                    50% { box-shadow: inset 0 0 10px 2px rgba(255, 255, 255, 0.5); }
                    100% { box-shadow: inset 0 0 5px 1px rgba(255, 255, 255, 0.2); }
                }
                .animate-gradient-border {
                    background-size: 200% 200%;
                    animation: 
                        gradient-border-animation 3s ease infinite,
                        pulse-glow-shadow 2s ease-in-out infinite;
                }
            `}</style>
        )}
    </div>
  );
};

export default Preview;
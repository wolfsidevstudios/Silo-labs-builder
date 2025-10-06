import React from 'react';
import EyeIcon from './icons/EyeIcon';

interface PreviewProps {
  htmlContent: string;
  hasFiles: boolean;
}

const Preview: React.FC<PreviewProps> = ({ htmlContent, hasFiles }) => {
  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 p-3 bg-slate-900/50 border-b border-slate-700">
            <EyeIcon className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-300">Live Preview</h2>
        </div>
        {hasFiles ? (
            <iframe
                srcDoc={htmlContent}
                title="App Preview"
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                className="w-full h-full flex-grow border-0 bg-white"
            />
        ) : (
            <div className="flex-grow flex items-center justify-center text-slate-500">
                Your app preview will appear here.
            </div>
        )}
    </div>
  );
};

export default Preview;
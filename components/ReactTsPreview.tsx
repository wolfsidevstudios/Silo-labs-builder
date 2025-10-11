import React from 'react';
import CodeIcon from './icons/CodeIcon';

const ReactTsPreview: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg overflow-hidden items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-6">
            <CodeIcon className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">React + TypeScript Project</h2>
        <p className="text-slate-400 max-w-md">
            This project requires a build step. To view it, please download the files and run it locally.
        </p>
        <div className="mt-6 text-left bg-slate-900/50 p-4 rounded-lg font-mono text-sm text-slate-300 max-w-md w-full">
            <p><span className="text-cyan-400">$</span> npm install</p>
            <p><span className="text-cyan-400">$</span> npm run dev</p>
        </div>
        <p className="text-xs text-slate-500 mt-4">
            This preview shows instructions because a local development server (like Vite) is needed to build and run the app.
        </p>
    </div>
  );
};

export default ReactTsPreview;

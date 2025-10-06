
import React, { useState } from 'react';
import { AppFile } from '../types';
import CodeIcon from './icons/CodeIcon';

interface CodeViewerProps {
  files: AppFile[];
}

const CodeViewer: React.FC<CodeViewerProps> = ({ files }) => {
  const [activeFile, setActiveFile] = useState<string | null>(
    files.length > 0 ? files[0].path : null
  );

  React.useEffect(() => {
    if (files.length > 0 && !files.find(f => f.path === activeFile)) {
      setActiveFile(files[0].path);
    } else if (files.length === 0) {
      setActiveFile(null);
    }
  }, [files, activeFile]);

  const displayedFile = files.find((file) => file.path === activeFile);

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 p-3 bg-slate-900/50 border-b border-slate-700">
        <CodeIcon className="w-5 h-5 text-slate-400" />
        <h2 className="font-semibold text-slate-300">Code</h2>
      </div>
      
      {files.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-slate-500">
          Your generated code will appear here.
        </div>
      ) : (
        <>
          <div className="flex-shrink-0 flex border-b border-slate-700 overflow-x-auto">
            {files.map((file) => (
              <button
                key={file.path}
                onClick={() => setActiveFile(file.path)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeFile === file.path
                    ? 'bg-slate-700 text-white border-b-2 border-indigo-500'
                    : 'text-slate-400 hover:bg-slate-700/50'
                }`}
              >
                {file.path}
              </button>
            ))}
          </div>
          <div className="flex-grow p-1 overflow-auto">
             <pre className="text-sm p-4 h-full"><code className="language-javascript">{displayedFile?.content}</code></pre>
          </div>
        </>
      )}
    </div>
  );
};

export default CodeViewer;

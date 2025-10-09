import React, { useEffect, useRef, useState } from 'react';
import CopyIcon from './icons/CopyIcon';
import DownloadIcon from './icons/DownloadIcon';

declare var Prism: any;

interface CodeBlockProps {
  language: string;
  code: string;
  filePath?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, filePath }) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copyText, setCopyText] = useState('Copy');

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy'), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath || `code.${language || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-black/50 border border-slate-600 rounded-lg overflow-hidden my-2">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-900/70">
        <p className="text-xs text-slate-400 font-mono">{filePath || language}</p>
        <div className="flex items-center gap-3">
          <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <CopyIcon className="w-4 h-4" /> {copyText}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <DownloadIcon className="w-4 h-4" /> Download
          </button>
        </div>
      </div>
      <pre className="text-sm max-h-96 overflow-auto p-4" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;

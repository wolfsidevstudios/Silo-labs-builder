import React, { useState, useEffect } from 'react';
import CodeIcon from './icons/CodeIcon';

declare var Prism: any;

interface FlutterPreviewProps {
  previewData: string;
}

interface FlutterFiles {
    'lib/main.dart': string;
    'pubspec.yaml': string;
}

const FlutterPreview: React.FC<FlutterPreviewProps> = ({ previewData }) => {
  const [files, setFiles] = useState<FlutterFiles | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<'main' | 'pubspec'>('main');

  useEffect(() => {
    try {
      if (!previewData) {
        setFiles(null);
        return;
      }
      const data = JSON.parse(previewData);
      if (data.type !== 'flutter' || !data.files) {
        throw new Error('Waiting for complete Flutter project data...');
      }
      setFiles(data.files);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid data format for Flutter preview.');
      setFiles(null);
    }
  }, [previewData]);

  useEffect(() => {
    if (files) {
      Prism.highlightAll();
    }
  }, [files, activeFile]);

  const displayedContent = activeFile === 'main' ? files?.['lib/main.dart'] : files?.['pubspec.yaml'];
  const language = activeFile === 'main' ? 'dart' : 'yaml';
  
  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 p-3 bg-slate-900 border-b border-slate-700">
            <CodeIcon className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-slate-300">Flutter Project Preview</h2>
        </div>

        {!files && (
            <div className="flex-grow flex items-center justify-center text-slate-500 p-4 text-center">
                {error || 'Generated Flutter project files will appear here.'}
            </div>
        )}

        {files && (
            <>
                <div className="p-4 bg-slate-900/50 border-b border-slate-700">
                    <h3 className="font-bold text-white mb-2">How to Run</h3>
                    <p className="text-sm text-slate-400">
                        To run this Flutter app, copy the code into a new Flutter project on your local machine and run `flutter pub get` and `flutter run`.
                    </p>
                </div>
                <div className="flex-shrink-0 flex border-b border-slate-700 overflow-x-auto">
                    <button onClick={() => setActiveFile('main')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeFile === 'main' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}>
                        lib/main.dart
                    </button>
                    <button onClick={() => setActiveFile('pubspec')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeFile === 'pubspec' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}>
                        pubspec.yaml
                    </button>
                </div>
                <div className="flex-grow p-1 overflow-auto">
                    <pre className="text-sm h-full" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        <code className={`language-${language}`}>{displayedContent}</code>
                    </pre>
                </div>
            </>
        )}
         <style>{`
            pre[class*="language-"]::-webkit-scrollbar { width: 8px; height: 8px; }
            pre[class*="language-"]::-webkit-scrollbar-track { background: #1a202c; }
            pre[class*="language-"]::-webkit-scrollbar-thumb { background-color: #4a5568; border-radius: 4px; }
            pre[class*="language-"]::-webkit-scrollbar-thumb:hover { background-color: #718096; }
        `}</style>
    </div>
  );
};

export default FlutterPreview;
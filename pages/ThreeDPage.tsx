import React, { useState, useEffect, useRef } from 'react';
import { generateOrUpdateAppCode } from '../services/geminiService';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import DownloadIcon from '../components/icons/DownloadIcon';
import CopyIcon from '../components/icons/CopyIcon';
import CodeIcon from '../components/icons/CodeIcon';
import EyeIcon from '../components/icons/EyeIcon';
import { AppFile } from '../types';

// Mock Prism for code highlighting
declare var Prism: any;

interface ThreeDPageProps {
  initialPrompt: string;
}

const ThreeDPage: React.FC<ThreeDPageProps> = ({ initialPrompt }) => {
  const [currentPrompt, setCurrentPrompt] = useState(initialPrompt);
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [copyText, setCopyText] = useState('Copy');
  
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    generateScene(currentPrompt);
  }, []);

  useEffect(() => {
    if (view === 'code' && codeRef.current && htmlContent) {
        Prism.highlightElement(codeRef.current);
    }
  }, [view, htmlContent]);

  const generateScene = async (promptToGenerate: string, existingFiles: AppFile[] | null = null) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setHtmlContent(existingFiles ? existingFiles[0].content : null); // Keep old content while generating
    
    const fullPrompt = existingFiles 
        ? promptToGenerate 
        : `Generate a 3D scene based on the prompt: "${promptToGenerate}"`;
    
    setCurrentPrompt(existingFiles ? `${currentPrompt}, ${promptToGenerate}`: promptToGenerate);
    setLoadingStatus(existingFiles ? 'Modifying 3D scene...' : 'Generating 3D scene...');

    try {
        const result = await generateOrUpdateAppCode(
            promptToGenerate,
            existingFiles,
            null,
            null,
            {},
            '3d'
        );
        
        if (!result.previewHtml) {
            throw new Error("The AI did not return any content for the 3D scene.");
        }

        setHtmlContent(result.previewHtml);
        setIsLoading(false);
        setLoadingStatus('Finished!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate scene: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const handleModificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modificationPrompt.trim() && htmlContent) {
      generateScene(modificationPrompt.trim(), [{ path: 'index.html', content: htmlContent }]);
      setModificationPrompt('');
    }
  };

  const handleDownload = () => {
    if (htmlContent) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentPrompt.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopy = () => {
    if (htmlContent) {
        navigator.clipboard.writeText(htmlContent).then(() => {
            setCopyText('Copied!');
            setTimeout(() => setCopyText('Copy'), 2000);
        });
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col pl-[4.5rem]">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-slate-900/50 backdrop-blur-sm p-1 rounded-full flex items-center border border-slate-700/50">
          <button onClick={() => setView('preview')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${view === 'preview' ? 'bg-white text-black' : 'text-slate-300'}`}><EyeIcon className="w-4 h-4"/>Preview</button>
          <button onClick={() => setView('code')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${view === 'code' ? 'bg-white text-black' : 'text-slate-300'}`}><CodeIcon className="w-4 h-4"/>Code</button>
        </div>
      </div>
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <button onClick={handleDownload} disabled={!htmlContent} className="px-4 py-2 bg-white text-black font-semibold rounded-full text-sm hover:bg-gray-200 transition-colors disabled:bg-gray-500 disabled:text-gray-800 flex items-center gap-2"><DownloadIcon className="w-4 h-4"/>Download</button>
        <button onClick={handleCopy} disabled={!htmlContent} className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-full text-sm hover:bg-slate-600 transition-colors disabled:bg-slate-800 disabled:text-slate-500 flex items-center gap-2"><CopyIcon className="w-4 h-4"/>{copyText}</button>
      </div>

      <main className="flex-grow relative grid-background overflow-hidden">
        {view === 'preview' ? (
          <div className="w-full h-full flex items-center justify-center model-container">
            {isLoading && !htmlContent && (
              <div className="text-center text-white max-w-md mx-auto p-4">
                 <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin mx-auto mb-4"></div>
                 <p className="font-semibold text-lg">{loadingStatus}</p>
                 <p className="text-sm text-slate-400 mt-2">
                    The AI is generating Three.js code for: <br/>
                    <span className="italic text-slate-300">"{currentPrompt}"</span>
                 </p>
              </div>
            )}
            {error && <p className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</p>}
            {htmlContent && (
              <div className="w-full h-full relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                     <div className="text-center text-white">
                        <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin mx-auto mb-3"></div>
                        <p>{loadingStatus}</p>
                     </div>
                  </div>
                )}
                <iframe
                  srcDoc={htmlContent}
                  title="3D Scene Preview"
                  sandbox="allow-scripts"
                  className="w-full h-full border-0"
                />
              </div>
            )}
          </div>
        ) : (
            <div className="h-full overflow-auto bg-slate-900">
                <pre className="text-sm h-full"><code ref={codeRef} className="language-html">{htmlContent || "<!-- Code will appear here once the model is generated -->"}</code></pre>
            </div>
        )}
      </main>

      <footer className="flex-shrink-0 p-4">
        <form onSubmit={handleModificationSubmit} className="relative w-full max-w-2xl mx-auto">
          <input
            type="text"
            value={modificationPrompt}
            onChange={e => setModificationPrompt(e.target.value)}
            placeholder="e.g., make it chrome plated, add wings..."
            disabled={isLoading || !htmlContent}
            className="w-full h-14 p-4 pr-16 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button type="submit" disabled={isLoading || !modificationPrompt.trim()} className="absolute h-12 w-12 right-1 top-1/2 -translate-y-1/2 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:bg-gray-600 group">
            <ArrowUpIcon className="w-5 h-5 text-black" />
          </button>
        </form>
      </footer>
      <style>{`
        .grid-background {
            background-color: #000;
            background-image:
                linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
            background-size: 3rem 3rem;
        }
        pre[class*="language-"] {
            margin: 0;
            height: 100%;
            box-sizing: border-box;
            padding: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ThreeDPage;

import React, { useState, useEffect, useRef } from 'react';
import { getApiKey as getTripoApiKey } from '../services/tripoService';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import DownloadIcon from '../components/icons/DownloadIcon';
import CopyIcon from '../components/icons/CopyIcon';
import CodeIcon from '../components/icons/CodeIcon';
import EyeIcon from '../components/icons/EyeIcon';

// Mock Prism for code highlighting
declare var Prism: any;

// Add TypeScript declarations for the <model-viewer> custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          ar?: boolean;
          'auto-rotate'?: boolean;
          'camera-controls'?: boolean;
          'shadow-intensity'?: string;
          exposure?: string;
          'environment-image'?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface ThreeDPageProps {
  initialPrompt: string;
}

const ThreeDPage: React.FC<ThreeDPageProps> = ({ initialPrompt }) => {
  const [currentPrompt, setCurrentPrompt] = useState(initialPrompt);
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copyText, setCopyText] = useState('Copy');
  
  const codeRef = useRef<HTMLElement>(null);
  const pollingInterval = useRef<number | null>(null);

  useEffect(() => {
    generateModel(currentPrompt);
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (view === 'code' && codeRef.current && generatedCode) {
        Prism.highlightElement(codeRef.current);
    }
  }, [view, generatedCode]);

  const generateModel = async (promptToGenerate: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setModelUrl(null);
    setCurrentPrompt(promptToGenerate); // Update current prompt immediately for loading text
    setLoadingStatus('Initializing task...');

    const apiKey = getTripoApiKey();
    if (!apiKey) {
      setError("Tripo AI API Key not found. Please add it in Settings > Integrations.");
      setIsLoading(false);
      return;
    }
    
    try {
      const generateResponse = await fetch('https://api.tripo3d.ai/v2/fast_generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'text_to_model',
          prompt: promptToGenerate,
        }),
      });

      if (!generateResponse.ok) throw new Error(`Failed to start generation task (Status: ${generateResponse.status}). Please check your API key.`);
      const generateData = await generateResponse.json();
      const taskId = generateData.data.task_id;

      setLoadingStatus('Generating model... this may take a minute.');

      pollingInterval.current = window.setInterval(async () => {
        const statusResponse = await fetch(`https://api.tripo3d.ai/v2/tasks/${taskId}`, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (!statusResponse.ok) {
            clearInterval(pollingInterval.current!);
            setError("Failed to get task status. The generation may have failed.");
            setIsLoading(false);
            return;
        }
        const statusData = await statusResponse.json();

        if (statusData.data.status === 'success') {
          clearInterval(pollingInterval.current!);
          const url = statusData.data.result.output.model_url;
          setModelUrl(url);
          setGeneratedCode(createHtmlCode(url, promptToGenerate));
          setIsLoading(false);
          setLoadingStatus('Finished!');
        } else if (statusData.data.status === 'failed') {
          clearInterval(pollingInterval.current!);
          setError(statusData.data.error_message || "Model generation failed.");
          setIsLoading(false);
        }
      }, 5000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate model: ${errorMessage}. Please verify your Tripo AI key in Settings and check your network connection.`);
      setIsLoading(false);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    }
  };

  const createHtmlCode = (url: string, prompt: string) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Model Viewer: ${prompt}</title>
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
  <style>
    body { margin: 0; font-family: sans-serif; background-color: #111; color: white; }
    model-viewer { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <model-viewer 
    src="${url}" 
    alt="${prompt}" 
    ar 
    auto-rotate 
    camera-controls
    shadow-intensity="1"
    exposure="1.2">
  </model-viewer>
</body>
</html>`;
  };

  const handleModificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modificationPrompt.trim()) {
      generateModel(`${currentPrompt}, ${modificationPrompt.trim()}`);
      setModificationPrompt('');
    }
  };

  const handleDownload = () => {
    if (modelUrl) {
      const a = document.createElement('a');
      a.href = modelUrl;
      a.download = `${currentPrompt.replace(/[^a-zA-Z0-9]/g, '_')}.glb`;
      a.click();
    }
  };

  const handleCopy = () => {
    if (modelUrl) {
        const embedCode = `<model-viewer src="${modelUrl}" alt="${currentPrompt}" ar auto-rotate camera-controls></model-viewer>`;
        navigator.clipboard.writeText(embedCode).then(() => {
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
        <button onClick={handleDownload} disabled={!modelUrl} className="px-4 py-2 bg-white text-black font-semibold rounded-full text-sm hover:bg-gray-200 transition-colors disabled:bg-gray-500 disabled:text-gray-800 flex items-center gap-2"><DownloadIcon className="w-4 h-4"/>Download</button>
        <button onClick={handleCopy} disabled={!modelUrl} className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-full text-sm hover:bg-slate-600 transition-colors disabled:bg-slate-800 disabled:text-slate-500 flex items-center gap-2"><CopyIcon className="w-4 h-4"/>{copyText}</button>
      </div>

      <main className="flex-grow relative grid-background overflow-hidden">
        {view === 'preview' ? (
          <div className="w-full h-full flex items-center justify-center model-container">
            {isLoading && (
              <div className="text-center text-white max-w-md mx-auto p-4">
                 <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin mx-auto mb-4"></div>
                 <p className="font-semibold text-lg">{loadingStatus}</p>
                 <p className="text-sm text-slate-400 mt-2">
                    AI is generating the 3D model for: <br/>
                    <span className="italic text-slate-300">"{currentPrompt}"</span>
                 </p>
              </div>
            )}
            {error && <p className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</p>}
            {modelUrl && !isLoading && (
              <model-viewer
                src={modelUrl}
                alt={currentPrompt}
                ar
                auto-rotate
                camera-controls
                shadow-intensity="1.5"
                exposure="1"
                environment-image="neutral"
              />
            )}
          </div>
        ) : (
            <div className="h-full overflow-auto bg-slate-900">
                <pre className="text-sm h-full"><code ref={codeRef} className="language-html">{generatedCode || "<!-- Code will appear here once the model is generated -->"}</code></pre>
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
            disabled={isLoading || !modelUrl}
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
            perspective: 800px;
        }
        .model-container {
            transform: rotateX(45deg);
            transform-style: preserve-3d;
        }
        model-viewer {
            width: 100%;
            height: 100%;
            transform: translateY(-10%);
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

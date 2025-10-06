import React, { useState, useEffect } from 'react';
import PromptInput from '../components/PromptInput';
import CodeViewer from '../components/CodeViewer';
import Preview from '../components/Preview';
import ChatHistory from '../components/ChatHistory';
import ViewSwitcher from '../components/ViewSwitcher';
import { AppFile } from '../types';
import { generateAppCode } from '../services/geminiService';

interface BuilderPageProps {
  initialPrompt: string;
}

const BuilderPage: React.FC<BuilderPageProps> = ({ initialPrompt }) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [files, setFiles] = useState<AppFile[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rightPaneView, setRightPaneView] = useState<'code' | 'preview'>('preview');

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    // Move view to preview on new generation
    setRightPaneView('preview');

    try {
      const { files: generatedFiles, previewHtml: generatedHtml } = await generateAppCode(prompt);
      setFiles(generatedFiles);
      setPreviewHtml(generatedHtml);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialPrompt) {
      handleGenerate();
    }
    // This effect should only run once when the component mounts with an initial prompt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  return (
    <div className="h-screen w-screen bg-black text-white flex pl-20">
      {/* Left Pane: Chat and Prompt */}
      <div className="flex flex-col w-full lg:w-1/2 h-full border-r border-slate-800">
        <div className="flex-grow flex flex-col overflow-hidden">
            <ChatHistory prompt={prompt} isLoading={isLoading} error={error} />
        </div>
        <div className="flex-shrink-0">
            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={handleGenerate}
              isLoading={isLoading}
            />
        </div>
      </div>

      {/* Right Pane: Code and Preview */}
      <div className="hidden lg:flex flex-col w-1/2 h-full">
         <ViewSwitcher activeView={rightPaneView} setActiveView={setRightPaneView} />
         <div className="flex-grow p-4 pt-0 overflow-hidden">
            {rightPaneView === 'code' ? (
                <CodeViewer files={files} />
            ) : (
                <Preview htmlContent={previewHtml} hasFiles={files.length > 0} />
            )}
         </div>
      </div>
    </div>
  );
};

export default BuilderPage;

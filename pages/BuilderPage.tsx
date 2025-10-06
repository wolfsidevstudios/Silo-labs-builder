import React, { useState, useEffect } from 'react';
import PromptInput from '../components/PromptInput';
import CodeViewer from '../components/CodeViewer';
import Preview from '../components/Preview';
import ChatHistory from '../components/ChatHistory';
import ViewSwitcher from '../components/ViewSwitcher';
import { AppFile, SavedProject } from '../types';
import { generateAppCode } from '../services/geminiService';
import { saveProject } from '../services/projectService';

interface BuilderPageProps {
  initialPrompt?: string;
  initialProject?: SavedProject | null;
}

const BuilderPage: React.FC<BuilderPageProps> = ({ initialPrompt = '', initialProject = null }) => {
  const [prompt, setPrompt] = useState<string>(initialProject?.prompt || initialPrompt);
  const [files, setFiles] = useState<AppFile[]>(initialProject?.files || []);
  const [summary, setSummary] = useState<string[]>(initialProject?.summary || []);
  const [previewHtml, setPreviewHtml] = useState<string>(initialProject?.previewHtml || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rightPaneView, setRightPaneView] = useState<'code' | 'preview'>('preview');

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setFiles([]);
    setSummary([]);
    // Move view to preview on new generation
    setRightPaneView('preview');

    try {
      const result = await generateAppCode(prompt);
      setFiles(result.files);
      setPreviewHtml(result.previewHtml);
      setSummary(result.summary);
      
      // Auto-save the successfully generated project
      saveProject({ prompt, ...result });

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
    // Auto-generate only if coming from home page with a prompt,
    // not when loading an existing project.
    if (initialPrompt && !initialProject) {
      handleGenerate();
    }
    // This effect should only run once when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, initialProject]);

  return (
    <div className="h-screen w-screen bg-black text-white flex pl-20">
      {/* Left Pane: Chat and Prompt */}
      <div className="flex flex-col w-full lg:w-1/2 h-full border-r border-slate-800">
        <div className="flex-grow flex flex-col overflow-hidden">
            <ChatHistory
              prompt={prompt}
              isLoading={isLoading}
              error={error}
              summary={summary}
              files={files}
            />
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

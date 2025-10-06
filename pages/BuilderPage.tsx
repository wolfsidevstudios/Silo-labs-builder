import React, { useState, useEffect, useRef } from 'react';
import PromptInput from '../components/PromptInput';
import CodeViewer from '../components/CodeViewer';
import Preview from '../components/Preview';
import ChatHistory from '../components/ChatHistory';
import ViewSwitcher from '../components/ViewSwitcher';
import { AppFile, SavedProject, ChatMessage, UserMessage, AssistantMessage } from '../types';
import { generateOrUpdateAppCode } from '../services/geminiService';
import { saveProject } from '../services/projectService';

interface BuilderPageProps {
  initialPrompt?: string;
  initialProject?: SavedProject | null;
}

const BuilderPage: React.FC<BuilderPageProps> = ({ initialPrompt = '', initialProject = null }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rightPaneView, setRightPaneView] = useState<'code' | 'preview'>('preview');
  
  const isInitialGenerationDone = useRef(false);

  const latestAssistantMessage = chatHistory.slice().reverse().find(m => m.role === 'assistant') as AssistantMessage | undefined;
  const files = latestAssistantMessage?.content.files || [];
  const previewHtml = latestAssistantMessage?.content.previewHtml || '';

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const userPrompt = prompt.trim();
    if (!userPrompt || isLoading) return;

    setError(null);
    setIsLoading(true);

    const newUserMessage: UserMessage = { role: 'user', content: userPrompt };
    setChatHistory(prev => [...prev, newUserMessage]);
    setPrompt(''); // Clear input after sending
    
    setRightPaneView('preview');

    try {
      const currentFiles = files.length > 0 ? files : null;
      const result = await generateOrUpdateAppCode(userPrompt, currentFiles);
      
      const newAssistantMessage: AssistantMessage = { role: 'assistant', content: result };
      setChatHistory(prev => [...prev, newAssistantMessage]);
      
      const firstUserMessage = chatHistory.find(m => m.role === 'user') as UserMessage | undefined;
      const projectPrompt = firstUserMessage ? firstUserMessage.content : userPrompt;
      saveProject({ prompt: projectPrompt, ...result });

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
    if (initialProject) {
      const initialUserMessage: UserMessage = { role: 'user', content: initialProject.prompt };
      const initialAssistantMessage: AssistantMessage = {
        role: 'assistant',
        content: {
          files: initialProject.files,
          previewHtml: initialProject.previewHtml,
          summary: initialProject.summary,
        }
      };
      setChatHistory([initialUserMessage, initialAssistantMessage]);
      isInitialGenerationDone.current = true;
    } else if (initialPrompt) {
      setPrompt(initialPrompt);
    }
    // This effect should only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProject, initialPrompt]);
  
  useEffect(() => {
    // This effect triggers the initial generation if a prompt was passed from home.
    if (prompt && !isInitialGenerationDone.current && chatHistory.length === 0) {
        handleSendMessage();
        isInitialGenerationDone.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, chatHistory.length]);

  return (
    <div className="h-screen w-screen bg-black text-white flex pl-20">
      {/* Left Pane: Chat and Prompt */}
      <div className="flex flex-col w-full lg:w-2/5 h-full border-r border-slate-800">
        <div className="flex-grow flex flex-col overflow-hidden">
            <ChatHistory
              messages={chatHistory}
              isLoading={isLoading}
              error={error}
            />
        </div>
        <div className="flex-shrink-0">
            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={handleSendMessage}
              isLoading={isLoading}
            />
        </div>
      </div>

      {/* Right Pane: Code and Preview */}
      <div className="hidden lg:flex flex-col w-3/5 h-full">
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
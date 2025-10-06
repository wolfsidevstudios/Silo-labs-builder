import React, { useState, useEffect, useRef } from 'react';
import PromptInput from '../components/PromptInput';
import CodeViewer from '../components/CodeViewer';
import Preview from '../components/Preview';
import ChatHistory from '../components/ChatHistory';
import ViewSwitcher from '../components/ViewSwitcher';
import GitHubSaveModal from '../components/GitHubSaveModal';
import { AppFile, SavedProject, ChatMessage, UserMessage, AssistantMessage, GitHubUser } from '../types';
import { generateOrUpdateAppCode } from '../services/geminiService';
import { saveProject, updateProject } from '../services/projectService';
import { getPat, getUserInfo, createRepository, getRepoContent, createOrUpdateFile } from '../services/githubService';

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
  
  // GitHub State
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [currentProjectRepo, setCurrentProjectRepo] = useState<string | null>(null); // e.g., "owner/repo"
  const [lastSavedProjectId, setLastSavedProjectId] = useState<string | null>(null);
  
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
      const saved = saveProject({ prompt: projectPrompt, ...result });
      setLastSavedProjectId(saved.id);
      if (!currentProjectRepo && saved.githubUrl) {
        setCurrentProjectRepo(new URL(saved.githubUrl).pathname.substring(1));
      }

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
  
  const handleBoostUi = async () => {
    // Can't boost if already loading or if there's no app to boost
    if (isLoading || files.length === 0) return;

    const boostPrompt = "Dramatically improve the UI/UX of the current application. Make it look modern, professional, and visually stunning. Focus on layout, color scheme, typography, and interactivity.";

    setError(null);
    setIsLoading(true);

    const newUserMessage: UserMessage = { role: 'user', content: "✨ Boost UI" };
    setChatHistory(prev => [...prev, newUserMessage]);
    setPrompt('');
    setRightPaneView('preview');

    try {
      const result = await generateOrUpdateAppCode(boostPrompt, files);
      
      const newAssistantMessage: AssistantMessage = { role: 'assistant', content: result };
      setChatHistory(prev => [...prev, newAssistantMessage]);
      
      const firstUserMessage = chatHistory.find(m => m.role === 'user') as UserMessage | undefined;
      const projectPrompt = firstUserMessage ? firstUserMessage.content : "AI Generated App";
      const saved = saveProject({ prompt: projectPrompt, ...result });
      setLastSavedProjectId(saved.id);
       if (!currentProjectRepo && saved.githubUrl) {
        setCurrentProjectRepo(new URL(saved.githubUrl).pathname.substring(1));
      }

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
  
  const handleGitHubSave = async (details: { repoName?: string, description?: string, commitMessage: string }) => {
    const token = getPat();
    if (!token || !githubUser || files.length === 0) {
        setError("Cannot save to GitHub. Ensure you are connected and have generated an app.");
        return;
    }
    
    setIsLoading(true);
    let repoFullName = currentProjectRepo;

    try {
        // Step 1: Create repo if it doesn't exist
        if (!repoFullName && details.repoName) {
            const newRepo = await createRepository(token, details.repoName, details.description);
            repoFullName = newRepo.full_name;
            setCurrentProjectRepo(repoFullName);
            // Link it to the project in our DB
            if (lastSavedProjectId) {
                updateProject(lastSavedProjectId, { githubUrl: newRepo.html_url });
            }
        }
        
        if (!repoFullName) throw new Error("Repository not specified.");

        // Step 2: Push files
        const [owner, repo] = repoFullName.split('/');
        for (const file of files) {
            let sha: string | undefined = undefined;
            try {
                const existingFile = await getRepoContent(token, owner, repo, file.path);
                sha = existingFile.sha;
            } catch (error) {
                // File doesn't exist, which is fine for the first push.
                console.log(`File ${file.path} not found in repo, creating it.`);
            }
            await createOrUpdateFile(token, owner, repo, file.path, file.content, details.commitMessage, sha);
        }
    } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("An unknown error occurred while saving to GitHub.");
    } finally {
        setIsLoading(false);
        setIsGitHubModalOpen(false);
    }
  };

  useEffect(() => {
    const token = getPat();
    if (token) {
        getUserInfo(token).then(setGithubUser).catch(() => console.error("Invalid GitHub PAT"));
    }
    
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
      setLastSavedProjectId(initialProject.id);
      if(initialProject.githubUrl) {
          setCurrentProjectRepo(new URL(initialProject.githubUrl).pathname.substring(1));
      }
      isInitialGenerationDone.current = true;
    } else if (initialPrompt) {
      setPrompt(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProject, initialPrompt]);
  
  useEffect(() => {
    if (prompt && !isInitialGenerationDone.current && chatHistory.length === 0) {
        handleSendMessage();
        isInitialGenerationDone.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, chatHistory.length]);

  return (
    <div className="h-screen w-screen bg-black text-white flex pl-20">
      <GitHubSaveModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onSave={handleGitHubSave}
        isNewRepo={!currentProjectRepo}
      />
      <div className="flex flex-col w-full lg:w-2/5 h-full border-r border-slate-800">
        <div className="flex-grow flex flex-col overflow-hidden">
            <ChatHistory messages={chatHistory} isLoading={isLoading} error={error} />
        </div>
        <div className="flex-shrink-0">
            <PromptInput prompt={prompt} setPrompt={setPrompt} onSubmit={handleSendMessage} onBoostUi={handleBoostUi} isLoading={isLoading} />
        </div>
      </div>
      <div className="hidden lg:flex flex-col w-3/5 h-full">
         <ViewSwitcher 
            activeView={rightPaneView} 
            setActiveView={setRightPaneView}
            isGitHubConnected={!!githubUser}
            onGitHubClick={() => setIsGitHubModalOpen(true)}
            hasFiles={files.length > 0}
         />
         <div className="flex-grow p-4 pt-0 overflow-hidden">
            {rightPaneView === 'code' ? (
                <CodeViewer files={files} />
            ) : (
                <Preview htmlContent={previewHtml} hasFiles={files.length > 0} isLoading={isLoading} />
            )}
         </div>
      </div>
    </div>
  );
};

export default BuilderPage;

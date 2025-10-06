import React, { useState, useEffect, useRef } from 'react';
import PromptInput from '../components/PromptInput';
import CodeViewer from '../components/CodeViewer';
import Preview from '../components/Preview';
import ChatHistory from '../components/ChatHistory';
import ViewSwitcher from '../components/ViewSwitcher';
import GitHubSaveModal from '../components/GitHubSaveModal';
import DeployModal from '../components/DeployModal';
import VisualEditBar from '../components/VisualEditBar';
import { AppFile, SavedProject, ChatMessage, UserMessage, AssistantMessage, GitHubUser, GeminiResponse } from '../types';
import { generateOrUpdateAppCode, streamGenerateOrUpdateAppCode } from '../services/geminiService';
import { saveProject, updateProject } from '../services/projectService';
import { getPat as getGitHubPat, getUserInfo as getGitHubUserInfo, createRepository, getRepoContent, createOrUpdateFile } from '../services/githubService';
import { getPat as getNetlifyPat, createSite, deployToNetlify } from '../services/netlifyService';

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
  
  // Experimental Features State
  const [streamingPreviewHtml, setStreamingPreviewHtml] = useState<string | null>(null);
  
  // Visual Edit Mode State
  const [isVisualEditMode, setIsVisualEditMode] = useState(false);
  const [selectedElementSelector, setSelectedElementSelector] = useState<string | null>(null);
  
  // GitHub State
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [currentProjectRepo, setCurrentProjectRepo] = useState<string | null>(null);
  
  // Netlify State
  const [isNetlifyConnected, setIsNetlifyConnected] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [currentNetlifySiteId, setCurrentNetlifySiteId] = useState<string | null>(null);
  const [currentNetlifyUrl, setCurrentNetlifyUrl] = useState<string | null>(null);

  const [lastSavedProjectId, setLastSavedProjectId] = useState<string | null>(null);
  
  const isInitialGenerationDone = useRef(false);

  const latestAssistantMessage = chatHistory.slice().reverse().find(m => m.role === 'assistant') as AssistantMessage | undefined;
  const files = latestAssistantMessage?.content.files || [];
  const previewHtml = latestAssistantMessage?.content.previewHtml || '';
  
  const handleSubmit = async (promptToSubmit: string, options: { isBoost?: boolean; visualEditTarget?: { selector: string } } = {}) => {
      if (!promptToSubmit || isLoading) return;

      setError(null);
      setIsLoading(true);
      setRightPaneView('preview');

      let userMessageContent = promptToSubmit;
      if (options.isBoost) userMessageContent = "✨ Boost UI";
      if (options.visualEditTarget) userMessageContent = `Edited element ("${options.visualEditTarget.selector}"): "${promptToSubmit}"`;
      
      const newUserMessage: UserMessage = { role: 'user', content: userMessageContent };
      setChatHistory(prev => [...prev, newUserMessage]);
      setPrompt('');
      if (options.visualEditTarget) {
        setSelectedElementSelector(null);
        setIsVisualEditMode(false);
      }

      const currentFiles = files.length > 0 ? files : null;
      const useLivePreview = localStorage.getItem('experimental_live_preview') === 'true';

      try {
          let result: GeminiResponse;

          if (useLivePreview) {
              setStreamingPreviewHtml(''); // Start with a blank slate for the stream
              const stream = streamGenerateOrUpdateAppCode(promptToSubmit, currentFiles, options.visualEditTarget);
              let finalResponse: GeminiResponse | null = null;
              for await (const update of stream) {
                  if (update.previewHtml) setStreamingPreviewHtml(update.previewHtml);
                  if (update.finalResponse) finalResponse = update.finalResponse;
                  if (update.error) throw new Error(update.error);
              }
              if (!finalResponse) throw new Error("Stream finished without a valid result.");
              result = finalResponse;
          } else {
              result = await generateOrUpdateAppCode(promptToSubmit, currentFiles, options.visualEditTarget);
          }

          // Process the final result
          const newAssistantMessage: AssistantMessage = { role: 'assistant', content: result };
          setChatHistory(prev => [...prev, newAssistantMessage]);

          if (lastSavedProjectId) {
              updateProject(lastSavedProjectId, { ...result });
          } else {
              const firstUserMessage = chatHistory.find(m => m.role === 'user') as UserMessage | undefined;
              const projectPrompt = firstUserMessage ? firstUserMessage.content : userMessageContent;
              const saved = saveProject({ prompt: projectPrompt, ...result });
              setLastSavedProjectId(saved.id);
          }
          // Preserve deployment/repo info
          if (lastSavedProjectId) {
            if (currentNetlifySiteId) updateProject(lastSavedProjectId, { netlifySiteId: currentNetlifySiteId, netlifyUrl: currentNetlifyUrl });
            if (currentProjectRepo) updateProject(lastSavedProjectId, { githubUrl: `https://github.com/${currentProjectRepo}`});
          }

      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
          setError(errorMessage);
          setChatHistory(prev => prev.slice(0, -1)); // Remove the user message on failure
      } finally {
          setIsLoading(false);
          setStreamingPreviewHtml(null); // Clear streaming preview on completion
      }
  };


  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(prompt.trim());
  };

  const handleVisualEditSubmit = (editPrompt: string) => {
    if (selectedElementSelector) {
        handleSubmit(editPrompt, { visualEditTarget: { selector: selectedElementSelector } });
    }
  };
  
  const handleBoostUi = () => {
    if (files.length > 0) {
        const boostPrompt = "Dramatically improve the UI/UX of the current application. Make it look modern, professional, and visually stunning. Focus on layout, color scheme, typography, and interactivity.";
        handleSubmit(boostPrompt, { isBoost: true });
    }
  };
  
  const handleGitHubSave = async (details: { repoName?: string, description?: string, commitMessage: string }) => {
    const token = getGitHubPat();
    if (!token || !githubUser || files.length === 0) {
        setError("Cannot save to GitHub. Ensure you are connected and have generated an app."); return;
    }
    setIsLoading(true);
    let repoFullName = currentProjectRepo;
    try {
        if (!repoFullName && details.repoName) {
            const newRepo = await createRepository(token, details.repoName, details.description);
            repoFullName = newRepo.full_name;
            setCurrentProjectRepo(repoFullName);
            if (lastSavedProjectId) {
                updateProject(lastSavedProjectId, { githubUrl: newRepo.html_url });
            }
        }
        if (!repoFullName) throw new Error("Repository not specified.");
        const [owner, repo] = repoFullName.split('/');
        for (const file of files) {
            let sha: string | undefined = undefined;
            try {
                const existingFile = await getRepoContent(token, owner, repo, file.path);
                sha = existingFile.sha;
            } catch (error) { console.log(`File ${file.path} not found in repo, creating it.`); }
            await createOrUpdateFile(token, owner, repo, file.path, file.content, details.commitMessage, sha);
        }
    } catch (err) { if (err instanceof Error) setError(err.message); else setError("An unknown error occurred while saving to GitHub."); }
    finally { setIsLoading(false); setIsGitHubModalOpen(false); }
  };

  const handleDeploy = async () => {
      const token = getNetlifyPat();
      if (!token || files.length === 0) return;
      
      setDeployStatus('deploying');
      let siteId = currentNetlifySiteId;
      let siteUrl = currentNetlifyUrl;
      
      try {
          if (!siteId) {
              const newSite = await createSite(token);
              siteId = newSite.id;
              siteUrl = newSite.ssl_url; // Capture new URL
              setCurrentNetlifySiteId(siteId);
              setCurrentNetlifyUrl(siteUrl);
          }
          if (!siteId) throw new Error("Could not create or find a site to deploy to.");

          const deploy = await deployToNetlify(token, siteId, files);
          siteUrl = deploy.ssl_url; // This is the most up-to-date URL
          setCurrentNetlifyUrl(siteUrl);

          if(lastSavedProjectId) {
              // Update project with both ID and URL after every deploy/redeploy
              updateProject(lastSavedProjectId, { netlifySiteId: siteId, netlifyUrl: siteUrl });
          }
          setDeployStatus('success');

      } catch (err) {
          if (err instanceof Error) setError(err.message);
          else setError("An unknown deployment error occurred.");
          setDeployStatus('error');
      }
  };
  
  const handleDeployClick = () => {
    setDeployStatus('idle'); // Reset status
    setIsDeployModalOpen(true);
    // If it's a new deploy, trigger it immediately upon opening the modal.
    if (!currentNetlifySiteId) {
        handleDeploy();
    }
  };

  const toggleVisualEditMode = () => {
    const nextState = !isVisualEditMode;
    setIsVisualEditMode(nextState);
    if (!nextState) { // If turning off
        setSelectedElementSelector(null);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'VISUAL_EDIT_SELECT' && isVisualEditMode) {
            setSelectedElementSelector(event.data.selector);
            setRightPaneView('preview');
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isVisualEditMode]);


  useEffect(() => {
    const ghToken = getGitHubPat();
    if (ghToken) getGitHubUserInfo(ghToken).then(setGithubUser).catch(() => console.error("Invalid GitHub PAT"));
    
    const ntToken = getNetlifyPat();
    if (ntToken) setIsNetlifyConnected(true);

    if (initialProject) {
      const initialUserMessage: UserMessage = { role: 'user', content: initialProject.prompt };
      const initialAssistantMessage: AssistantMessage = { role: 'assistant', content: { files: initialProject.files, previewHtml: initialProject.previewHtml, summary: initialProject.summary } };
      setChatHistory([initialUserMessage, initialAssistantMessage]);
      setLastSavedProjectId(initialProject.id);
      if(initialProject.githubUrl) setCurrentProjectRepo(new URL(initialProject.githubUrl).pathname.substring(1));
      if(initialProject.netlifySiteId) setCurrentNetlifySiteId(initialProject.netlifySiteId);
      if(initialProject.netlifyUrl) setCurrentNetlifyUrl(initialProject.netlifyUrl);
      isInitialGenerationDone.current = true;
    } else if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialProject, initialPrompt]);
  
  useEffect(() => {
    if (prompt && !isInitialGenerationDone.current && chatHistory.length === 0) {
        handleSubmit(prompt);
        isInitialGenerationDone.current = true;
    }
  }, [prompt]);

  return (
    <div className="h-screen w-screen bg-black text-white flex pl-20">
      <GitHubSaveModal isOpen={isGitHubModalOpen} onClose={() => setIsGitHubModalOpen(false)} onSave={handleGitHubSave} isNewRepo={!currentProjectRepo} />
      <DeployModal isOpen={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} onDeploy={handleDeploy} status={deployStatus} siteUrl={currentNetlifyUrl} isNewDeploy={!currentNetlifySiteId} />
      <div className="flex flex-col w-full lg:w-2/5 h-full border-r border-slate-800">
        <div className="flex-grow flex flex-col overflow-hidden">
            <ChatHistory messages={chatHistory} isLoading={isLoading} error={error} />
        </div>
        <div className="flex-shrink-0">
            <PromptInput 
                prompt={prompt} 
                setPrompt={setPrompt} 
                onSubmit={handlePromptSubmit} 
                onBoostUi={handleBoostUi} 
                isLoading={isLoading}
                isVisualEditMode={isVisualEditMode}
                onToggleVisualEditMode={toggleVisualEditMode}
            />
        </div>
      </div>
      <div className="hidden lg:flex flex-col w-3/5 h-full relative">
         <ViewSwitcher 
            activeView={rightPaneView} 
            setActiveView={setRightPaneView}
            isGitHubConnected={!!githubUser}
            onGitHubClick={() => setIsGitHubModalOpen(true)}
            isNetlifyConnected={isNetlifyConnected}
            onDeployClick={handleDeployClick}
            isDeployed={!!currentNetlifySiteId}
            hasFiles={files.length > 0}
         />
         <div className="flex-grow p-4 pt-0 overflow-hidden">
            {rightPaneView === 'code' ? (
                <CodeViewer files={files} />
            ) : (
                <Preview 
                    htmlContent={previewHtml} 
                    streamingPreviewHtml={streamingPreviewHtml}
                    hasFiles={files.length > 0} 
                    isLoading={isLoading}
                    isVisualEditMode={isVisualEditMode && !selectedElementSelector}
                />
            )}
         </div>
         {selectedElementSelector && (
            <VisualEditBar
                selector={selectedElementSelector}
                onSubmit={handleVisualEditSubmit}
                onCancel={() => setSelectedElementSelector(null)}
                isLoading={isLoading}
            />
         )}
      </div>
    </div>
  );
};

export default BuilderPage;
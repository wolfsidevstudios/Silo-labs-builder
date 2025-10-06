import React, { useState, useEffect, useRef } from 'react';
import PromptInput from '../components/PromptInput';
import CodeViewer from '../components/CodeViewer';
import Preview from '../components/Preview';
import ChatHistory from '../components/ChatHistory';
import ViewSwitcher from '../components/ViewSwitcher';
import GitHubSaveModal from '../components/GitHubSaveModal';
import DeployModal from '../components/DeployModal';
import { AppFile, SavedProject, ChatMessage, UserMessage, AssistantMessage, GitHubUser } from '../types';
import { generateOrUpdateAppCode } from '../services/geminiService';
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

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const userPrompt = prompt.trim();
    if (!userPrompt || isLoading) return;

    setError(null);
    setIsLoading(true);

    const newUserMessage: UserMessage = { role: 'user', content: userPrompt };
    setChatHistory(prev => [...prev, newUserMessage]);
    setPrompt('');
    
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

      // Preserve deployment info across AI updates
      if (currentNetlifySiteId) updateProject(saved.id, { netlifySiteId: currentNetlifySiteId });
      if (currentProjectRepo) updateProject(saved.id, { githubUrl: `https://github.com/${currentProjectRepo}`});

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
      
      if (currentNetlifySiteId) updateProject(saved.id, { netlifySiteId: currentNetlifySiteId });
      if (currentProjectRepo) updateProject(saved.id, { githubUrl: `https://github.com/${currentProjectRepo}`});
    } catch (err) { if (err instanceof Error) setError(err.message); else setError("An unexpected error occurred."); }
    finally { setIsLoading(false); }
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
      
      try {
          if (!siteId) {
              const newSite = await createSite(token);
              siteId = newSite.id;
              setCurrentNetlifySiteId(siteId);
              setCurrentNetlifyUrl(newSite.ssl_url);
              if(lastSavedProjectId) {
                  updateProject(lastSavedProjectId, { netlifySiteId: siteId });
              }
          }
          if (!siteId) throw new Error("Could not create or find a site to deploy to.");

          const deploy = await deployToNetlify(token, siteId, files);
          setCurrentNetlifyUrl(deploy.ssl_url); // Update URL in case it changed (it shouldn't)
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
      isInitialGenerationDone.current = true;
    } else if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialProject, initialPrompt]);
  
  useEffect(() => {
    if (prompt && !isInitialGenerationDone.current && chatHistory.length === 0) {
        handleSendMessage();
        isInitialGenerationDone.current = true;
    }
  }, [prompt, chatHistory.length]);

  return (
    <div className="h-screen w-screen bg-black text-white flex pl-20">
      <GitHubSaveModal isOpen={isGitHubModalOpen} onClose={() => setIsGitHubModalOpen(false)} onSave={handleGitHubSave} isNewRepo={!currentProjectRepo} />
      <DeployModal isOpen={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} onDeploy={handleDeploy} status={deployStatus} siteUrl={currentNetlifyUrl} isNewDeploy={!currentNetlifySiteId} />
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
            isNetlifyConnected={isNetlifyConnected}
            onDeployClick={handleDeployClick}
            isDeployed={!!currentNetlifySiteId}
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
import React, { useState, useEffect, useRef } from 'react';
import PromptInput from '../components/PromptInput';
import CodeViewer from '../components/CodeViewer';
import Preview from '../components/Preview';
import ChatHistory from '../components/ChatHistory';
import ViewSwitcher from '../components/ViewSwitcher';
import GitHubSaveModal from '../components/GitHubSaveModal';
import DeployModal from '../components/DeployModal';
import VisualEditBar from '../components/VisualEditBar';
import ImageLibraryModal from '../components/ImageLibraryModal';
import GiphySearchModal from '../components/GiphySearchModal';
import TrialCountdownBar from '../components/TrialCountdownBar';
import { AppFile, SavedProject, ChatMessage, UserMessage, AssistantMessage, GitHubUser, GeminiResponse, SavedImage, GiphyGif } from '../types';
import { generateOrUpdateAppCode, streamGenerateOrUpdateAppCode } from '../services/geminiService';
import { saveProject, updateProject } from '../services/projectService';
import { getPat as getGitHubPat, getUserInfo as getGitHubUserInfo, createRepository, getRepoContent, createOrUpdateFile } from '../services/githubService';
import { getPat as getNetlifyPat, createSite, deployToNetlify } from '../services/netlifyService';
import { getApiKey as getGiphyKey } from '../services/giphyService';
import { saveImage } from '../services/imageService';

interface BuilderPageProps {
  initialPrompt?: string;
  initialProject?: SavedProject | null;
  isTrialActive: boolean;
  trialEndTime: number | null;
}

interface UploadedImageState {
    data: string; // base64 string without data URL prefix
    mimeType: string;
    previewUrl: string; // data URL for preview
}

const BuilderPage: React.FC<BuilderPageProps> = ({ initialPrompt = '', initialProject = null, isTrialActive, trialEndTime }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rightPaneView, setRightPaneView] = useState<'code' | 'preview'>('preview');
  
  // Experimental Features State
  const [streamingPreviewHtml, setStreamingPreviewHtml] = useState<string | null>(null);

  // Image Upload State
  const [uploadedImages, setUploadedImages] = useState<UploadedImageState[]>([]);
  const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);
  
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

  // Giphy State
  const [isGiphyConnected, setIsGiphyConnected] = useState(false);
  const [isGiphyModalOpen, setIsGiphyModalOpen] = useState(false);

  const [lastSavedProjectId, setLastSavedProjectId] = useState<string | null>(null);
  
  const isInitialGenerationDone = useRef(false);

  const latestAssistantMessage = chatHistory.slice().reverse().find(m => m.role === 'assistant' && !m.isGenerating) as AssistantMessage | undefined;
  const files = latestAssistantMessage?.content.files || [];
  const previewHtml = latestAssistantMessage?.content.previewHtml || '';

  const handleImagesUpload = (files: FileList) => {
    const filesToProcess = Array.from(files);
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const [header, base64Data] = dataUrl.split(',');
          const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
          
          // Add to local UI state for prompt
          setUploadedImages(prev => [...prev, {
              data: base64Data,
              mimeType: mimeType,
              previewUrl: dataUrl
          }]);
          
          // Also save to global image library for reuse
          saveImage({ data: base64Data, mimeType });
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleSelectFromLibrary = (images: SavedImage[]) => {
    const newImages: UploadedImageState[] = images.map(img => ({
        data: img.data,
        mimeType: img.mimeType,
        previewUrl: `data:${img.mimeType};base64,${img.data}`
    }));
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const handleImageRemove = (indexToRemove: number) => {
      setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleSelectGif = async (gif: GiphyGif) => {
    setIsGiphyModalOpen(false);
    setError(null);
    try {
        const response = await fetch(gif.images.original.url);
        if (!response.ok) throw new Error("Failed to fetch GIF data.");

        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const [header, base64Data] = dataUrl.split(',');
            
            setUploadedImages(prev => [...prev, {
                data: base64Data,
                mimeType: 'image/gif',
                previewUrl: dataUrl
            }]);
        };
        reader.onerror = () => { throw new Error("Failed to read GIF data."); };
        reader.readAsDataURL(blob);

    } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while adding the GIF.");
    }
  };

  const handleSubmit = async (promptToSubmit: string, options: { isBoost?: boolean; visualEditTarget?: { selector: string } } = {}) => {
      if ((!promptToSubmit && uploadedImages.length === 0) || isLoading) return;

      setError(null);
      setIsLoading(true);
      setRightPaneView('preview');
      setStreamingPreviewHtml('');

      let userMessageContent = promptToSubmit;
      if (options.isBoost) userMessageContent = "✨ Boost UI";
      if (options.visualEditTarget) userMessageContent = `Edited element ("${options.visualEditTarget.selector}"): "${promptToSubmit}"`;
      
      const imagesToSubmit = uploadedImages;
      const newUserMessage: UserMessage = { 
        id: `user-${Date.now()}`,
        role: 'user', 
        content: userMessageContent,
        imagePreviewUrls: imagesToSubmit.map(img => img.previewUrl),
      };
      setPrompt('');
      setUploadedImages([]);

      if (options.visualEditTarget) {
        setSelectedElementSelector(null);
        setIsVisualEditMode(false);
      }

      const tempAssistantId = `assistant-${Date.now()}`;
      const placeholderAssistantMessage: AssistantMessage = {
          id: tempAssistantId,
          role: 'assistant',
          content: {
              summary: ['Thinking...'],
          },
          isGenerating: true,
      };

      setChatHistory(prev => [...prev, newUserMessage, placeholderAssistantMessage]);

      const currentFiles = files.length > 0 ? files : null;
      const useLivePreview = localStorage.getItem('experimental_live_preview') === 'true';

      try {
          const stream = streamGenerateOrUpdateAppCode(promptToSubmit, currentFiles, options.visualEditTarget, imagesToSubmit);
          let finalResponse: GeminiResponse | null = null;
          
          for await (const update of stream) {
              if (update.error) throw new Error(update.error);
              if (update.finalResponse) {
                  finalResponse = update.finalResponse;
                  break;
              }

              setChatHistory(prev => prev.map(msg => {
                  if (msg.id === tempAssistantId && msg.role === 'assistant') {
                      return {
                          ...msg,
                          content: {
                              summary: update.summary || msg.content.summary,
                              files: update.files || msg.content.files,
                          }
                      };
                  }
                  return msg;
              }));

              if (useLivePreview && update.previewHtml) {
                  setStreamingPreviewHtml(update.previewHtml);
              }
          }
          
          if (!finalResponse) throw new Error("Stream finished without a valid result.");
          
          const finalAssistantMessage: AssistantMessage = {
              id: tempAssistantId,
              role: 'assistant',
              content: finalResponse,
              isGenerating: false,
          };

          setChatHistory(prev => prev.map(msg => msg.id === tempAssistantId ? finalAssistantMessage : msg));

          if (lastSavedProjectId) {
              updateProject(lastSavedProjectId, { ...finalResponse });
          } else {
              const firstUserMessage = chatHistory.find(m => m.role === 'user') as UserMessage | undefined;
              const projectPrompt = firstUserMessage ? firstUserMessage.content : userMessageContent;
              const saved = saveProject({ prompt: projectPrompt, ...finalResponse });
              setLastSavedProjectId(saved.id);
          }
          if (lastSavedProjectId) {
            if (currentNetlifySiteId) updateProject(lastSavedProjectId, { netlifySiteId: currentNetlifySiteId, netlifyUrl: currentNetlifyUrl });
            if (currentProjectRepo) updateProject(lastSavedProjectId, { githubUrl: `https://github.com/${currentProjectRepo}`});
          }

      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
          setError(errorMessage);
          setChatHistory(prev => prev.filter(msg => msg.id !== tempAssistantId && msg.id !== newUserMessage.id));
      } finally {
          setIsLoading(false);
          setStreamingPreviewHtml(null);
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

    const gphKey = getGiphyKey();
    if (gphKey) setIsGiphyConnected(true);

    if (initialProject) {
      const initialUserMessage: UserMessage = { id: `user-${initialProject.id}`, role: 'user', content: initialProject.prompt };
      const initialAssistantMessage: AssistantMessage = { id: `assistant-${initialProject.id}`, role: 'assistant', content: { files: initialProject.files, previewHtml: initialProject.previewHtml, summary: initialProject.summary } };
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
      <ImageLibraryModal isOpen={isImageLibraryOpen} onClose={() => setIsImageLibraryOpen(false)} onSelectImages={handleSelectFromLibrary} />
      <GiphySearchModal isOpen={isGiphyModalOpen} onClose={() => setIsGiphyModalOpen(false)} onSelectGif={handleSelectGif} />
      <div className="flex flex-col w-full lg:w-2/5 h-full border-r border-slate-800">
        {isTrialActive && trialEndTime && (
            <div className="p-4 border-b border-slate-800">
                <TrialCountdownBar endTime={trialEndTime} isInline={true} />
            </div>
        )}
        <div className="flex-grow flex flex-col overflow-hidden">
            <ChatHistory messages={chatHistory} error={error} />
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
                uploadedImages={uploadedImages}
                onImagesUpload={handleImagesUpload}
                onImageRemove={handleImageRemove}
                onOpenImageLibrary={() => setIsImageLibraryOpen(true)}
                isGiphyConnected={isGiphyConnected}
                onAddGifClick={() => setIsGiphyModalOpen(true)}
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
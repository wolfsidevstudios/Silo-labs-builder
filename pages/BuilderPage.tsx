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
import UnsplashSearchModal from '../components/UnsplashSearchModal';
import YouTubeSearchModal from '../components/YouTubeSearchModal';
import ProjectTabs from '../components/ProjectTabs';
import QuotaErrorModal from '../components/QuotaErrorModal';
import ProjectSettingsModal from '../components/ProjectSettingsModal';
import { AppFile, SavedProject, ChatMessage, UserMessage, AssistantMessage, GitHubUser, GeminiResponse, SavedImage, GiphyGif, UnsplashPhoto, Secret, GeminiModelId, MaxIssue } from '../types';
import { generateOrUpdateAppCode, streamGenerateOrUpdateAppCode, analyzeAppCode } from '../services/geminiService';
import { saveProject, updateProject } from '../services/projectService';
import { getPat as getGitHubPat, getUserInfo as getGitHubUserInfo, createRepository, getRepoContent, createOrUpdateFile } from '../services/githubService';
import { getPat as getNetlifyPat, createSite, deployToNetlify } from '../services/netlifyService';
import { getApiKey as getGiphyKey } from '../services/giphyService';
import { getAccessKey as getUnsplashKey } from '../services/unsplashService';
import { getApiKey as getYouTubeKey } from '../services/youtubeService';
import { getApiKey as getPexelsKey } from '../services/pexelsService';
import { getApiKey as getFreeSoundKey } from '../services/freesoundService';
import { saveImage } from '../services/imageService';
import { getUserId } from '../services/firebaseService';

interface BuilderPageProps {
  initialPrompt?: string;
  initialProject?: SavedProject | null;
  isPro: boolean;
}

interface UploadedImageState {
    data: string; // base64 string without data URL prefix
    mimeType: string;
    previewUrl: string; // data URL for preview
}

interface ProjectTab {
    id: string;
    chatHistory: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    lastSavedProjectId: string | null;
    currentProjectRepo: string | null;
    currentNetlifySiteId: string | null;
    currentNetlifyUrl: string | null;
    prompt: string;
    uploadedImages: UploadedImageState[];
    isVisualEditMode: boolean;
    selectedElementSelector: string | null;
    streamingPreviewHtml: string | null;
    isMaxAgentRunning: boolean;
    agentTargets: { id: number; top: number; left: number; width: number; height: number; tagName: string; text: string; }[];
    // Settings
    name: string;
    description?: string;
    iconUrl?: string;
    thumbnailUrl?: string;
    model: GeminiModelId;
    secrets: Secret[];
}

const createNewTab = (name: string, prompt: string = '', project: SavedProject | null = null): ProjectTab => {
    const id = `tab-${Date.now()}`;
    let chatHistory: ChatMessage[] = [];
    if (project) {
        const initialUserMessage: UserMessage = { id: `user-${project.id}`, role: 'user', content: project.prompt };
        const initialAssistantMessage: AssistantMessage = { id: `assistant-${project.id}`, role: 'assistant', content: { files: project.files, previewHtml: project.previewHtml, summary: project.summary } };
        chatHistory = [initialUserMessage, initialAssistantMessage];
    }

    return {
        id,
        chatHistory,
        isLoading: false,
        error: null,
        lastSavedProjectId: project?.id || null,
        currentProjectRepo: project?.githubUrl ? new URL(project.githubUrl).pathname.substring(1) : null,
        currentNetlifySiteId: project?.netlifySiteId || null,
        currentNetlifyUrl: project?.netlifyUrl || null,
        prompt,
        uploadedImages: [],
        isVisualEditMode: false,
        selectedElementSelector: null,
        streamingPreviewHtml: null,
        isMaxAgentRunning: false,
        agentTargets: [],
        // Settings
        name: project?.name || name,
        description: project?.description,
        iconUrl: project?.iconUrl,
        thumbnailUrl: project?.thumbnailUrl,
        model: project?.model || 'gemini-2.5-flash',
        secrets: project?.secrets || [],
    };
};


const BuilderPage: React.FC<BuilderPageProps> = ({ initialPrompt = '', initialProject = null, isPro }) => {
  const [tabs, setTabs] = useState<ProjectTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  
  // Modals can be global as they are temporary UI states
  const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [isGiphyModalOpen, setIsGiphyModalOpen] = useState(false);
  const [isUnsplashModalOpen, setIsUnsplashModalOpen] = useState(false);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [isQuotaErrorModalOpen, setIsQuotaErrorModalOpen] = useState(false);

  // Connections can be global
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [isNetlifyConnected, setIsNetlifyConnected] = useState(false);
  const [isGiphyConnected, setIsGiphyConnected] = useState(false);
  const [isUnsplashConnected, setIsUnsplashConnected] = useState(false);
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
  const [isPexelsConnected, setIsPexelsConnected] = useState(false);
  const [isFreeSoundConnected, setIsFreeSoundConnected] = useState(false);

  const initialGenerationDone = useRef<Set<string>>(new Set());

  // --- Tab Management ---
  const activeTab = tabs.find(t => t.id === activeTabId);
  
  const updateActiveTab = (updates: Partial<ProjectTab>) => {
    if (!activeTabId) return;
    setTabs(prevTabs => prevTabs.map(tab =>
        tab.id === activeTabId ? { ...tab, ...updates } : tab
    ));
  };
  
  const handleAddNewTab = () => {
    const newTab = createNewTab(`Project ${tabs.length + 1}`);
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId: string) => {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    
    if (newTabs.length === 0) {
        const newTab = createNewTab('Project 1');
        setTabs([newTab]);
        setActiveTabId(newTab.id);
        return;
    }

    if (activeTabId === tabId) {
        const newActiveIndex = Math.max(0, tabIndex - 1);
        setActiveTabId(newTabs[newActiveIndex].id);
    }
    setTabs(newTabs);
  };
  
  const files = activeTab?.chatHistory.slice().reverse().find(m => m.role === 'assistant' && !m.isGenerating)?.content.files || [];
  const previewHtml = activeTab?.chatHistory.slice().reverse().find(m => m.role === 'assistant' && !m.isGenerating)?.content.previewHtml || '';

  const handleImagesUpload = (files: FileList) => {
    if (!activeTab) return;
    const filesToProcess = Array.from(files);
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const [header, base64Data] = dataUrl.split(',');
          const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
          
          updateActiveTab({ uploadedImages: [...activeTab.uploadedImages, { data: base64Data, mimeType: mimeType, previewUrl: dataUrl }] });
          saveImage({ data: base64Data, mimeType });
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleSelectFromLibrary = (images: SavedImage[]) => {
    if (!activeTab) return;
    const newImages: UploadedImageState[] = images.map(img => ({
        data: img.data,
        mimeType: img.mimeType,
        previewUrl: `data:${img.mimeType};base64,${img.data}`
    }));
    updateActiveTab({ uploadedImages: [...activeTab.uploadedImages, ...newImages] });
  };

  const handleImageRemove = (indexToRemove: number) => {
      if (!activeTab) return;
      updateActiveTab({ uploadedImages: activeTab.uploadedImages.filter((_, index) => index !== indexToRemove) });
  };
  
  const addMediaAsUploadedImage = async (url: string, mimeType: string) => {
      updateActiveTab({ error: null });
      try {
          // Note: Fetching from external URLs might be blocked by CORS in a browser environment.
          // A server-side proxy would be needed for a robust solution. We'll attempt a direct fetch.
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch media from ${url}. Status: ${response.status}`);
          const blob = await response.blob();
          
          const reader = new FileReader();
          reader.onloadend = () => {
              const dataUrl = reader.result as string;
              const [, base64Data] = dataUrl.split(',');
              updateActiveTab({ uploadedImages: [...(activeTab?.uploadedImages || []), {
                  data: base64Data,
                  mimeType: blob.type || mimeType,
                  previewUrl: dataUrl
              }]});
          };
          reader.onerror = () => { throw new Error("Failed to read media data."); };
          reader.readAsDataURL(blob);
      } catch (err) {
          console.error("CORS or network error fetching media:", err);
          const message = `Could not fetch media. This might be a CORS issue. Try downloading and uploading manually.`;
          updateActiveTab({ error: err instanceof Error ? `${message} Details: ${err.message}` : message });
      }
  };

  const handleSelectGif = (gif: GiphyGif) => { setIsGiphyModalOpen(false); addMediaAsUploadedImage(gif.images.original.url, 'image/gif'); };
  const handleSelectUnsplashPhoto = (photo: UnsplashPhoto) => { setIsUnsplashModalOpen(false); addMediaAsUploadedImage(photo.urls.regular, 'image/jpeg'); };
  const handleSelectYouTubeVideo = (videoId: string) => {
    if (!activeTab) return;
    const currentPrompt = activeTab.prompt;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const newPrompt = currentPrompt ? `${currentPrompt}\nIncorporate this YouTube video: ${videoUrl}` : `Incorporate this YouTube video: ${videoUrl}`;
    updateActiveTab({ prompt: newPrompt });
    setIsYouTubeModalOpen(false);
  };


  const handleSubmit = async (promptToSubmit: string, options: { isBoost?: boolean; visualEditTarget?: { selector: string } } = {}) => {
      if (!activeTab || (!promptToSubmit && activeTab.uploadedImages.length === 0) || activeTab.isLoading) return;

      updateActiveTab({ error: null, isLoading: true, streamingPreviewHtml: '' });
      setRightPaneView('preview');

      let userMessageContent = promptToSubmit;
      if (options.isBoost) userMessageContent = "✨ Boost UI";
      if (options.visualEditTarget) userMessageContent = `Edited element ("${options.visualEditTarget.selector}"): "${promptToSubmit}"`;
      
      const imagesToSubmit = activeTab.uploadedImages;
      const newUserMessage: UserMessage = { 
        id: `user-${Date.now()}`,
        role: 'user', 
        content: userMessageContent,
        imagePreviewUrls: imagesToSubmit.map(img => img.previewUrl),
      };

      if (options.visualEditTarget) {
        updateActiveTab({ prompt: '', uploadedImages: [], selectedElementSelector: null, isVisualEditMode: false });
      } else {
        updateActiveTab({ prompt: '', uploadedImages: [] });
      }

      const tempAssistantId = `assistant-${Date.now()}`;
      const placeholderAssistantMessage: AssistantMessage = {
          id: tempAssistantId,
          role: 'assistant',
          content: { summary: ['Thinking...'] },
          isGenerating: true,
      };

      const newChatHistory = [...activeTab.chatHistory, newUserMessage, placeholderAssistantMessage];
      updateActiveTab({ chatHistory: newChatHistory });
      
      const currentFiles = files.length > 0 ? files : null;
      
      const projectSettings = {
        model: activeTab.model,
        secrets: activeTab.secrets,
      };

      try {
          const stream = streamGenerateOrUpdateAppCode(promptToSubmit, currentFiles, options.visualEditTarget, imagesToSubmit, projectSettings);
          let finalResponse: GeminiResponse | null = null;
          
          for await (const update of stream) {
              if (update.error) throw new Error(update.error);
              if (update.finalResponse) {
                  finalResponse = update.finalResponse;
                  break;
              }

              setTabs(prevTabs => prevTabs.map(t => {
                if (t.id === activeTabId) {
                    const updatedChatHistory = t.chatHistory.map(msg => {
                        if (msg.id === tempAssistantId && msg.role === 'assistant') {
                            return { ...msg, content: { summary: update.summary || msg.content.summary, files: update.files || msg.content.files } };
                        }
                        return msg;
                    });
                    return { ...t, chatHistory: updatedChatHistory, streamingPreviewHtml: update.previewHtml || t.streamingPreviewHtml };
                }
                return t;
              }));
          }
          
          if (!finalResponse) throw new Error("Stream finished without a valid result.");
          
          const finalAssistantMessage: AssistantMessage = {
              id: tempAssistantId,
              role: 'assistant',
              content: finalResponse,
              isGenerating: false,
          };

          let finalProjectId = activeTab.lastSavedProjectId;
          const projectDataToSave = {
              prompt: (activeTab.chatHistory.find(m => m.role === 'user') as UserMessage)?.content || userMessageContent,
              name: activeTab.name,
              ...finalResponse
          };

          if (finalProjectId) {
              updateProject(finalProjectId, projectDataToSave);
          } else {
              const saved = saveProject(projectDataToSave);
              finalProjectId = saved.id;
          }

          setTabs(prevTabs => prevTabs.map(t => t.id === activeTabId ? {
              ...t,
              chatHistory: t.chatHistory.map(msg => msg.id === tempAssistantId ? finalAssistantMessage : msg),
              lastSavedProjectId: finalProjectId,
          } : t));

          // Send a push notification if the tab is not active
          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('Silo Build: App Ready!', {
                  body: "Your new app has been generated successfully. Come check it out!",
                  icon: 'https://i.ibb.co/DgYbPJ9z/IMG-3953.png', // App's favicon
              });
          }

      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
          if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
              setIsQuotaErrorModalOpen(true);
              setTabs(prevTabs => prevTabs.map(t => t.id === activeTabId ? {
                  ...t,
                  chatHistory: t.chatHistory.filter(msg => msg.id !== tempAssistantId && msg.id !== newUserMessage.id)
              } : t));
          } else {
            setTabs(prevTabs => prevTabs.map(t => t.id === activeTabId ? {
                ...t,
                error: errorMessage,
                chatHistory: t.chatHistory.filter(msg => msg.id !== tempAssistantId && msg.id !== newUserMessage.id)
            } : t));
          }
      } finally {
          updateActiveTab({ isLoading: false, streamingPreviewHtml: null });
      }
  };


  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab) handleSubmit(activeTab.prompt.trim());
  };

  const handleVisualEditSubmit = (editPrompt: string) => {
    if (activeTab?.selectedElementSelector) {
        handleSubmit(editPrompt, { visualEditTarget: { selector: activeTab.selectedElementSelector } });
    }
  };
  
  const handleBoostUi = () => {
    if (files.length > 0) {
        const boostPrompt = "Dramatically improve the UI/UX of the current application. Make it look modern, professional, and visually stunning. Focus on layout, color scheme, typography, and interactivity.";
        handleSubmit(boostPrompt, { isBoost: true });
    }
  };

  const handleStartMaxAgent = async () => {
    if (!activeTab || files.length === 0 || activeTab.isLoading || activeTab.isMaxAgentRunning) return;
  
    updateActiveTab({ isLoading: true, isMaxAgentRunning: true, error: null, agentTargets: [] });
  
    const tempAssistantId = `assistant-max-${Date.now()}`;
  
    const thinkingMessage: AssistantMessage = {
      id: tempAssistantId,
      role: 'assistant',
      content: { summary: ["MAX is analyzing your app..."] },
      isGenerating: true,
    };
  
    updateActiveTab({ chatHistory: [...activeTab.chatHistory, thinkingMessage] });
  
    try {
      const currentCode = files[0].content;
      const projectSettings = { model: activeTab.model, secrets: activeTab.secrets };
      
      const [report] = await Promise.all([
        analyzeAppCode(currentCode, projectSettings),
        new Promise(resolve => setTimeout(resolve, 5000)) // Ensure animation plays for a bit
      ]);

      const lastAssistantMessageWithContent = activeTab.chatHistory
        .slice()
        .reverse()
        .find(m => m.role === 'assistant' && m.content?.files?.length) as AssistantMessage | undefined;
      
      const reportMessage: AssistantMessage = {
        id: `assistant-max-report-${Date.now()}`,
        role: 'assistant',
        content: lastAssistantMessageWithContent?.content || {},
        isGenerating: false,
        maxReport: report,
      };

      setTabs(prevTabs => prevTabs.map(t => t.id === activeTabId ? {
          ...t,
          chatHistory: [...t.chatHistory.filter(m => m.id !== tempAssistantId), reportMessage],
      } : t));

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "MAX analysis failed.";
        updateActiveTab({ error: errorMessage, chatHistory: activeTab.chatHistory.filter(m => m.id !== tempAssistantId) });
    } finally {
        updateActiveTab({ isLoading: false, isMaxAgentRunning: false });
    }
  };

  const handleAutoFix = (issues: MaxIssue[]) => {
    const issuesString = issues.map(issue => `- ${issue.description} (Suggestion: ${issue.suggestion})`).join('\n');
    const fixPrompt = `Please apply the following fixes to the application code. While implementing these changes, also take the opportunity to improve the overall UI/UX. Make the app look more modern, professional, and visually polished. Ensure the final result is both functional (with the issues resolved) and aesthetically pleasing.\n\nHere are the specific issues to address:\n${issuesString}`;
    handleSubmit(fixPrompt);
  };
  
  const handleGitHubSave = async (details: { repoName?: string, description?: string, commitMessage: string }) => {
    const token = getGitHubPat();
    if (!token || !githubUser || !activeTab || files.length === 0) {
        updateActiveTab({ error: "Cannot save to GitHub. Ensure you are connected and have generated an app." }); return;
    }
    updateActiveTab({ isLoading: true });
    let repoFullName = activeTab.currentProjectRepo;
    try {
        if (!repoFullName && details.repoName) {
            const newRepo = await createRepository(token, details.repoName, details.description);
            repoFullName = newRepo.full_name;
            updateActiveTab({ currentProjectRepo: repoFullName });
            if (activeTab.lastSavedProjectId) {
                updateProject(activeTab.lastSavedProjectId, { githubUrl: newRepo.html_url });
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
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred while saving to GitHub.";
        updateActiveTab({ error: errorMsg });
    } finally {
        updateActiveTab({ isLoading: false });
        setIsGitHubModalOpen(false);
    }
  };

  const handleDeploy = async () => {
      const token = getNetlifyPat();
      if (!token || !activeTab || files.length === 0) return;
      
      setDeployStatus('deploying');
      let siteId = activeTab.currentNetlifySiteId;
      let siteUrl = activeTab.currentNetlifyUrl;
      
      try {
          if (!siteId) {
              const newSite = await createSite(token);
              siteId = newSite.id;
              siteUrl = newSite.ssl_url;
              updateActiveTab({ currentNetlifySiteId: siteId, currentNetlifyUrl: siteUrl });
          }
          if (!siteId) throw new Error("Could not create or find a site to deploy to.");

          const deploy = await deployToNetlify(token, siteId, files);
          siteUrl = deploy.ssl_url;
          updateActiveTab({ currentNetlifyUrl: siteUrl });

          if(activeTab.lastSavedProjectId) {
              updateProject(activeTab.lastSavedProjectId, { netlifySiteId: siteId, netlifyUrl: siteUrl });
          }
          setDeployStatus('success');

      } catch (err) {
          updateActiveTab({ error: err instanceof Error ? err.message : "An unknown deployment error occurred." });
          setDeployStatus('error');
      }
  };
  
  const handleDeployClick = () => {
    setDeployStatus('idle'); setIsDeployModalOpen(true);
    if (!activeTab?.currentNetlifySiteId) handleDeploy();
  };
  
  const handleDownloadClick = () => {
    if (!isPro || !activeTab || files.length === 0) return;
    
    // For this app, we only generate a single index.html
    const fileToDownload = files[0];
    if (!fileToDownload) {
      updateActiveTab({ error: "Could not find a file to download." });
      return;
    }
    
    const blob = new Blob([fileToDownload.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileToDownload.path;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveSettings = (settings: Partial<Omit<ProjectTab, 'id'>>) => {
    if (!activeTab) return;
    
    // Create a new tab object with updated settings to ensure correct typing
    const updatedTabData = { ...activeTab, ...settings };
    updateActiveTab(updatedTabData);

    if (activeTab.lastSavedProjectId) {
      updateProject(activeTab.lastSavedProjectId, settings);
    }
    setIsProjectSettingsOpen(false);
  };


  const toggleVisualEditMode = () => {
    const nextState = !activeTab?.isVisualEditMode;
    updateActiveTab({ isVisualEditMode: nextState });
    if (!nextState) updateActiveTab({ selectedElementSelector: null });
  };
  
  const [rightPaneView, setRightPaneView] = useState<'code' | 'preview'>('preview');

  useEffect(() => {
    // Ask for notification permission when the builder page loads
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'VISUAL_EDIT_SELECT' && activeTab?.isVisualEditMode) {
            updateActiveTab({ selectedElementSelector: event.data.selector });
            setRightPaneView('preview');
        } else if (event.data.type === 'MAX_AGENT_ELEMENTS') {
            updateActiveTab({ agentTargets: event.data.elements || [] });
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeTab?.isVisualEditMode, activeTabId]);

  useEffect(() => {
    // Initialize tabs
    if (tabs.length === 0) {
        const firstTab = initialProject
            ? createNewTab(initialProject.name || initialProject.prompt.substring(0, 20) || "Loaded Project", initialProject.prompt, initialProject)
            : createNewTab("Project 1", initialPrompt);
        setTabs([firstTab]);
        setActiveTabId(firstTab.id);
    }

    // Connect to services
    const ghToken = getGitHubPat(); if (ghToken) getGitHubUserInfo(ghToken).then(setGithubUser).catch(() => console.error("Invalid GitHub PAT"));
    const ntToken = getNetlifyPat(); if (ntToken) setIsNetlifyConnected(true);
    const gphKey = getGiphyKey(); if (gphKey) setIsGiphyConnected(true);
    const uspKey = getUnsplashKey(); if (uspKey) setIsUnsplashConnected(true);
    const ytKey = getYouTubeKey(); if (ytKey) setIsYouTubeConnected(true);
    const pexKey = getPexelsKey(); if (pexKey) setIsPexelsConnected(true);
    const fsKey = getFreeSoundKey(); if (fsKey) setIsFreeSoundConnected(true);

  }, [initialProject, initialPrompt]);
  
  useEffect(() => {
    if (activeTab?.prompt && !initialGenerationDone.current.has(activeTab.id) && activeTab.chatHistory.length === 0) {
        handleSubmit(activeTab.prompt);
        initialGenerationDone.current.add(activeTab.id);
    }
  }, [activeTab]);

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col pl-[4.5rem]">
      <GitHubSaveModal isOpen={isGitHubModalOpen} onClose={() => setIsGitHubModalOpen(false)} onSave={handleGitHubSave} isNewRepo={!activeTab?.currentProjectRepo} />
      <DeployModal isOpen={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} onDeploy={handleDeploy} status={deployStatus} siteUrl={activeTab?.currentNetlifyUrl || null} isNewDeploy={!activeTab?.currentNetlifySiteId} />
      <ImageLibraryModal isOpen={isImageLibraryOpen} onClose={() => setIsImageLibraryOpen(false)} onSelectImages={handleSelectFromLibrary} />
      <GiphySearchModal isOpen={isGiphyModalOpen} onClose={() => setIsGiphyModalOpen(false)} onSelectGif={handleSelectGif} />
      <UnsplashSearchModal isOpen={isUnsplashModalOpen} onClose={() => setIsUnsplashModalOpen(false)} onSelectPhoto={handleSelectUnsplashPhoto} />
      <YouTubeSearchModal isOpen={isYouTubeModalOpen} onClose={() => setIsYouTubeModalOpen(false)} onSelectVideo={handleSelectYouTubeVideo} />
      <QuotaErrorModal isOpen={isQuotaErrorModalOpen} onClose={() => setIsQuotaErrorModalOpen(false)} />
      {activeTab && <ProjectSettingsModal isOpen={isProjectSettingsOpen} onClose={() => setIsProjectSettingsOpen(false)} onSave={handleSaveSettings} project={activeTab} />}
      
      <div className="flex-shrink-0">
          <ProjectTabs tabs={tabs} activeTabId={activeTabId} onSelectTab={setActiveTabId} onAddTab={handleAddNewTab} onCloseTab={handleCloseTab} />
      </div>
      
      <div className="flex flex-grow overflow-hidden">
        <div className="flex flex-col w-full lg:w-2/5 h-full border-r border-slate-800">
            <div className="flex-grow flex flex-col overflow-hidden">
                <ChatHistory messages={activeTab?.chatHistory || []} error={activeTab?.error || null} onAutoFix={handleAutoFix} />
            </div>
            <div className="flex-shrink-0">
                {activeTab && (
                    <PromptInput 
                        prompt={activeTab.prompt} 
                        setPrompt={(p) => updateActiveTab({ prompt: p })} 
                        onSubmit={handlePromptSubmit} 
                        onBoostUi={handleBoostUi} 
                        isLoading={activeTab.isLoading}
                        isVisualEditMode={activeTab.isVisualEditMode}
                        onToggleVisualEditMode={toggleVisualEditMode}
                        uploadedImages={activeTab.uploadedImages}
                        onImagesUpload={handleImagesUpload}
                        onImageRemove={handleImageRemove}
                        onOpenImageLibrary={() => setIsImageLibraryOpen(true)}
                        isGiphyConnected={isGiphyConnected} onAddGifClick={() => setIsGiphyModalOpen(true)}
                        isUnsplashConnected={isUnsplashConnected} onAddStockPhotoClick={() => setIsUnsplashModalOpen(true)}
                        isYouTubeConnected={isYouTubeConnected} onAddYouTubeVideoClick={() => setIsYouTubeModalOpen(true)}
                        onStartMaxAgent={handleStartMaxAgent}
                        isMaxAgentRunning={activeTab.isMaxAgentRunning}
                        hasFiles={files.length > 0}
                    />
                )}
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
                isDeployed={!!activeTab?.currentNetlifySiteId}
                hasFiles={files.length > 0}
                isPro={isPro}
                onDownloadClick={handleDownloadClick}
                onSettingsClick={() => setIsProjectSettingsOpen(true)}
            />
            <div className="flex-grow p-4 pt-0 overflow-hidden">
                {rightPaneView === 'code' ? (
                    <CodeViewer files={files} />
                ) : (
                    <Preview 
                        htmlContent={previewHtml} 
                        streamingPreviewHtml={activeTab?.streamingPreviewHtml || null}
                        hasFiles={files.length > 0} 
                        isLoading={activeTab?.isLoading || false}
                        isVisualEditMode={!!activeTab?.isVisualEditMode && !activeTab?.selectedElementSelector}
                        isMaxAgentRunning={activeTab?.isMaxAgentRunning || false}
                        agentTargets={activeTab?.agentTargets || []}
                    />
                )}
            </div>
            {activeTab?.selectedElementSelector && (
                <VisualEditBar
                    selector={activeTab.selectedElementSelector}
                    onSubmit={handleVisualEditSubmit}
                    onCancel={() => updateActiveTab({ selectedElementSelector: null })}
                    isLoading={activeTab.isLoading}
                />
            )}
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;
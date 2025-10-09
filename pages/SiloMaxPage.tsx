import React, { useState, useEffect, useRef } from 'react';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import BotIcon from '../components/icons/BotIcon';
import GitHubIcon from '../components/icons/GitHubIcon';
import YouTubeIcon from '../components/icons/YouTubeIcon';
import ImageIcon from '../components/icons/ImageIcon';
import GlobeIcon from '../components/icons/GlobeIcon';
import XIcon from '../components/icons/XIcon';
import SiloMaxRepoModal from '../components/SiloMaxRepoModal';
import SiloMaxVideoModal from '../components/SiloMaxVideoModal';
import SiloMaxImageModal from '../components/SiloMaxImageModal';
import SiloMaxWebsiteModal from '../components/SiloMaxWebsiteModal';
import SiloMaxCommitModal from '../components/SiloMaxCommitModal';
import CodeBlock from '../components/CodeBlock';
import { generateMaxChatStream } from '../services/geminiService';
import { createOrUpdateFile, getRepoContent, getPat } from '../services/githubService';
import { GitHubRepo } from '../types';

interface CodeBlockData {
  language: string;
  code: string;
  filePath?: string;
}

interface MaxChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  codeBlock?: CodeBlockData;
  isGenerating?: boolean;
  isRepoEdit?: boolean;
}

interface Resource {
  type: 'repository' | 'video' | 'image' | 'website';
  label: string;
  data: any;
}


const SiloMaxPage: React.FC = () => {
  const [isChatActive, setIsChatActive] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<MaxChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const [resources, setResources] = useState<Resource[]>([]);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);
  const [commitDetails, setCommitDetails] = useState<{ filePath: string, code: string, repo: GitHubRepo } | null>(null);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isChatActive && promptInputRef.current) {
        promptInputRef.current.focus();
    }
  }, [isChatActive]);

  const handleAddRepo = (repo: GitHubRepo) => {
    setResources(prev => [...prev, { type: 'repository', label: repo.name, data: repo }]);
    setIsRepoModalOpen(false);
  };
  
  const handleAddVideo = (url: string) => {
    try {
        const label = new URL(url).hostname.replace('www.','');
        setResources(prev => [...prev, { type: 'video', label, data: url }]);
    } catch {
        setResources(prev => [...prev, { type: 'video', label: 'Video Link', data: url }]);
    }
    setIsVideoModalOpen(false);
  };

  const handleAddImage = (image: { data: string; mimeType: string }) => {
    const label = `Image.${image.mimeType.split('/')[1] || 'img'}`;
    setResources(prev => [...prev, { type: 'image', label: label, data: image }]);
    setIsImageModalOpen(false);
  };
  
  const handleAddWebsite = (url: string) => {
    try {
        const label = new URL(url).hostname.replace('www.','');
        setResources(prev => [...prev, { type: 'website', label, data: url }]);
    } catch {
        setResources(prev => [...prev, { type: 'website', label: 'Website Link', data: url }]);
    }
    setIsWebsiteModalOpen(false);
  };
  
  const handleRemoveResource = (indexToRemove: number) => {
    setResources(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentPrompt = prompt.trim();
    if ((!currentPrompt && resources.length === 0) || isLoading) return;

    if (!isChatActive) {
      setIsChatActive(true);
    }
    
    let context = '';
    if (resources.length > 0) {
      context = 'Using the following context:\n' + resources.map(r => {
        if (r.type === 'repository') {
            return `- Repository: ${(r.data as GitHubRepo).full_name}. When you suggest code changes for a file in this repository, you MUST provide the full new content of the file and specify the file path on the first line of the code block like this: \`// FILEPATH: path/to/your/file.ext\`.`;
        }
        return `- ${r.type}: ${r.label}`;
      }).join('\n') + '\n\n';
    }
    
    const fullPrompt = context + currentPrompt;
    
    const userMessage: MaxChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: currentPrompt,
    };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setResources([]); // Clear resources after they are submitted
    setIsLoading(true);

    const aiMessageId = `assistant-${Date.now()}`;
    const placeholderMessage: MaxChatMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        isGenerating: true,
    };
    setMessages(prev => [...prev, placeholderMessage]);

    try {
        const stream = generateMaxChatStream(fullPrompt);
        let fullResponse = '';

        for await (const chunk of stream) {
            fullResponse += chunk;
            setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, content: fullResponse } : msg
            ));
        }

        // Post-stream processing
        const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/;
        const match = fullResponse.match(codeBlockRegex);
        
        const finalMessage: MaxChatMessage = {
            id: aiMessageId,
            role: 'assistant',
            content: fullResponse.replace(codeBlockRegex, '').trim(),
            isGenerating: false,
        };

        const repoResource = resources.find(r => r.type === 'repository');

        if (match) {
            const language = match[1] || 'text';
            let code = match[2].trim();
            finalMessage.codeBlock = { language, code };
            
            if (repoResource) {
                const filePathRegex = /^\s*(?:\/\/|\#)\s*FILEPATH:\s*(\S+)/m;
                const filePathMatch = code.match(filePathRegex);
                if (filePathMatch) {
                    finalMessage.isRepoEdit = true;
                    finalMessage.codeBlock.filePath = filePathMatch[1];
                    finalMessage.codeBlock.code = code.replace(filePathRegex, '').trim();
                }
            }
        }
        
        setMessages(prev => prev.map(msg => msg.id === aiMessageId ? finalMessage : msg));

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
        const errorMsg: MaxChatMessage = {
            id: aiMessageId,
            role: 'assistant',
            content: `Sorry, I encountered an error: ${errorMessage}`
        };
        setMessages(prev => prev.map(msg => msg.id === aiMessageId ? errorMsg : msg));
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleCommit = async (commitMessage: string) => {
    if (!commitDetails) return;

    setIsLoading(true);
    const { filePath, code, repo } = commitDetails;
    const [owner, repoName] = repo.full_name.split('/');
    
    try {
        const token = getPat();
        if (!token) throw new Error("GitHub token not found. Please connect to GitHub in Settings.");

        let sha: string | undefined;
        try {
            const fileMeta = await getRepoContent(token, owner, repoName, filePath);
            sha = fileMeta.sha;
        } catch (e) {
            console.log("File not found, creating a new one.");
        }

        await createOrUpdateFile(token, owner, repoName, filePath, code, commitMessage, sha);
        
        const successMsg: MaxChatMessage = {
            id: `success-${Date.now()}`,
            role: 'assistant',
            content: `Successfully committed changes to \`${filePath}\` in \`${repoName}\`!`
        };
        setMessages(prev => [...prev, successMsg]);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to commit changes.";
        const errorMsg: MaxChatMessage = {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: `Commit failed: ${errorMessage}`
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsLoading(false);
        setCommitDetails(null);
    }
  };
  
  const resourceButtons = [
      { label: 'Repository', icon: GitHubIcon, onClick: () => setIsRepoModalOpen(true) },
      { label: 'Videos', icon: YouTubeIcon, onClick: () => setIsVideoModalOpen(true) },
      { label: 'Images', icon: ImageIcon, onClick: () => setIsImageModalOpen(true) },
      { label: 'Website', icon: GlobeIcon, onClick: () => setIsWebsiteModalOpen(true) },
  ]

  return (
    <>
      <SiloMaxRepoModal isOpen={isRepoModalOpen} onClose={() => setIsRepoModalOpen(false)} onSelectRepo={handleAddRepo} />
      <SiloMaxVideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} onAddVideo={handleAddVideo} />
      <SiloMaxImageModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onAddImage={handleAddImage} />
      <SiloMaxWebsiteModal isOpen={isWebsiteModalOpen} onClose={() => setIsWebsiteModalOpen(false)} onAddWebsite={handleAddWebsite} />
      <SiloMaxCommitModal 
        isOpen={!!commitDetails}
        onClose={() => setCommitDetails(null)}
        onCommit={handleCommit}
        filePath={commitDetails?.filePath || ''}
        repoName={commitDetails?.repo.name || ''}
      />

      <div className="relative h-screen w-screen bg-black overflow-hidden text-white font-sans selection:bg-indigo-500 selection:text-white pl-[4.5rem]">
        <div className={`absolute top-0 left-0 right-0 z-20 transition-all duration-500 ease-in-out ${isChatActive ? 'pt-8 pb-4' : 'pt-20 md:pt-24'}`}>
          <div className="flex flex-col items-center justify-center">
            <h1 
                  className="text-8xl md:text-9xl font-['Orbitron'] bg-gradient-to-r from-slate-200 via-white to-slate-400 text-transparent bg-clip-text"
                  style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.2)' }}
              >
                  SILO MAX
              </h1>
              <div className={`flex items-center gap-3 mt-8 transition-opacity duration-500 ${isChatActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                  {resourceButtons.map(btn => (
                      <button key={btn.label} onClick={btn.onClick} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300 hover:bg-white/10 transition-colors">
                          <btn.icon className="w-4 h-4" />
                          <span>Add {btn.label}</span>
                      </button>
                  ))}
              </div>
          </div>
        </div>

        {isChatActive && (
          <div ref={chatContainerRef} className="absolute top-0 left-0 right-0 bottom-28 pt-48 pb-4 px-6 md:px-12 lg:px-24 overflow-y-auto animate-fade-in space-y-6">
            {messages.map((message) => {
              const repoResource = resources.find(r => r.type === 'repository');
              return (
                  <div key={message.id} className={`flex items-start gap-4 max-w-4xl mx-auto ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center">
                              <BotIcon className="w-5 h-5 text-indigo-300" />
                          </div>
                      )}
                      <div className={`p-4 rounded-2xl ${
                          message.role === 'user'
                          ? 'bg-white text-black'
                          : 'bg-white/10 backdrop-blur-md border border-white/20'
                      }`}>
                          {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                          {message.codeBlock && (
                              <CodeBlock 
                                  language={message.codeBlock.language} 
                                  code={message.codeBlock.code}
                                  filePath={message.codeBlock.filePath}
                              />
                          )}
                          {message.isRepoEdit && message.codeBlock?.filePath && repoResource && (
                              <div className="mt-4 text-right">
                                  <button
                                      onClick={() => setCommitDetails({ filePath: message.codeBlock!.filePath!, code: message.codeBlock!.code, repo: repoResource.data as GitHubRepo })}
                                      className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg text-sm"
                                  >
                                      Commit Changes
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              )
            })}
          </div>
        )}
        
        <form
          onSubmit={handleSubmit}
          className={`fixed z-30 transition-all duration-700 ease-in-out ${
            isChatActive 
              ? 'bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4' 
              : 'top-1/2 left-1/2 -translate-x-1/2 w-full max-w-2xl'
          }`}
          style={isChatActive ? {} : { transform: 'translate(-50%, 20%)' }}
        >
          <div className={`relative ${!isChatActive ? 'animate-fade-in-up' : ''}`}>
            {resources.length > 0 && (
                <div className="absolute left-4 -top-12 flex flex-wrap gap-2 max-w-[calc(100%-1rem)]">
                    {resources.map((resource, index) => (
                        <div key={index} className="flex items-center gap-1.5 bg-white text-black px-3 py-1 rounded-full text-sm font-semibold animate-fade-in-up">
                            <span>{resource.label}</span>
                            <button type="button" onClick={() => handleRemoveResource(index)} className="text-gray-500 hover:text-black">
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <textarea
              ref={promptInputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Chat with MAX, or ask it to edit a repository..."
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
              disabled={isLoading}
              className={`w-full p-4 pr-16 bg-white/[0.03] backdrop-blur-3xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-[0_0_120px_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(255,255,255,0.05)] transition-all duration-700 ease-in-out resize-none ${
                isChatActive
                  ? 'h-14 rounded-full pl-6'
                  : 'h-48 rounded-3xl pl-6 pt-6'
              }`}
            />
            <button
              type="submit"
              disabled={isLoading || (!prompt.trim() && resources.length === 0)}
              className={`absolute h-10 w-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-700 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed group ${
                isChatActive
                  ? 'right-2 top-1/2 -translate-y-1/2'
                  : 'right-4 bottom-4'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
              ) : (
                <ArrowUpIcon className="w-5 h-5 text-black transition-transform group-hover:scale-110" />
              )}
            </button>
          </div>
        </form>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.5s 0.5s ease-out forwards; opacity: 0; }
            .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        `}</style>
      </div>
    </>
  );
};

export default SiloMaxPage;
import React, { useState, useEffect } from 'react';
import { GitHubRepo, GitHubTreeItem } from '../types';
import { getRepoTree, getFileContent, getPat, createOrUpdateFile, getRepoContent } from '../services/githubService';
import { editCodeWithAi } from '../services/geminiService';
import FileTree from '../components/FileTree';
import CodeEditor from '../components/CodeEditor';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import SparklesIcon from '../components/icons/SparklesIcon';

interface CodePilotPageProps {
  repo: GitHubRepo;
}

const CodePilotPage: React.FC<CodePilotPageProps> = ({ repo }) => {
  const [tree, setTree] = useState<GitHubTreeItem[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [owner, repoName] = repo.full_name.split('/');

  useEffect(() => {
    const fetchTree = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = getPat()!;
        if (!token) {
            throw new Error("GitHub token not found. Please connect to GitHub in Settings.")
        }
        const repoTree = await getRepoTree(token, owner, repoName);
        setTree(repoTree.tree);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repository tree.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTree();
  }, [repo]);

  const handleFileSelect = async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getPat()!;
      const content = await getFileContent(token, owner, repoName, path);
      setFileContent(content);
      setActiveFile(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file content.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !activeFile || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedContent = await editCodeWithAi(prompt, activeFile, fileContent);
      setFileContent(updatedContent);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI code edit failed.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCommit = async () => {
    if (!activeFile) return;
    const commitMessage = prompt(`Enter commit message for changes to ${activeFile}:`);
    if (!commitMessage) return;

    setIsLoading(true);
    setError(null);
    try {
        const token = getPat()!;
        let sha: string | undefined;
        try {
            const fileMeta = await getRepoContent(token, owner, repoName, activeFile);
            sha = fileMeta.sha;
        } catch (e) {
            console.log("File not found, creating a new one.");
        }
        
        await createOrUpdateFile(token, owner, repoName, activeFile, fileContent, commitMessage, sha);
        alert('Changes committed successfully!');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to commit changes.');
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="h-screen w-screen bg-black text-white flex pl-[4.5rem]">
      <div className="w-1/4 h-full border-r border-slate-800">
        <div className="p-4 border-b border-slate-800">
            <h2 className="text-lg font-bold truncate">{repo.name}</h2>
            <p className="text-sm text-slate-400">Code Pilot</p>
        </div>
        <FileTree tree={tree} onFileSelect={handleFileSelect} />
      </div>
      <div className="w-3/4 h-full flex flex-col">
        <div className="flex-grow p-4 overflow-hidden">
          {activeFile ? (
            <CodeEditor content={fileContent} onContentChange={setFileContent} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">Select a file to start editing.</div>
          )}
        </div>
        {error && <div className="p-4 text-red-400 bg-red-900/50">{error}</div>}
        <div className="p-4 border-t border-slate-800">
          <form onSubmit={handleSubmit} className="relative">
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., Refactor this function to be async/await..." className="w-full h-24 p-4 pr-16 bg-slate-800 rounded-lg resize-none" disabled={isLoading || !activeFile} />
            <button type="submit" disabled={isLoading || !prompt.trim()} className="absolute right-4 top-4 h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500 disabled:bg-slate-600">
                {isLoading ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5"/>}
            </button>
          </form>
          {activeFile && (
            <button onClick={handleCommit} disabled={isLoading} className="mt-2 px-4 py-2 bg-green-700 hover:bg-green-600 rounded-lg font-semibold disabled:bg-slate-600">
              Commit Changes to <span className="font-mono">{activeFile}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodePilotPage;

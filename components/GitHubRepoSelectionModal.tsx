import React, { useState, useEffect } from 'react';
import { GitHubRepo } from '../types';
import { getRepositories, getPat } from '../services/githubService';
import GitHubIcon from './icons/GitHubIcon';

interface GitHubRepoSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRepo: (repo: GitHubRepo) => void;
}

const GitHubRepoSelectionModal: React.FC<GitHubRepoSelectionModalProps> = ({ isOpen, onClose, onSelectRepo }) => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isConnected = !!getPat();

  useEffect(() => {
    if (isOpen && isConnected) {
      const fetchRepos = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const token = getPat()!;
          const userRepos = await getRepositories(token);
          setRepos(userRepos);
          setFilteredRepos(userRepos);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch repositories.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchRepos();
    }
  }, [isOpen, isConnected]);

  useEffect(() => {
    setFilteredRepos(
      repos.filter(repo => repo.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, repos]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl m-4 w-full max-w-2xl h-[70vh] flex flex-col transform transition-transform duration-300 scale-95 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-3"><GitHubIcon className="w-6 h-6"/> Select a Repository</h2>
        </div>
        {!isConnected ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
            <p className="text-slate-400 mb-4">You need to connect your GitHub account to use Code Pilot.</p>
            <p className="text-slate-400">Please go to <span className="font-bold text-indigo-400">Settings &gt; Integrations</span> to connect your GitHub Personal Access Token.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-700">
              <input type="text" placeholder="Filter repositories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md" />
            </div>
            <div className="flex-grow overflow-y-auto p-4">
              {isLoading && <p className="text-slate-400">Loading repositories...</p>}
              {error && <p className="text-red-400">{error}</p>}
              <ul className="space-y-2">
                {filteredRepos.map(repo => (
                  <li key={repo.id} onClick={() => onSelectRepo(repo)} className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-colors">
                    <p className="font-semibold text-white">{repo.full_name}</p>
                    <p className="text-sm text-slate-400 truncate">{repo.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
       <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};
export default GitHubRepoSelectionModal;

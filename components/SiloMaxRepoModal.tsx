import React, { useState, useEffect } from 'react';
import { GitHubRepo } from '../types';
import { getRepositories, getPat } from '../services/githubService';
import SiloMaxModalBase from './SiloMaxModalBase';

interface SiloMaxRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRepo: (repo: GitHubRepo) => void;
}

const SiloMaxRepoModal: React.FC<SiloMaxRepoModalProps> = ({ isOpen, onClose, onSelectRepo }) => {
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

  const renderContent = () => {
    if (!isConnected) {
        return (
            <div className="text-center p-6">
                <p className="text-slate-400 mb-4">You need to connect your GitHub account to select a repository.</p>
                <p className="text-slate-400">Please go to <span className="font-bold text-indigo-400">Settings &gt; Integrations</span> to connect your GitHub Personal Access Token.</p>
            </div>
        );
    }
    
    return (
        <div className="h-[50vh] flex flex-col">
            <input type="text" placeholder="Filter repositories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 mb-4 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <div className="flex-grow overflow-y-auto">
              {isLoading && <p className="text-slate-400 text-center">Loading repositories...</p>}
              {error && <p className="text-red-400 text-center">{error}</p>}
              <ul className="space-y-2">
                {filteredRepos.map(repo => (
                  <li key={repo.id} onClick={() => onSelectRepo(repo)} className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-colors">
                    <p className="font-semibold text-white">{repo.full_name}</p>
                    <p className="text-sm text-slate-400 truncate">{repo.description}</p>
                  </li>
                ))}
              </ul>
            </div>
        </div>
    );
  };
  
  return (
    <SiloMaxModalBase isOpen={isOpen} onClose={onClose} title="Select a Repository">
        {renderContent()}
    </SiloMaxModalBase>
  );
};

export default SiloMaxRepoModal;

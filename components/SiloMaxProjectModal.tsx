import React, { useState, useEffect } from 'react';
import { SavedProject } from '../types';
import { getProjects } from '../services/projectService';
import SiloMaxModalBase from './SiloMaxModalBase';

interface SiloMaxProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: SavedProject) => void;
}

const SiloMaxProjectModal: React.FC<SiloMaxProjectModalProps> = ({ isOpen, onClose, onSelectProject }) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchProjects = () => {
        setIsLoading(true);
        setError(null);
        try {
          const userProjects = getProjects();
          setProjects(userProjects);
          setFilteredProjects(userProjects);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch projects.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    setFilteredProjects(
      projects.filter(p => 
        (p.name || p.prompt).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, projects]);

  const renderContent = () => {
    if (isLoading) {
        return <p className="text-slate-400 text-center">Loading projects...</p>
    }
    if (error) {
        return <p className="text-red-400 text-center">{error}</p>
    }
    if (projects.length === 0) {
        return (
            <div className="text-center p-6">
                <p className="text-slate-400">No saved projects found.</p>
                <p className="text-slate-500 text-sm">Create a project in the builder to see it here.</p>
            </div>
        );
    }
    
    return (
        <div className="h-[50vh] flex flex-col">
            <input 
                type="text" 
                placeholder="Filter projects..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full p-2 mb-4 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex-grow overflow-y-auto">
              <ul className="space-y-2">
                {filteredProjects.map(project => (
                  <li 
                    key={project.id} 
                    onClick={() => onSelectProject(project)} 
                    className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-white truncate">{project.name || project.prompt}</p>
                    <p className="text-sm text-slate-400">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            </div>
        </div>
    );
  };
  
  return (
    <SiloMaxModalBase isOpen={isOpen} onClose={onClose} title="Select a Project">
        {renderContent()}
    </SiloMaxModalBase>
  );
};

export default SiloMaxProjectModal;
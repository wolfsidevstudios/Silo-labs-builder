import React, { useState, useEffect } from 'react';
import { SavedProject } from '../types';
import { getProjects } from '../services/projectService';

interface ProjectsPageProps {
  onLoadProject: (project: SavedProject) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ onLoadProject }) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  return (
    <div className="min-h-screen w-screen bg-black flex flex-col p-4 pl-20 selection:bg-indigo-500 selection:text-white">
      <main className="w-full max-w-7xl mx-auto px-4 animate-fade-in-up">
        <div className="text-center md:text-left mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text">
            My Projects
          </h1>
          <p className="text-lg text-slate-400 mt-2">
            Click on any project to load it in the builder.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
            <h2 className="text-2xl font-semibold text-slate-300">No Projects Found</h2>
            <p className="text-slate-500 mt-2">
              Once you build an app, it will automatically be saved here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden flex flex-col group cursor-pointer transition-all hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 animate-fade-in-up"
                onClick={() => onLoadProject(project)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="aspect-[16/10] bg-white overflow-hidden pointer-events-none border-b border-slate-700">
                  <iframe
                    srcDoc={project.previewHtml}
                    title={project.prompt}
                    sandbox="allow-scripts"
                    scrolling="no"
                    className="w-full h-full transform scale-[0.6] origin-top-left"
                  />
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <p className="font-semibold text-slate-200 truncate group-hover:text-indigo-400 transition-colors" title={project.prompt}>
                    {project.prompt}
                  </p>
                  <p className="text-xs text-slate-500 mt-auto pt-2">
                    {new Date(project.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ProjectsPage;

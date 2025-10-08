import React, { useState, useEffect, useRef } from 'react';
import { SavedProject, SavedImage } from '../types';
import { getProjects } from '../services/projectService';
import { getImages, saveImage, removeImage } from '../services/imageService';
import RocketIcon from '../components/icons/RocketIcon';
import ExternalLinkIcon from '../components/icons/ExternalLinkIcon';
import ImageIcon from '../components/icons/ImageIcon';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';

interface ProjectsPageProps {
  onLoadProject: (project: SavedProject) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ onLoadProject }) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [images, setImages] = useState<SavedImage[]>([]);
  const [view, setView] = useState<'projects' | 'deployments' | 'images'>('projects');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProjects(getProjects());
    setImages(getImages());
  }, []);
  
  const handleImageFilesUpload = (files: FileList) => {
    const filesToProcess = Array.from(files);
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const [header, base64Data] = dataUrl.split(',');
          const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
          saveImage({ data: base64Data, mimeType });
          // Refresh the list after saving
          setImages(getImages());
      };
      reader.readAsDataURL(file);
    });
    // Clear the input value to allow re-uploading the same file
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  const handleImageDelete = (id: string) => {
    removeImage(id);
    setImages(getImages());
  };

  const deployedProjects = projects.filter(p => p.netlifySiteId && p.netlifyUrl);

  return (
    <div className="min-h-screen w-screen bg-black flex flex-col p-4 pl-[4.5rem] selection:bg-indigo-500 selection:text-white">
      <main className="w-full max-w-7xl mx-auto px-4 animate-fade-in-up">
        <div className="text-center md:text-left mb-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text">
            My Work
          </h1>
          <p className="text-lg text-slate-400 mt-2">
            Browse projects, manage deployments, and organize your image library.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex justify-center mb-12">
            <div className="bg-slate-900/50 p-1 rounded-full flex items-center border border-slate-700/50">
                <button
                    onClick={() => setView('projects')}
                    className={`px-6 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                        view === 'projects' ? 'bg-white text-black' : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                >
                    Projects
                </button>
                <button
                    onClick={() => setView('deployments')}
                    className={`px-6 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                        view === 'deployments' ? 'bg-white text-black' : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                >
                    Deployments
                </button>
                <button
                    onClick={() => setView('images')}
                    className={`px-6 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                        view === 'images' ? 'bg-white text-black' : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                >
                    Images
                </button>
            </div>
        </div>

        {view === 'projects' && (
          <>
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
                    className="relative bg-slate-900 border border-slate-700 rounded-lg overflow-hidden group cursor-pointer transition-all hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 animate-fade-in-up aspect-[16/10]"
                    onClick={() => onLoadProject(project)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {project.thumbnailUrl ? (
                        <img src={project.thumbnailUrl} alt={project.name || project.prompt} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 pointer-events-none">
                            <iframe
                                srcDoc={project.previewHtml}
                                title={project.prompt}
                                sandbox="allow-scripts"
                                scrolling="no"
                                className="w-[166.67%] h-[166.67%] transform scale-[0.6] origin-top-left bg-white"
                            />
                        </div>
                    )}
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                        <div className="flex items-center">
                            {project.iconUrl && <img src={project.iconUrl} alt="App icon" className="w-8 h-8 rounded-md mr-3 flex-shrink-0" />}
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-100 truncate group-hover:text-indigo-300 transition-colors" title={project.name || project.prompt}>
                                    {project.name || project.prompt}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {new Date(project.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'deployments' && (
          <>
            {deployedProjects.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
                <h2 className="text-2xl font-semibold text-slate-300">No Deployments Found</h2>
                <p className="text-slate-500 mt-2">
                  Deploy an app from the builder, and it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {deployedProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4 flex-grow w-full md:w-auto">
                      <div className="flex-shrink-0 w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                        <RocketIcon className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-slate-100 truncate" title={project.prompt}>
                          {project.prompt}
                        </p>
                        <a
                          href={project.netlifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-400 mt-1 flex items-center gap-1.5 hover:underline"
                        >
                          <ExternalLinkIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{project.netlifyUrl}</span>
                        </a>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => onLoadProject(project)}
                        className="w-full md:w-auto px-5 py-2 bg-white text-black font-semibold rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        Load in Builder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'images' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                 <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleImageFilesUpload(e.target.files)} accept="image/*" className="hidden" multiple />
                 <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-slate-900 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500 transition-colors"
                 >
                    <PlusIcon className="w-10 h-10" />
                    <span className="mt-2 text-sm font-semibold">Upload Images</span>
                </button>
                {images.map((image, index) => (
                    <div
                        key={image.id}
                        className="relative group aspect-square bg-slate-800 rounded-lg overflow-hidden animate-fade-in-up"
                        style={{ animationDelay: `${index * 30}ms` }}
                    >
                        <img 
                            src={`data:${image.mimeType};base64,${image.data}`} 
                            alt={`Saved content ${new Date(image.createdAt).toLocaleString()}`} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <button 
                                onClick={() => handleImageDelete(image.id)}
                                className="p-2 bg-red-600/80 hover:bg-red-500 text-white rounded-full"
                                aria-label="Delete image"
                             >
                                <TrashIcon className="w-5 h-5" />
                             </button>
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
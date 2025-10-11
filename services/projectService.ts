import { SavedProject, AppFile, GeminiResponse, Version, AppMode } from '../types';

const PROJECTS_STORAGE_KEY = 'ai_react_app_builder_projects';

export function getProjects(): SavedProject[] {
  try {
    const projectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!projectsJson) {
      return [];
    }
    const projects = JSON.parse(projectsJson) as SavedProject[];
    // Sort by most recent first for display
    return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to parse projects from localStorage", error);
    // If parsing fails, clear the corrupted data to prevent future errors
    localStorage.removeItem(PROJECTS_STORAGE_KEY);
    return [];
  }
}

export function saveProject(projectData: {
  prompt: string;
  files: AppFile[];
  previewHtml: string;
  summary: string[];
  appMode?: AppMode;
}): SavedProject {
  const projects = getProjects();
  const now = new Date().toISOString();
  
  const newVersion: Version = {
    versionId: `v-${Date.now()}`,
    createdAt: now,
    prompt: projectData.prompt,
    summary: projectData.summary,
    files: projectData.files,
    previewHtml: projectData.previewHtml,
  };

  const newProject: SavedProject = {
    id: Date.now().toString(),
    ...projectData,
    createdAt: new Date().toISOString(),
    history: [newVersion],
    appMode: projectData.appMode || 'web',
  };

  // Add the new project to the start of the array
  const updatedProjects = [newProject, ...projects];
  
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
  
  return newProject;
}

export function updateProject(id: string, updates: Partial<SavedProject>): void {
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === id);

    if (projectIndex !== -1) {
        const projectToUpdate = { ...projects[projectIndex] };
        
        // If the update contains new code, create a version history entry
        if (updates.files && updates.prompt && updates.summary && updates.previewHtml) {
            const now = new Date().toISOString();
            const newVersion: Version = {
                versionId: `v-${Date.now()}`,
                createdAt: now,
                prompt: updates.prompt,
                summary: updates.summary,
                files: updates.files,
                previewHtml: updates.previewHtml,
            };
            
            projectToUpdate.history = [newVersion, ...(projectToUpdate.history || [])];
        }

        // Merge all updates into the top-level project object
        projects[projectIndex] = { ...projectToUpdate, ...updates };
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    }
}

export function deleteProject(id: string): void {
  const projects = getProjects();
  const updatedProjects = projects.filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
}

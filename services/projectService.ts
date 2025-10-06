import { SavedProject, AppFile, GeminiResponse } from '../types';

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
}): SavedProject {
  const projects = getProjects();
  const newProject: SavedProject = {
    id: Date.now().toString(),
    ...projectData,
    createdAt: new Date().toISOString(),
  };

  // Add the new project to the start of the array
  const updatedProjects = [newProject, ...projects];
  
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
  
  return newProject;
}

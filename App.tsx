import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import BuilderPage from './pages/BuilderPage';
import SettingsPage from './pages/SettingsPage';
import PlansPage from './pages/PlansPage';
import ProjectsPage from './pages/ProjectsPage';
import Sidebar, { SidebarPage } from './components/Sidebar';
import UltraBadge from './components/UltraBadge';
import { SavedProject } from './types';

type Page = 'home' | 'builder' | 'projects' | 'settings' | 'plans';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [builderPrompt, setBuilderPrompt] = useState<string>('');
  const [projectToLoad, setProjectToLoad] = useState<SavedProject | null>(null);
  const [isUltra, setIsUltra] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage first for persistent status
    const ultraStatus = localStorage.getItem('isUltra') === 'true';
    if (ultraStatus) {
      setIsUltra(true);
    }

    // Check for query param from payment redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('upgraded')) {
      localStorage.setItem('isUltra', 'true');
      setIsUltra(true);
      // Clean up URL to avoid re-triggering on refresh
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleStartBuilding = (prompt: string) => {
    setBuilderPrompt(prompt);
    setProjectToLoad(null); // Ensure we're not loading an old project
    setCurrentPage('builder');
  };
  
  const handleLoadProject = (project: SavedProject) => {
    setProjectToLoad(project);
    setBuilderPrompt(''); // Clear any prompt from home page
    setCurrentPage('builder');
  };

  const handleNavigate = (page: SidebarPage) => {
    if (page === 'home' || page === 'settings' || page === 'projects' || page === 'plans') {
      setCurrentPage(page);
    } else {
      alert(`The '${page}' page is not implemented in this demo.`);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onGenerate={handleStartBuilding} />;
      case 'builder':
        return <BuilderPage initialPrompt={builderPrompt} initialProject={projectToLoad} />;
      case 'settings':
        return <SettingsPage />;
      case 'plans':
        return <PlansPage />;
      case 'projects':
        return <ProjectsPage onLoadProject={handleLoadProject} />;
      default:
        return <HomePage onGenerate={handleStartBuilding} />;
    }
  };

  const getActivePageForSidebar = (): SidebarPage | null => {
    if (currentPage === 'home') return 'home';
    if (currentPage === 'projects') return 'projects';
    if (currentPage === 'settings') return 'settings';
    if (currentPage === 'plans') return 'plans';
    return null;
  };

  return (
    <>
      <UltraBadge isVisible={isUltra} />
      <Sidebar
        activePage={getActivePageForSidebar()}
        onNavigate={handleNavigate}
      />
      <div className="font-sans antialiased">
        {renderPage()}
      </div>
    </>
  );
};

export default App;

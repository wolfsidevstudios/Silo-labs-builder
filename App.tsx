import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import BuilderPage from './pages/BuilderPage';
import SettingsPage from './pages/SettingsPage';
import PlansPage from './pages/PlansPage';
import ProjectsPage from './pages/ProjectsPage';
import Sidebar, { SidebarPage } from './components/Sidebar';
import ProBadge from './components/ProBadge';
import ReferralModal from './components/ReferralModal';
import OnboardingModal from './components/OnboardingModal';
import UserGreeting from './components/UserGreeting';
import { SavedProject } from './types';

type Page = 'home' | 'builder' | 'projects' | 'settings' | 'plans';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [builderPrompt, setBuilderPrompt] = useState<string>('');
  const [projectToLoad, setProjectToLoad] = useState<SavedProject | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [proTrialEndTime, setProTrialEndTime] = useState<number | null>(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [referrerId, setReferrerId] = useState<string | null>(null);

  // State for new onboarding flow
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Onboarding check
    const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    } else {
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        setUserName(storedName);
      }
    }

    // Check for permanent Pro status from payment
    const permanentProStatus = localStorage.getItem('isPro') === 'true';
    if (permanentProStatus) {
      setIsPro(true);
      return; // Permanent pro doesn't need trial checks
    }

    // Check for trial status
    const trialEndTimeStr = localStorage.getItem('proTrialEndTime');
    if (trialEndTimeStr) {
      const endTime = parseInt(trialEndTimeStr, 10);
      if (Date.now() < endTime) {
        setIsPro(true);
        setProTrialEndTime(endTime);
      } else {
        localStorage.removeItem('proTrialEndTime'); // Clean up expired trial
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for referral
    const refCode = urlParams.get('ref');
    const referralSeen = localStorage.getItem('referralSeen') === 'true';

    if (refCode && !referralSeen && !trialEndTimeStr && !permanentProStatus) {
      setReferrerId(refCode);
      setIsReferralModalOpen(true);
      localStorage.setItem('referralSeen', 'true');
    }

    // Handle payment redirect
    if (urlParams.has('upgraded')) {
      localStorage.setItem('isPro', 'true');
      setIsPro(true);
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('upgraded');
      newUrl.searchParams.delete('ref'); // also clean ref
      window.history.replaceState(null, '', newUrl.toString());
    }
  }, []);
  
  const handleOnboardingFinish = (data: { name: string; accountType: 'individual' | 'business'; businessProfile?: any }) => {
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('userName', data.name);
    
    if (data.accountType === 'business' && data.businessProfile) {
      localStorage.setItem('businessProfile', JSON.stringify(data.businessProfile));
    }
    
    setUserName(data.name);
    setShowOnboarding(false);
  };

  const handleStartTrial = () => {
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const endTime = Date.now() + oneDayInMs;
    localStorage.setItem('proTrialEndTime', String(endTime));
    setProTrialEndTime(endTime);
    setIsPro(true);
    setIsReferralModalOpen(false);
  };

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
        return <HomePage onGenerate={handleStartBuilding} isTrialActive={!!proTrialEndTime} trialEndTime={proTrialEndTime} />;
      case 'builder':
        return <BuilderPage initialPrompt={builderPrompt} initialProject={projectToLoad} />;
      case 'settings':
        return <SettingsPage />;
      case 'plans':
        return <PlansPage />;
      case 'projects':
        return <ProjectsPage onLoadProject={handleLoadProject} />;
      default:
        return <HomePage onGenerate={handleStartBuilding} isTrialActive={!!proTrialEndTime} trialEndTime={proTrialEndTime} />;
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
      <OnboardingModal isOpen={showOnboarding} onFinish={handleOnboardingFinish} />
      {userName && currentPage === 'home' && <UserGreeting name={userName} />}
      <ProBadge isVisible={isPro} isTrial={!!proTrialEndTime} />
       <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        onStartTrial={handleStartTrial}
        referrerId={referrerId}
      />
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
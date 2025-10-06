import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import BuilderPage from './pages/BuilderPage';
import SettingsPage from './pages/SettingsPage';
import PlansPage from './pages/PlansPage';
import ProjectsPage from './pages/ProjectsPage';
import NewsPage from './pages/NewsPage';
import StudioPage from './pages/StudioPage';
import Sidebar, { SidebarPage } from './components/Sidebar';
import ProBadge from './components/ProBadge';
import ReferralModal from './components/ReferralModal';
import OnboardingModal from './components/OnboardingModal';
import UserGreeting from './components/UserGreeting';
import UpgradeModal from './components/UpgradeModal';
import { SavedProject } from './types';

type Page = 'home' | 'builder' | 'projects' | 'settings' | 'plans' | 'news' | 'studio';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [builderPrompt, setBuilderPrompt] = useState<string>('');
  const [projectToLoad, setProjectToLoad] = useState<SavedProject | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [proTrialEndTime, setProTrialEndTime] = useState<number | null>(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

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

    // Check for permanent Pro status first. This is the highest priority.
    const permanentProStatus = localStorage.getItem('isPro') === 'true';
    if (permanentProStatus) {
      setIsPro(true);
    } else {
      // Grant the one-time 7-day trial if it hasn't been granted before.
      const freeWeekGranted = localStorage.getItem('proTrialFreeWeekGranted') === 'true';
      if (!freeWeekGranted) {
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        const endTime = Date.now() + sevenDaysInMs;
        localStorage.setItem('proTrialEndTime', String(endTime));
        localStorage.setItem('proTrialFreeWeekGranted', 'true');
        setProTrialEndTime(endTime);
        setIsPro(true);
      } else {
        // If the free week was already granted, check if the trial is still active.
        const trialEndTimeStr = localStorage.getItem('proTrialEndTime');
        if (trialEndTimeStr) {
          const endTime = parseInt(trialEndTimeStr, 10);
          if (Date.now() < endTime) {
            setIsPro(true);
            setProTrialEndTime(endTime);
          } else {
            setIsPro(false);
            setProTrialEndTime(null);
            localStorage.removeItem('proTrialEndTime'); // Clean up expired trial
          }
        }
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for referral
    const refCode = urlParams.get('ref');
    const referralSeen = localStorage.getItem('referralSeen') === 'true';

    if (refCode && !referralSeen && !permanentProStatus) {
      setReferrerId(refCode);
      setIsReferralModalOpen(true);
      localStorage.setItem('referralSeen', 'true');
    }

    // Handle payment redirect
    if (urlParams.has('upgraded')) {
      localStorage.setItem('isPro', 'true');
      setIsPro(true);
      setProTrialEndTime(null);
      localStorage.removeItem('proTrialEndTime');
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
    if (['home', 'settings', 'projects', 'plans', 'news', 'studio'].includes(page)) {
      setCurrentPage(page as Page);
    } else {
      alert(`The '${page}' page is not implemented in this demo.`);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onGenerate={handleStartBuilding} isTrialActive={!!proTrialEndTime} trialEndTime={proTrialEndTime} />;
      case 'builder':
        return <BuilderPage initialPrompt={builderPrompt} initialProject={projectToLoad} isTrialActive={!!proTrialEndTime} trialEndTime={proTrialEndTime} />;
      case 'settings':
        return <SettingsPage isPro={isPro} onUpgradeClick={() => setIsUpgradeModalOpen(true)} />;
      case 'plans':
        return <PlansPage />;
      case 'projects':
        return <ProjectsPage onLoadProject={handleLoadProject} />;
      case 'news':
        return <NewsPage />;
      case 'studio':
        return <StudioPage onGenerate={handleStartBuilding} />;
      default:
        return <HomePage onGenerate={handleStartBuilding} isTrialActive={!!proTrialEndTime} trialEndTime={proTrialEndTime} />;
    }
  };

  const getActivePageForSidebar = (): SidebarPage | null => {
    if (['home', 'projects', 'settings', 'plans', 'news', 'studio'].includes(currentPage)) {
      return currentPage as SidebarPage;
    }
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
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
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

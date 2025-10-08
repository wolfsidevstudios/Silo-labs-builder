import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import BuilderPage from './pages/BuilderPage';
import SettingsPage from './pages/SettingsPage';
import PlansPage from './pages/PlansPage';
import ProjectsPage from './pages/ProjectsPage';
import NewsPage from './pages/NewsPage';
import SiloMaxPage from './pages/SiloMaxPage';
import Sidebar, { SidebarPage } from './components/Sidebar';
import ProBadge from './components/ProBadge';
import ReferralModal from './components/ReferralModal';
import OnboardingModal from './components/OnboardingModal';
import UserGreeting from './components/UserGreeting';
import UpgradeModal from './components/UpgradeModal';
import Logo from './components/Logo';
import { trackAffiliateClick } from './services/affiliateService';
import { SavedProject, FirebaseUser } from './types';
import FeatureDropModal from './components/FeatureDropModal';
import { auth } from './services/firebaseService';

type Page = 'home' | 'builder' | 'projects' | 'settings' | 'plans' | 'news' | 'max';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [builderPrompt, setBuilderPrompt] = useState<string>('');
  const [builderIsLisaActive, setBuilderIsLisaActive] = useState<boolean>(false);
  const [projectToLoad, setProjectToLoad] = useState<SavedProject | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isFeatureDropModalOpen, setIsFeatureDropModalOpen] = useState(false);

  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // State for new onboarding flow
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // --- Auth Setup ---
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
            setUser(firebaseUser as FirebaseUser);
            const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';

            if (onboardingCompleted) {
                setUserName(localStorage.getItem('userName'));
                setShowOnboarding(false);
            } else {
                setShowOnboarding(true);
            }
        } else {
            // No user is signed in, so we start an anonymous session.
            setUser(null);
            auth.signInAnonymously().catch(err => console.error("Anonymous sign-in failed:", err));
        }
    });

    // --- Other Initializations ---
    // Feature Drop Modal check
    const featureDropSeen = localStorage.getItem('featureDrop_oct2025_v3_seen') === 'true';
    if (!featureDropSeen) {
        setIsFeatureDropModalOpen(true);
    }

    const permanentProStatus = localStorage.getItem('isPro') === 'true';
    setIsPro(permanentProStatus);

    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    const referralSeen = localStorage.getItem('referralSeen') === 'true';
    if (refCode && !referralSeen && !permanentProStatus) {
      setReferrerId(refCode);
      setIsReferralModalOpen(true);
      trackAffiliateClick(refCode);
      localStorage.setItem('referralSeen', 'true');
    }

    if (urlParams.has('upgraded')) {
      localStorage.setItem('isPro', 'true');
      setIsPro(true);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('upgraded');
      newUrl.searchParams.delete('ref');
      window.history.replaceState(null, '', newUrl.toString());
    }

    return () => {
      unsubscribe();
    };
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

  const handleStartBuilding = (prompt: string, isLisaActive: boolean) => {
    setBuilderPrompt(prompt);
    setBuilderIsLisaActive(isLisaActive);
    setProjectToLoad(null); // Ensure we're not loading an old project
    setCurrentPage('builder');
  };
  
  const handleLoadProject = (project: SavedProject) => {
    setProjectToLoad(project);
    setBuilderPrompt(''); // Clear any prompt from home page
    setBuilderIsLisaActive(project.isLisaActive || false);
    setCurrentPage('builder');
  };

  const handleNavigate = (page: SidebarPage) => {
    if (['home', 'settings', 'projects', 'plans', 'news', 'max'].includes(page)) {
      setCurrentPage(page as Page);
    } else {
      alert(`The '${page}' page is not implemented in this demo.`);
    }
  };
  
  const handleGoHome = () => {
    setCurrentPage('home');
  };

  const handleCloseFeatureDropModal = () => {
    setIsFeatureDropModalOpen(false);
    localStorage.setItem('featureDrop_oct2025_v3_seen', 'true');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onGenerate={handleStartBuilding} />;
      case 'builder':
        return <BuilderPage initialPrompt={builderPrompt} initialProject={projectToLoad} isPro={isPro} initialIsLisaActive={builderIsLisaActive} />;
      case 'settings':
        return <SettingsPage isPro={isPro} onUpgradeClick={() => setIsUpgradeModalOpen(true)} user={user} />;
      case 'plans':
        return <PlansPage />;
      case 'projects':
        return <ProjectsPage onLoadProject={handleLoadProject} />;
      case 'news':
        return <NewsPage />;
      case 'max':
        return <SiloMaxPage />;
      default:
        return <HomePage onGenerate={handleStartBuilding} />;
    }
  };

  const getActivePageForSidebar = (): SidebarPage | null => {
    if (['home', 'projects', 'settings', 'plans', 'news', 'max'].includes(currentPage)) {
      return currentPage as SidebarPage;
    }
    return null;
  };

  return (
    <>
      <header className="fixed top-6 left-[4.5rem] z-30 flex items-center gap-4">
          <button onClick={handleGoHome} aria-label="Go to Home page" className="transition-transform hover:scale-105">
            <Logo type={currentPage === 'home' ? 'full' : 'icon'} />
          </button>
          {currentPage === 'home' && <ProBadge isVisible={isPro} />}
      </header>
      <OnboardingModal isOpen={showOnboarding} onFinish={handleOnboardingFinish} user={user} />
      {userName && currentPage === 'home' && <UserGreeting name={userName} />}
       <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        referrerId={referrerId}
      />
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
      <FeatureDropModal
        isOpen={isFeatureDropModalOpen}
        onClose={handleCloseFeatureDropModal}
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
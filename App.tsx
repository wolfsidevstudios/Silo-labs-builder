import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import BuilderPage from './pages/BuilderPage';
import SettingsPage from './pages/SettingsPage';
import PlansPage from './pages/PlansPage';
import ProjectsPage from './pages/ProjectsPage';
import NewsPage from './pages/NewsPage';
import SiloMaxPage from './pages/SiloMaxPage';
import CodePilotPage from './pages/CodePilotPage';
import PlanPage from './pages/PlanPage';
import BuildingPage from './pages/BuildingPage';
import Sidebar, { SidebarPage } from './components/Sidebar';
import ProBadge from './components/ProBadge';
import ReferralModal from './components/ReferralModal';
import OnboardingModal from './components/OnboardingModal';
import UserGreeting from './components/UserGreeting';
import UpgradeModal from './components/UpgradeModal';
import Logo from './components/Logo';
import { trackAffiliateClick } from './services/affiliateService';
import { SavedProject, FirebaseUser, GitHubRepo, AppMode, AppPlan, GeminiResponse } from './types';
import FeatureDropModal from './components/FeatureDropModal';
import { auth } from './services/firebaseService';
import FaceTrackingCursor from './components/FaceTrackingCursor';
import DiscontinuationModal from './components/DiscontinuationModal';

type Page = 'home' | 'builder' | 'projects' | 'settings' | 'plans' | 'news' | 'max' | 'codepilot' | 'plan' | 'building';

const ICONS = {
    regular: {
        favicon: "https://i.ibb.co/wZrCv8bW/Google-AI-Studio-2025-09-29-T00-09-44-063-Z-modified.png",
        manifest: "/manifest-regular.json",
    },
    liquid: {
        favicon: "https://i.ibb.co/yFmsLKxR/Generated-Image-October-08-2025-6-21-PM-modified.png",
        manifest: "/manifest-liquid.json",
    },
    light: {
        favicon: "https://i.ibb.co/9HrQSLym/Generated-Image-October-08-2025-6-19-PM-modified.png",
        manifest: "/manifest-light.json",
    }
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [projectToLoad, setProjectToLoad] = useState<SavedProject | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isFeatureDropModalOpen, setIsFeatureDropModalOpen] = useState(false);
  const [codePilotRepo, setCodePilotRepo] = useState<GitHubRepo | null>(null);
  const [isFaceTrackingEnabled, setIsFaceTrackingEnabled] = useState(false);
  const [isDiscontinuationModalOpen, setIsDiscontinuationModalOpen] = useState(false);

  const [generationData, setGenerationData] = useState<{
    prompt: string;
    isLisaActive: boolean;
    appMode: AppMode;
    revisedPrompt?: string;
    plan?: AppPlan;
  } | null>(null);


  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // State for new onboarding flow
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // --- Appearance Settings ---
    const theme = localStorage.getItem('app_theme');
    const icon = localStorage.getItem('app_icon') as keyof typeof ICONS | null;
    if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.getElementById('theme-color-meta')?.setAttribute('content', '#ffffff');
    }
    if (icon && ICONS[icon]) {
        document.getElementById('favicon-link')?.setAttribute('href', ICONS[icon].favicon);
        document.getElementById('manifest-link')?.setAttribute('href', ICONS[icon].manifest);
    }


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
    // Accessibility Features
    const faceTracking = localStorage.getItem('face_tracking_enabled') === 'true';
    setIsFaceTrackingEnabled(faceTracking);

    // Feature Drop Modal check
    const featureDropSeen = localStorage.getItem('featureDrop_oct2025_v3_seen') === 'true';
    if (!featureDropSeen) {
        setIsFeatureDropModalOpen(true);
    }
    
    // Discontinuation notice check
    const discontinuationNoticeSeen = localStorage.getItem('mobileWebAppDiscontinuationNoticeSeen') === 'true';
    if (!discontinuationNoticeSeen) {
        setIsDiscontinuationModalOpen(true);
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

  const handleStartBuilding = (prompt: string, isLisaActive: boolean, appMode: AppMode) => {
    setGenerationData({ prompt, isLisaActive, appMode });
    setCurrentPage('plan');
  };

  const handleStartCodePilot = (repo: GitHubRepo) => {
    setCodePilotRepo(repo);
    setCurrentPage('codepilot');
  };
  
  const handleLoadProject = (project: SavedProject) => {
    setProjectToLoad(project);
    setGenerationData(null); // Clear any generation flow
    setCurrentPage('builder');
  };

  const handlePlanApproved = (plan: AppPlan) => {
    setGenerationData(prev => prev ? ({ ...prev, plan }) : null);
    setCurrentPage('building');
  };

  const handlePlanRevised = (revision: string) => {
      setGenerationData(prev => prev ? ({ ...prev, revisedPrompt: revision }) : null);
  };
  
  const handleBuildComplete = (geminiResponse: GeminiResponse) => {
      if (!generationData) return;
      const finalPrompt = generationData.revisedPrompt
        ? `${generationData.prompt}\n\nUser Revision: ${generationData.revisedPrompt}`
        : generationData.prompt;

      const newProject: SavedProject = {
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          prompt: finalPrompt,
          isLisaActive: generationData.isLisaActive,
          appMode: generationData.appMode,
          ...geminiResponse
      };
      setProjectToLoad(newProject);
      setGenerationData(null);
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
    setGenerationData(null);
  };

  const handleCloseFeatureDropModal = () => {
    setIsFeatureDropModalOpen(false);
    localStorage.setItem('featureDrop_oct2025_v3_seen', 'true');
  };
  
  const handleCloseDiscontinuationModal = () => {
    setIsDiscontinuationModalOpen(false);
    localStorage.setItem('mobileWebAppDiscontinuationNoticeSeen', 'true');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onGenerate={handleStartBuilding} onStartCodePilot={handleStartCodePilot} />;
      case 'plan':
          return generationData ? <PlanPage
              initialPrompt={generationData.prompt}
              isLisaActive={generationData.isLisaActive}
              revisedPrompt={generationData.revisedPrompt}
              onApprove={handlePlanApproved}
              onDecline={handlePlanRevised}
              onGoHome={handleGoHome}
          /> : <HomePage onGenerate={handleStartBuilding} onStartCodePilot={handleStartCodePilot} />;
      case 'building':
        return generationData && generationData.plan ? <BuildingPage
            prompt={generationData.prompt}
            plan={generationData.plan}
            isLisaActive={generationData.isLisaActive}
            appMode={generationData.appMode}
            revisedPrompt={generationData.revisedPrompt}
            onBuildComplete={handleBuildComplete}
        /> : <HomePage onGenerate={handleStartBuilding} onStartCodePilot={handleStartCodePilot} />;
      case 'builder':
        return <BuilderPage initialPrompt={""} initialProject={projectToLoad} isPro={isPro} />;
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
      case 'codepilot':
        return <CodePilotPage repo={codePilotRepo!} />;
      default:
        return <HomePage onGenerate={handleStartBuilding} onStartCodePilot={handleStartCodePilot} />;
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
      {isFaceTrackingEnabled && <FaceTrackingCursor />}
      <header className="fixed top-6 left-[4.5rem] z-30 flex items-center gap-4">
          <button onClick={handleGoHome} aria-label="Go to Home page" className="transition-transform hover:scale-105">
            <Logo type={currentPage === 'home' || currentPage === 'plan' || currentPage === 'building' ? 'full' : 'icon'} />
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
      <DiscontinuationModal
        isOpen={isDiscontinuationModalOpen}
        onClose={handleCloseDiscontinuationModal}
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
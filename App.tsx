import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import BuilderPage from './pages/BuilderPage';
import SettingsPage from './pages/SettingsPage';
import PlansPage from './pages/PlansPage';
import ProjectsPage from './pages/ProjectsPage';
import NewsPage from './pages/NewsPage';
import MarketplacePage from './pages/MarketplacePage';
import ProfilePage from './pages/ProfilePage';
import Sidebar, { SidebarPage } from './components/Sidebar';
import ProBadge from './components/ProBadge';
import ReferralModal from './components/ReferralModal';
import OnboardingModal from './components/OnboardingModal';
import UserGreeting from './components/UserGreeting';
import UpgradeModal from './components/UpgradeModal';
import Logo from './components/Logo';
import { trackAffiliateClick } from './services/affiliateService';
import { SavedProject, AppFile, Session, Profile } from './types';
import FeatureDropModal from './components/FeatureDropModal';
import { getUserId, supabase, getProfile, createOrUpdateProfile } from './services/supabaseService';

type Page = 'home' | 'builder' | 'projects' | 'settings' | 'plans' | 'news' | 'marketplace' | 'profile';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [builderPrompt, setBuilderPrompt] = useState<string>('');
  const [projectToLoad, setProjectToLoad] = useState<SavedProject | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [proTrialEndTime, setProTrialEndTime] = useState<number | null>(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isFeatureDropModalOpen, setIsFeatureDropModalOpen] = useState(false);

  // Auth & Profile state
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // State for new onboarding flow
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // --- Auth Setup ---
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        setSession(session);
        const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';

        if (session) {
            const profileData = await getProfile(session.user.id);
            setProfile(profileData);
            if (profileData) {
                setUserName(profileData.username);
            } else if (!onboardingCompleted) {
                setShowOnboarding(true);
            }
        } else {
            if (!onboardingCompleted) {
                setShowOnboarding(true);
            } else {
                setUserName(localStorage.getItem('userName'));
            }
        }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        if (session) {
            const profileData = await getProfile(session.user.id);
            setProfile(profileData);
            if (profileData) {
                setUserName(profileData.username);
            }
        } else {
            setProfile(null);
            setUserName(localStorage.getItem('userName')); // Fallback to guest name
        }
    });

    // --- Other Initializations ---
    getUserId(); // Ensure anonymous user ID is created if needed.

    // Feature Drop Modal check
    const featureDropSeen = localStorage.getItem('featureDrop_oct2025_v3_seen') === 'true';
    if (!featureDropSeen) {
        setIsFeatureDropModalOpen(true);
    }

    // Check for permanent Pro status first.
    const permanentProStatus = localStorage.getItem('isPro') === 'true';
    if (permanentProStatus) {
      setIsPro(true);
    } else {
      const freeWeekGranted = localStorage.getItem('proTrialFreeWeekGranted') === 'true';
      if (!freeWeekGranted) {
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        const endTime = Date.now() + sevenDaysInMs;
        localStorage.setItem('proTrialEndTime', String(endTime));
        localStorage.setItem('proTrialFreeWeekGranted', 'true');
        setProTrialEndTime(endTime);
        setIsPro(true);
      } else {
        const trialEndTimeStr = localStorage.getItem('proTrialEndTime');
        if (trialEndTimeStr) {
          const endTime = parseInt(trialEndTimeStr, 10);
          if (Date.now() < endTime) {
            setIsPro(true);
            setProTrialEndTime(endTime);
          } else {
            setIsPro(false);
            setProTrialEndTime(null);
            localStorage.removeItem('proTrialEndTime');
          }
        }
      }
    }

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
      setProTrialEndTime(null);
      localStorage.removeItem('proTrialEndTime');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('upgraded');
      newUrl.searchParams.delete('ref');
      window.history.replaceState(null, '', newUrl.toString());
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleOnboardingFinish = async (data: { name: string; accountType: 'individual' | 'business'; businessProfile?: any }) => {
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('userName', data.name);
    
    if (data.accountType === 'business' && data.businessProfile) {
      localStorage.setItem('businessProfile', JSON.stringify(data.businessProfile));
    }
    
    setUserName(data.name);
    setShowOnboarding(false);

    if (session) {
        const updatedProfile = await createOrUpdateProfile(session.user.id, { username: data.name });
        setProfile(updatedProfile);
    }
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
    if (['home', 'settings', 'projects', 'plans', 'news', 'marketplace', 'profile'].includes(page)) {
      setCurrentPage(page as Page);
    } else {
      alert(`The '${page}' page is not implemented in this demo.`);
    }
  };

  const handleLoadAppFromMarketplace = (prompt: string, html_content: string, summary: string[]) => {
      const files: AppFile[] = [{ path: 'index.html', content: html_content }];
      const project: SavedProject = {
          id: `marketplace-${Date.now()}`,
          prompt,
          files,
          previewHtml: html_content,
          summary,
          createdAt: new Date().toISOString(),
      };
      handleLoadProject(project);
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
        return <HomePage onGenerate={handleStartBuilding} isTrialActive={!!proTrialEndTime} trialEndTime={proTrialEndTime} />;
      case 'builder':
        return <BuilderPage initialPrompt={builderPrompt} initialProject={projectToLoad} isTrialActive={isPro} trialEndTime={proTrialEndTime} />;
      case 'settings':
        return <SettingsPage isPro={isPro} onUpgradeClick={() => setIsUpgradeModalOpen(true)} />;
      case 'plans':
        return <PlansPage />;
      case 'projects':
        return <ProjectsPage onLoadProject={handleLoadProject} />;
      case 'news':
        return <NewsPage />;
      case 'marketplace':
        return <MarketplacePage onForkApp={handleLoadAppFromMarketplace} />;
      case 'profile':
        return <ProfilePage onLoadProject={handleLoadProject} />;
      default:
        return <HomePage onGenerate={handleStartBuilding} isTrialActive={!!proTrialEndTime} trialEndTime={proTrialEndTime} />;
    }
  };

  const getActivePageForSidebar = (): SidebarPage | null => {
    if (['home', 'projects', 'settings', 'plans', 'news', 'marketplace', 'profile'].includes(currentPage)) {
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
          {currentPage === 'home' && <ProBadge isVisible={isPro} isTrial={!!proTrialEndTime} />}
      </header>
      <OnboardingModal isOpen={showOnboarding} onFinish={handleOnboardingFinish} session={session} />
      {userName && currentPage === 'home' && <UserGreeting name={userName} />}
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
      <FeatureDropModal
        isOpen={isFeatureDropModalOpen}
        onClose={handleCloseFeatureDropModal}
      />
      <Sidebar
        activePage={getActivePageForSidebar()}
        onNavigate={handleNavigate}
        session={session}
      />
      <div className="font-sans antialiased">
        {renderPage()}
      </div>
    </>
  );
};

export default App;

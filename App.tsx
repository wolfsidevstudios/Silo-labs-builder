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
import { SavedProject, AppFile, FirebaseUser, Profile } from './types';
import FeatureDropModal from './components/FeatureDropModal';
import { auth, getProfile, createOrUpdateProfile } from './services/firebaseService';

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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // State for new onboarding flow
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // --- Auth Setup ---
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
            setUser(firebaseUser as FirebaseUser);
            const profileData = await getProfile(firebaseUser.uid);
            setProfile(profileData);
            const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';

            if (profileData) {
                setUserName(profileData.username);
                // Ensure onboarding is marked complete if a profile exists
                if (!onboardingCompleted) localStorage.setItem('onboardingCompleted', 'true');
                setShowOnboarding(false);
            } else { // No profile exists
                if (!onboardingCompleted) {
                    setShowOnboarding(true); // New user (anonymous or signed up)
                } else {
                    // This case handles a user who completed onboarding as a guest
                    // but hasn't created a profile in the DB yet.
                    setUserName(localStorage.getItem('userName'));
                }
            }
        } else {
            // No user is signed in, so we start an anonymous session.
            setUser(null);
            setProfile(null);
            auth.signInAnonymously().catch(err => console.error("Anonymous sign-in failed:", err));
        }
    });

    // --- Other Initializations ---
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
      unsubscribe();
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

    if (user) {
        // Create a profile for the user in Firestore
        const updatedProfile = await createOrUpdateProfile(user.uid, { username: data.name });
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

  const handleLoadAppFromMarketplace = (prompt: string, htmlContent: string, summary: string[]) => {
      const files: AppFile[] = [{ path: 'index.html', content: htmlContent }];
      const project: SavedProject = {
          id: `marketplace-${Date.now()}`,
          prompt,
          files,
          previewHtml: htmlContent,
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
        return <SettingsPage isPro={isPro} onUpgradeClick={() => setIsUpgradeModalOpen(true)} user={user} />;
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
      <OnboardingModal isOpen={showOnboarding} onFinish={handleOnboardingFinish} user={user} />
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
        profile={profile}
      />
      <div className="font-sans antialiased">
        {renderPage()}
      </div>
    </>
  );
};

export default App;

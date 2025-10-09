import React, { useState, useEffect, useCallback } from 'react';
import { Secret, Theme, GitHubUser, NetlifyUser, GeminiModelId, DataCategory, FirebaseUser } from '../types';
import { THEMES } from '../data/themes';
import { auth } from '../services/firebaseService';
import { getSecrets, addSecret, removeSecret } from '../services/secretsService';
import { getPat as getGitHubPat, savePat as saveGitHubPat, removePat as removeGitHubPat, getUserInfo as getGitHubUserInfo } from '../services/githubService';
import { getPat as getNetlifyPat, savePat as saveNetlifyPat, removePat as removeNetlifyPat, getUserInfo as getNetlifyUserInfo } from '../services/netlifyService';
import { getApiKey as getGiphyApiKey, saveApiKey as saveGiphyApiKey, removeApiKey as removeGiphyApiKey } from '../services/giphyService';
import { getAccessKey as getUnsplashAccessKey, saveAccessKey as saveUnsplashAccessKey, removeAccessKey as removeUnsplashAccessKey } from '../services/unsplashService';
import { getApiKey as getOpenAiApiKey, saveApiKey as saveOpenAiApiKey, removeApiKey as removeOpenAiApiKey } from '../services/openaiService';
import { getApiKey as getPexelsApiKey, saveApiKey as savePexelsApiKey, removeApiKey as removePexelsApiKey } from '../services/pexelsService';
import { getApiKey as getFreeSoundApiKey, saveApiKey as saveFreeSoundApiKey, removeApiKey as removeFreeSoundApiKey } from '../services/freesoundService';
import { getClientCredentials as getSpotifyCredentials, saveClientCredentials as saveSpotifyCredentials, removeClientCredentials as removeSpotifyCredentials } from '../services/spotifyService';
import { getApiKey as getStabilityApiKey, saveApiKey as saveStabilityApiKey, removeApiKey as removeStabilityApiKey } from '../services/stabilityService';
import { getApiKey as getStreamlineApiKey, saveApiKey as saveStreamlineApiKey, removeApiKey as removeStreamlineApiKey } from '../services/streamlineService';
import { getCredentials as getHuggingFaceCreds, saveCredentials as saveHuggingFaceCreds, removeCredentials as removeHuggingFaceCreds } from '../services/huggingfaceService';
import { getApiKey as getWeatherApiKey, saveApiKey as saveWeatherApiKey, removeApiKey as removeWeatherApiKey } from '../services/weatherApiService';
import { getApiKey as getOpenWeatherMapApiKey, saveApiKey as saveOpenWeatherMapApiKey, removeApiKey as removeOpenWeatherMapApiKey } from '../services/openWeatherMapService';
import { getApiKey as getTmdbApiKey, saveApiKey as saveTmdbApiKey, removeApiKey as removeTmdbApiKey } from '../services/tmdbService';
import { getApiKey as getYouTubeApiKey, saveApiKey as saveYouTubeApiKey, removeApiKey as removeYouTubeApiKey } from '../services/youtubeService';
import { getApiKey as getMapboxApiKey, saveApiKey as saveMapboxApiKey, removeApiKey as removeMapboxApiKey } from '../services/mapboxService';
import { getApiKey as getExchangeRateApiKey, saveApiKey as saveExchangeRateApiKey, removeApiKey as removeExchangeRateApiKey } from '../services/exchangeRateApiService';
import { getApiKey as getFmpApiKey, saveApiKey as saveFmpApiKey, removeApiKey as removeFmpApiKey } from '../services/financialModelingPrepService';
import { getApiKey as getNewsApiKey, saveApiKey as saveNewsApiKey, removeApiKey as removeNewsApiKey } from '../services/newsApiService';
import { getApiKey as getRawgApiKey, saveApiKey as saveRawgApiKey, removeApiKey as removeRawgApiKey } from '../services/rawgService';
import { getApiKey as getWordsApiKey, saveApiKey as saveWordsApiKey, removeApiKey as removeWordsApiKey } from '../services/wordsApiService';

import ThemeTemplateCard from '../components/ThemeTemplateCard';
import DeleteDataModal from '../components/DeleteDataModal';
import { deleteSelectedAppData } from '../services/dataService';
import SparklesIcon from '../components/icons/SparklesIcon';
import PaintBrushIcon from '../components/icons/PaintBrushIcon';
import KeyIcon from '../components/icons/KeyIcon';
import ZapIcon from '../components/icons/ZapIcon';
import AlertTriangleIcon from '../components/icons/AlertTriangleIcon';
import GitHubIcon from '../components/icons/GitHubIcon';
import NetlifyIcon from '../components/icons/NetlifyIcon';
import OpenAiIcon from '../components/icons/OpenAiIcon';
import GiphyIcon from '../components/icons/GiphyIcon';
import UnsplashIcon from '../components/icons/UnsplashIcon';
import PexelsIcon from '../components/icons/PexelsIcon';
import FreeSoundIcon from '../components/icons/FreeSoundIcon';
import SpotifyIcon from '../components/icons/SpotifyIcon';
import StableDiffusionIcon from '../components/icons/StableDiffusionIcon';
import StreamlineIcon from '../components/icons/StreamlineIcon';
import LogoDevIcon from '../components/icons/LogoDevIcon';
import GoogleIcon from '../components/icons/GoogleIcon';
import HuggingFaceIcon from '../components/icons/HuggingFaceIcon';
import WeatherApiIcon from '../components/icons/WeatherApiIcon';
import TmdbIcon from '../components/icons/TmdbIcon';
import YouTubeIcon from '../components/icons/YouTubeIcon';
import MapboxIcon from '../components/icons/MapboxIcon';
import ExchangeRateApiIcon from '../components/icons/ExchangeRateApiIcon';
import FinancialModelingPrepIcon from '../components/icons/FinancialModelingPrepIcon';
import NewsApiIcon from '../components/icons/NewsApiIcon';
import OpenWeatherMapIcon from '../components/icons/OpenWeatherMapIcon';
import RawgIcon from '../components/icons/RawgIcon';
import WordsApiIcon from '../components/icons/WordsApiIcon';
import TrashIcon from '../components/icons/TrashIcon';
import UserIcon from '../components/icons/UserIcon';
import AccessibilityIcon from '../components/icons/AccessibilityIcon';
import FaceIcon from '../components/icons/FaceIcon';

interface SettingsPageProps {
  isPro: boolean;
  onUpgradeClick: () => void;
  user: FirebaseUser | null;
}

const MODELS: { id: GeminiModelId; name: string; description: string }[] = [
    { id: 'gemini-2.5-pro', name: '2.5 Pro', description: 'Most capable model for complex tasks.' },
    { id: 'gemini-2.5-flash', name: '2.5 Flash', description: 'Fast and efficient for general tasks.' },
    { id: 'gemini-2.0-pro', name: '2.0 Pro', description: 'A powerful, high-context model from the 2.0 family.' },
    { id: 'gemini-1.5-pro', name: '1.5 Pro', description: 'Previous generation, balanced performance.' },
    { id: 'gemini-1.5-flash', name: '1.5 Flash', description: 'Fast and cost-effective legacy model.' },
];

const apiDocsLinks: Record<string, string> = {
  'Giphy': 'https://developers.giphy.com/dashboard/',
  'Unsplash': 'https://unsplash.com/oauth/applications',
  'OpenAI': 'https://platform.openai.com/api-keys',
  'Pexels': 'https://www.pexels.com/api/',
  'FreeSound': 'https://freesound.org/home/app_new/',
  'Spotify': 'https://developer.spotify.com/dashboard',
  'Stability AI': 'https://platform.stability.ai/account/keys',
  'Streamline': 'https://www.streamlinehq.com/account/my-api-keys',
  'WeatherAPI': 'https://www.weatherapi.com/my/',
  'OpenWeatherMap': 'https://home.openweathermap.org/api_keys',
  'TMDB': 'https://www.themoviedb.org/settings/api',
  'YouTube': 'https://console.cloud.google.com/apis/credentials',
  'Mapbox': 'https://account.mapbox.com/access-tokens',
  'ExchangeRate-API': 'https://www.exchangerate-api.com/user/api-keys',
  'Financial Modeling Prep': 'https://site.financialmodelingprep.com/developer/docs/dashboard',
  'NewsAPI': 'https://newsapi.org/account',
  'RAWG': 'https://rawg.io/apidocs',
  'WordsAPI': 'https://rapidapi.com/dpventures/api/wordsapi',
};


const SettingsPage: React.FC<SettingsPageProps> = ({ isPro, onUpgradeClick, user }) => {
  const [activeSection, setActiveSection] = useState('account');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // States for keys and settings
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState<GeminiModelId>('gemini-2.5-flash');
  const [githubPat, setGithubPat] = useState('');
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [netlifyPat, setNetlifyPat] = useState('');
  const [netlifyUser, setNetlifyUser] = useState<NetlifyUser | null>(null);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [newSecretName, setNewSecretName] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  const [secretError, setSecretError] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('none');
  const [aiProvider, setAiProvider] = useState('gemini');
  const [huggingFaceToken, setHuggingFaceToken] = useState('');
  const [huggingFaceModelUrl, setHuggingFaceModelUrl] = useState('');
  const [isFaceTrackingEnabled, setIsFaceTrackingEnabled] = useState(false);


  // Account section states
  const [authView, setAuthView] = useState<'main' | 'signin' | 'signup'>('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const loadSettings = useCallback(() => {
    // Load AI Provider
    setAiProvider(localStorage.getItem('ai_provider') || 'gemini');
    setGeminiKey(localStorage.getItem('gemini_api_key') || '');
    setGeminiModel((localStorage.getItem('gemini_model') as GeminiModelId) || 'gemini-2.5-flash');
    const hfCreds = getHuggingFaceCreds();
    setHuggingFaceToken(hfCreds?.token || '');
    setHuggingFaceModelUrl(hfCreds?.modelUrl || '');

    // Load Integrations
    const ghPat = getGitHubPat();
    if (ghPat) {
      setGithubPat(ghPat);
      getGitHubUserInfo(ghPat).then(setGithubUser).catch(() => {
        removeGitHubPat(); // Invalid token
        setGithubPat('');
      });
    }
    const ntPat = getNetlifyPat();
    if (ntPat) {
      setNetlifyPat(ntPat);
      getNetlifyUserInfo(ntPat).then(setNetlifyUser).catch(() => {
        removeNetlifyPat();
        setNetlifyPat('');
      });
    }

    // Load secrets & theme
    setSecrets(getSecrets());
    setSelectedTheme(localStorage.getItem('ui_theme_template') || 'none');
    // Load accessibility settings
    setIsFaceTrackingEnabled(localStorage.getItem('face_tracking_enabled') === 'true');

  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (activeSection !== 'account') {
      setAuthView('main');
      setAuthError(null);
      setEmail('');
      setPassword('');
    }
  }, [activeSection]);
  
  const handleAuthAction = async (action: 'signup' | 'signin') => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
        if (action === 'signup') {
            await auth.signUp({ email, password });
        } else {
            await auth.signInWithPassword({ email, password });
        }
    } catch (e) {
        setAuthError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsAuthLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
        await auth.signInWithOAuth(provider);
    } catch (e) {
        setAuthError(e instanceof Error ? e.message : 'An unknown error occurred.');
        setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
  };

  const handleDisconnectGitHub = () => {
    removeGitHubPat();
    setGithubPat('');
    setGithubUser(null);
  };
  
  const handleSaveNetlify = () => {
    saveNetlifyPat(netlifyPat);
    getNetlifyUserInfo(netlifyPat).then(setNetlifyUser).catch(() => alert("Invalid Netlify PAT"));
    alert('Netlify Token saved!');
  };
  
  const handleDisconnectNetlify = () => {
    removeNetlifyPat();
    setNetlifyPat('');
    setNetlifyUser(null);
  };
  
  const handleAddSecret = () => {
    if (!newSecretName || !newSecretValue) {
      setSecretError("Both name and value are required.");
      return;
    }
    try {
      addSecret({ name: newSecretName, value: newSecretValue });
      setSecrets(getSecrets());
      setNewSecretName('');
      setNewSecretValue('');
      setSecretError('');
    } catch (e) {
      if (e instanceof Error) setSecretError(e.message);
    }
  };

  const handleRemoveSecret = (name: string) => {
    removeSecret(name);
    setSecrets(getSecrets());
  };

  const handleThemeSelect = (themeId: string) => {
    const newThemeId = selectedTheme === themeId ? 'none' : themeId;
    setSelectedTheme(newThemeId);
    localStorage.setItem('ui_theme_template', newThemeId);
  };

  const handleSaveAiProvider = () => {
    localStorage.setItem('ai_provider', aiProvider);
    if (aiProvider === 'gemini') {
        localStorage.setItem('gemini_api_key', geminiKey);
        localStorage.setItem('gemini_model', geminiModel);
    } else if (aiProvider === 'huggingface') {
        saveHuggingFaceCreds(huggingFaceToken, huggingFaceModelUrl);
    }
    alert('AI Provider settings saved!');
  };
  
  const handleDeleteData = (categories: DataCategory[]) => {
    if (categories.length > 0) {
      deleteSelectedAppData(categories);
    }
    setIsDeleteModalOpen(false);
  };

  const handleToggleFaceTracking = () => {
    const newValue = !isFaceTrackingEnabled;
    setIsFaceTrackingEnabled(newValue);
    localStorage.setItem('face_tracking_enabled', String(newValue));
    alert(newValue 
        ? "Face Tracking enabled. Please allow camera access and reload the page for the feature to activate."
        : "Face Tracking disabled. Please reload the page to apply the change."
    );
  };

  const sections = [
    { id: 'account', name: 'Account', icon: UserIcon },
    { id: 'accessibility', name: 'Accessibility', icon: AccessibilityIcon },
    { id: 'ai', name: 'AI Settings', icon: SparklesIcon },
    { id: 'themes', name: 'UI Themes', icon: PaintBrushIcon },
    { id: 'secrets', name: 'Global Secrets', icon: KeyIcon },
    { id: 'integrations', name: 'Integrations', icon: ZapIcon },
    { id: 'danger', name: 'Danger Zone', icon: AlertTriangleIcon },
  ];
  
  const integrationsList = [
      { name: 'Giphy', icon: GiphyIcon, get: getGiphyApiKey, save: saveGiphyApiKey, remove: removeGiphyApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'Unsplash', icon: UnsplashIcon, get: getUnsplashAccessKey, save: saveUnsplashAccessKey, remove: removeUnsplashAccessKey, fields: [{name: 'Access Key', type: 'password'}] },
      { name: 'OpenAI', icon: OpenAiIcon, get: getOpenAiApiKey, save: saveOpenAiApiKey, remove: removeOpenAiApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'Pexels', icon: PexelsIcon, get: getPexelsApiKey, save: savePexelsApiKey, remove: removePexelsApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'FreeSound', icon: FreeSoundIcon, get: getFreeSoundApiKey, save: saveFreeSoundApiKey, remove: removeFreeSoundApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'Spotify', icon: SpotifyIcon, getCreds: getSpotifyCredentials, saveCreds: saveSpotifyCredentials, removeCreds: removeSpotifyCredentials, fields: [{name: 'Client ID', type: 'text'}, {name: 'Client Secret', type: 'password'}] },
      { name: 'Stability AI', icon: StableDiffusionIcon, get: getStabilityApiKey, save: saveStabilityApiKey, remove: removeStabilityApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'Streamline', icon: StreamlineIcon, get: getStreamlineApiKey, save: saveStreamlineApiKey, remove: removeStreamlineApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'WeatherAPI', icon: WeatherApiIcon, get: getWeatherApiKey, save: saveWeatherApiKey, remove: removeWeatherApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'OpenWeatherMap', icon: OpenWeatherMapIcon, get: getOpenWeatherMapApiKey, save: saveOpenWeatherMapApiKey, remove: removeOpenWeatherMapApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'TMDB', icon: TmdbIcon, get: getTmdbApiKey, save: saveTmdbApiKey, remove: removeTmdbApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'YouTube', icon: YouTubeIcon, get: getYouTubeApiKey, save: saveYouTubeApiKey, remove: removeYouTubeApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'Mapbox', icon: MapboxIcon, get: getMapboxApiKey, save: saveMapboxApiKey, remove: removeMapboxApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'ExchangeRate-API', icon: ExchangeRateApiIcon, get: getExchangeRateApiKey, save: saveExchangeRateApiKey, remove: removeExchangeRateApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'Financial Modeling Prep', icon: FinancialModelingPrepIcon, get: getFmpApiKey, save: saveFmpApiKey, remove: removeFmpApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'NewsAPI', icon: NewsApiIcon, get: getNewsApiKey, save: saveNewsApiKey, remove: removeNewsApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'RAWG', icon: RawgIcon, get: getRawgApiKey, save: saveRawgApiKey, remove: removeRawgApiKey, fields: [{name: 'API Key', type: 'password'}] },
      { name: 'WordsAPI', icon: WordsApiIcon, get: getWordsApiKey, save: saveWordsApiKey, remove: removeWordsApiKey, fields: [{name: 'API Key', type: 'password'}] },
  ];

  return (
    <>
      <DeleteDataModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteData} />
      <div className="min-h-screen w-screen bg-black flex p-4 pl-[4.5rem] selection:bg-indigo-500 selection:text-white">
        <main className="w-full max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text mb-12">
            Settings
          </h1>

          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="lg:w-1/4">
              <nav className="space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <section.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold">{section.name}</span>
                  </button>
                ))}
              </nav>
            </aside>

            <div className="flex-grow">
              {activeSection === 'account' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Account</h2>
                   <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                      {user && !user.isAnonymous ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-white">{user.email || 'Authenticated User'}</p>
                                <p className="text-sm text-slate-400">You are signed in.</p>
                            </div>
                            <button onClick={handleSignOut} className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-lg text-sm">
                                Sign Out
                            </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-bold text-lg text-white mb-2">Create an Account or Log In</h3>
                          <p className="text-slate-400 mb-6 text-sm">
                            Sign up or log in to publish apps, save your profile, and connect with other builders.
                          </p>
                          {authView === 'main' && (
                              <div className="w-full space-y-3 animate-fade-in">
                                  <button onClick={() => handleOAuthSignIn('google')} disabled={isAuthLoading} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-full font-semibold hover:bg-white/10 transition-colors">
                                      <GoogleIcon className="w-5 h-5" /> Continue with Google
                                  </button>
                                  <button onClick={() => handleOAuthSignIn('github')} disabled={isAuthLoading} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-full font-semibold hover:bg-white/10 transition-colors">
                                      <GitHubIcon className="w-5 h-5" /> Continue with GitHub
                                  </button>
                                  <div className="flex items-center gap-4 py-2">
                                      <hr className="w-full border-slate-700" />
                                      <span className="text-slate-500 text-xs">OR</span>
                                      <hr className="w-full border-slate-700" />
                                  </div>
                                  <button onClick={() => setAuthView('signup')} className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-full font-semibold transition-colors">
                                      Sign up with Email
                                  </button>
                                  <p className="text-sm text-center text-slate-400">
                                      Already have an account? <button onClick={() => setAuthView('signin')} className="font-semibold text-indigo-400 hover:underline">Log in</button>
                                  </p>
                              </div>
                          )}
                          {(authView === 'signin' || authView === 'signup') && (
                              <form onSubmit={e => {e.preventDefault(); handleAuthAction(authView === 'signup' ? 'signup' : 'signin');}} className="w-full space-y-4 animate-fade-in">
                                  <h2 className="text-xl font-bold text-white">{authView === 'signin' ? 'Log In' : 'Sign Up'}</h2>
                                  {authError && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{authError}</p>}
                                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                  <button type="submit" disabled={isAuthLoading} className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full font-semibold transition-colors disabled:bg-slate-500">
                                      {isAuthLoading ? 'Loading...' : (authView === 'signin' ? 'Log In' : 'Sign Up')}
                                  </button>
                                  <button type="button" onClick={() => { setAuthView('main'); setAuthError(null); }} className="text-sm text-slate-500 hover:text-slate-300">
                                      &larr; Back to all options
                                  </button>
                              </form>
                          )}
                        </>
                      )}
                   </div>
                </div>
              )}

              {activeSection === 'accessibility' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Accessibility</h2>
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <FaceIcon className="w-6 h-6 text-indigo-400"/>
                        <div>
                          <h3 className="font-bold text-lg text-white">Face Tracking Navigation</h3>
                          <p className="text-slate-400 text-sm mt-1">Control the cursor with your head and click by opening your mouth.</p>
                        </div>
                      </div>
                      <button
                        onClick={handleToggleFaceTracking}
                        role="switch"
                        aria-checked={isFaceTrackingEnabled}
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 ${isFaceTrackingEnabled ? 'bg-indigo-600' : 'bg-slate-600'}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${isFaceTrackingEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'ai' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">AI Settings</h2>
                   <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                        <label className="block text-lg font-semibold text-slate-200 mb-4">AI Provider</label>
                         <div className="flex gap-4 mb-6">
                             <div onClick={() => setAiProvider('gemini')} className={`flex-1 p-4 border rounded-lg cursor-pointer ${aiProvider === 'gemini' ? 'border-indigo-500' : 'border-slate-700'}`}>
                                <h3 className="font-bold flex items-center gap-2"><GoogleIcon className="w-5 h-5"/> Gemini</h3>
                                <p className="text-sm text-slate-400 mt-1">Use Google's powerful and fast models.</p>
                             </div>
                              <div onClick={() => setAiProvider('huggingface')} className={`flex-1 p-4 border rounded-lg cursor-pointer ${aiProvider === 'huggingface' ? 'border-indigo-500' : 'border-slate-700'}`}>
                                <h3 className="font-bold flex items-center gap-2"><HuggingFaceIcon className="w-5 h-5"/> Hugging Face</h3>
                                <p className="text-sm text-slate-400 mt-1">Use a custom model from Hugging Face.</p>
                             </div>
                         </div>

                        {aiProvider === 'gemini' && (
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="gemini-key" className="block text-sm font-medium text-slate-300 mb-2">Gemini API Key</label>
                                    <input id="gemini-key" type="password" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-full px-4" />
                                     <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline mt-2 inline-block ml-2">
                                        Get your Gemini API Key
                                    </a>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Default Generation Model</label>
                                    <div className="space-y-2">
                                        {MODELS.map((model) => (
                                            <div
                                                key={model.id}
                                                onClick={() => setGeminiModel(model.id)}
                                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                    geminiModel === model.id
                                                        ? 'bg-indigo-900/50 border-indigo-500'
                                                        : 'border-slate-700 hover:bg-slate-800'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-white">{model.name}</span>
                                                    <div
                                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                            geminiModel === model.id ? 'border-indigo-400' : 'border-slate-600'
                                                        }`}
                                                    >
                                                        {geminiModel === model.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-400"></div>}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-400 mt-1">{model.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {aiProvider === 'huggingface' && (
                             <div className="space-y-4">
                                <div>
                                    <label htmlFor="hf-token" className="block text-sm font-medium text-slate-300 mb-2">Hugging Face Access Token</label>
                                    <input id="hf-token" type="password" value={huggingFaceToken} onChange={e => setHuggingFaceToken(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-full px-4" />
                                    <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline mt-2 inline-block ml-2">
                                        Get your Hugging Face Token
                                    </a>
                                </div>
                                 <div>
                                    <label htmlFor="hf-model" className="block text-sm font-medium text-slate-300 mb-2">Model URL (Inference API)</label>
                                    <input id="hf-model" type="text" value={huggingFaceModelUrl} onChange={e => setHuggingFaceModelUrl(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-full px-4" />
                                </div>
                             </div>
                        )}
                        <button onClick={handleSaveAiProvider} className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full">Save AI Settings</button>
                   </div>
                </div>
              )}

              {activeSection === 'themes' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">UI Theme Templates</h2>
                  <p className="text-slate-400 mb-6">Guide the AI with a pre-defined design system. Select a theme to apply it to all future generations.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {THEMES.map(theme => (
                      <ThemeTemplateCard key={theme.id} theme={theme} isSelected={selectedTheme === theme.id} onSelect={handleThemeSelect} isProUser={isPro}/>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'secrets' && (
                 <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Global Custom Secrets</h2>
                  <p className="text-slate-400 mb-6">Add secret keys that the AI can use in your generated apps via `process.env.SECRET_NAME`. These are stored securely in your browser's local storage.</p>
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <input value={newSecretName} onChange={e => setNewSecretName(e.target.value)} placeholder="Secret Name (e.g., MY_API_KEY)" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-full px-4"/>
                            <input type="password" value={newSecretValue} onChange={e => setNewSecretValue(e.target.value)} placeholder="Secret Value" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-full px-4"/>
                        </div>
                        {secretError && <p className="text-red-400 text-sm mt-3">{secretError}</p>}
                        <div className="text-right mt-4"><button onClick={handleAddSecret} className="px-5 py-2 font-semibold rounded-full bg-indigo-600 hover:bg-indigo-500 text-white">Add Secret</button></div>

                        {secrets.length > 0 && <div className="mt-6 border-t border-slate-700 pt-6 space-y-3">
                            {secrets.map(secret => <div key={secret.name} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg"><p className="font-mono text-sm text-slate-200">{secret.name}</p><button onClick={() => handleRemoveSecret(secret.name)} className="p-2 text-slate-500 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button></div>)}
                        </div>}
                    </div>
                </div>
              )}
              
              {activeSection === 'integrations' && (
                 <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Integrations</h2>
                    <p className="text-slate-400 mb-6">Connect your accounts to enable features like saving to GitHub, one-click deploys with Netlify, and using various APIs in your generated apps.</p>
                    <div className="space-y-6">
                         <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><GitHubIcon className="w-6 h-6"/> GitHub</h3>
                            {githubUser ? <div className="flex items-center justify-between"><div className="flex items-center gap-3"><img src={githubUser.avatar_url} alt={githubUser.login} className="w-10 h-10 rounded-full"/><div><p className="font-semibold text-white">{githubUser.name || githubUser.login}</p><a href={githubUser.html_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline">View Profile</a></div></div><button onClick={handleDisconnectGitHub} className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-lg text-sm">Disconnect</button></div> : (
                                <div className="flex items-center gap-4">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-4">
                                            <input type="password" value={githubPat} onChange={e => setGithubPat(e.target.value)} placeholder="Personal Access Token" className="flex-grow p-3 bg-slate-800 border border-slate-700 rounded-full px-4"/>
                                            <button onClick={() => { saveGitHubPat(githubPat); getGitHubUserInfo(githubPat).then(setGithubUser).catch(() => alert("Invalid GitHub PAT")); alert('GitHub Token saved!'); }} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full">Connect</button>
                                        </div>
                                        <a href="https://github.com/settings/tokens/new?description=Silo%20Build&scopes=repo,read:user" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline mt-2 ml-2 inline-block">
                                            Get your GitHub PAT (repo & read:user scopes pre-selected)
                                        </a>
                                    </div>
                                </div>
                            )}
                         </div>
                          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><NetlifyIcon className="w-6 h-6"/> Netlify</h3>
                            {netlifyUser ? <div className="flex items-center justify-between"><div className="flex items-center gap-3"><img src={netlifyUser.avatar_url} alt={netlifyUser.full_name} className="w-10 h-10 rounded-full"/><div><p className="font-semibold text-white">{netlifyUser.full_name}</p><p className="text-sm text-slate-400">{netlifyUser.email}</p></div></div><button onClick={handleDisconnectNetlify} className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-lg text-sm">Disconnect</button></div> : (
                                <div className="flex items-center gap-4">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-4">
                                            <input type="password" value={netlifyPat} onChange={e => setNetlifyPat(e.target.value)} placeholder="Personal Access Token" className="flex-grow p-3 bg-slate-800 border border-slate-700 rounded-full px-4"/>
                                            <button onClick={handleSaveNetlify} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full">Connect</button>
                                        </div>
                                        <a href="https://app.netlify.com/user/applications#personal-access-tokens" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline mt-2 ml-2 inline-block">
                                            Get your Netlify PAT
                                        </a>
                                    </div>
                                </div>
                            )}
                         </div>
                    </div>
                     <h3 className="text-xl font-bold text-white mt-12 mb-6">Available APIs</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {integrationsList.map(api => <ApiKeyManager key={api.name} {...api} />)}
                     </div>
                 </div>
              )}

              {activeSection === 'danger' && (
                <div>
                  <h2 className="text-2xl font-bold text-red-400 mb-4">Danger Zone</h2>
                  <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-red-300">Manage & Delete App Data</h3>
                    <p className="text-red-300/80 mt-2 mb-4">Selectively delete local data like projects, API keys, or settings. This action cannot be undone.</p>
                    <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg">Manage & Delete Data</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

const ApiKeyManager: React.FC<{
  name: string;
  icon: React.FC<any>;
  get?: () => string | null;
  save?: (key: string) => void;
  remove?: () => void;
  getCreds?: () => { [key: string]: string } | null;
  saveCreds?: (...args: string[]) => void;
  removeCreds?: () => void;
  fields: { name: string; type: string }[];
}> = ({ name, icon: Icon, get, save, remove, getCreds, saveCreds, removeCreds, fields }) => {
    
    const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>(() => {
        const initial: { [key: string]: string } = {};
        fields.forEach(f => initial[f.name] = '');
        return initial;
    });
    const [isConnected, setIsConnected] = useState(false);
    const docLink = apiDocsLinks[name];

    useEffect(() => {
        let connected = false;
        if (get) {
            if (get()) connected = true;
        } else if (getCreds) {
            if (getCreds()) connected = true;
        }
        setIsConnected(connected);
    }, [get, getCreds]);

    const handleFieldChange = (fieldName: string, value: string) => {
        setFieldValues(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSave = () => {
        if (save) {
            const key = fieldValues[fields[0].name];
            if (key) {
                save(key);
                setIsConnected(true);
                alert(`${name} API Key saved!`);
            }
        } else if (saveCreds) {
            const values = fields.map(f => fieldValues[f.name]);
            if (values.every(v => v)) {
                saveCreds(...values);
                setIsConnected(true);
                alert(`${name} credentials saved!`);
            }
        }
    };

    const handleRemove = () => {
        if (remove) remove();
        if (removeCreds) removeCreds();
        
        const resetValues: { [key: string]: string } = {};
        fields.forEach(f => resetValues[f.name] = '');
        setFieldValues(resetValues);
        
        setIsConnected(false);
    };

    return (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
            <h3 className="font-bold text-md text-white mb-3 flex items-center gap-2"><Icon className="w-5 h-5"/> {name}</h3>
            {isConnected ? (
                 <div className="flex items-center justify-between">
                    <p className="text-sm text-green-400">Connected</p>
                    <button onClick={handleRemove} className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-md text-xs">Disconnect</button>
                 </div>
            ) : (
                <div>
                    <div className="space-y-2">
                        {fields.map(field => (
                            <input 
                                key={field.name}
                                type={field.type}
                                value={fieldValues[field.name]}
                                onChange={e => handleFieldChange(field.name, e.target.value)}
                                placeholder={field.name}
                                className="w-full p-2.5 px-4 text-sm bg-slate-800 border border-slate-700 rounded-full"
                            />
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        {docLink && (
                            <a href={docLink} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline ml-2">
                                Get your {name} key
                            </a>
                        )}
                        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full text-sm ml-auto">Save</button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default SettingsPage;
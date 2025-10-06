import React, { useState, useEffect } from 'react';
import EyeIcon from '../components/icons/EyeIcon';
import EyeOffIcon from '../components/icons/EyeOffIcon';
import TrashIcon from '../components/icons/TrashIcon';
import KeyIcon from '../components/icons/KeyIcon';
import GitHubIcon from '../components/icons/GitHubIcon';
import NetlifyIcon from '../components/icons/NetlifyIcon';
import GiphyIcon from '../components/icons/GiphyIcon';
import UnsplashIcon from '../components/icons/UnsplashIcon';
import OpenAiIcon from '../components/icons/OpenAiIcon';
import { THEMES } from '../data/themes';
import ThemeTemplateCard from '../components/ThemeTemplateCard';
import { Secret, GitHubUser, GitHubRepo, NetlifyUser, NetlifySite } from '../types';
import { getSecrets, addSecret, removeSecret } from '../services/secretsService';
import { savePat as saveGitHubPat, getPat as getGitHubPat, removePat as removeGitHubPat, getUserInfo as getGitHubUserInfo, getRepositories } from '../services/githubService';
import { savePat as saveNetlifyPat, getPat as getNetlifyPat, removePat as removeNetlifyPat, getUserInfo as getNetlifyUserInfo, getSites as getNetlifySites } from '../services/netlifyService';
import { saveApiKey as saveGiphyKey, getApiKey as getGiphyKey, removeApiKey as removeGiphyKey, searchGifs } from '../services/giphyService';
import { saveAccessKey as saveUnsplashKey, getAccessKey as getUnsplashKey, removeAccessKey as removeUnsplashKey, searchPhotos as testUnsplash } from '../services/unsplashService';
import { saveApiKey as saveOpenAiKey, getApiKey as getOpenAiKey, removeApiKey as removeOpenAiKey, verifyApiKey as testOpenAi } from '../services/openaiService';


type GeminiModel = 'gemini-2.5-flash' | 'gemini-2.5-pro';

interface SettingsPageProps {
  isPro: boolean;
  onUpgradeClick: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isPro, onUpgradeClick }) => {
  const [apiKey, setApiKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('none');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-2.5-flash');
  
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [newSecretName, setNewSecretName] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  const [isSecretValueVisible, setIsSecretValueVisible] = useState(false);
  const [secretError, setSecretError] = useState<string | null>(null);

  // GitHub State
  const [githubPat, setGithubPat] = useState('');
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [isGitHubConnecting, setIsGitHubConnecting] = useState(false);

  // Netlify State
  const [netlifyPat, setNetlifyPat] = useState('');
  const [netlifyUser, setNetlifyUser] = useState<NetlifyUser | null>(null);
  const [netlifySites, setNetlifySites] = useState<NetlifySite[]>([]);
  const [netlifyError, setNetlifyError] = useState<string | null>(null);
  const [isNetlifyConnecting, setIsNetlifyConnecting] = useState(false);

  // Giphy State
  const [giphyApiKey, setGiphyApiKey] = useState('');
  const [isGiphyConnected, setIsGiphyConnected] = useState(false);
  const [giphyError, setGiphyError] = useState<string | null>(null);
  const [isGiphyConnecting, setIsGiphyConnecting] = useState(false);

  // Unsplash State
  const [unsplashKey, setUnsplashKey] = useState('');
  const [isUnsplashConnected, setIsUnsplashConnected] = useState(false);
  const [unsplashError, setUnsplashError] = useState<string | null>(null);
  const [isUnsplashConnecting, setIsUnsplashConnecting] = useState(false);

  // OpenAI State
  const [openAiKey, setOpenAiKey] = useState('');
  const [isOpenAiConnected, setIsOpenAiConnected] = useState(false);
  const [openAiError, setOpenAiError] = useState<string | null>(null);
  const [isOpenAiConnecting, setIsOpenAiConnecting] = useState(false);

  // Experimental Features
  const [isLivePreviewEnabled, setIsLivePreviewEnabled] = useState(false);


  useEffect(() => {
    // Load Gemini Key
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setApiKey(storedKey);

    const storedTheme = localStorage.getItem('ui_theme_template');
    setSelectedTheme(storedTheme || 'none');
    if (!storedTheme) localStorage.setItem('ui_theme_template', 'none');

    const storedModel = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';
    setSelectedModel(storedModel as GeminiModel);

    setSecrets(getSecrets());

    // Load Experimental settings
    const livePreview = localStorage.getItem('experimental_live_preview') === 'true';
    setIsLivePreviewEnabled(livePreview);

    // Load and verify GitHub connection
    const ghPat = getGitHubPat();
    if (ghPat) {
        setIsGitHubConnecting(true);
        getGitHubUserInfo(ghPat)
            .then(user => { setGithubUser(user); return getRepositories(ghPat); })
            .then(repos => setGithubRepos(repos))
            .catch(() => { setGithubError("Your PAT seems to be invalid or expired."); removeGitHubPat(); })
            .finally(() => setIsGitHubConnecting(false));
    }

    // Load and verify Netlify connection
    const ntPat = getNetlifyPat();
    if (ntPat) {
      setIsNetlifyConnecting(true);
      getNetlifyUserInfo(ntPat)
        .then(user => {
            setNetlifyUser(user);
            return getNetlifySites(ntPat);
        })
        .then(sites => setNetlifySites(sites))
        .catch(() => { setNetlifyError("Your PAT seems to be invalid or expired."); removeNetlifyPat(); })
        .finally(() => setIsNetlifyConnecting(false));
    }

    // Load and verify Giphy connection
    const gphKey = getGiphyKey();
    if (gphKey) {
      setIsGiphyConnected(true);
    }

    // Load and verify Unsplash connection
    const uspKey = getUnsplashKey();
    if (uspKey) {
      setIsUnsplashConnected(true);
    }

    // Load and verify OpenAI connection
    const oaiKey = getOpenAiKey();
    if (oaiKey) {
      setIsOpenAiConnected(true);
    }

  }, []);

  const handleSaveApiKey = () => {
    if (saveStatus !== 'idle') return;
    setSaveStatus('saving');
    localStorage.setItem('gemini_api_key', apiKey);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };
  
  const handleAddSecret = () => {
    if (!isPro) {
      onUpgradeClick();
      return;
    }

    setSecretError(null);
    if (!newSecretName.trim() || !newSecretValue.trim()) {
        setSecretError("Both name and value are required."); return;
    }
    if (!/^[A-Z_][A-Z0-9_]*$/.test(newSecretName)) {
        setSecretError("Name must be uppercase letters, numbers, and underscores, and cannot start with a number."); return;
    }
    try {
        addSecret({ name: newSecretName.trim(), value: newSecretValue.trim() });
        setSecrets(getSecrets());
        setNewSecretName('');
        setNewSecretValue('');
    } catch (error) { if (error instanceof Error) setSecretError(error.message); }
  };
  
  const handleRemoveSecret = (name: string) => {
      removeSecret(name);
      setSecrets(getSecrets());
  };

  const handleSelectTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (themeId !== 'none' && !theme) return;
    if (theme?.isPro && !isPro) {
      onUpgradeClick(); return;
    }
    setSelectedTheme(themeId);
    localStorage.setItem('ui_theme_template', themeId);
  };

  const handleSelectModel = (model: GeminiModel) => {
    setSelectedModel(model);
    localStorage.setItem('gemini_model', model);
  };

  const handleConnectGitHub = async () => {
    if (!githubPat.trim()) { setGithubError("Please enter a Personal Access Token."); return; }
    setIsGitHubConnecting(true);
    setGithubError(null);
    try {
        const user = await getGitHubUserInfo(githubPat);
        const repos = await getRepositories(githubPat);
        saveGitHubPat(githubPat);
        setGithubUser(user);
        setGithubRepos(repos);
        setGithubPat('');
    } catch (err) { setGithubError("Connection failed. Please check your token and permissions."); }
    finally { setIsGitHubConnecting(false); }
  };

  const handleDisconnectGitHub = () => {
    removeGitHubPat();
    setGithubUser(null);
    setGithubRepos([]);
    setGithubError(null);
  };

  const handleConnectNetlify = async () => {
    if (!netlifyPat.trim()) { setNetlifyError("Please enter a Personal Access Token."); return; }
    setIsNetlifyConnecting(true);
    setNetlifyError(null);
    try {
      const user = await getNetlifyUserInfo(netlifyPat);
      const sites = await getNetlifySites(netlifyPat);
      saveNetlifyPat(netlifyPat);
      setNetlifyUser(user);
      setNetlifySites(sites);
      setNetlifyPat('');
    } catch (err) { setNetlifyError("Connection failed. Please check your token and permissions."); }
    finally { setIsNetlifyConnecting(false); }
  };

  const handleDisconnectNetlify = () => {
    removeNetlifyPat();
    setNetlifyUser(null);
    setNetlifySites([]);
    setNetlifyError(null);
  };

  const handleConnectGiphy = async () => {
    if (!giphyApiKey.trim()) { setGiphyError("Please enter a Giphy API Key."); return; }
    setIsGiphyConnecting(true);
    setGiphyError(null);
    try {
        await searchGifs(giphyApiKey, 'test');
        saveGiphyKey(giphyApiKey);
        setIsGiphyConnected(true);
        setGiphyApiKey('');
    } catch (err) { setGiphyError("Connection failed. Please check your API key."); }
    finally { setIsGiphyConnecting(false); }
  };

  const handleDisconnectGiphy = () => {
    removeGiphyKey();
    setIsGiphyConnected(false);
    setGiphyError(null);
  };

  const handleConnectUnsplash = async () => {
    if (!unsplashKey.trim()) { setUnsplashError("Please enter an Unsplash Access Key."); return; }
    setIsUnsplashConnecting(true);
    setUnsplashError(null);
    try {
        await testUnsplash(unsplashKey, 'test'); // Test the key with a simple search
        saveUnsplashKey(unsplashKey);
        setIsUnsplashConnected(true);
        setUnsplashKey('');
    } catch (err) { setUnsplashError("Connection failed. Please check your Access Key."); }
    finally { setIsUnsplashConnecting(false); }
  };

  const handleDisconnectUnsplash = () => {
    removeUnsplashKey();
    setIsUnsplashConnected(false);
    setUnsplashError(null);
  };

  const handleConnectOpenAI = async () => {
    if (!openAiKey.trim()) { setOpenAiError("Please enter an OpenAI API Key."); return; }
    setIsOpenAiConnecting(true);
    setOpenAiError(null);
    try {
        const isValid = await testOpenAi(openAiKey);
        if (!isValid) throw new Error("Invalid key or API error.");
        saveOpenAiKey(openAiKey);
        setIsOpenAiConnected(true);
        setOpenAiKey('');
    } catch (err) { setOpenAiError("Connection failed. Please check your API Key."); }
    finally { setIsOpenAiConnecting(false); }
  };

  const handleDisconnectOpenAI = () => {
    removeOpenAiKey();
    setIsOpenAiConnected(false);
    setOpenAiError(null);
  };

  const handleToggleLivePreview = () => {
    const newValue = !isLivePreviewEnabled;
    setIsLivePreviewEnabled(newValue);
    localStorage.setItem('experimental_live_preview', String(newValue));
  };


  return (
    <div className="min-h-screen w-screen bg-black flex flex-col items-center p-4 pl-20 selection:bg-indigo-500 selection:text-white overflow-y-auto">
      <main className="w-full max-w-5xl px-4 py-12">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text mb-12 text-center animate-fade-in-down">
          Settings
        </h1>
        
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-[0_0_120px_rgba(255,255,255,0.1)] animate-fade-in-up">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">API Settings</h2>
          <div className="flex flex-col gap-2 mb-6">
            <label className="font-semibold text-slate-300">AI Model</label>
            <div className="relative bg-slate-900/50 p-1 rounded-full flex items-center border border-slate-700/50 max-w-xs text-center">
              <div className="absolute top-1 left-1 h-8 w-[calc(50%-4px)] bg-indigo-600 rounded-full transition-transform duration-300 ease-in-out shadow-lg" style={{ transform: `translateX(${selectedModel === 'gemini-2.5-flash' ? '0' : 'calc(100% + 4px)'})` }} />
              <button onClick={() => handleSelectModel('gemini-2.5-flash')} className="relative z-10 w-1/2 py-1.5 text-sm font-semibold rounded-full transition-colors text-white">2.5 Flash</button>
              <button onClick={() => handleSelectModel('gemini-2.5-pro')} className="relative z-10 w-1/2 py-1.5 text-sm font-semibold rounded-full transition-colors text-white">2.5 Pro</button>
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-slate-800 pt-6">
            <label htmlFor="api-key-input" className="font-semibold text-slate-300">Gemini API Key</label>
            <div className="relative"><input id="api-key-input" type={isKeyVisible ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your API key here" className="w-full p-3 pr-12 bg-white/[0.05] border border-white/10 rounded-full shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              <button onClick={() => setIsKeyVisible(!isKeyVisible)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-slate-400 hover:text-white" aria-label={isKeyVisible ? 'Hide' : 'Show'} >
                {isKeyVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="mt-6 text-right"><button onClick={handleSaveApiKey} disabled={saveStatus !== 'idle'} className={`px-5 py-2 font-semibold rounded-lg transition-all ${saveStatus === 'saved' ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500'} text-white`}>
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Key'}
            </button>
          </div>
        </div>

        <div className="mt-16 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-[0_0_120px_rgba(255,255,255,0.1)] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Connected Apps</h2>
          {/* GitHub Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {githubUser ? (
              <div>
                <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex items-center gap-4"><img src={githubUser.avatar_url} alt="GitHub avatar" className="w-12 h-12 rounded-full border-2 border-slate-600" /><div><p className="font-bold text-lg text-white">{githubUser.name}</p><a href={githubUser.html_url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-indigo-400">@{githubUser.login}</a></div></div>
                  <button onClick={handleDisconnectGitHub} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button>
                </div>
                <div className="mt-6"><h3 className="font-semibold text-slate-300 mb-3">Your Repositories</h3><div className="max-h-40 overflow-y-auto space-y-2 pr-2">{githubRepos.map(repo => (<a href={repo.html_url} target="_blank" rel="noopener noreferrer" key={repo.id} className="block bg-slate-900/50 hover:bg-slate-800 p-3 rounded-md transition-colors"><p className="font-mono text-sm text-slate-200 truncate">{repo.name} {repo.private && <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded-sm ml-2">Private</span>}</p></a>))}</div></div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-2"><GitHubIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to GitHub</h3></div>
                <p className="text-sm text-slate-500 mb-4">Provide a <a href="https://github.com/settings/tokens/new?scopes=repo,user" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Personal Access Token</a> with `repo` and `user` scopes to save projects to GitHub.</p>
                <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={githubPat} onChange={e => setGithubPat(e.target.value)} placeholder="ghp_..." className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectGitHub} disabled={isGitHubConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isGitHubConnecting ? 'Connecting...' : 'Connect'}</button></div>
                {githubError && <p className="text-red-400 text-sm mt-3">{githubError}</p>}
              </div>
            )}
          </div>
          {/* Netlify Section */}
           <div className="mb-8 pb-8 border-b border-slate-800">
            {netlifyUser ? (
                <div>
                  <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-4"><img src={netlifyUser.avatar_url} alt="Netlify avatar" className="w-12 h-12 rounded-full border-2 border-slate-600" /><div><p className="font-bold text-lg text-white">{netlifyUser.full_name}</p><p className="text-sm text-slate-400">{netlifyUser.email}</p></div></div>
                    <button onClick={handleDisconnectNetlify} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button>
                  </div>
                   <div className="mt-6">
                    <h3 className="font-semibold text-slate-300 mb-3">Your Sites</h3>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                        {netlifySites.map(site => (
                            <a href={site.ssl_url} target="_blank" rel="noopener noreferrer" key={site.id} className="block bg-slate-900/50 hover:bg-slate-800 p-3 rounded-md transition-colors">
                                <p className="font-mono text-sm text-slate-200 truncate">{site.name}</p>
                            </a>
                        ))}
                    </div>
                  </div>
                </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-2"><NetlifyIcon className="w-6 h-6"/><h3 className="font-semibold text-slate-300 text-lg">Connect to Netlify</h3></div>
                <p className="text-sm text-slate-500 mb-4">Provide a <a href="https://app.netlify.com/user/applications#personal-access-tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Personal Access Token</a> to deploy projects directly to Netlify.</p>
                <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={netlifyPat} onChange={e => setNetlifyPat(e.target.value)} placeholder="nfp_..." className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectNetlify} disabled={isNetlifyConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isNetlifyConnecting ? 'Connecting...' : 'Connect'}</button></div>
                {netlifyError && <p className="text-red-400 text-sm mt-3">{netlifyError}</p>}
              </div>
            )}
          </div>
          {/* Giphy Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isGiphyConnected ? (
                <div>
                  <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black">
                         <GiphyIcon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white">Giphy Connected</p>
                        <p className="text-sm text-slate-400">Ready to add GIFs to your apps.</p>
                      </div>
                    </div>
                    <button onClick={handleDisconnectGiphy} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button>
                  </div>
                </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-2"><GiphyIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to Giphy</h3></div>
                <p className="text-sm text-slate-500 mb-4">Provide a <a href="https://developers.giphy.com/dashboard/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Giphy API Key</a> to search and add GIFs to your projects.</p>
                <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={giphyApiKey} onChange={e => setGiphyApiKey(e.target.value)} placeholder="Your Giphy API Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectGiphy} disabled={isGiphyConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isGiphyConnecting ? 'Connecting...' : 'Connect'}</button></div>
                {giphyError && <p className="text-red-400 text-sm mt-3">{giphyError}</p>}
              </div>
            )}
          </div>
          {/* Unsplash Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isUnsplashConnected ? (
                <div>
                  <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black">
                         <UnsplashIcon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white">Unsplash Connected</p>
                        <p className="text-sm text-slate-400">Ready to add stock photos.</p>
                      </div>
                    </div>
                    <button onClick={handleDisconnectUnsplash} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button>
                  </div>
                </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-2"><UnsplashIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to Unsplash</h3></div>
                <p className="text-sm text-slate-500 mb-4">Provide an <a href="https://unsplash.com/oauth/applications" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Unsplash Access Key</a> to search and add high-quality photos.</p>
                <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={unsplashKey} onChange={e => setUnsplashKey(e.target.value)} placeholder="Your Unsplash Access Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectUnsplash} disabled={isUnsplashConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isUnsplashConnecting ? 'Connecting...' : 'Connect'}</button></div>
                {unsplashError && <p className="text-red-400 text-sm mt-3">{unsplashError}</p>}
              </div>
            )}
          </div>
          {/* OpenAI Section */}
          <div>
            {isOpenAiConnected ? (
                <div>
                  <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black">
                         <OpenAiIcon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white">OpenAI Connected</p>
                        <p className="text-sm text-slate-400">Ready to generate images with DALL-E.</p>
                      </div>
                    </div>
                    <button onClick={handleDisconnectOpenAI} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button>
                  </div>
                </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-2"><OpenAiIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to OpenAI</h3></div>
                <p className="text-sm text-slate-500 mb-4">Provide an <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">OpenAI API Key</a> to generate images with DALL-E in your projects.</p>
                <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={openAiKey} onChange={e => setOpenAiKey(e.target.value)} placeholder="sk-..." className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectOpenAI} disabled={isOpenAiConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isOpenAiConnecting ? 'Connecting...' : 'Connect'}</button></div>
                {openAiError && <p className="text-red-400 text-sm mt-3">{openAiError}</p>}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-16 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-[0_0_120px_rgba(255,255,255,0.1)] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-100">Custom Secrets</h2>
                {!isPro && (
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        PRO
                    </span>
                )}
            </div>
            <p className="text-sm text-slate-500 mb-6">Add secrets for third-party APIs. They will be available as environment variables.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="flex flex-col gap-2"><label htmlFor="secret-name" className="font-semibold text-sm text-slate-400">Secret Name</label><input id="secret-name" type="text" value={newSecretName} onChange={(e) => setNewSecretName(e.target.value)} placeholder="E.g., OPENAI_API_KEY" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div className="flex flex-col gap-2"><label htmlFor="secret-value" className="font-semibold text-sm text-slate-400">Secret Value</label><div className="relative"><input id="secret-value" type={isSecretValueVisible ? 'text' : 'password'} value={newSecretValue} onChange={(e) => setNewSecretValue(e.target.value)} placeholder="Enter secret value" className="w-full p-3 pr-12 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"/><button onClick={() => setIsSecretValueVisible(!isSecretValueVisible)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-slate-400 hover:text-white" aria-label={isSecretValueVisible ? 'Hide' : 'Show'}>{isSecretValueVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}</button></div></div>
            </div>
            {secretError && <p className="text-red-400 text-sm mt-3">{secretError}</p>}
            <div className="mt-6 text-right"><button onClick={handleAddSecret} className="px-5 py-2 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white">Add Secret</button></div>
            {secrets.length > 0 && (
              <div className="mt-8 border-t border-slate-700 pt-6">
                <h3 className="font-semibold text-slate-300 mb-4">Saved Secrets</h3>
                <div className="space-y-3">
                  {secrets.map(secret => (
                    <div key={secret.name} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <KeyIcon className="w-6 h-6 text-slate-400" />
                        <div>
                          <p className="font-mono text-sm text-slate-200">{secret.name}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveSecret(secret.name)} className="p-2 text-slate-500 hover:text-red-400" aria-label={`Remove ${secret.name}`}>
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="mt-16 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-[0_0_120px_rgba(255,255,255,0.1)] animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">🧪 Experimental Tools</h2>
          <p className="text-sm text-slate-500 mb-6">Enable cutting-edge features. These are in beta and may be unstable.</p>
          <div
            onClick={handleToggleLivePreview}
            className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800"
          >
            <div>
              <h3 className="font-semibold text-slate-200">Live AI Coding Preview</h3>
              <p className="text-sm text-slate-400">See code changes reflected in the preview in real-time as the AI generates them.</p>
            </div>
            <div className={`relative w-12 h-6 rounded-full transition-colors ${isLivePreviewEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isLivePreviewEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>
        
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="text-center"><h2 className="text-3xl font-bold text-slate-100 mb-2">UI Theme Templates</h2><p className="text-base text-slate-400 mb-8 max-w-2xl mx-auto">Choose a theme to guide the AI's design.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div onClick={() => handleSelectTheme('none')} className={`relative bg-slate-800/50 border rounded-lg p-4 flex flex-col justify-center items-center text-center h-full min-h-[250px] ${selectedTheme === 'none' ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-700'} cursor-pointer hover:-translate-y-1`}><h3 className="font-bold text-lg text-white">No Theme</h3><p className="text-sm text-slate-400">Let the AI decide the design.</p></div>
            {THEMES.filter(t => !t.id.includes('holiday')).map(theme => <ThemeTemplateCard key={theme.id} theme={theme} isSelected={selectedTheme === theme.id} onSelect={handleSelectTheme} isProUser={isPro} />)}
          </div>
        </div>
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="text-center"><h2 className="text-3xl font-bold text-slate-100 mb-2">Holiday Packs</h2><p className="text-base text-slate-400 mb-8 max-w-2xl mx-auto">Seasonal themes for your apps.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {THEMES.filter(t => t.id.includes('holiday')).map(theme => <ThemeTemplateCard key={theme.id} theme={theme} isSelected={selectedTheme === theme.id} onSelect={handleSelectTheme} isProUser={isPro}/>)}
          </div>
        </div>
      </main>
      <footer className="w-full text-center p-4 text-xs text-gray-600 mt-auto">API keys are required for app generation</footer>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto+Mono:wght@400;700&family=Lora:wght@400;700&family=Playfair+Display:wght@700&family=Mountains+of+Christmas:wght@700&family=Great+Vibes&display=swap'); .animate-fade-in-down { animation: fade-in-down 0.6s ease-out forwards; } .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; } @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default SettingsPage;
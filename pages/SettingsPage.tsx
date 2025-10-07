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
import PexelsIcon from '../components/icons/PexelsIcon';
import FreeSoundIcon from '../components/icons/FreeSoundIcon';
import SpotifyIcon from '../components/icons/SpotifyIcon';
import StableDiffusionIcon from '../components/icons/StableDiffusionIcon';
import LogoDevIcon from '../components/icons/LogoDevIcon';
import StreamlineIcon from '../components/icons/StreamlineIcon';
// New API Icons
import WeatherApiIcon from '../components/icons/WeatherApiIcon';
import OpenWeatherMapIcon from '../components/icons/OpenWeatherMapIcon';
import TmdbIcon from '../components/icons/TmdbIcon';
import YouTubeIcon from '../components/icons/YouTubeIcon';
import MapboxIcon from '../components/icons/MapboxIcon';
import ExchangeRateApiIcon from '../components/icons/ExchangeRateApiIcon';
import FinancialModelingPrepIcon from '../components/icons/FinancialModelingPrepIcon';
import NewsApiIcon from '../components/icons/NewsApiIcon';
import RawgIcon from '../components/icons/RawgIcon';
import WordsApiIcon from '../components/icons/WordsApiIcon';

import { THEMES } from '../data/themes';
import ThemeTemplateCard from '../components/ThemeTemplateCard';
import { Secret, GitHubUser, GitHubRepo, NetlifyUser, NetlifySite } from '../types';
import { getSecrets, addSecret, removeSecret } from '../services/secretsService';
import { savePat as saveGitHubPat, getPat as getGitHubPat, removePat as removeGitHubPat, getUserInfo as getGitHubUserInfo, getRepositories } from '../services/githubService';
import { savePat as saveNetlifyPat, getPat as getNetlifyPat, removePat as removeNetlifyPat, getUserInfo as getNetlifyUserInfo, getSites as getNetlifySites } from '../services/netlifyService';
import { saveApiKey as saveGiphyKey, getApiKey as getGiphyKey, removeApiKey as removeGiphyKey, searchGifs } from '../services/giphyService';
import { saveAccessKey as saveUnsplashKey, getAccessKey as getUnsplashKey, removeAccessKey as removeUnsplashKey, searchPhotos as testUnsplash } from '../services/unsplashService';
import { saveApiKey as saveOpenAiKey, getApiKey as getOpenAiKey, removeApiKey as removeOpenAiKey, verifyApiKey as testOpenAi } from '../services/openaiService';
import { saveApiKey as savePexelsKey, getApiKey as getPexelsKey, removeApiKey as removePexelsKey, searchPexels } from '../services/pexelsService';
import { saveApiKey as saveFreeSoundKey, getApiKey as getFreeSoundKey, removeApiKey as removeFreeSoundKey, searchFreeSound } from '../services/freesoundService';
import { saveClientCredentials as saveSpotifyCreds, getClientCredentials as getSpotifyCreds, removeClientCredentials as removeSpotifyCreds, testSpotifyCredentials } from '../services/spotifyService';
import { saveApiKey as saveStabilityKey, getApiKey as getStabilityKey, removeApiKey as removeStabilityKey, testStabilityApiKey } from '../services/stabilityService';
import { saveApiKey as saveStreamlineKey, getApiKey as getStreamlineKey, removeApiKey as removeStreamlineKey, testStreamlineApiKey } from '../services/streamlineService';

// New API Services
import { saveApiKey as saveWeatherApiKey, getApiKey as getWeatherApiKey, removeApiKey as removeWeatherApiKey, testApiKey as testWeatherApi } from '../services/weatherApiService';
import { saveApiKey as saveOpenWeatherMapApiKey, getApiKey as getOpenWeatherMapApiKey, removeApiKey as removeOpenWeatherMapApiKey, testApiKey as testOpenWeatherMapApi } from '../services/openWeatherMapService';
import { saveApiKey as saveTmdbApiKey, getApiKey as getTmdbApiKey, removeApiKey as removeTmdbApiKey, testApiKey as testTmdbApi } from '../services/tmdbService';
import { saveApiKey as saveYouTubeApiKey, getApiKey as getYouTubeApiKey, removeApiKey as removeYouTubeApiKey, testApiKey as testYouTubeApi } from '../services/youtubeService';
import { saveApiKey as saveMapboxApiKey, getApiKey as getMapboxApiKey, removeApiKey as removeMapboxApiKey, testApiKey as testMapboxApi } from '../services/mapboxService';
import { saveApiKey as saveExchangeRateApiKey, getApiKey as getExchangeRateApiKey, removeApiKey as removeExchangeRateApiKey, testApiKey as testExchangeRateApi } from '../services/exchangeRateApiService';
import { saveApiKey as saveFmpApiKey, getApiKey as getFmpApiKey, removeApiKey as removeFmpApiKey, testApiKey as testFmpApi } from '../services/financialModelingPrepService';
import { saveApiKey as saveNewsApiKey, getApiKey as getNewsApiKey, removeApiKey as removeNewsApiKey, testApiKey as testNewsApi } from '../services/newsApiService';
import { saveApiKey as saveRawgApiKey, getApiKey as getRawgApiKey, removeApiKey as removeRawgApiKey, testApiKey as testRawgApi } from '../services/rawgService';
import { saveApiKey as saveWordsApiKey, getApiKey as getWordsApiKey, removeApiKey as removeWordsApiKey, testApiKey as testWordsApi } from '../services/wordsApiService';


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

  // Connection States
  const [githubPat, setGithubPat] = useState('');
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [isGitHubConnecting, setIsGitHubConnecting] = useState(false);

  const [netlifyPat, setNetlifyPat] = useState('');
  const [netlifyUser, setNetlifyUser] = useState<NetlifyUser | null>(null);
  const [netlifySites, setNetlifySites] = useState<NetlifySite[]>([]);
  const [netlifyError, setNetlifyError] = useState<string | null>(null);
  const [isNetlifyConnecting, setIsNetlifyConnecting] = useState(false);

  const [giphyApiKey, setGiphyApiKey] = useState('');
  const [isGiphyConnected, setIsGiphyConnected] = useState(false);
  const [giphyError, setGiphyError] = useState<string | null>(null);
  const [isGiphyConnecting, setIsGiphyConnecting] = useState(false);

  const [unsplashKey, setUnsplashKey] = useState('');
  const [isUnsplashConnected, setIsUnsplashConnected] = useState(false);
  const [unsplashError, setUnsplashError] = useState<string | null>(null);
  const [isUnsplashConnecting, setIsUnsplashConnecting] = useState(false);

  const [openAiKey, setOpenAiKey] = useState('');
  const [isOpenAiConnected, setIsOpenAiConnected] = useState(false);
  const [openAiError, setOpenAiError] = useState<string | null>(null);
  const [isOpenAiConnecting, setIsOpenAiConnecting] = useState(false);
  
  const [pexelsKey, setPexelsKey] = useState('');
  const [isPexelsConnected, setIsPexelsConnected] = useState(false);
  const [pexelsError, setPexelsError] = useState<string | null>(null);
  const [isPexelsConnecting, setIsPexelsConnecting] = useState(false);

  const [freeSoundKey, setFreeSoundKey] = useState('');
  const [isFreeSoundConnected, setIsFreeSoundConnected] = useState(false);
  const [freeSoundError, setFreeSoundError] = useState<string | null>(null);
  const [isFreeSoundConnecting, setIsFreeSoundConnecting] = useState(false);
  
  const [spotifyClientId, setSpotifyClientId] = useState('');
  const [spotifyClientSecret, setSpotifyClientSecret] = useState('');
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [isSpotifyConnecting, setIsSpotifyConnecting] = useState(false);
  
  const [stabilityKey, setStabilityKey] = useState('');
  const [isStabilityConnected, setIsStabilityConnected] = useState(false);
  const [stabilityError, setStabilityError] = useState<string | null>(null);
  const [isStabilityConnecting, setIsStabilityConnecting] = useState(false);
  
  const [streamlineKey, setStreamlineKey] = useState('');
  const [isStreamlineConnected, setIsStreamlineConnected] = useState(false);
  const [streamlineError, setStreamlineError] = useState<string | null>(null);
  const [isStreamlineConnecting, setIsStreamlineConnecting] = useState(false);
  
  // New API Connection States
  const [weatherApiKey, setWeatherApiKey] = useState('');
  const [isWeatherApiConnected, setIsWeatherApiConnected] = useState(false);
  const [weatherApiError, setWeatherApiError] = useState<string | null>(null);
  const [isWeatherApiConnecting, setIsWeatherApiConnecting] = useState(false);
  
  const [openWeatherMapKey, setOpenWeatherMapKey] = useState('');
  const [isOpenWeatherMapConnected, setIsOpenWeatherMapConnected] = useState(false);
  const [openWeatherMapError, setOpenWeatherMapError] = useState<string | null>(null);
  const [isOpenWeatherMapConnecting, setIsOpenWeatherMapConnecting] = useState(false);
  
  const [tmdbKey, setTmdbKey] = useState('');
  const [isTmdbConnected, setIsTmdbConnected] = useState(false);
  const [tmdbError, setTmdbError] = useState<string | null>(null);
  const [isTmdbConnecting, setIsTmdbConnecting] = useState(false);
  
  const [youTubeKey, setYouTubeKey] = useState('');
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
  const [youTubeError, setYouTubeError] = useState<string | null>(null);
  const [isYouTubeConnecting, setIsYouTubeConnecting] = useState(false);
  
  const [mapboxKey, setMapboxKey] = useState('');
  const [isMapboxConnected, setIsMapboxConnected] = useState(false);
  const [mapboxError, setMapboxError] = useState<string | null>(null);
  const [isMapboxConnecting, setIsMapboxConnecting] = useState(false);
  
  const [exchangeRateKey, setExchangeRateKey] = useState('');
  const [isExchangeRateConnected, setIsExchangeRateConnected] = useState(false);
  const [exchangeRateError, setExchangeRateError] = useState<string | null>(null);
  const [isExchangeRateConnecting, setIsExchangeRateConnecting] = useState(false);
  
  const [fmpKey, setFmpKey] = useState('');
  const [isFmpConnected, setIsFmpConnected] = useState(false);
  const [fmpError, setFmpError] = useState<string | null>(null);
  const [isFmpConnecting, setIsFmpConnecting] = useState(false);
  
  const [newsApiKey, setNewsApiKey] = useState('');
  const [isNewsApiConnected, setIsNewsApiConnected] = useState(false);
  const [newsApiError, setNewsApiError] = useState<string | null>(null);
  const [isNewsApiConnecting, setIsNewsApiConnecting] = useState(false);
  
  const [rawgKey, setRawgKey] = useState('');
  const [isRawgConnected, setIsRawgConnected] = useState(false);
  const [rawgError, setRawgError] = useState<string | null>(null);
  const [isRawgConnecting, setIsRawgConnecting] = useState(false);
  
  const [wordsApiKey, setWordsApiKey] = useState('');
  const [isWordsApiConnected, setIsWordsApiConnected] = useState(false);
  const [wordsApiError, setWordsApiError] = useState<string | null>(null);
  const [isWordsApiConnecting, setIsWordsApiConnecting] = useState(false);


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

    // --- Load and verify all connections ---
    if (getGitHubPat()) { setIsGitHubConnecting(true); getGitHubUserInfo(getGitHubPat()!).then(setGithubUser).catch(() => removeGitHubPat()).finally(() => setIsGitHubConnecting(false)); }
    if (getNetlifyPat()) { setIsNetlifyConnecting(true); getNetlifyUserInfo(getNetlifyPat()!).then(setNetlifyUser).catch(() => removeNetlifyPat()).finally(() => setIsNetlifyConnecting(false)); }
    if (getGiphyKey()) setIsGiphyConnected(true);
    if (getUnsplashKey()) setIsUnsplashConnected(true);
    if (getOpenAiKey()) setIsOpenAiConnected(true);
    if (getPexelsKey()) setIsPexelsConnected(true);
    if (getFreeSoundKey()) setIsFreeSoundConnected(true);
    if (getSpotifyCreds()) setIsSpotifyConnected(true);
    if (getStabilityKey()) setIsStabilityConnected(true);
    if (getStreamlineKey()) setIsStreamlineConnected(true);
    // New APIs
    if (getWeatherApiKey()) setIsWeatherApiConnected(true);
    if (getOpenWeatherMapApiKey()) setIsOpenWeatherMapConnected(true);
    if (getTmdbApiKey()) setIsTmdbConnected(true);
    if (getYouTubeApiKey()) setIsYouTubeConnected(true);
    if (getMapboxApiKey()) setIsMapboxConnected(true);
    if (getExchangeRateApiKey()) setIsExchangeRateConnected(true);
    if (getFmpApiKey()) setIsFmpConnected(true);
    if (getNewsApiKey()) setIsNewsApiConnected(true);
    if (getRawgApiKey()) setIsRawgConnected(true);
    if (getWordsApiKey()) setIsWordsApiConnected(true);


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
    if (!isPro) { onUpgradeClick(); return; }
    setSecretError(null);
    if (!newSecretName.trim() || !newSecretValue.trim()) { setSecretError("Both name and value are required."); return; }
    if (!/^[A-Z_][A-Z0-9_]*$/.test(newSecretName)) { setSecretError("Name must be uppercase letters, numbers, and underscores, and cannot start with a number."); return; }
    try {
        addSecret({ name: newSecretName.trim(), value: newSecretValue.trim() });
        setSecrets(getSecrets());
        setNewSecretName(''); setNewSecretValue('');
    } catch (error) { if (error instanceof Error) setSecretError(error.message); }
  };
  
  const handleRemoveSecret = (name: string) => { removeSecret(name); setSecrets(getSecrets()); };
  const handleSelectTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (themeId !== 'none' && !theme) return;
    if (theme?.isPro && !isPro) { onUpgradeClick(); return; }
    setSelectedTheme(themeId);
    localStorage.setItem('ui_theme_template', themeId);
  };

  const handleSelectModel = (model: GeminiModel) => { setSelectedModel(model); localStorage.setItem('gemini_model', model); };
  const handleToggleLivePreview = () => { const newValue = !isLivePreviewEnabled; setIsLivePreviewEnabled(newValue); localStorage.setItem('experimental_live_preview', String(newValue)); };

  // --- Connection Handlers ---
  const handleConnectGitHub = async () => { if (!githubPat.trim()) { setGithubError("Please enter a Personal Access Token."); return; } setIsGitHubConnecting(true); setGithubError(null); try { const user = await getGitHubUserInfo(githubPat); await getRepositories(githubPat); saveGitHubPat(githubPat); setGithubUser(user); setGithubPat(''); } catch (err) { setGithubError("Connection failed. Please check your token and permissions."); } finally { setIsGitHubConnecting(false); } };
  const handleDisconnectGitHub = () => { removeGitHubPat(); setGithubUser(null); setGithubRepos([]); setGithubError(null); };
  const handleConnectNetlify = async () => { if (!netlifyPat.trim()) { setNetlifyError("Please enter a Personal Access Token."); return; } setIsNetlifyConnecting(true); setNetlifyError(null); try { const user = await getNetlifyUserInfo(netlifyPat); await getNetlifySites(netlifyPat); saveNetlifyPat(netlifyPat); setNetlifyUser(user); setNetlifyPat(''); } catch (err) { setNetlifyError("Connection failed. Please check your token and permissions."); } finally { setIsNetlifyConnecting(false); } };
  const handleDisconnectNetlify = () => { removeNetlifyPat(); setNetlifyUser(null); setNetlifySites([]); setNetlifyError(null); };
  const handleConnectGiphy = async () => { if (!giphyApiKey.trim()) { setGiphyError("Please enter a Giphy API Key."); return; } setIsGiphyConnecting(true); setGiphyError(null); try { await searchGifs(giphyApiKey, 'test'); saveGiphyKey(giphyApiKey); setIsGiphyConnected(true); setGiphyApiKey(''); } catch (err) { setGiphyError("Connection failed. Please check your API key."); } finally { setIsGiphyConnecting(false); } };
  const handleDisconnectGiphy = () => { removeGiphyKey(); setIsGiphyConnected(false); setGiphyError(null); };
  const handleConnectUnsplash = async () => { if (!unsplashKey.trim()) { setUnsplashError("Please enter an Unsplash Access Key."); return; } setIsUnsplashConnecting(true); setUnsplashError(null); try { await testUnsplash(unsplashKey, 'test'); saveUnsplashKey(unsplashKey); setIsUnsplashConnected(true); setUnsplashKey(''); } catch (err) { setUnsplashError("Connection failed. Please check your Access Key."); } finally { setIsUnsplashConnecting(false); } };
  const handleDisconnectUnsplash = () => { removeUnsplashKey(); setIsUnsplashConnected(false); setUnsplashError(null); };
  const handleConnectOpenAI = async () => { if (!openAiKey.trim()) { setOpenAiError("Please enter an OpenAI API Key."); return; } setIsOpenAiConnecting(true); setOpenAiError(null); try { const isValid = await testOpenAi(openAiKey); if (!isValid) throw new Error("Invalid key or API error."); saveOpenAiKey(openAiKey); setIsOpenAiConnected(true); setOpenAiKey(''); } catch (err) { setOpenAiError("Connection failed. Please check your API Key."); } finally { setIsOpenAiConnecting(false); } };
  const handleDisconnectOpenAI = () => { removeOpenAiKey(); setIsOpenAiConnected(false); setOpenAiError(null); };
  const handleConnectPexels = async () => { if (!pexelsKey.trim()) { setPexelsError("Please enter a Pexels API Key."); return; } setIsPexelsConnecting(true); setPexelsError(null); try { await searchPexels(pexelsKey, 'test'); savePexelsKey(pexelsKey); setIsPexelsConnected(true); setPexelsKey(''); } catch (err) { setPexelsError("Connection failed. Please check your API key."); } finally { setIsPexelsConnecting(false); } };
  const handleDisconnectPexels = () => { removePexelsKey(); setIsPexelsConnected(false); setPexelsError(null); };
  const handleConnectFreeSound = async () => { if (!freeSoundKey.trim()) { setFreeSoundError("Please enter a FreeSound API Key."); return; } setIsFreeSoundConnecting(true); setFreeSoundError(null); try { await searchFreeSound(freeSoundKey, 'test'); saveFreeSoundKey(freeSoundKey); setIsFreeSoundConnected(true); setFreeSoundKey(''); } catch (err) { setFreeSoundError("Connection failed. Please check your API key."); } finally { setIsFreeSoundConnecting(false); } };
  const handleDisconnectFreeSound = () => { removeFreeSoundKey(); setIsFreeSoundConnected(false); setFreeSoundError(null); };
  const handleConnectSpotify = async () => { if (!spotifyClientId.trim() || !spotifyClientSecret.trim()) { setSpotifyError("Please enter both Client ID and Secret."); return; } setIsSpotifyConnecting(true); setSpotifyError(null); try { await testSpotifyCredentials(spotifyClientId, spotifyClientSecret); saveSpotifyCreds(spotifyClientId, spotifyClientSecret); setIsSpotifyConnected(true); setSpotifyClientId(''); setSpotifyClientSecret(''); } catch (err) { setSpotifyError("Connection failed. Please check your credentials."); } finally { setIsSpotifyConnecting(false); } };
  const handleDisconnectSpotify = () => { removeSpotifyCreds(); setIsSpotifyConnected(false); setSpotifyError(null); };
  const handleConnectStability = async () => { if (!stabilityKey.trim()) { setStabilityError("Please enter a Stability AI API Key."); return; } setIsStabilityConnecting(true); setStabilityError(null); try { await testStabilityApiKey(stabilityKey); saveStabilityKey(stabilityKey); setIsStabilityConnected(true); setStabilityKey(''); } catch (err) { setStabilityError("Connection failed. Please check your API key."); } finally { setIsStabilityConnecting(false); } };
  const handleDisconnectStability = () => { removeStabilityKey(); setIsStabilityConnected(false); setStabilityError(null); };
  const handleConnectStreamline = async () => { if (!streamlineKey.trim()) { setStreamlineError("Please enter a Streamline API Key."); return; } setIsStreamlineConnecting(true); setStreamlineError(null); try { await testStreamlineApiKey(streamlineKey); saveStreamlineKey(streamlineKey); setIsStreamlineConnected(true); setStreamlineKey(''); } catch (err) { setStreamlineError("Connection failed. Please check your API key."); } finally { setIsStreamlineConnecting(false); } };
  const handleDisconnectStreamline = () => { removeStreamlineKey(); setIsStreamlineConnected(false); setStreamlineError(null); };
  
  // --- New API Connection Handlers ---
  const handleConnectWeatherApi = async () => { if (!weatherApiKey.trim()) { setWeatherApiError("Please enter a WeatherAPI.com API Key."); return; } setIsWeatherApiConnecting(true); setWeatherApiError(null); try { if (!(await testWeatherApi(weatherApiKey))) throw new Error("Invalid key"); saveWeatherApiKey(weatherApiKey); setIsWeatherApiConnected(true); setWeatherApiKey(''); } catch (err) { setWeatherApiError("Connection failed. Please check your API key."); } finally { setIsWeatherApiConnecting(false); } };
  const handleDisconnectWeatherApi = () => { removeWeatherApiKey(); setIsWeatherApiConnected(false); setWeatherApiError(null); };
  const handleConnectOpenWeatherMap = async () => { if (!openWeatherMapKey.trim()) { setOpenWeatherMapError("Please enter an OpenWeatherMap API Key."); return; } setIsOpenWeatherMapConnecting(true); setOpenWeatherMapError(null); try { if (!(await testOpenWeatherMapApi(openWeatherMapKey))) throw new Error("Invalid key"); saveOpenWeatherMapApiKey(openWeatherMapKey); setIsOpenWeatherMapConnected(true); setOpenWeatherMapKey(''); } catch (err) { setOpenWeatherMapError("Connection failed. Please check your API key."); } finally { setIsOpenWeatherMapConnecting(false); } };
  const handleDisconnectOpenWeatherMap = () => { removeOpenWeatherMapApiKey(); setIsOpenWeatherMapConnected(false); setOpenWeatherMapError(null); };
  const handleConnectTmdb = async () => { if (!tmdbKey.trim()) { setTmdbError("Please enter a TMDB API Key."); return; } setIsTmdbConnecting(true); setTmdbError(null); try { if (!(await testTmdbApi(tmdbKey))) throw new Error("Invalid key"); saveTmdbApiKey(tmdbKey); setIsTmdbConnected(true); setTmdbKey(''); } catch (err) { setTmdbError("Connection failed. Please check your API key."); } finally { setIsTmdbConnecting(false); } };
  const handleDisconnectTmdb = () => { removeTmdbApiKey(); setIsTmdbConnected(false); setTmdbError(null); };
  const handleConnectYouTube = async () => { if (!youTubeKey.trim()) { setYouTubeError("Please enter a YouTube Data API Key."); return; } setIsYouTubeConnecting(true); setYouTubeError(null); try { if (!(await testYouTubeApi(youTubeKey))) throw new Error("Invalid key"); saveYouTubeApiKey(youTubeKey); setIsYouTubeConnected(true); setYouTubeKey(''); } catch (err) { setYouTubeError("Connection failed. Please check your API key."); } finally { setIsYouTubeConnecting(false); } };
  const handleDisconnectYouTube = () => { removeYouTubeApiKey(); setIsYouTubeConnected(false); setYouTubeError(null); };
  const handleConnectMapbox = async () => { if (!mapboxKey.trim()) { setMapboxError("Please enter a Mapbox Access Token."); return; } setIsMapboxConnecting(true); setMapboxError(null); try { if (!(await testMapboxApi(mapboxKey))) throw new Error("Invalid key"); saveMapboxApiKey(mapboxKey); setIsMapboxConnected(true); setMapboxKey(''); } catch (err) { setMapboxError("Connection failed. Please check your Access Token."); } finally { setIsMapboxConnecting(false); } };
  const handleDisconnectMapbox = () => { removeMapboxApiKey(); setIsMapboxConnected(false); setMapboxError(null); };
  const handleConnectExchangeRate = async () => { if (!exchangeRateKey.trim()) { setExchangeRateError("Please enter an ExchangeRate-API Key."); return; } setIsExchangeRateConnecting(true); setExchangeRateError(null); try { if (!(await testExchangeRateApi(exchangeRateKey))) throw new Error("Invalid key"); saveExchangeRateApiKey(exchangeRateKey); setIsExchangeRateConnected(true); setExchangeRateKey(''); } catch (err) { setExchangeRateError("Connection failed. Please check your API key."); } finally { setIsExchangeRateConnecting(false); } };
  const handleDisconnectExchangeRate = () => { removeExchangeRateApiKey(); setIsExchangeRateConnected(false); setExchangeRateError(null); };
  const handleConnectFmp = async () => { if (!fmpKey.trim()) { setFmpError("Please enter a Financial Modeling Prep API Key."); return; } setIsFmpConnecting(true); setFmpError(null); try { if (!(await testFmpApi(fmpKey))) throw new Error("Invalid key"); saveFmpApiKey(fmpKey); setIsFmpConnected(true); setFmpKey(''); } catch (err) { setFmpError("Connection failed. Please check your API key."); } finally { setIsFmpConnecting(false); } };
  const handleDisconnectFmp = () => { removeFmpApiKey(); setIsFmpConnected(false); setFmpError(null); };
  const handleConnectNewsApi = async () => { if (!newsApiKey.trim()) { setNewsApiError("Please enter a NewsAPI Key."); return; } setIsNewsApiConnecting(true); setNewsApiError(null); try { if (!(await testNewsApi(newsApiKey))) throw new Error("Invalid key"); saveNewsApiKey(newsApiKey); setIsNewsApiConnected(true); setNewsApiKey(''); } catch (err) { setNewsApiError("Connection failed. Please check your API key."); } finally { setIsNewsApiConnecting(false); } };
  const handleDisconnectNewsApi = () => { removeNewsApiKey(); setIsNewsApiConnected(false); setNewsApiError(null); };
  const handleConnectRawg = async () => { if (!rawgKey.trim()) { setRawgError("Please enter a RAWG API Key."); return; } setIsRawgConnecting(true); setRawgError(null); try { if (!(await testRawgApi(rawgKey))) throw new Error("Invalid key"); saveRawgApiKey(rawgKey); setIsRawgConnected(true); setRawgKey(''); } catch (err) { setRawgError("Connection failed. Please check your API key."); } finally { setIsRawgConnecting(false); } };
  const handleDisconnectRawg = () => { removeRawgApiKey(); setIsRawgConnected(false); setRawgError(null); };
  const handleConnectWordsApi = async () => { if (!wordsApiKey.trim()) { setWordsApiError("Please enter a WordsAPI Key."); return; } setIsWordsApiConnecting(true); setWordsApiError(null); try { if (!(await testWordsApi(wordsApiKey))) throw new Error("Invalid key"); saveWordsApiKey(wordsApiKey); setIsWordsApiConnected(true); setWordsApiKey(''); } catch (err) { setWordsApiError("Connection failed. Please check your API key."); } finally { setIsWordsApiConnecting(false); } };
  const handleDisconnectWordsApi = () => { removeWordsApiKey(); setIsWordsApiConnected(false); setWordsApiError(null); };


  return (
    <div className="min-h-screen w-screen bg-black flex flex-col items-center p-4 pl-[4.5rem] selection:bg-indigo-500 selection:text-white overflow-y-auto">
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
            {githubUser ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"><img src={githubUser.avatar_url} alt="GitHub avatar" className="w-12 h-12 rounded-full border-2 border-slate-600" /><div><p className="font-bold text-lg text-white">{githubUser.name}</p><a href={githubUser.html_url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-indigo-400">@{githubUser.login}</a></div></div> <button onClick={handleDisconnectGitHub} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><GitHubIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to GitHub</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a <a href="https://github.com/settings/tokens/new?scopes=repo,user" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Personal Access Token</a> with `repo` and `user` scopes to save projects to GitHub.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={githubPat} onChange={e => setGithubPat(e.target.value)} placeholder="ghp_..." className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectGitHub} disabled={isGitHubConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isGitHubConnecting ? 'Connecting...' : 'Connect'}</button></div> {githubError && <p className="text-red-400 text-sm mt-3">{githubError}</p>} </div> )}
          </div>
          {/* Netlify Section */}
           <div className="mb-8 pb-8 border-b border-slate-800">
            {netlifyUser ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"><img src={netlifyUser.avatar_url} alt="Netlify avatar" className="w-12 h-12 rounded-full border-2 border-slate-600" /><div><p className="font-bold text-lg text-white">{netlifyUser.full_name}</p><p className="text-sm text-slate-400">{netlifyUser.email}</p></div></div> <button onClick={handleDisconnectNetlify} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><NetlifyIcon className="w-6 h-6"/><h3 className="font-semibold text-slate-300 text-lg">Connect to Netlify</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a <a href="https://app.netlify.com/user/applications#personal-access-tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Personal Access Token</a> to deploy projects directly to Netlify.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={netlifyPat} onChange={e => setNetlifyPat(e.target.value)} placeholder="nfp_..." className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectNetlify} disabled={isNetlifyConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isNetlifyConnecting ? 'Connecting...' : 'Connect'}</button></div> {netlifyError && <p className="text-red-400 text-sm mt-3">{netlifyError}</p>} </div> )}
          </div>
          {/* Giphy Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isGiphyConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <GiphyIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">Giphy Connected</p> <p className="text-sm text-slate-400">Ready to add GIFs to your apps.</p> </div> </div> <button onClick={handleDisconnectGiphy} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><GiphyIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to Giphy</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a <a href="https://developers.giphy.com/dashboard/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Giphy API Key</a> to search and add GIFs to your projects.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={giphyApiKey} onChange={e => setGiphyApiKey(e.target.value)} placeholder="Your Giphy API Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectGiphy} disabled={isGiphyConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isGiphyConnecting ? 'Connecting...' : 'Connect'}</button></div> {giphyError && <p className="text-red-400 text-sm mt-3">{giphyError}</p>} </div> )}
          </div>
          {/* Unsplash Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isUnsplashConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <UnsplashIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">Unsplash Connected</p> <p className="text-sm text-slate-400">Ready to add stock photos.</p> </div> </div> <button onClick={handleDisconnectUnsplash} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><UnsplashIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to Unsplash</h3></div> <p className="text-sm text-slate-500 mb-4">Provide an <a href="https://unsplash.com/oauth/applications" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Unsplash Access Key</a> to search and add high-quality photos.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={unsplashKey} onChange={e => setUnsplashKey(e.target.value)} placeholder="Your Unsplash Access Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectUnsplash} disabled={isUnsplashConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isUnsplashConnecting ? 'Connecting...' : 'Connect'}</button></div> {unsplashError && <p className="text-red-400 text-sm mt-3">{unsplashError}</p>} </div> )}
          </div>
           {/* Logo.dev Section (Always On) */}
          <div className="mb-8 pb-8 border-b border-slate-800">
              <div>
                  <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black">
                              <LogoDevIcon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                              <p className="font-bold text-lg text-white">logo.dev</p>
                              <p className="text-sm text-slate-400">Fetch any company's logo by domain.</p>
                          </div>
                      </div>
                      <div className="px-4 py-2 text-sm font-semibold bg-green-600/20 text-green-300 rounded-lg">
                          Connected
                      </div>
                  </div>
              </div>
          </div>
           {/* Pexels Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isPexelsConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <PexelsIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">Pexels Connected</p> <p className="text-sm text-slate-400">Ready to add stock photos & videos.</p> </div> </div> <button onClick={handleDisconnectPexels} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><PexelsIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to Pexels</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a <a href="https://www.pexels.com/api/new/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Pexels API Key</a> to add free stock photos and videos.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={pexelsKey} onChange={e => setPexelsKey(e.target.value)} placeholder="Your Pexels API Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectPexels} disabled={isPexelsConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isPexelsConnecting ? 'Connecting...' : 'Connect'}</button></div> {pexelsError && <p className="text-red-400 text-sm mt-3">{pexelsError}</p>} </div> )}
          </div>
          {/* FreeSound Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isFreeSoundConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <FreeSoundIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">FreeSound Connected</p> <p className="text-sm text-slate-400">Ready to add sound effects.</p> </div> </div> <button onClick={handleDisconnectFreeSound} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><FreeSoundIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to FreeSound</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a <a href="https://freesound.org/docs/api/authentication.html" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">FreeSound API Key</a> to add sound effects to your apps.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={freeSoundKey} onChange={e => setFreeSoundKey(e.target.value)} placeholder="Your FreeSound API Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectFreeSound} disabled={isFreeSoundConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isFreeSoundConnecting ? 'Connecting...' : 'Connect'}</button></div> {freeSoundError && <p className="text-red-400 text-sm mt-3">{freeSoundError}</p>} </div> )}
          </div>
           {/* Spotify Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isSpotifyConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <SpotifyIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">Spotify Connected</p> <p className="text-sm text-slate-400">Ready to build music apps.</p> </div> </div> <button onClick={handleDisconnectSpotify} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><SpotifyIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to Spotify</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Client ID and Secret</a> to build apps with Spotify data.</p> <div className="grid md:grid-cols-2 gap-4"><input type="password" value={spotifyClientId} onChange={e => setSpotifyClientId(e.target.value)} placeholder="Spotify Client ID" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg" /><input type="password" value={spotifyClientSecret} onChange={e => setSpotifyClientSecret(e.target.value)} placeholder="Spotify Client Secret" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg" /></div> <div className="mt-4 text-right"><button onClick={handleConnectSpotify} disabled={isSpotifyConnecting} className="px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isSpotifyConnecting ? 'Connecting...' : 'Connect'}</button></div> {spotifyError && <p className="text-red-400 text-sm mt-3">{spotifyError}</p>} </div> )}
          </div>
           {/* Streamline Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isStreamlineConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <StreamlineIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">Streamline Connected</p> <p className="text-sm text-slate-400">Ready to find icons for your apps.</p> </div> </div> <button onClick={handleDisconnectStreamline} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><StreamlineIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to Streamline</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a <a href="https://streamlinehq.com/developers" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Streamline API Key</a> to search and use icons in your projects.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={streamlineKey} onChange={e => setStreamlineKey(e.target.value)} placeholder="Your Streamline API Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectStreamline} disabled={isStreamlineConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isStreamlineConnecting ? 'Connecting...' : 'Connect'}</button></div> {streamlineError && <p className="text-red-400 text-sm mt-3">{streamlineError}</p>} </div> )}
          </div>
          {/* OpenAI Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isOpenAiConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <OpenAiIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">OpenAI Connected</p> <p className="text-sm text-slate-400">Ready to generate images with DALL-E.</p> </div> </div> <button onClick={handleDisconnectOpenAI} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><OpenAiIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to OpenAI</h3></div> <p className="text-sm text-slate-500 mb-4">Provide an <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">OpenAI API Key</a> to generate images with DALL-E in your projects.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={openAiKey} onChange={e => setOpenAiKey(e.target.value)} placeholder="sk-..." className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectOpenAI} disabled={isOpenAiConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isOpenAiConnecting ? 'Connecting...' : 'Connect'}</button></div> {openAiError && <p className="text-red-400 text-sm mt-3">{openAiError}</p>} </div> )}
          </div>
          {/* Stability AI Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isStabilityConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <StableDiffusionIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">Stability AI Connected</p> <p className="text-sm text-slate-400">Ready to generate images with Stable Diffusion.</p> </div> </div> <button onClick={handleDisconnectStability} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><StableDiffusionIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to Stability AI</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a <a href="https://platform.stability.ai/account/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Stability AI API Key</a> to generate images with Stable Diffusion.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={stabilityKey} onChange={e => setStabilityKey(e.target.value)} placeholder="Your Stability AI API Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow" /><button onClick={handleConnectStability} disabled={isStabilityConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isStabilityConnecting ? 'Connecting...' : 'Connect'}</button></div> {stabilityError && <p className="text-red-400 text-sm mt-3">{stabilityError}</p>} </div> )}
          </div>
          {/* WeatherAPI.com Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isWeatherApiConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <WeatherApiIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">WeatherAPI.com Connected</p> <p className="text-sm text-slate-400">Ready to build weather apps.</p> </div> </div> <button onClick={handleDisconnectWeatherApi} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><WeatherApiIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to WeatherAPI.com</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a key from <a href="https://www.weatherapi.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">WeatherAPI.com</a> to get weather data.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={weatherApiKey} onChange={e => setWeatherApiKey(e.target.value)} placeholder="Your WeatherAPI Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner" /><button onClick={handleConnectWeatherApi} disabled={isWeatherApiConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isWeatherApiConnecting ? 'Connecting...' : 'Connect'}</button></div> {weatherApiError && <p className="text-red-400 text-sm mt-3">{weatherApiError}</p>} </div> )}
          </div>
          {/* OpenWeatherMap Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isOpenWeatherMapConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <OpenWeatherMapIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">OpenWeatherMap Connected</p> <p className="text-sm text-slate-400">Ready to build weather apps.</p> </div> </div> <button onClick={handleDisconnectOpenWeatherMap} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><OpenWeatherMapIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to OpenWeatherMap</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a key from <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">OpenWeatherMap</a>.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={openWeatherMapKey} onChange={e => setOpenWeatherMapKey(e.target.value)} placeholder="Your OpenWeatherMap Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner" /><button onClick={handleConnectOpenWeatherMap} disabled={isOpenWeatherMapConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isOpenWeatherMapConnecting ? 'Connecting...' : 'Connect'}</button></div> {openWeatherMapError && <p className="text-red-400 text-sm mt-3">{openWeatherMapError}</p>} </div> )}
          </div>
          {/* TMDB Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isTmdbConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <TmdbIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">TMDB Connected</p> <p className="text-sm text-slate-400">Ready to build movie apps.</p> </div> </div> <button onClick={handleDisconnectTmdb} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><TmdbIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to The Movie DB</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a key from <a href="https://www.themoviedb.org/documentation/api" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">TMDB</a>.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={tmdbKey} onChange={e => setTmdbKey(e.target.value)} placeholder="Your TMDB Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner" /><button onClick={handleConnectTmdb} disabled={isTmdbConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isTmdbConnecting ? 'Connecting...' : 'Connect'}</button></div> {tmdbError && <p className="text-red-400 text-sm mt-3">{tmdbError}</p>} </div> )}
          </div>
          {/* YouTube Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isYouTubeConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <YouTubeIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">YouTube Connected</p> <p className="text-sm text-slate-400">Ready to search and embed videos.</p> </div> </div> <button onClick={handleDisconnectYouTube} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><YouTubeIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to YouTube</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a key from the <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google Cloud Console</a>.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={youTubeKey} onChange={e => setYouTubeKey(e.target.value)} placeholder="Your YouTube API Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner" /><button onClick={handleConnectYouTube} disabled={isYouTubeConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isYouTubeConnecting ? 'Connecting...' : 'Connect'}</button></div> {youTubeError && <p className="text-red-400 text-sm mt-3">{youTubeError}</p>} </div> )}
          </div>
          {/* Mapbox Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isMapboxConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <MapboxIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">Mapbox Connected</p> <p className="text-sm text-slate-400">Ready to build map apps.</p> </div> </div> <button onClick={handleDisconnectMapbox} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><MapboxIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to Mapbox</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a key from <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Mapbox</a>.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={mapboxKey} onChange={e => setMapboxKey(e.target.value)} placeholder="Your Mapbox Access Token" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner" /><button onClick={handleConnectMapbox} disabled={isMapboxConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isMapboxConnecting ? 'Connecting...' : 'Connect'}</button></div> {mapboxError && <p className="text-red-400 text-sm mt-3">{mapboxError}</p>} </div> )}
          </div>
          {/* ExchangeRate-API Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isExchangeRateConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <ExchangeRateApiIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">ExchangeRate-API Connected</p> <p className="text-sm text-slate-400">Ready for currency conversions.</p> </div> </div> <button onClick={handleDisconnectExchangeRate} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><ExchangeRateApiIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to ExchangeRate-API</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a key from <a href="https://www.exchangerate-api.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">ExchangeRate-API</a>.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={exchangeRateKey} onChange={e => setExchangeRateKey(e.target.value)} placeholder="Your ExchangeRate-API Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner" /><button onClick={handleConnectExchangeRate} disabled={isExchangeRateConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isExchangeRateConnecting ? 'Connecting...' : 'Connect'}</button></div> {exchangeRateError && <p className="text-red-400 text-sm mt-3">{exchangeRateError}</p>} </div> )}
          </div>
          {/* Financial Modeling Prep Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isFmpConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <FinancialModelingPrepIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">FMP Connected</p> <p className="text-sm text-slate-400">Ready for financial data apps.</p> </div> </div> <button onClick={handleDisconnectFmp} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><FinancialModelingPrepIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to Financial Modeling Prep</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a key from <a href="https://site.financialmodelingprep.com/developer/docs" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">FMP</a>.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={fmpKey} onChange={e => setFmpKey(e.target.value)} placeholder="Your FMP API Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner" /><button onClick={handleConnectFmp} disabled={isFmpConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isFmpConnecting ? 'Connecting...' : 'Connect'}</button></div> {fmpError && <p className="text-red-400 text-sm mt-3">{fmpError}</p>} </div> )}
          </div>
          {/* NewsAPI Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isNewsApiConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <NewsApiIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">NewsAPI Connected</p> <p className="text-sm text-slate-400">Ready to build news apps.</p> </div> </div> <button onClick={handleDisconnectNewsApi} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><NewsApiIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to NewsAPI</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a key from <a href="https://newsapi.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">NewsAPI</a>.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={newsApiKey} onChange={e => setNewsApiKey(e.target.value)} placeholder="Your NewsAPI Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner" /><button onClick={handleConnectNewsApi} disabled={isNewsApiConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isNewsApiConnecting ? 'Connecting...' : 'Connect'}</button></div> {newsApiError && <p className="text-red-400 text-sm mt-3">{newsApiError}</p>} </div> )}
          </div>
          {/* RAWG Section */}
          <div className="mb-8 pb-8 border-b border-slate-800">
            {isRawgConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <RawgIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">RAWG Connected</p> <p className="text-sm text-slate-400">Ready for video game data apps.</p> </div> </div> <button onClick={handleDisconnectRawg} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><RawgIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to RAWG</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a key from <a href="https://rawg.io/apidocs" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">RAWG</a>.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={rawgKey} onChange={e => setRawgKey(e.target.value)} placeholder="Your RAWG API Key" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner" /><button onClick={handleConnectRawg} disabled={isRawgConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isRawgConnecting ? 'Connecting...' : 'Connect'}</button></div> {rawgError && <p className="text-red-400 text-sm mt-3">{rawgError}</p>} </div> )}
          </div>
          {/* WordsAPI Section */}
          <div>
            {isWordsApiConnected ? ( <div> <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center bg-black"> <WordsApiIcon className="w-8 h-8 text-white" /> </div> <div> <p className="font-bold text-lg text-white">WordsAPI Connected</p> <p className="text-sm text-slate-400">Ready for dictionary apps.</p> </div> </div> <button onClick={handleDisconnectWordsApi} className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">Disconnect</button> </div> </div> ) : ( <div> <div className="flex items-center gap-3 mb-2"><WordsApiIcon className="w-6 h-6 text-white"/><h3 className="font-semibold text-slate-300 text-lg">Connect to WordsAPI</h3></div> <p className="text-sm text-slate-500 mb-4">Provide a key from <a href="https://rapidapi.com/dpventures/api/wordsapi/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">RapidAPI</a>.</p> <div className="flex flex-col md:flex-row gap-4 items-start"><input type="password" value={wordsApiKey} onChange={e => setWordsApiKey(e.target.value)} placeholder="Your WordsAPI Key (from RapidAPI)" className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner" /><button onClick={handleConnectWordsApi} disabled={isWordsApiConnecting} className="w-full md:w-auto px-5 py-3 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-500 text-white transition-colors">{isWordsApiConnecting ? 'Connecting...' : 'Connect'}</button></div> {wordsApiError && <p className="text-red-400 text-sm mt-3">{wordsApiError}</p>} </div> )}
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
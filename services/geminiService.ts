import { GoogleGenAI, Type } from "@google/genai";
import { AppFile, GeminiResponse, Secret, MaxReport, TestStep, GeminiModelId, AppMode, AppPlan } from "../types";
import { SYSTEM_PROMPT } from '../constants';
import { THEMES } from '../data/themes';
import { getSecrets as getGlobalSecrets } from './secretsService';
import { getApiKey as getGiphyApiKey } from './giphyService';
import { getAccessKey as getUnsplashAccessKey } from './unsplashService';
import { getApiKey as getOpenAiApiKey } from './openaiService';
import { getApiKey as getPexelsApiKey } from './pexelsService';
import { getApiKey as getFreeSoundApiKey } from './freesoundService';
import { getClientCredentials as getSpotifyCredentials } from './spotifyService';
import { getApiKey as getStabilityApiKey } from './stabilityService';
import { getApiKey as getStreamlineApiKey } from './streamlineService';
import { getCredentials as getHuggingFaceCreds } from './huggingfaceService';
import { getApiKey as getWeatherApiKey } from './weatherApiService';
import { getApiKey as getOpenWeatherMapApiKey } from './openWeatherMapService';
import { getApiKey as getTmdbApiKey } from './tmdbService';
import { getApiKey as getYouTubeApiKey } from './youtubeService';
import { getApiKey as getMapboxApiKey } from './mapboxService';
import { getApiKey as getExchangeRateApiKey } from './exchangeRateApiService';
import { getApiKey as getFmpApiKey } from './financialModelingPrepService';
import { getApiKey as getNewsApiKey } from './newsApiService';
import { getApiKey as getRawgApiKey } from './rawgService';
import { getApiKey as getWordsApiKey } from './wordsApiService';


interface UploadedImage {
    data: string;
    mimeType: string;
}

interface ProjectSettings {
    model?: string;
    secrets?: Secret[];
}

function getGeminiApiKey(): string {
  const storedKey = localStorage.getItem('gemini_api_key');
  if (storedKey && storedKey.trim() !== '') {
    return storedKey;
  }

  const envKey = process.env.API_KEY;
  if (!envKey) {
    throw new Error("Please set your Gemini API Key in the Settings page. No key found in local storage or environment variables.");
  }
  return envKey;
}

const geminiSchema = {
  type: Type.OBJECT,
  properties: {
    previewHtml: { type: Type.STRING },
    files: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING },
          content: { type: Type.STRING },
        },
        required: ["path", "content"],
      },
    },
    summary: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ["previewHtml", "files", "summary"],
};

const appPlanSchema = {
    type: Type.OBJECT,
    properties: {
        features: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of key features the application should have.",
        },
        designDetails: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list describing the visual style, layout, and overall design aesthetic.",
        },
        pages: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of the different pages or main sections the application will contain.",
        },
        colors: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The role of the color (e.g., Primary, Background, Text)." },
                    hex: { type: Type.STRING, description: "The hex code for the color (e.g., #FFFFFF)." },
                },
                required: ["name", "hex"],
            },
            description: "A color palette for the application.",
        },
    },
    required: ["features", "designDetails", "pages", "colors"],
};


const maxReportSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER },
        summary: { type: Type.STRING },
        isPerfect: { type: Type.BOOLEAN },
        issues: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING },
                    description: { type: Type.STRING },
                    suggestion: { type: Type.STRING },
                },
                required: ["type", "description", "suggestion"],
            },
        },
    },
    required: ["score", "summary", "isPerfect", "issues"],
};


function getThemeInstruction(): string { const themeId = localStorage.getItem('ui_theme_template'); if (!themeId || themeId === 'none') { return ''; } const theme = THEMES.find(t => t.id === themeId); if (!theme) return ''; return `
---
**UI THEME INSTRUCTIONS (MUST FOLLOW):**
- **Theme Name:** ${theme.name}
- **Font Family:** Apply "${theme.fontFamily}" to the entire application. You must include the Google Font import for this font in the HTML head.
- **Colors:**
  - Primary: ${theme.colors.primary} (Use for main actions, buttons, highlights)
  - Secondary: ${theme.colors.secondary} (Use for secondary actions, accents)
  - Background: ${theme.colors.background} (Main app background color)
  - Text: ${theme.colors.text} (Default text color)
  - Accent: ${theme.colors.accent} (For links, focus rings, etc.)
- **Navbar Style:** ${theme.navbar.description}
- **Button Style:** ${theme.button.description}

Strictly use these theme properties in the generated code, primarily using Tailwind CSS classes that correspond to these styles. For example, if background is ${theme.colors.background}, use a dark gray class like bg-slate-900. If primary color is ${theme.colors.primary}, use a corresponding color class.
---
`; }
function getSecretsInstruction(secrets: Secret[] | null, title: string): string { if (!secrets || secrets.length === 0) { return ''; } const secretNames = secrets.map(s => `- ${s.name}`).join('\n'); return `
---
**${title} (MUST USE process.env):**
You have access to the following secrets. Use them in your code with \`process.env.SECRET_NAME\`.
${secretNames}
---
`; }
function getLogoDevInstruction(): string { return `
---
**LOGO.DEV API AVAILABLE:**
The logo.dev API is available for fetching company logos. Follow the logo.dev API integration rules in the system prompt. This API is always available and does not require a key.
---
`; }
function getGiphyInstruction(): string { const giphyKey = getGiphyApiKey(); if (!giphyKey) { return ''; } return `
---
**GIPHY API AVAILABLE:**
A Giphy API key is available. If the user asks for a GIF-related application, follow the Giphy API integration rules in the system prompt.
---
`; }
function getGeminiInstruction(): string { try { getGeminiApiKey(); return `
---
**GEMINI API AVAILABLE:**
A Gemini API key is available. If the user asks for an AI-powered application (chatbot, summarizer, etc.), follow the Gemini API integration rules in the system prompt.
---
`; } catch (error) { return ''; } }
function getUnsplashInstruction(): string { const unsplashKey = getUnsplashAccessKey(); if (!unsplashKey) { return ''; } return `
---
**UNSPLASH API AVAILABLE:**
An Unsplash Access Key is available. If the user asks for a stock photo-related application, follow the Unsplash API integration rules in the system prompt.
---
`; }
function getPexelsInstruction(): string { const pexelsKey = getPexelsApiKey(); if (!pexelsKey) { return ''; } return `
---
**PEXELS API AVAILABLE:**
A Pexels API Key is available. If the user asks for a stock photo or video application, follow the Pexels API integration rules in the system prompt.
---
`; }
function getFreeSoundInstruction(): string { const freeSoundKey = getFreeSoundApiKey(); if (!freeSoundKey) { return ''; } return `
---
**FREESOUND API AVAILABLE:**
A FreeSound API Key is available. If the user asks for an application with sound effects, follow the FreeSound API integration rules in the system prompt.
---
`; }
function getSpotifyInstruction(): string { const creds = getSpotifyCredentials(); if (!creds) { return ''; } return `
---
**SPOTIFY API AVAILABLE:**
Spotify API credentials are available. If the user asks for a music-related application, follow the Spotify API integration rules in the system prompt.
---
`; }
function getStreamlineInstruction(): string { const key = getStreamlineApiKey(); if (!key) { return ''; } return `
---
**STREAMLINEHQ API AVAILABLE:**
A StreamlineHQ API Key is available. If the user asks for an icon finder application, follow the StreamlineHQ API integration rules in the system prompt.
---
`; }
function getStabilityInstruction(): string { const key = getStabilityApiKey(); if (!key) { return ''; } return `
---
**STABILITY AI (STABLE DIFFUSION) API AVAILABLE:**
A Stability AI API Key is available. If the user asks for an AI image generation application, prefer this over any other image generation API. Follow the Stability AI integration rules in the system prompt.
---
`; }
function getOpenAiInstruction(): string { const openAiKey = getOpenAiApiKey(); if (!openAiKey) { return ''; } return `
---
**OPENAI API AVAILABLE:**
An OpenAI API Key is available. If the user asks for an AI image generation application (e.g., using DALL-E), follow the OpenAI API integration rules in the system prompt.
---
`; }
function getWeatherApiInstruction(): string { if (!getWeatherApiKey()) return ''; return `
---
**WEATHERAPI.COM API AVAILABLE:**
A WeatherAPI.com API key is available. If the user asks for a weather application, follow the WeatherAPI.com integration rules in the system prompt.
---
`; }
function getOpenWeatherMapInstruction(): string { if (!getOpenWeatherMapApiKey()) return ''; return `
---
**OPENWEATHERMAP API AVAILABLE:**
An OpenWeatherMap API key is available. If the user asks for a weather application, this is an alternative to WeatherAPI.com. Follow the OpenWeatherMap integration rules in the system prompt.
---
`; }
function getTmdbInstruction(): string { if (!getTmdbApiKey()) return ''; return `
---
**THE MOVIE DATABASE (TMDB) API AVAILABLE:**
A TMDB API key is available. If the user asks for a movie or TV show database app, follow the TMDB integration rules in the system prompt.
---
`; }
function getYouTubeInstruction(): string { if (!getYouTubeApiKey()) return ''; return `
---
**YOUTUBE DATA API AVAILABLE:**
A YouTube Data API key is available. If the user asks to build an app involving YouTube videos, follow the YouTube integration rules in the system prompt.
---
`; }
function getMapboxInstruction(): string { if (!getMapboxApiKey()) return ''; return `
---
**MAPBOX API AVAILABLE:**
A Mapbox API key is available. If the user asks to build a map-based application, follow the Mapbox integration rules in the system prompt.
---
`; }
function getExchangeRateApiInstruction(): string { if (!getExchangeRateApiKey()) return ''; return `
---
**EXCHANGERATE-API AVAILABLE:**
An ExchangeRate-API key is available. For any app involving currency conversion, follow the ExchangeRate-API integration rules in the system prompt.
---
`; }
function getFmpInstruction(): string { if (!getFmpApiKey()) return ''; return `
---
**FINANCIAL MODELING PREP (FMP) API AVAILABLE:**
An FMP API key is available. For any app involving stock market data, follow the FMP integration rules in the system prompt.
---
`; }
function getNewsApiInstruction(): string { if (!getNewsApiKey()) return ''; return `
---
**NEWSAPI AVAILABLE:**
A NewsAPI key is available. For any app that needs to display news articles, follow the NewsAPI integration rules in the system prompt.
---
`; }
function getRawgInstruction(): string { if (!getRawgApiKey()) return ''; return `
---
**RAWG VIDEO GAMES API AVAILABLE:**
A RAWG API key is available. For any app related to video games, follow the RAWG integration rules in the system prompt.
---
`; }
function getWordsApiInstruction(): string { if (!getWordsApiKey()) return ''; return `
---
**WORDSAPI AVAILABLE:**
A WordsAPI key is available. For dictionary or thesaurus apps, follow the WordsAPI integration rules in the system prompt.
---
`; }

function constructFullPrompt( prompt: string, existingFiles: AppFile[] | null, visualEditTarget?: { selector: string } | null, projectSecrets?: Secret[] | null, appMode?: AppMode ): string { const instructions = [ getThemeInstruction(), getSecretsInstruction(getGlobalSecrets(), "GLOBAL CUSTOM SECRETS"), getSecretsInstruction(projectSecrets, "PROJECT-SPECIFIC SECRETS"), getLogoDevInstruction(), getGiphyInstruction(), getGeminiInstruction(), getUnsplashInstruction(), getPexelsInstruction(), getFreeSoundInstruction(), getSpotifyInstruction(), getStreamlineInstruction(), getStabilityInstruction(), getOpenAiInstruction(), getWeatherApiInstruction(), getOpenWeatherMapInstruction(), getTmdbInstruction(), getYouTubeInstruction(), getMapboxInstruction(), getExchangeRateApiInstruction(), getFmpInstruction(), getNewsApiInstruction(), getRawgInstruction(), getWordsApiInstruction(), ].filter(Boolean).join('\n'); const filesString = existingFiles ? existingFiles .map(f => `// File: ${f.path}\n\n${f.content}`) .join('\n\n---\n\n') : ''; const modeInstruction = `APP MODE: ${appMode || 'web'}\n\n`; if (visualEditTarget && existingFiles) { return `${instructions}\n\n${modeInstruction}Here is the current application's code:\n\n---\n${filesString}\n---\n\nCSS SELECTOR: \`${visualEditTarget.selector}\`\nVISUAL EDIT PROMPT: "${prompt}"\n\nPlease apply the visual edit prompt to the element identified by the CSS selector.`; } else if (existingFiles && existingFiles.length > 0) { return `${instructions}\n\n${modeInstruction}Here is the current application's code:\n\n---\n${filesString}\n---\n\nPlease apply the following change to the application: ${prompt}`; } else { return `${instructions}\n\n${modeInstruction}Please generate an application based on the following request: ${prompt}`; } }

function injectSecrets(html: string, secrets: Secret[]): string { if (secrets.length > 0) { const secretsObject = secrets.reduce((obj, secret) => { obj[secret.name] = secret.value; return obj; }, {} as Record<string, string>); const secretScript = `<script>window.process = { env: ${JSON.stringify(secretsObject)} };</script>`; return html.replace('</head>', `${secretScript}</head>`); } return html; }

function injectApiKeys(code: string): string { let injectedCode = code; const giphyKey = getGiphyApiKey(); if (giphyKey) injectedCode = injectedCode.replace(/'YOUR_GIPHY_API_KEY'/g, `'${giphyKey}'`); try { const geminiKey = getGeminiApiKey(); injectedCode = injectedCode.replace(/'YOUR_GEMINI_API_KEY'/g, `'${geminiKey}'`); } catch(e) { /* No Gemini key, do nothing */ } const unsplashKey = getUnsplashAccessKey(); if (unsplashKey) injectedCode = injectedCode.replace(/'YOUR_UNSPLASH_ACCESS_KEY'/g, `'${unsplashKey}'`); const pexelsKey = getPexelsApiKey(); if (pexelsKey) injectedCode = injectedCode.replace(/'YOUR_PEXELS_API_KEY'/g, `'${pexelsKey}'`); const freeSoundKey = getFreeSoundApiKey(); if (freeSoundKey) injectedCode = injectedCode.replace(/'YOUR_FREESOUND_API_KEY'/g, `'${freeSoundKey}'`); const spotifyCreds = getSpotifyCredentials(); if (spotifyCreds) { injectedCode = injectedCode.replace(/'YOUR_SPOTIFY_CLIENT_ID'/g, `'${spotifyCreds.clientId}'`); injectedCode = injectedCode.replace(/'YOUR_SPOTIFY_CLIENT_SECRET'/g, `'${spotifyCreds.clientSecret}'`); } const openAiKey = getOpenAiApiKey(); if (openAiKey) injectedCode = injectedCode.replace(/'YOUR_OPENAI_API_KEY'/g, `'${openAiKey}'`); const stabilityKey = getStabilityApiKey(); if (stabilityKey) injectedCode = injectedCode.replace(/'YOUR_STABILITY_API_KEY'/g, `'${stabilityKey}'`); const streamlineKey = getStreamlineApiKey(); if (streamlineKey) injectedCode = injectedCode.replace(/'YOUR_STREAMLINE_API_KEY'/g, `'${streamlineKey}'`); const weatherApiKey = getWeatherApiKey(); if (weatherApiKey) injectedCode = injectedCode.replace(/'YOUR_WEATHERAPI_KEY'/g, `'${weatherApiKey}'`); const openWeatherMapKey = getOpenWeatherMapApiKey(); if (openWeatherMapKey) injectedCode = injectedCode.replace(/'YOUR_OPENWEATHERMAP_KEY'/g, `'${openWeatherMapKey}'`); const tmdbKey = getTmdbApiKey(); if (tmdbKey) injectedCode = injectedCode.replace(/'YOUR_TMDB_KEY'/g, `'${tmdbKey}'`); const youtubeKey = getYouTubeApiKey(); if (youtubeKey) injectedCode = injectedCode.replace(/'YOUR_YOUTUBE_KEY'/g, `'${youtubeKey}'`); const mapboxKey = getMapboxApiKey(); if (mapboxKey) injectedCode = injectedCode.replace(/'YOUR_MAPBOX_KEY'/g, `'${mapboxKey}'`); const exchangeRateKey = getExchangeRateApiKey(); if (exchangeRateKey) injectedCode = injectedCode.replace(/'YOUR_EXCHANGERATE_KEY'/g, `'${exchangeRateKey}'`); const fmpKey = getFmpApiKey(); if (fmpKey) injectedCode = injectedCode.replace(/'YOUR_FMP_KEY'/g, `'${fmpKey}'`); const newsApiKey = getNewsApiKey(); if (newsApiKey) injectedCode = injectedCode.replace(/'YOUR_NEWSAPI_KEY'/g, `'${newsApiKey}'`); const rawgKey = getRawgApiKey(); if (rawgKey) injectedCode = injectedCode.replace(/'YOUR_RAWG_KEY'/g, `'${rawgKey}'`); const wordsApiKey = getWordsApiKey(); if (wordsApiKey) injectedCode = injectedCode.replace(/'YOUR_WORDSAPI_KEY'/g, `'${wordsApiKey}'`); return injectedCode; }

async function _generateWithHuggingFace(fullPrompt: string): Promise<GeminiResponse> {
    const creds = getHuggingFaceCreds();
    if (!creds) {
        throw new Error("Hugging Face credentials are not set. Please add them in the Settings page.");
    }

    const response = await fetch(creds.modelUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${creds.token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: `${SYSTEM_PROMPT}\n\n${fullPrompt}`,
            parameters: { return_full_text: false }
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API error (${response.status}): ${errorText}`);
    }

    const results = await response.json();
    // Hugging Face API typically returns an array, and the generated text is inside the first element.
    const rawJsonString = results[0]?.generated_text;
    
    if (!rawJsonString) {
      console.error("Hugging Face response format unexpected:", results);
      throw new Error("Failed to parse response from Hugging Face model. The response format was not as expected.");
    }
    
    const generatedApp = JSON.parse(rawJsonString) as GeminiResponse;
    return generatedApp;
}


async function _generateWithGemini(fullPrompt: string, images?: UploadedImage[] | null, projectSettings?: ProjectSettings): Promise<GeminiResponse> {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please add it in the Settings page.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const model = projectSettings?.model || localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

    let contents: any;
    const textPart = { text: fullPrompt };
    if (images && images.length > 0) {
        const imageParts = images.map(image => ({
            inlineData: { mimeType: image.mimeType, data: image.data },
        }));
        contents = { parts: [textPart, ...imageParts] };
    } else {
        contents = fullPrompt;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: geminiSchema,
      },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString) as GeminiResponse;
}


export async function generateOrUpdateAppCode(
    prompt: string, 
    existingFiles: AppFile[] | null,
    visualEditTarget?: { selector: string } | null,
    images?: UploadedImage[] | null,
    projectSettings?: ProjectSettings,
    appMode?: AppMode
): Promise<GeminiResponse> {
  try {
    const fullPrompt = constructFullPrompt(prompt, existingFiles, visualEditTarget, projectSettings?.secrets, appMode);
    const provider = localStorage.getItem('ai_provider') || 'gemini';
    
    let generatedApp: GeminiResponse;

    if (provider === 'huggingface') {
        if (images && images.length > 0) {
            throw new Error("Image uploads are not supported with Hugging Face models at this time.");
        }
        generatedApp = await _generateWithHuggingFace(fullPrompt);
    } else {
        generatedApp = await _generateWithGemini(fullPrompt, images, projectSettings);
    }

    if (!generatedApp || typeof generatedApp.previewHtml !== 'string' || !Array.isArray(generatedApp.files) || generatedApp.files.length === 0 || !Array.isArray(generatedApp.summary)) {
      throw new Error("AI response is not in the expected format or is empty.");
    }

    generatedApp.files = generatedApp.files.map(file => ({ ...file, content: injectApiKeys(file.content) }));
    if (generatedApp.files[0] && (appMode === 'web' || !appMode)) {
      const globalSecrets = getGlobalSecrets();
      const projectSecrets = projectSettings?.secrets || [];
      const secretsMap = new Map<string, string>();
      globalSecrets.forEach(s => secretsMap.set(s.name, s.value));
      projectSecrets.forEach(s => secretsMap.set(s.name, s.value));
      const combinedSecrets: Secret[] = Array.from(secretsMap, ([name, value]) => ({ name, value }));

      generatedApp.previewHtml = injectSecrets(generatedApp.files[0].content, combinedSecrets);
    }
    
    return generatedApp;

  } catch (error) {
    console.error("Error generating app code:", error);
    if (error instanceof Error) { throw new Error(`Failed to generate app code: ${error.message}`); }
    throw new Error("An unknown error occurred while generating app code.");
  }
}

async function* _streamGenerateWithHuggingFace(fullPrompt: string): AsyncGenerator<{ summary?: string[]; files?: AppFile[]; previewHtml?: string; finalResponse?: GeminiResponse; error?: string }> {
    const creds = getHuggingFaceCreds();
    if (!creds) throw new Error("Hugging Face credentials are not set.");

    const response = await fetch(creds.modelUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${creds.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            inputs: `${SYSTEM_PROMPT}\n\n${fullPrompt}`,
            stream: true,
            parameters: { return_full_text: false }
        }),
    });

    if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(`Hugging Face stream error (${response.status}): ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Process server-sent events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last, potentially incomplete line

        for (const line of lines) {
            if (line.startsWith('data:')) {
                const jsonStr = line.substring(5).trim();
                try {
                    const data = JSON.parse(jsonStr);
                    if (data.token && data.token.text) {
                        yield { previewHtml: data.token.text }; // Yielding raw token text for live preview
                    }
                } catch (e) { /* Incomplete JSON, wait for more chunks */ }
            }
        }
    }
    // Note: This simplified streaming yields raw tokens. The final response parsing is more complex.
    // For a robust implementation, you'd accumulate all tokens and then parse the final JSON.
    // Let's fallback to just returning the final object at the end for simplicity.
    const finalResponse = await _generateWithHuggingFace(fullPrompt);
    yield { finalResponse };
}

async function* _streamGenerateWithGemini(fullPrompt: string, images?: UploadedImage[] | null, projectSettings?: ProjectSettings): AsyncGenerator<{ summary?: string[]; files?: AppFile[]; previewHtml?: string; finalResponse?: GeminiResponse; error?: string }> {
    const apiKey = getGeminiApiKey();
    if (!apiKey) throw new Error("Gemini API key is missing.");
    
    const ai = new GoogleGenAI({ apiKey });
    const model = projectSettings?.model || localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

    let contents: any;
    const textPart = { text: fullPrompt };
    if (images && images.length > 0) {
        const imageParts = images.map(image => ({ inlineData: { mimeType: image.mimeType, data: image.data } }));
        contents = { parts: [textPart, ...imageParts] };
    } else { contents = fullPrompt; }

    const responseStream = await ai.models.generateContentStream({
      model: model, contents: contents,
      config: { systemInstruction: SYSTEM_PROMPT, responseMimeType: "application/json", responseSchema: geminiSchema },
    });

    let buffer = '';
    let yieldedSummary = false;
    let yieldedFiles = false;

    for await (const chunk of responseStream) {
        buffer += chunk.text;
        if (!yieldedSummary) {
            const summaryRegex = /"summary"\s*:\s*(\[.*?\])/s;
            const summaryMatch = buffer.match(summaryRegex);
            if (summaryMatch) {
                try {
                    const summary = JSON.parse(summaryMatch[1]);
                    yield { summary };
                    yieldedSummary = true;
                } catch (e) { /* Incomplete */ }
            }
        }
        if (!yieldedFiles) {
            const filesRegex = /"files"\s*:\s*(\[.*?\])/s;
            const filesMatch = buffer.match(filesRegex);
            if (filesMatch) {
                try {
                    const files = JSON.parse(filesMatch[1]);
                    if (Array.isArray(files) && files.every(f => f.path && Object.keys(f).length === 1)) {
                        yield { files: files.map(f => ({ path: f.path, content: '' })) };
                        yieldedFiles = true;
                    }
                } catch (e) { /* Incomplete */ }
            }
        }
        const startMarker = '"previewHtml": "';
        const startIndex = buffer.indexOf(startMarker);
        if (startIndex !== -1) { 
            const htmlFragment = buffer.substring(startIndex + startMarker.length); 
            yield { previewHtml: htmlFragment }; 
        }
    }

    const finalResponse = JSON.parse(buffer) as GeminiResponse;
    if (!finalResponse || !finalResponse.previewHtml || !finalResponse.files || !finalResponse.summary) {
        throw new Error("Stream finished but AI response is not in the expected format or is empty.");
    }
    
    yield { finalResponse };
}


export async function* streamGenerateOrUpdateAppCode(
    prompt: string, 
    existingFiles: AppFile[] | null,
    visualEditTarget?: { selector: string } | null,
    images?: UploadedImage[] | null,
    projectSettings?: ProjectSettings,
    appMode?: AppMode,
): AsyncGenerator<{ summary?: string[]; files?: AppFile[]; previewHtml?: string; finalResponse?: GeminiResponse; error?: string }> {
  try {
    const fullPrompt = constructFullPrompt(prompt, existingFiles, visualEditTarget, projectSettings?.secrets, appMode);
    const provider = localStorage.getItem('ai_provider') || 'gemini';
    const useStreaming = localStorage.getItem('experimental_live_preview') === 'true' && appMode === 'web';

    if (!useStreaming) {
        const finalResponse = await generateOrUpdateAppCode(prompt, existingFiles, visualEditTarget, images, projectSettings, appMode);
        yield { finalResponse };
        return;
    }

    let stream;
    if (provider === 'huggingface') {
        if (images && images.length > 0) throw new Error("Image uploads are not supported with Hugging Face models.");
        stream = _streamGenerateWithHuggingFace(fullPrompt);
    } else {
        stream = _streamGenerateWithGemini(fullPrompt, images, projectSettings);
    }
    
    let finalResponse: GeminiResponse | null = null;
    let combinedPreview = '';
    for await (const update of stream) {
        if ('finalResponse' in update) {
            finalResponse = update.finalResponse!;
            break;
        }
        if (update.previewHtml) {
            combinedPreview += update.previewHtml;
            yield { ...update, previewHtml: combinedPreview };
        } else {
            yield update;
        }
    }
    
    if (!finalResponse) { // Handle cases where stream ends without a final response object
      // This is a simplified fallback for HuggingFace streaming.
      if (provider === 'huggingface') {
         finalResponse = JSON.parse(combinedPreview) as GeminiResponse;
      } else {
        throw new Error("Stream finished without a valid result.");
      }
    }
    
    finalResponse.files = finalResponse.files.map(file => ({ ...file, content: injectApiKeys(file.content) }));
    if (finalResponse.files[0] && (appMode === 'web' || !appMode)) {
      const globalSecrets = getGlobalSecrets();
      const projectSecrets = projectSettings?.secrets || [];
      const secretsMap = new Map<string, string>();
      globalSecrets.forEach(s => secretsMap.set(s.name, s.value));
      projectSecrets.forEach(s => secretsMap.set(s.name, s.value));
      const combinedSecrets: Secret[] = Array.from(secretsMap, ([name, value]) => ({ name, value }));
      
      finalResponse.previewHtml = injectSecrets(finalResponse.files[0].content, combinedSecrets);
    }

    yield { finalResponse };

  } catch (error) {
    console.error("Error streaming app code:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    yield { error: `Failed to generate app code: ${errorMessage}` };
  }
}

export async function generateAppPlan(prompt: string, revisions?: string): Promise<AppPlan> {
    const systemInstruction = `You are an expert software project planner. Based on the user's prompt, break down the requested application into a detailed plan. The plan must include a list of features, design details, pages/sections, and a color palette. If the user provides revisions, adjust the plan accordingly. You MUST respond in the specified JSON format.`;

    const fullPrompt = revisions
        ? `The original request was: "${prompt}". The user has requested the following revisions: "${revisions}". Please generate an updated plan.`
        : `Please generate a plan for the following application request: "${prompt}"`;

    try {
        const apiKey = getGeminiApiKey();
        const ai = new GoogleGenAI({ apiKey });
        const model = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

        const response = await ai.models.generateContent({
          model: model,
          contents: fullPrompt,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: appPlanSchema,
          },
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as AppPlan;
    } catch (error) {
        console.error("Error generating app plan:", error);
        if (error instanceof Error) { throw new Error(`Failed to generate app plan: ${error.message}`); }
        throw new Error("An unknown error occurred while generating the app plan.");
    }
}


export async function analyzeAppCode(code: string, projectSettings?: ProjectSettings): Promise<MaxReport> {
    const systemInstruction = `You are "MAX", an expert AI quality assurance engineer. Your task is to analyze the user's single-file HTML application code.
- Provide a score from 0-100 based on code quality, UI/UX, accessibility, and potential bugs.
- Give a brief, one-sentence summary of your findings.
- Identify specific issues and categorize them as "UI/UX", "Accessibility", "Bug", "Performance", or "Best Practice".
- For each issue, provide a concise description and a clear suggestion for how to fix it.
- If the code is perfect and has no issues, set "isPerfect" to true, score to 100, and leave the issues array empty.
- You MUST respond in the specified JSON format.`;

    const prompt = `Here is the application code:\n\n\`\`\`html\n${code}\n\`\`\`\n\nPlease analyze it and provide your report.`;
    
    try {
        const apiKey = getGeminiApiKey();
        const ai = new GoogleGenAI({ apiKey });
        const model = projectSettings?.model || localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: maxReportSchema,
          },
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as MaxReport;
    } catch (error) {
        console.error("Error analyzing app code with MAX:", error);
        if (error instanceof Error) { throw new Error(`MAX analysis failed: ${error.message}`); }
        throw new Error("An unknown error occurred during MAX analysis.");
    }
}


export async function determineModelForPrompt(prompt: string): Promise<GeminiModelId> {
    const systemInstruction = `Analyze the user's web app prompt. Determine if it requires a simple model ('gemini-2.5-flash') for basic tasks or a more advanced model ('gemini-2.5-pro') for complex requests.
- Simple tasks include: to-do lists, calculators, simple forms, a basic landing page, a personal portfolio with static content.
- Complex tasks include: apps with API integrations, real-time data, complex state management, multiple interactive components, or highly stylized/animated UIs.
Respond ONLY with a JSON object in the format: { "model": "model_name" }`;

    const modelSchema = {
        type: Type.OBJECT,
        properties: { model: { type: Type.STRING } },
        required: ["model"],
    };

    try {
        const apiKey = getGeminiApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash', // Use flash for this simple classification task
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: modelSchema,
          },
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString) as { model: string };
        
        if (result.model === 'gemini-2.5-pro' || result.model === 'gemini-2.5-flash') {
            return result.model as GeminiModelId;
        }
        // Fallback if the model returns an unexpected string
        return 'gemini-2.5-flash';

    } catch (error) {
        console.error("Error determining model:", error);
        // Fallback on error
        return 'gemini-2.5-flash';
    }
}

export async function generateMaxTestPlan(code: string): Promise<TestStep[]> {
    const testStepSchema = {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, enum: ['type', 'click', 'scroll', 'navigate'] },
        targetSelector: { type: Type.STRING, description: "A unique and valid CSS selector for the target element." },
        payload: {
          type: Type.OBJECT,
          properties: { 
              text: { type: Type.STRING, description: "Text to type for 'type' actions." },
              amount: { type: Type.NUMBER, description: "Pixel amount to scroll for 'scroll' actions." },
          },
          nullable: true,
        },
        description: { type: Type.STRING, description: "A user-friendly description of the test step." },
      },
      required: ["action", "targetSelector", "description"],
    };

    const testPlanSchema = {
        type: Type.OBJECT,
        properties: {
            plan: {
                type: Type.ARRAY,
                items: testStepSchema
            }
        },
        required: ["plan"]
    };

    const systemInstruction = `You are "MAX", a world-class QA automation engineer. Your task is to analyze the provided HTML application code and generate a logical, step-by-step test plan in JSON format.
- The plan should test the application's core functionality from top to bottom, as a user would.
- For each step, provide a precise CSS selector for the target element.
- The plan should be an array of test step objects.
- Example for a to-do app:
  1. Type "Buy milk" into the input field.
  2. Click the "Add" button.
  3. Click the checkbox of the first to-do item.
  4. Click the "Delete" button of the first to-do item.
- Ensure the selectors are robust (e.g., use IDs, unique classes, or attribute selectors if possible).
- Respond ONLY with a JSON object in the format: { "plan": [...] }`;

    const prompt = `Here is the application code:\n\n\`\`\`html\n${code}\n\`\`\`\n\nPlease generate the test plan.`;

    try {
        const apiKey = getGeminiApiKey();
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash', // Flash is sufficient for this
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: testPlanSchema,
          },
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString) as { plan: TestStep[] };
        return result.plan;
    } catch (error) {
        console.error("Error generating MAX test plan:", error);
        throw new Error("Failed to generate test plan for MAX.");
    }
}

export async function generateImprovementPrompt(code: string, existingFeatures: string[]): Promise<string> {
    const systemInstruction = `You are an expert AI software engineer. Your task is to analyze the provided HTML application code and a list of existing features/prompts.
- Suggest a SINGLE, NEW, and VALUABLE feature or improvement that can be added to the application.
- The suggestion should be a concise, actionable prompt that another AI could use to implement the change.
- DO NOT suggest features that are already in the "Existing Features" list.
- Good examples: "add a dark mode toggle", "animate the header on scroll", "add a confirmation modal before deleting an item", "make the layout responsive for mobile devices".
- Bad examples: "improve the code", "make it better", "add more features".
- Respond ONLY with the raw text of the prompt. Do not add any extra formatting, quotation marks, or explanations.`;

    const prompt = `Here is the application code:\n\n\`\`\`html\n${code}\n\`\`\`\n\nExisting Features (do not repeat these):\n- ${existingFeatures.join('\n- ')}\n\nPlease provide a new feature prompt.`;
    
    try {
        const apiKey = getGeminiApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
          },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating improvement prompt:", error);
        if (error instanceof Error) { throw new Error(`Failed to generate improvement prompt: ${error.message}`); }
        throw new Error("An unknown error occurred while generating an improvement prompt.");
    }
}


export async function editCodeWithAi(prompt: string, filePath: string, fileContent: string): Promise<string> {
    const systemInstruction = `You are an expert AI software engineer. You will be given a file's content and a user's instruction to modify it.
- Your task is to apply the user's requested changes to the code.
- You MUST return the ENTIRE, complete, updated code for the file.
- Do NOT add any explanations, comments, or markdown formatting (like \`\`\`diff or \`\`\`javascript) around the code.
- Only output the raw, modified code content.`;
    
    const fullPrompt = `Here is the file \`${filePath}\`:\n\n\`\`\`\n${fileContent}\n\`\`\`\n\nUser request: "${prompt}"\n\nPlease provide the full, updated content for the file.`;

    try {
        const apiKey = getGeminiApiKey();
        const ai = new GoogleGenAI({ apiKey });
        const model = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

        const response = await ai.models.generateContent({
          model: model,
          contents: fullPrompt,
          config: {
            systemInstruction: systemInstruction,
          },
        });

        const updatedCode = response.text;
        
        // Sometimes the model might still wrap the code in markdown, let's try to strip it.
        const codeBlockRegex = /```(?:\w+\n)?([\s\S]*?)```/;
        const match = updatedCode.match(codeBlockRegex);
        if (match && match[1]) {
            return match[1].trim();
        }
        
        return updatedCode.trim();

    } catch (error) {
        console.error("Error editing code with AI:", error);
        if (error instanceof Error) { throw new Error(`AI edit failed: ${error.message}`); }
        throw new Error("An unknown error occurred during AI code editing.");
    }
}

export async function* generateMaxChatStream(prompt: string): AsyncGenerator<string> {
    const systemInstruction = `You are Silo MAX, an expert AI assistant and programmer. 
- You can chat conversationally.
- You can generate code snippets or entire files.
- When you generate code, you MUST wrap it in a markdown code block with the language identifier (e.g., \`\`\`tsx ... \`\`\`).
- If the user provides context about editing a file in a repository, your code block should represent the entire new content of that file.
- Keep your non-code responses helpful and concise.`;

    try {
        const apiKey = getGeminiApiKey();
        const ai = new GoogleGenAI({ apiKey });
        const model = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error in Silo MAX chat stream:", error);
        if (error instanceof Error) {
            throw new Error(`Silo MAX chat failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during Silo MAX chat.");
    }
}
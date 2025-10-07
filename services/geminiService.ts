

import { GoogleGenAI, Type } from "@google/genai";
import { AppFile, GeminiResponse } from "../types";
import { SYSTEM_PROMPT, STUDIO_SYSTEM_PROMPT } from '../constants';
import { THEMES } from '../data/themes';
import { getSecrets } from './secretsService';
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
function getSecretsInstruction(): string { const secrets = getSecrets(); if (secrets.length === 0) { return ''; } const secretNames = secrets.map(s => `- ${s.name}`).join('\n'); return `
---
**CUSTOM SECRETS (MUST USE process.env):**
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

function constructFullPrompt( prompt: string, existingFiles: AppFile[] | null, visualEditTarget?: { selector: string } | null ): string { const instructions = [ getThemeInstruction(), getSecretsInstruction(), getLogoDevInstruction(), getGiphyInstruction(), getGeminiInstruction(), getUnsplashInstruction(), getPexelsInstruction(), getFreeSoundInstruction(), getSpotifyInstruction(), getStreamlineInstruction(), getStabilityInstruction(), getOpenAiInstruction(), getWeatherApiInstruction(), getOpenWeatherMapInstruction(), getTmdbInstruction(), getYouTubeInstruction(), getMapboxInstruction(), getExchangeRateApiInstruction(), getFmpInstruction(), getNewsApiInstruction(), getRawgInstruction(), getWordsApiInstruction(), ].filter(Boolean).join('\n'); const filesString = existingFiles ? existingFiles .map(f => `// File: ${f.path}\n\n${f.content}`) .join('\n\n---\n\n') : ''; if (visualEditTarget && existingFiles) { return `${instructions}\n\nHere is the current application's code:\n\n---\n${filesString}\n---\n\nCSS SELECTOR: \`${visualEditTarget.selector}\`\nVISUAL EDIT PROMPT: "${prompt}"\n\nPlease apply the visual edit prompt to the element identified by the CSS selector.`; } else if (existingFiles && existingFiles.length > 0) { return `${instructions}\n\nHere is the current application's code:\n\n---\n${filesString}\n---\n\nPlease apply the following change to the application: ${prompt}`; } else { return `${instructions}\n\nPlease generate an application based on the following request: ${prompt}`; } }

function injectSecrets(html: string): string { const secrets = getSecrets(); if (secrets.length > 0) { const secretsObject = secrets.reduce((obj, secret) => { obj[secret.name] = secret.value; return obj; }, {} as Record<string, string>); const secretScript = `<script>window.process = { env: ${JSON.stringify(secretsObject)} };</script>`; return html.replace('</head>', `${secretScript}</head>`); } return html; }

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


async function _generateWithGemini(fullPrompt: string, images?: UploadedImage[] | null): Promise<GeminiResponse> {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please add it in the Settings page.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const model = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

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
    images?: UploadedImage[] | null
): Promise<GeminiResponse> {
  try {
    const fullPrompt = constructFullPrompt(prompt, existingFiles, visualEditTarget);
    const provider = localStorage.getItem('ai_provider') || 'gemini';
    
    let generatedApp: GeminiResponse;

    if (provider === 'huggingface') {
        if (images && images.length > 0) {
            throw new Error("Image uploads are not supported with Hugging Face models at this time.");
        }
        generatedApp = await _generateWithHuggingFace(fullPrompt);
    } else {
        generatedApp = await _generateWithGemini(fullPrompt, images);
    }

    if (!generatedApp || typeof generatedApp.previewHtml !== 'string' || !Array.isArray(generatedApp.files) || generatedApp.files.length === 0 || !Array.isArray(generatedApp.summary)) {
      throw new Error("AI response is not in the expected format or is empty.");
    }

    generatedApp.files = generatedApp.files.map(file => ({ ...file, content: injectApiKeys(file.content) }));
    if (generatedApp.files[0]) {
      generatedApp.previewHtml = injectSecrets(generatedApp.files[0].content);
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

async function* _streamGenerateWithGemini(fullPrompt: string, images?: UploadedImage[] | null): AsyncGenerator<{ summary?: string[]; files?: AppFile[]; previewHtml?: string; finalResponse?: GeminiResponse; error?: string }> {
    const apiKey = getGeminiApiKey();
    if (!apiKey) throw new Error("Gemini API key is missing.");
    
    const ai = new GoogleGenAI({ apiKey });
    const model = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

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
            const summaryRegex = /"summary"\s*:\s*(\[.*?\])/s; const summaryMatch = buffer.match(summaryRegex);
            if (summaryMatch) { try { const summary = JSON.parse(summaryMatch[1]); yield { summary }; yieldedSummary = true; } catch (e) { /* Incomplete */ } }
        }
        if (!yieldedFiles) {
            const filesRegex = /"files"\s*:\s*(\[.*?\])/s; const filesMatch = buffer.match(filesRegex);
            if (filesMatch) { try { const files = JSON.parse(filesMatch[1]); if (Array.isArray(files) && files.every(f => f.path && Object.keys(f).length === 1)) { yield { files: files.map(f => ({ path: f.path, content: '' })) }; yieldedFiles = true; } } catch (e) { /* Incomplete */ } }
        }
        const startMarker = '"previewHtml": "'; const startIndex = buffer.indexOf(startMarker);
        if (startIndex !== -1) { const htmlFragment = buffer.substring(startIndex + startMarker.length); yield { previewHtml: injectApiKeys(htmlFragment) }; }
    }

    const finalResponse = JSON.parse(buffer) as GeminiResponse;
    if (!finalResponse || !finalResponse.previewHtml || !finalResponse.files || !finalResponse.summary) {
        throw new Error("Stream finished but AI response is not in the expected format or is empty.");
    }
    // FIX: An async generator's return value is not captured by a `for await...of` loop.
    // The final response must be yielded to be consumed by the calling function.
    yield { finalResponse };
}


export async function* streamGenerateOrUpdateAppCode(
    prompt: string, 
    existingFiles: AppFile[] | null,
    visualEditTarget?: { selector: string } | null,
    images?: UploadedImage[] | null
): AsyncGenerator<{ summary?: string[]; files?: AppFile[]; previewHtml?: string; finalResponse?: GeminiResponse; error?: string }> {
  try {
    const fullPrompt = constructFullPrompt(prompt, existingFiles, visualEditTarget);
    const provider = localStorage.getItem('ai_provider') || 'gemini';
    const useStreaming = localStorage.getItem('experimental_live_preview') === 'true';

    if (!useStreaming) {
        const finalResponse = await generateOrUpdateAppCode(prompt, existingFiles, visualEditTarget, images);
        yield { finalResponse };
        return;
    }

    let stream;
    if (provider === 'huggingface') {
        if (images && images.length > 0) throw new Error("Image uploads are not supported with Hugging Face models.");
        stream = _streamGenerateWithHuggingFace(fullPrompt);
    } else {
        stream = _streamGenerateWithGemini(fullPrompt, images);
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
    if (finalResponse.files[0]) {
      finalResponse.previewHtml = injectSecrets(finalResponse.files[0].content);
    }

    yield { finalResponse };

  } catch (error) {
    console.error("Error streaming app code:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    yield { error: `Failed to generate app code: ${errorMessage}` };
  }
}


function getStudioSystemPrompt(): string { const isGiphyConnected = !!getGiphyApiKey(); let isGeminiConnected = false; try { getGeminiApiKey(); isGeminiConnected = true; } catch (e) { /* ignore */ } const secrets = getSecrets(); const secretsList = secrets.length > 0 ? secrets.map(s => s.name).join(', ') : 'None'; return STUDIO_SYSTEM_PROMPT .replace('{{GIPHY_STATUS}}', isGiphyConnected ? 'Connected' : 'Not Connected') .replace('{{GEMINI_STATUS}}', isGeminiConnected ? 'Connected' : 'Not Connected') .replace('{{SECRETS_LIST}}', secretsList); }

// New function for Studio Chat
export async function chatWithStudioAgent( history: { role: 'user' | 'model'; parts: { text: string }[] }[] ): Promise<string> { try { const apiKey = getGeminiApiKey(); if (!apiKey) { throw new Error("Gemini API key is missing. Please add it in the Settings page."); } const ai = new GoogleGenAI({ apiKey }); const model = 'gemini-2.5-flash'; // Always use flash for chat const response = await ai.models.generateContent({ model: model, contents: history, config: { systemInstruction: getStudioSystemPrompt() } }); return response.text; } catch (error) { console.error("Error chatting with Studio Agent:", error); if (error instanceof Error) { throw new Error(`Studio Agent failed: ${error.message}`); } throw new Error("An unknown error occurred while chatting with the Studio Agent."); } }
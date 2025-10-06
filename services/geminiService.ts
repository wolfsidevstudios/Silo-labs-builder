
import { GoogleGenAI, Type } from "@google/genai";
import { AppFile, GeminiResponse } from "../types";
import { SYSTEM_PROMPT, STUDIO_SYSTEM_PROMPT } from '../constants';
import { THEMES } from '../data/themes';
import { getSecrets } from './secretsService';
import { getApiKey as getGiphyApiKey } from './giphyService';
import { getAccessKey as getUnsplashAccessKey } from './unsplashService';
import { getApiKey as getOpenAiApiKey } from './openaiService';

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

const schema = {
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

function getThemeInstruction(): string {
  const themeId = localStorage.getItem('ui_theme_template');
  
  if (!themeId || themeId === 'none') {
    return '';
  }

  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return '';

  return `
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
`;
}

function getSecretsInstruction(): string {
  const secrets = getSecrets();
  if (secrets.length === 0) {
    return '';
  }
  const secretNames = secrets.map(s => `- ${s.name}`).join('\n');
  return `
---
**CUSTOM SECRETS (MUST USE process.env):**
You have access to the following secrets. Use them in your code with \`process.env.SECRET_NAME\`.
${secretNames}
---
`;
}

function getGiphyInstruction(): string {
  const giphyKey = getGiphyApiKey();
  if (!giphyKey) {
    return '';
  }
  return `
---
**GIPHY API AVAILABLE:**
A Giphy API key is available. If the user asks for a GIF-related application, follow the Giphy API integration rules in the system prompt.
---
`;
}

function getGeminiInstruction(): string {
  try {
    getGeminiApiKey(); // This will throw if the key doesn't exist
    return `
---
**GEMINI API AVAILABLE:**
A Gemini API key is available. If the user asks for an AI-powered application (chatbot, summarizer, etc.), follow the Gemini API integration rules in the system prompt.
---
`;
  } catch (error) {
    return '';
  }
}

function getUnsplashInstruction(): string {
  const unsplashKey = getUnsplashAccessKey();
  if (!unsplashKey) {
    return '';
  }
  return `
---
**UNSPLASH API AVAILABLE:**
An Unsplash Access Key is available. If the user asks for a stock photo-related application, follow the Unsplash API integration rules in the system prompt.
---
`;
}

function getOpenAiInstruction(): string {
  const openAiKey = getOpenAiApiKey();
  if (!openAiKey) {
    return '';
  }
  return `
---
**OPENAI API AVAILABLE:**
An OpenAI API Key is available. If the user asks for an AI image generation application (e.g., using DALL-E), follow the OpenAI API integration rules in the system prompt.
---
`;
}

function constructFullPrompt(
    prompt: string,
    existingFiles: AppFile[] | null,
    visualEditTarget?: { selector: string } | null
): string {
    const themeInstruction = getThemeInstruction();
    const secretsInstruction = getSecretsInstruction();
    const giphyInstruction = getGiphyInstruction();
    const geminiInstruction = getGeminiInstruction();
    const unsplashInstruction = getUnsplashInstruction();
    const openAiInstruction = getOpenAiInstruction();

    const filesString = existingFiles
        ? existingFiles
            .map(f => `// File: ${f.path}\n\n${f.content}`)
            .join('\n\n---\n\n')
        : '';

    const instructions = [themeInstruction, secretsInstruction, giphyInstruction, geminiInstruction, unsplashInstruction, openAiInstruction].filter(Boolean).join('\n');

    if (visualEditTarget && existingFiles) {
        return `${instructions}\n\nHere is the current application's code:\n\n---\n${filesString}\n---\n\nCSS SELECTOR: \`${visualEditTarget.selector}\`\nVISUAL EDIT PROMPT: "${prompt}"\n\nPlease apply the visual edit prompt to the element identified by the CSS selector.`;
    } else if (existingFiles && existingFiles.length > 0) {
      return `${instructions}\n\nHere is the current application's code:\n\n---\n${filesString}\n---\n\nPlease apply the following change to the application: ${prompt}`;
    } else {
        return `${instructions}\n\nPlease generate an application based on the following request: ${prompt}`;
    }
}

function injectSecrets(html: string): string {
    const secrets = getSecrets();
    if (secrets.length > 0) {
        const secretsObject = secrets.reduce((obj, secret) => {
            obj[secret.name] = secret.value;
            return obj;
        }, {} as Record<string, string>);

        const secretScript = `<script>window.process = { env: ${JSON.stringify(secretsObject)} };</script>`;
        return html.replace('</head>', `${secretScript}</head>`);
    }
    return html;
}

function injectApiKeys(code: string): string {
    let injectedCode = code;
    
    // Inject Giphy Key
    const giphyKey = getGiphyApiKey();
    if (giphyKey) {
        injectedCode = injectedCode.replace(/'YOUR_GIPHY_API_KEY'/g, `'${giphyKey}'`);
    }

    // Inject Gemini Key
    try {
        const geminiKey = getGeminiApiKey();
        injectedCode = injectedCode.replace(/'YOUR_GEMINI_API_KEY'/g, `'${geminiKey}'`);
    } catch(e) { /* No Gemini key, do nothing */ }

    // Inject Unsplash Key
    const unsplashKey = getUnsplashAccessKey();
    if (unsplashKey) {
        injectedCode = injectedCode.replace(/'YOUR_UNSPLASH_ACCESS_KEY'/g, `'${unsplashKey}'`);
    }

    // Inject OpenAI Key
    const openAiKey = getOpenAiApiKey();
    if (openAiKey) {
        injectedCode = injectedCode.replace(/'YOUR_OPENAI_API_KEY'/g, `'${openAiKey}'`);
    }
    
    return injectedCode;
}

export async function generateOrUpdateAppCode(
    prompt: string, 
    existingFiles: AppFile[] | null,
    visualEditTarget?: { selector: string } | null,
    images?: UploadedImage[] | null
): Promise<GeminiResponse> {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please add it in the Settings page.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const model = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';
    const fullPrompt = constructFullPrompt(prompt, existingFiles, visualEditTarget);

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
        responseSchema: schema,
      },
    });

    const jsonString = response.text;
    const generatedApp = JSON.parse(jsonString) as GeminiResponse;

    if (
      !generatedApp ||
      typeof generatedApp.previewHtml !== 'string' ||
      !Array.isArray(generatedApp.files) ||
      generatedApp.files.length === 0 ||
      !Array.isArray(generatedApp.summary)
    ) {
      throw new Error("AI response is not in the expected format or is empty.");
    }

    // Inject API keys into file content first, as it's the source of truth
    generatedApp.files = generatedApp.files.map(file => ({
        ...file,
        content: injectApiKeys(file.content),
    }));

    // Update previewHtml from the modified file content, then inject preview-only secrets
    if (generatedApp.files[0]) {
      generatedApp.previewHtml = injectSecrets(generatedApp.files[0].content);
    }
    
    return generatedApp;

  } catch (error) {
    console.error("Error generating app code:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate app code: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating app code.");
  }
}


export async function* streamGenerateOrUpdateAppCode(
    prompt: string, 
    existingFiles: AppFile[] | null,
    visualEditTarget?: { selector: string } | null,
    images?: UploadedImage[] | null
): AsyncGenerator<{ summary?: string[]; files?: AppFile[]; previewHtml?: string; finalResponse?: GeminiResponse; error?: string }> {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) throw new Error("Gemini API key is missing. Please add it in the Settings page.");
    
    const ai = new GoogleGenAI({ apiKey });
    const model = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';
    const fullPrompt = constructFullPrompt(prompt, existingFiles, visualEditTarget);

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

    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    let buffer = '';
    let yieldedSummary = false;
    let yieldedFiles = false;

    for await (const chunk of responseStream) {
        buffer += chunk.text;
        
        // Try to yield summary plan as soon as it's available
        if (!yieldedSummary) {
            const summaryRegex = /"summary"\s*:\s*(\[.*?\])/s;
            const summaryMatch = buffer.match(summaryRegex);
            if (summaryMatch) {
                try {
                    const summary = JSON.parse(summaryMatch[1]);
                    yield { summary };
                    yieldedSummary = true;
                } catch (e) { /* Incomplete JSON, wait for more chunks */ }
            }
        }

        // Try to yield file paths plan as soon as it's available
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
                } catch (e) { /* Incomplete JSON, wait for more chunks */ }
            }
        }
        
        const startMarker = '"previewHtml": "';
        const startIndex = buffer.indexOf(startMarker);
        
        if (startIndex !== -1) {
            const htmlFragment = buffer.substring(startIndex + startMarker.length);
            // Inject API keys into the streaming preview for a better live experience
            yield { previewHtml: injectApiKeys(htmlFragment) };
        }
    }

    const finalResponse = JSON.parse(buffer) as GeminiResponse;
    if (!finalResponse || !finalResponse.previewHtml || !finalResponse.files || !finalResponse.summary) {
        throw new Error("Stream finished but AI response is not in the expected format or is empty.");
    }
    
    // Inject API keys into file content first
    finalResponse.files = finalResponse.files.map(file => ({
        ...file,
        content: injectApiKeys(file.content),
    }));

    // Update previewHtml from the modified file content, then inject preview-only secrets
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


function getStudioSystemPrompt(): string {
  const isGiphyConnected = !!getGiphyApiKey();
  let isGeminiConnected = false;
  try {
    getGeminiApiKey();
    isGeminiConnected = true;
  } catch (e) { /* ignore */ }
  const secrets = getSecrets();
  const secretsList = secrets.length > 0 ? secrets.map(s => s.name).join(', ') : 'None';

  return STUDIO_SYSTEM_PROMPT
    .replace('{{GIPHY_STATUS}}', isGiphyConnected ? 'Connected' : 'Not Connected')
    .replace('{{GEMINI_STATUS}}', isGeminiConnected ? 'Connected' : 'Not Connected')
    .replace('{{SECRETS_LIST}}', secretsList);
}

// New function for Studio Chat
export async function chatWithStudioAgent(
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Please add it in the Settings page.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash'; // Always use flash for chat

    const response = await ai.models.generateContent({
        model: model,
        contents: history,
        config: {
            systemInstruction: getStudioSystemPrompt()
        }
    });

    return response.text;

  } catch (error) {
    console.error("Error chatting with Studio Agent:", error);
    if (error instanceof Error) {
      throw new Error(`Studio Agent failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while chatting with the Studio Agent.");
  }
}

import { GoogleGenAI, Type } from "@google/genai";
import { AppFile, GeminiResponse } from "../types";
import { SYSTEM_PROMPT } from '../constants';
import { THEMES } from '../data/themes';

function getApiKey(): string {
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
  const themeId = localStorage.getItem('ui_theme_template') || THEMES[0].id; // Default to first theme
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


export async function generateOrUpdateAppCode(prompt: string, existingFiles: AppFile[] | null): Promise<GeminiResponse> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please add it in the Settings page.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const themeInstruction = getThemeInstruction();

    let fullPrompt = '';
    if (existingFiles && existingFiles.length > 0) {
      const filesString = existingFiles
        .map(f => `// File: ${f.path}\n\n${f.content}`)
        .join('\n\n---\n\n');
      
      fullPrompt = `${themeInstruction}\n\nHere is the current application's code:\n\n---\n${filesString}\n---\n\nPlease apply the following change to the application: ${prompt}`;
    } else {
        fullPrompt = `${themeInstruction}\n\nPlease generate an application based on the following request: ${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonString = response.text;
    const generatedApp = JSON.parse(jsonString);

    // Basic validation
    if (
      !generatedApp ||
      typeof generatedApp.previewHtml !== 'string' ||
      !Array.isArray(generatedApp.files) ||
      generatedApp.files.length === 0 ||
      !Array.isArray(generatedApp.summary)
    ) {
      throw new Error("AI response is not in the expected format or is empty.");
    }

    return generatedApp as GeminiResponse;

  } catch (error) {
    console.error("Error generating app code:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate app code: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating app code.");
  }
}

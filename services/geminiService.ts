import { GoogleGenAI, Type } from "@google/genai";
import { AppFile, GeminiResponse } from "../types";
import { SYSTEM_PROMPT } from '../constants';

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


export async function generateOrUpdateAppCode(prompt: string, existingFiles: AppFile[] | null): Promise<GeminiResponse> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please add it in the Settings page.");
    }
    const ai = new GoogleGenAI({ apiKey });

    let fullPrompt = prompt;
    if (existingFiles && existingFiles.length > 0) {
      const filesString = existingFiles
        .map(f => `// File: ${f.path}\n\n${f.content}`)
        .join('\n\n---\n\n');
      
      fullPrompt = `Here is the current application's code:\n\n---\n${filesString}\n---\n\nPlease apply the following change to the application: ${prompt}`;
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

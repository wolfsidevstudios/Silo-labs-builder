import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";
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


export async function generateAppCode(prompt: string): Promise<GeminiResponse> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please add it in the Settings page.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
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
      !Array.isArray(generatedApp.summary)
    ) {
      throw new Error("AI response is not in the expected format ({ previewHtml: string, files: AppFile[], summary: string[] }).");
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

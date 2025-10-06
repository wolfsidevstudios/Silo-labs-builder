import { FreeSound } from '../types';

const FREESOUND_API_KEY = 'freesound_api_key';
const FREESOUND_API_URL = 'https://freesound.org/apiv2';

// --- Key Management ---
export function saveApiKey(key: string): void {
  localStorage.setItem(FREESOUND_API_KEY, key);
}

export function getApiKey(): string | null {
  return localStorage.getItem(FREESOUND_API_KEY);
}

export function removeApiKey(): void {
  localStorage.removeItem(FREESOUND_API_KEY);
}

// --- API Functions ---
export async function searchFreeSound(apiKey: string, query: string, limit: number = 20): Promise<FreeSound[]> {
  if (!query.trim()) {
    return [];
  }
  
  // FreeSound requires specific fields to be requested
  const fields = 'id,name,tags,description,previews,download,username';
  const url = `${FREESOUND_API_URL}/search/text/?query=${encodeURIComponent(query)}&page_size=${limit}&fields=${fields}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Token ${apiKey}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `FreeSound API request failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.results as FreeSound[];
}

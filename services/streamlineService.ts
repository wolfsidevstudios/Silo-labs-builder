import { StreamlineIcon } from '../types';

const STREAMLINE_API_KEY = 'streamline_api_key';
const STREAMLINE_API_URL = 'https://api.streamlinehq.com/v3';

// --- Key Management ---
export function saveApiKey(key: string): void {
  localStorage.setItem(STREAMLINE_API_KEY, key);
}

export function getApiKey(): string | null {
  return localStorage.getItem(STREAMLINE_API_KEY);
}

export function removeApiKey(): void {
  localStorage.removeItem(STREAMLINE_API_KEY);
}

// --- API Functions ---
export async function searchStreamlineIcons(apiKey: string, query: string, limit: number = 20): Promise<StreamlineIcon[]> {
  if (!query.trim()) {
    return [];
  }
  
  const url = `${STREAMLINE_API_URL}/search?query=${encodeURIComponent(query)}&page_size=${limit}&api_token=${apiKey}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Streamline API request failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.data as StreamlineIcon[];
}

// Used to verify the key is working.
export async function testStreamlineApiKey(apiKey: string): Promise<boolean> {
  try {
    await searchStreamlineIcons(apiKey, 'test', 1);
    return true;
  } catch (error) {
    console.error("Streamline API key test failed:", error);
    return false;
  }
}
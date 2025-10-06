import { GiphyGif } from '../types';

const GIPHY_API_KEY = 'giphy_api_key';
const GIPHY_API_URL = 'https://api.giphy.com/v1/gifs';

// --- Token Management ---
export function saveApiKey(key: string): void {
  localStorage.setItem(GIPHY_API_KEY, key);
}

export function getApiKey(): string | null {
  return localStorage.getItem(GIPHY_API_KEY);
}

export function removeApiKey(): void {
  localStorage.removeItem(GIPHY_API_KEY);
}

// --- API Functions ---
export async function searchGifs(apiKey: string, query: string, limit: number = 20): Promise<GiphyGif[]> {
  if (!query.trim()) {
    return [];
  }
  const response = await fetch(`${GIPHY_API_URL}/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Giphy API request failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.data as GiphyGif[];
}

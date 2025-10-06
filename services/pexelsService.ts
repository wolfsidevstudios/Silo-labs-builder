import { PexelsMedia } from '../types';

const PEXELS_API_KEY = 'pexels_api_key';
const PEXELS_API_URL = 'https://api.pexels.com/v1';

// --- Key Management ---
export function saveApiKey(key: string): void {
  localStorage.setItem(PEXELS_API_KEY, key);
}

export function getApiKey(): string | null {
  return localStorage.getItem(PEXELS_API_KEY);
}

export function removeApiKey(): void {
  localStorage.removeItem(PEXELS_API_KEY);
}

// --- API Functions ---
export async function searchPexels(apiKey: string, query: string, type: 'photos' | 'videos' = 'photos', limit: number = 20): Promise<PexelsMedia[]> {
  if (!query.trim()) {
    return [];
  }
  
  const endpoint = type === 'videos' ? '/videos/search' : '/search';
  const url = `${PEXELS_API_URL}${endpoint}?query=${encodeURIComponent(query)}&per_page=${limit}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': apiKey,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Pexels API request failed with status ${response.status}`);
  }

  const result = await response.json();
  const media = type === 'videos' ? result.videos : result.photos;

  // Normalize the response to a common PexelsMedia structure
  return media.map((item: any) => ({
      ...item,
      type: type === 'videos' ? 'Video' : 'Photo',
  }));
}

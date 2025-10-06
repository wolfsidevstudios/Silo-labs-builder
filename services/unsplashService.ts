import { UnsplashPhoto } from '../types';

const UNSPLASH_ACCESS_KEY = 'unsplash_access_key';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// --- Key Management ---
export function saveAccessKey(key: string): void {
  localStorage.setItem(UNSPLASH_ACCESS_KEY, key);
}

export function getAccessKey(): string | null {
  return localStorage.getItem(UNSPLASH_ACCESS_KEY);
}

export function removeAccessKey(): void {
  localStorage.removeItem(UNSPLASH_ACCESS_KEY);
}

// --- API Functions ---
export async function searchPhotos(accessKey: string, query: string, limit: number = 20): Promise<UnsplashPhoto[]> {
  if (!query.trim()) {
    return [];
  }
  const response = await fetch(`${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}`, {
    headers: {
      'Authorization': `Client-ID ${accessKey}`,
      'Accept-Version': 'v1',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors.join(', ') || `Unsplash API request failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.results as UnsplashPhoto[];
}

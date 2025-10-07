import { YouTubeVideo } from '../types';

const API_KEY_STORAGE = 'youtube_api_key';
const API_URL = 'https://www.googleapis.com/youtube/v3';

export function saveApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE);
}

export function removeApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE);
}

export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/search?part=snippet&q=test&key=${apiKey}`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function searchVideos(apiKey: string, query: string, limit: number = 10): Promise<YouTubeVideo[]> {
  if (!query.trim()) {
    return [];
  }
  const response = await fetch(`${API_URL}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${limit}&type=video&key=${apiKey}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || `YouTube API request failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.items as YouTubeVideo[];
}
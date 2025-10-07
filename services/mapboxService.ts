const API_KEY_STORAGE = 'mapbox_api_key';
const API_URL = 'https://api.mapbox.com';

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
    const response = await fetch(`${API_URL}/geocoding/v5/mapbox.places/mapbox.json?access_token=${apiKey}`);
    return response.ok;
  } catch (error) {
    return false;
  }
}
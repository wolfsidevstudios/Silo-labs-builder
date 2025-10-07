const API_KEY_STORAGE = 'openweathermap_api_key';
const API_URL = 'https://api.openweathermap.org/data/2.5';

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
    const response = await fetch(`${API_URL}/weather?q=London&appid=${apiKey}`);
    return response.ok;
  } catch (error) {
    return false;
  }
}
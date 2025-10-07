const API_KEY_STORAGE = 'weatherapi_api_key';
const API_URL = 'https://api.weatherapi.com/v1';

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
    const response = await fetch(`${API_URL}/current.json?key=${apiKey}&q=London`);
    const data = await response.json();
    return response.ok && !data.error;
  } catch (error) {
    return false;
  }
}
const API_KEY_STORAGE = 'wordsapi_api_key';
const API_URL = 'https://wordsapiv1.p.rapidapi.com/words/';

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
    const response = await fetch(`${API_URL}test`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
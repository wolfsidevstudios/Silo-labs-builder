
const TRIPO_API_KEY = 'tripo_api_key';

export function saveApiKey(key: string): void {
  localStorage.setItem(TRIPO_API_KEY, key);
}

export function getApiKey(): string | null {
  return localStorage.getItem(TRIPO_API_KEY);
}

export function removeApiKey(): void {
  localStorage.removeItem(TRIPO_API_KEY);
}

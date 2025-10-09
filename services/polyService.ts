const POLY_API_KEY = 'poly_api_key';

export function saveApiKey(key: string): void {
  localStorage.setItem(POLY_API_KEY, key);
}

export function getApiKey(): string | null {
  return localStorage.getItem(POLY_API_KEY);
}

export function removeApiKey(): void {
  localStorage.removeItem(POLY_API_KEY);
}

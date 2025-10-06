const OPENAI_API_KEY = 'openai_api_key';
const OPENAI_API_URL = 'https://api.openai.com/v1';

// --- Key Management ---
export function saveApiKey(key: string): void {
  localStorage.setItem(OPENAI_API_KEY, key);
}

export function getApiKey(): string | null {
  return localStorage.getItem(OPENAI_API_KEY);
}

export function removeApiKey(): void {
  localStorage.removeItem(OPENAI_API_KEY);
}

// --- API Functions ---
// Used to verify the key is working
export async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${OPENAI_API_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

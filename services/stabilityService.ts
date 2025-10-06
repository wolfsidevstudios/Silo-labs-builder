const STABILITY_API_KEY = 'stability_api_key';
const STABILITY_API_URL = 'https://api.stability.ai/v1';

// --- Key Management ---
export function saveApiKey(key: string): void {
  localStorage.setItem(STABILITY_API_KEY, key);
}

export function getApiKey(): string | null {
  return localStorage.getItem(STABILITY_API_KEY);
}

export function removeApiKey(): void {
  localStorage.removeItem(STABILITY_API_KEY);
}

// --- API Functions ---
// Used to verify the key is working by fetching user account info.
export async function testStabilityApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${STABILITY_API_URL}/user/account`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

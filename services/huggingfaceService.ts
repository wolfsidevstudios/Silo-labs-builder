const HF_TOKEN_KEY = 'huggingface_access_token';
const HF_MODEL_URL_KEY = 'huggingface_model_url';

interface HuggingFaceCredentials {
  token: string;
  modelUrl: string;
}

// --- Credential Management ---
export function saveCredentials(token: string, modelUrl: string): void {
  localStorage.setItem(HF_TOKEN_KEY, token);
  localStorage.setItem(HF_MODEL_URL_KEY, modelUrl);
}

export function getCredentials(): HuggingFaceCredentials | null {
  const token = localStorage.getItem(HF_TOKEN_KEY);
  const modelUrl = localStorage.getItem(HF_MODEL_URL_KEY);
  if (token && modelUrl) {
    return { token, modelUrl };
  }
  return null;
}

export function removeCredentials(): void {
  localStorage.removeItem(HF_TOKEN_KEY);
  localStorage.removeItem(HF_MODEL_URL_KEY);
}

// --- API Functions ---
// Used to verify the credentials are working by making a test request.
export async function testCredentials(token: string, modelUrl: string): Promise<boolean> {
  if (!token.trim() || !modelUrl.trim()) return false;
  
  try {
    const response = await fetch(modelUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: 'Say "test".',
            parameters: { max_new_tokens: 5 }
        }),
    });
    
    // Some models might return 200 but with an error object
    if (response.ok) {
        const result = await response.json();
        return !result.error;
    }
    
    return false;

  } catch (error) {
    console.error("Hugging Face test request failed:", error);
    return false;
  }
}

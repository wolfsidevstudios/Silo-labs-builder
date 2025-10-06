const SPOTIFY_CLIENT_ID_KEY = 'spotify_client_id';
const SPOTIFY_CLIENT_SECRET_KEY = 'spotify_client_secret';

// --- Credential Management ---
export function saveClientCredentials(clientId: string, clientSecret: string): void {
  localStorage.setItem(SPOTIFY_CLIENT_ID_KEY, clientId);
  localStorage.setItem(SPOTIFY_CLIENT_SECRET_KEY, clientSecret);
}

export function getClientCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = localStorage.getItem(SPOTIFY_CLIENT_ID_KEY);
  const clientSecret = localStorage.getItem(SPOTIFY_CLIENT_SECRET_KEY);
  if (clientId && clientSecret) {
    return { clientId, clientSecret };
  }
  return null;
}

export function removeClientCredentials(): void {
  localStorage.removeItem(SPOTIFY_CLIENT_ID_KEY);
  localStorage.removeItem(SPOTIFY_CLIENT_SECRET_KEY);
}

// --- API Functions ---
// Used to verify the credentials are working by fetching a token.
export async function testSpotifyCredentials(clientId: string, clientSecret: string): Promise<boolean> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
      },
      body: 'grant_type=client_credentials'
    });
    
    if (response.ok) {
        const data = await response.json();
        return !!data.access_token;
    }
    return false;
  } catch (error) {
    return false;
  }
}

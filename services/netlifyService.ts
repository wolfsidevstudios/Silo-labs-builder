import { NetlifyUser, NetlifySite, NetlifyDeploy, AppFile } from '../types';

const NETLIFY_PAT_KEY = 'netlify_personal_access_token';
const NETLIFY_API_URL = 'https://api.netlify.com/api/v1';

// --- Token Management ---
export function savePat(token: string): void {
  localStorage.setItem(NETLIFY_PAT_KEY, token);
}

export function getPat(): string | null {
  return localStorage.getItem(NETLIFY_PAT_KEY);
}

export function removePat(): void {
  localStorage.removeItem(NETLIFY_PAT_KEY);
}

// --- API Helpers ---
async function netlifyApiRequest<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${NETLIFY_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Netlify API request failed with status ${response.status}`);
  }
  
  // Handle 204 No Content response
  if (response.status === 204) {
    return null as T;
  }
  
  return response.json() as T;
}

// --- API Functions ---
export async function getUserInfo(token: string): Promise<NetlifyUser> {
  return netlifyApiRequest<NetlifyUser>('/user', token);
}

export async function createSite(token: string): Promise<NetlifySite> {
    return netlifyApiRequest<NetlifySite>('/sites', token, {
        method: 'POST',
        body: JSON.stringify({}), // Create with a random name
    });
}

// Helper to calculate SHA1 digest for a file
async function getFileSha1(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export async function deployToNetlify(token: string, siteId: string, files: AppFile[]): Promise<NetlifyDeploy> {
    // 1. Prepare file digests for the Netlify API
    const digests: { [path: string]: string } = {};
    for (const file of files) {
        digests[`/${file.path}`] = await getFileSha1(file.content);
    }
    
    // 2. Create a new deploy record on Netlify
    // This tells Netlify what files we plan to upload.
    const deploy = await netlifyApiRequest<NetlifyDeploy>(`/sites/${siteId}/deploys`, token, {
        method: 'POST',
        body: JSON.stringify({ files: digests }),
    });

    const deployId = deploy.id;

    // 3. Upload each file individually
    // Netlify's API requires uploading files one by one after creating the deploy record.
    for (const file of files) {
        const filePath = `/${file.path}`;
        await fetch(`${NETLIFY_API_URL}/deploys/${deployId}/files${filePath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/octet-stream'
            },
            body: file.content
        });
    }

    // Return the initial deploy object. It contains the URL.
    // The deploy will be processing in the background on Netlify's side.
    return deploy;
}

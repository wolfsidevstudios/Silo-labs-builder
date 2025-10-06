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

export async function getSites(token: string): Promise<NetlifySite[]> {
  // By default, Netlify API returns sites sorted by `updated_at` descending
  return netlifyApiRequest<NetlifySite[]>('/sites', token);
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
    // 1. Prepare file digests and content maps for the Netlify API
    const digests: { [path: string]: string } = {};
    const fileContents: { [sha: string]: string } = {};
    const filePaths: { [sha: string]: string } = {};

    for (const file of files) {
        const sha = await getFileSha1(file.content);
        const path = `/${file.path}`;
        digests[path] = sha;
        fileContents[sha] = file.content;
        filePaths[sha] = path;
    }
    
    // 2. Create a new deploy record on Netlify.
    // This tells Netlify what files we plan to upload and gets back a list of files it needs.
    const deploy = await netlifyApiRequest<NetlifyDeploy>(`/sites/${siteId}/deploys`, token, {
        method: 'POST',
        body: JSON.stringify({ files: digests }),
    });

    const deployId = deploy.id;

    // 3. Upload only the files Netlify has requested in the `required` array.
    if (deploy.required && deploy.required.length > 0) {
        for (const sha of deploy.required) {
            const filePath = filePaths[sha];
            const fileContent = fileContents[sha];
            
            await fetch(`${NETLIFY_API_URL}/deploys/${deployId}/files${filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/octet-stream'
                },
                body: fileContent
            });
        }
    }

    // Return the initial deploy object. The deploy will process on Netlify's side.
    return deploy;
}
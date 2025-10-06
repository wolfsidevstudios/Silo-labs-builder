import { GitHubUser, GitHubRepo } from '../types';

const GITHUB_PAT_KEY = 'github_personal_access_token';
const GITHUB_API_URL = 'https://api.github.com';

// --- Token Management ---
export function savePat(token: string): void {
  localStorage.setItem(GITHUB_PAT_KEY, token);
}

export function getPat(): string | null {
  return localStorage.getItem(GITHUB_PAT_KEY);
}

export function removePat(): void {
  localStorage.removeItem(GITHUB_PAT_KEY);
}

// --- API Helpers ---
async function githubApiRequest<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `GitHub API request failed with status ${response.status}`);
  }
  
  // Handle 204 No Content response
  if (response.status === 204) {
      return null as T;
  }
  
  return response.json() as T;
}

// --- API Functions ---
export async function getUserInfo(token: string): Promise<GitHubUser> {
  return githubApiRequest<GitHubUser>('/user', token);
}

export async function getRepositories(token: string): Promise<GitHubRepo[]> {
  // Fetches repos sorted by most recently pushed to
  return githubApiRequest<GitHubRepo[]>('/user/repos?sort=pushed&per_page=100', token);
}

export async function createRepository(token: string, name: string, description?: string): Promise<GitHubRepo> {
    return githubApiRequest<GitHubRepo>('/user/repos', token, {
        method: 'POST',
        body: JSON.stringify({
            name,
            description: description || 'AI-generated application',
            private: false, // For simplicity, create public repos. Could be an option later.
        }),
    });
}

export async function getRepoContent(token: string, owner: string, repo: string, path: string): Promise<{ sha: string }> {
    return githubApiRequest<{ sha: string }>(`/repos/${owner}/${repo}/contents/${path}`, token);
}

export async function createOrUpdateFile(token: string, owner: string, repo: string, path: string, content: string, message: string, sha?: string): Promise<any> {
    const contentBase64 = btoa(unescape(encodeURIComponent(content))); // Handles UTF-8 characters properly
    
    const body: { message: string, content: string, sha?: string } = {
        message,
        content: contentBase64,
    };
    if (sha) {
        body.sha = sha;
    }
    
    return githubApiRequest(`/repos/${owner}/${repo}/contents/${path}`, token, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

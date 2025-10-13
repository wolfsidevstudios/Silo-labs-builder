import type * React from 'react';
import { Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

// A simplified version of React.CSSProperties to avoid React dependency in a .ts file
type CSSProperties = {
  [key: string]: string | number | undefined;
};

export interface AppFile {
  path: string;
  content: string;
}

export interface GeminiResponse {
  summary: string[];
  files: AppFile[];
  previewHtml: string;
}

export interface AppPlan {
  features: string[];
  designDetails: string[];
  pages: string[];
  colors: {
    name: string;
    hex: string;
  }[];
  previewHtml: string;
}

export interface Version extends GeminiResponse {
  versionId: string;
  createdAt: string;
  prompt: string; // The prompt that generated this version
}

export interface Secret {
  name: string;
  value: string;
}

export type GeminiModelId = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.0-pro' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
export type AppMode = 'web' | 'expo' | 'react-ts' | 'flutter' | 'nextjs' | 'angular' | '3d';

export interface TestStep {
    action: 'type' | 'click' | 'scroll' | 'navigate';
    targetSelector: string;
    payload?: {
        text?: string;
        amount?: number;
    };
    description: string;
}

export interface SavedProject extends GeminiResponse {
  id: string;
  prompt: string;
  createdAt: string;
  name?: string;
  description?: string;
  iconUrl?: string;
  thumbnailUrl?: string;
  model?: GeminiModelId;
  secrets?: Secret[];
  githubUrl?: string;
  netlifySiteId?: string;
  netlifyUrl?: string;
  isLisaActive?: boolean;
  history?: Version[];
  appMode?: AppMode;
}

export interface Profile {
  id: string; // User UID
  username: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

export interface PublishedApp {
  id: string;
  prompt: string;
  htmlContent: string;
  previewHtml: string;
  summary: string[];
  authorId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  likes: number;
  createdAt: Timestamp;
}


// Chat History Types
export interface UserMessage {
  id: string;
  role: 'user';
  content: string;
  imagePreviewUrls?: string[];
}

export interface MaxIssue {
    type: 'UI/UX' | 'Accessibility' | 'Bug' | 'Performance' | 'Best Practice';
    description: string;
    suggestion: string;
}

export interface MaxReport {
    score: number;
    summary: string;
    issues: MaxIssue[];
    isPerfect: boolean;
}

export interface AssistantMessage {
  id: string;
  role: 'assistant';
  content: Partial<GeminiResponse>;
  isGenerating?: boolean;
  maxReport?: MaxReport;
}

export type ChatMessage = UserMessage | AssistantMessage;

// GitHub Integration Types
export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  default_branch?: string;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}


// Netlify Integration Types
export interface NetlifyUser {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
}
export interface NetlifySite {
  id: string;
  name: string;
  ssl_url: string;
  admin_url: string;
  created_at: string;
}
export interface NetlifyDeploy {
  id: string;
  site_id: string;
  ssl_url: string;
  state: string;
  required?: string[]; // Array of SHAs that need to be uploaded
}


// Theme Types
export interface Theme {
  id: string;
  name: string;
  isPro?: boolean;
  fontFamily: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  navbar: {
    description: string;
    style: CSSProperties;
    textStyle: CSSProperties;
  };
  button: {
    description: string;
    style: CSSProperties;
  };
}

// Image Library
export interface SavedImage {
  id: string;
  data: string; // base64
  mimeType: string;
  createdAt: string;
}

// Giphy API
export interface GiphyGif {
  id: string;
  title: string;
  images: {
    original: { url: string; };
    fixed_width: { url: string; webp: string; };
  };
}

// Unsplash API
export interface UnsplashPhoto {
  id: string;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    }
  }
}

// Pexels API
export interface PexelsMedia {
  id: number;
  type: 'Photo' | 'Video';
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  // Video specific
  image?: string; // thumbnail
  video_files?: {
    link: string;
  }[];
}

// FreeSound API
export interface FreeSound {
    id: number;
    name: string;
    tags: string[];
    description: string;
    previews: {
        'preview-hq-mp3': string;
        'preview-lq-mp3': string;
    };
    download: string;
    username: string;
}

// StreamlineHQ API
export interface StreamlineIcon {
  image_url: string;
  name: string;
}

// YouTube API
export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}


// News Page
export interface NewsItem {
  id: string;
  date: string;
  title: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  content: string;
}

// Firebase Types
export type FirebaseUser = User;

export type DataCategory = 'projects' | 'images' | 'keys' | 'settings';

export interface TerminalLine {
  type: 'command' | 'output';
  text: string;
}

export interface PersonalInfo {
  fullName?: string;
  address?: string;
  phone?: string;
  email?: string;
  other?: string;
}
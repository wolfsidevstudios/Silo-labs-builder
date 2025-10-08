import type * as React from 'react';
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

export interface Secret {
  name: string;
  value: string;
}

export type GeminiModelId = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.0-pro' | 'gemini-1.5-pro' | 'gemini-1.5-flash';


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
}

// Chat History Types
export interface UserMessage {
  id: string;
  role: 'user';
  content: string;
  imagePreviewUrls?: string[];
}

export interface AssistantMessage {
  id: string;
  role: 'assistant';
  content: Partial<GeminiResponse>;
  isGenerating?: boolean;
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

export interface Profile {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  bannerUrl?: string;
  createdAt?: Timestamp | string; // Allow for client-side creation before server timestamp
}

export interface PublishedApp {
  id: string;
  prompt: string;
  summary: string[];
  htmlContent: string;
  previewHtml: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string;
  createdAt: Timestamp;
  likes: number;
}
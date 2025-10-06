import React from 'react';

export interface AppFile {
  path: string;
  content: string;
}

export interface GeminiResponse {
  files: AppFile[];
  previewHtml: string;
  summary: string[];
}

export interface SavedProject {
  id: string;
  prompt: string;
  files: AppFile[];
  previewHtml: string;
  summary: string[];
  createdAt: string;
  githubUrl?: string;
  netlifySiteId?: string; // Add optional Netlify Site ID
  netlifyUrl?: string;
}

// New type for the image library
export interface SavedImage {
  id: string;
  data: string; // base64 string
  mimeType: string;
  createdAt: string;
}

// --- Builder Page Chat Types ---
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

// --- Studio Page Chat Types ---
export interface StudioUserMessage {
  id: string;
  role: 'user';
  content: string;
}

export interface StudioAssistantMessage {
  id: string;
  role: 'assistant';
  content: string;
}

export type StudioChatMessage = StudioUserMessage | StudioAssistantMessage;


export interface Theme {
  id: string;
  name: string;
  fontFamily: string;
  isPro?: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  navbar: {
    description: string;
    style: React.CSSProperties;
    textStyle: React.CSSProperties;
  };
  button: {
    description: string;
    style: React.CSSProperties;
  };
}

export interface Secret {
  name: string;
  value: string;
}

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  content: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

// GitHub Integration types
export interface GitHubUser {
    login: string;
    avatar_url: string;
    html_url: string;
    name: string;
}

export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string | null;
}

// Netlify Integration types
export interface NetlifyUser {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
}

export interface NetlifySite {
    id: string;
    name: string;
    url: string;
    ssl_url: string;
    admin_url: string;
}

export interface NetlifyDeploy {
    id: string;
    site_id: string;
    ssl_url: string;
    state: string;
    required?: string[];
}

// Giphy Integration types
export interface GiphyGif {
  id: string;
  url: string;
  title: string;
  images: {
    fixed_width: {
      url: string;
      webp: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
      webp: string;
      width: string;
      height: string;
    }
  };
}

// Unsplash Integration types
export interface UnsplashPhoto {
  id: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    html: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

// Pexels Integration types
export interface PexelsMedia {
  id: number;
  type: 'Photo' | 'Video';
  url: string; // page URL
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
  // For videos
  video_files?: {
    id: number;
    quality: 'hd' | 'sd';
    link: string;
  }[];
}

// FreeSound Integration types
export interface FreeSound {
  id: number;
  name: string;
  tags: string[];
  description: string;
  previews: {
    'preview-hq-mp3': string;
    'preview-lq-mp3': string;
  };
  download: string; // The authenticated download link
  username: string;
}

// StreamlineHQ Integration types
export interface StreamlineIcon {
  id: number;
  name: string;
  family_slug: string;
  image: string; // URL to PNG
  svg: string; // Full SVG content
}
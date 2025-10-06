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

// New types for chat history
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

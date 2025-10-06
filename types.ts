// FIX: Add React import for CSSProperties type.
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
  githubUrl?: string; // Add optional GitHub URL
}

// New types for chat history
export interface UserMessage {
  role: 'user';
  content: string;
}

export interface AssistantMessage {
  role: 'assistant';
  content: GeminiResponse;
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

// New types for GitHub Integration
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

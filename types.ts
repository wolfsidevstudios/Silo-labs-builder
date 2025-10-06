
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
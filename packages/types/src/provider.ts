export type ProviderName = 'anthropic' | 'openai';

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
}

export interface ProviderCredentials {
  provider: ProviderName;
  model: string;
  apiKey: string;
}

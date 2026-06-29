import type { ChatRequest, ChatResponse } from '@tael/types';

export interface Provider {
  readonly name: string;
  chat(request: ChatRequest): Promise<ChatResponse>;
}

export class ProviderError extends Error {
  override name = 'ProviderError';
  constructor(
    message: string,
    public readonly provider: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}

export const DEFAULT_MAX_TOKENS = 1024;

import { createProvider, type Provider } from '@tael/providers';
import type { ChatMessage, ProviderCredentials } from '@tael/types';
import { buildSystemPrompt } from './context.js';
import { listContexts } from './context-store.js';
import { loadCredentials } from './credentials.js';
import { listMemories } from './memories.js';
import { getLatestSession } from './session.js';
import { readProfile, type Workspace } from './workspace.js';

export interface ChatSessionOptions {
  credentials?: ProviderCredentials;
  maxTokens?: number;
  temperature?: number;
}

export class ChatSession {
  private readonly messages: ChatMessage[];

  private constructor(
    private readonly provider: Provider,
    private readonly model: string,
    private readonly options: ChatSessionOptions,
    systemPrompt: string,
  ) {
    this.messages = [{ role: 'system', content: systemPrompt }];
  }

  static async create(
    workspace: Workspace,
    options: ChatSessionOptions = {},
  ): Promise<ChatSession> {
    const credentials = options.credentials ?? (await loadCredentials());

    const [profile, contexts, session, memories] = await Promise.all([
      readProfile(workspace),
      listContexts(workspace),
      getLatestSession(workspace),
      listMemories(workspace),
    ]);

    const systemPrompt = buildSystemPrompt({ profile, contexts, session, memories });
    return new ChatSession(createProvider(credentials), credentials.model, options, systemPrompt);
  }

  get modelName(): string {
    return this.model;
  }

  async send(message: string): Promise<string> {
    this.messages.push({ role: 'user', content: message });
    const response = await this.provider.chat({
      messages: this.messages,
      model: this.model,
      maxTokens: this.options.maxTokens,
      temperature: this.options.temperature,
    });
    this.messages.push({ role: 'assistant', content: response.content });
    return response.content;
  }
}

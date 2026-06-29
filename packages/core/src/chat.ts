import { createProvider, type Provider } from '@tael/providers';
import type { ChatMessage, ProviderCredentials } from '@tael/types';
import { buildProjectPrompt } from './context.js';
import { loadCredentials } from './credentials.js';
import { loadProfile } from './profile-store.js';
import { listBugs, listFeatures, requireActiveProject } from './projects.js';

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
    public readonly projectName: string,
  ) {
    this.messages = [{ role: 'system', content: systemPrompt }];
  }

  static async create(options: ChatSessionOptions = {}): Promise<ChatSession> {
    const credentials = options.credentials ?? (await loadCredentials());
    const project = await requireActiveProject();

    const [features, bugs, profile] = await Promise.all([
      listFeatures(project.id),
      listBugs(project.id),
      loadProfile(),
    ]);

    const systemPrompt = buildProjectPrompt({ profile, project, features, bugs });
    return new ChatSession(
      createProvider(credentials),
      credentials.model,
      options,
      systemPrompt,
      project.name,
    );
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

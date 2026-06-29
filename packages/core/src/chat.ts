import { createProvider, type Provider } from '@tael/providers';
import type { ChatMessage, ProviderCredentials } from '@tael/types';
import {
  ACTION_INSTRUCTIONS,
  executeActions,
  parseActions,
  type ExecutedAction,
} from './actions.js';
import { buildProjectPrompt } from './context.js';
import { loadCredentials } from './credentials.js';
import { loadProfile } from './profile-store.js';
import { listBugs, listFeatures, requireActiveProject } from './projects.js';
import { listSyncedSessions } from './sessions-store.js';

export interface ChatSessionOptions {
  credentials?: ProviderCredentials;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatTurn {
  content: string;
  executed: ExecutedAction[];
}

export class ChatSession {
  private readonly messages: ChatMessage[];

  private constructor(
    private readonly provider: Provider,
    private readonly model: string,
    private readonly options: ChatSessionOptions,
    private readonly projectId: string,
    systemPrompt: string,
    public readonly projectName: string,
  ) {
    this.messages = [{ role: 'system', content: systemPrompt }];
  }

  static async create(options: ChatSessionOptions = {}): Promise<ChatSession> {
    const credentials = options.credentials ?? (await loadCredentials());
    const project = await requireActiveProject();

    const [features, bugs, sessions, profile] = await Promise.all([
      listFeatures(project.id),
      listBugs(project.id),
      listSyncedSessions(project.id),
      loadProfile(),
    ]);

    const systemPrompt = `${buildProjectPrompt({ profile, project, features, bugs, sessions })}\n\n${ACTION_INSTRUCTIONS}`;
    return new ChatSession(
      createProvider(credentials),
      credentials.model,
      options,
      project.id,
      systemPrompt,
      project.name,
    );
  }

  get modelName(): string {
    return this.model;
  }

  async send(message: string): Promise<ChatTurn> {
    this.messages.push({ role: 'user', content: message });
    const response = await this.provider.chat({
      messages: this.messages,
      model: this.model,
      maxTokens: this.options.maxTokens,
      temperature: this.options.temperature,
    });

    const { actions, cleaned } = parseActions(response.content);
    const executed = actions.length > 0 ? await executeActions(this.projectId, actions) : [];

    this.messages.push({ role: 'assistant', content: cleaned });
    return { content: cleaned, executed };
  }
}

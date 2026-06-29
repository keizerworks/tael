import { createProvider } from '@tael/providers';
import type { ChatResponse, ProviderCredentials } from '@tael/types';
import { buildProjectMessages } from './context.js';
import { loadCredentials } from './credentials.js';
import { loadProfile } from './profile-store.js';
import { listBugs, listFeatures, requireActiveProject } from './projects.js';
import { listSyncedSessions } from './sessions-store.js';

export interface AskOptions {
  credentials?: ProviderCredentials;
  maxTokens?: number;
  temperature?: number;
}

export async function ask(question: string, options: AskOptions = {}): Promise<ChatResponse> {
  const credentials = options.credentials ?? (await loadCredentials());
  const project = await requireActiveProject();

  const [features, bugs, sessions, profile] = await Promise.all([
    listFeatures(project.id),
    listBugs(project.id),
    listSyncedSessions(project.id),
    loadProfile(),
  ]);

  const messages = buildProjectMessages({ profile, project, features, bugs, sessions }, question);
  const provider = createProvider(credentials);

  return provider.chat({
    messages,
    model: credentials.model,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
  });
}

import { createProvider } from '@tael/providers';
import type { ChatResponse, ProviderCredentials } from '@tael/types';
import { buildAskMessages } from './context.js';
import { listContexts } from './context-store.js';
import { loadCredentials } from './credentials.js';
import { listMemories } from './memories.js';
import { getLatestSession } from './session.js';
import { readProfile, type Workspace } from './workspace.js';

export interface AskOptions {
  credentials?: ProviderCredentials;
  maxTokens?: number;
  temperature?: number;
}

export async function ask(
  workspace: Workspace,
  question: string,
  options: AskOptions = {},
): Promise<ChatResponse> {
  const credentials = options.credentials ?? (await loadCredentials());

  const [profile, contexts, session, memories] = await Promise.all([
    readProfile(workspace),
    listContexts(workspace),
    getLatestSession(workspace),
    listMemories(workspace),
  ]);

  const messages = buildAskMessages({ profile, contexts, session, memories }, question);
  const provider = createProvider(credentials);

  return provider.chat({
    messages,
    model: credentials.model,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
  });
}

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProviderCredentials } from '@tael/types';
import { ChatSession } from './chat.js';
import { createContext } from './context-store.js';
import { initWorkspace, type Workspace } from './workspace.js';

const credentials: ProviderCredentials = {
  provider: 'anthropic',
  model: 'claude-test',
  apiKey: 'k',
};

function mockFetchOnce(text: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ model: 'claude-test', content: [{ type: 'text', text }] }),
    text: async () => '',
  };
}

describe('ChatSession', () => {
  let workspace: Workspace;
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'tael-chat-'));
    workspace = await initWorkspace(dir, { name: 'Rahul', currentProject: 'tael' });
    await createContext(workspace, {
      title: 'Tael',
      description: 'the product',
      body: 'A personal AI CLI.',
    });
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
    vi.unstubAllGlobals();
  });

  it('seeds the system prompt with context and keeps multi-turn history', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mockFetchOnce('first answer'))
      .mockResolvedValueOnce(mockFetchOnce('second answer'));
    vi.stubGlobal('fetch', fetchFn);

    const chat = await ChatSession.create(workspace, { credentials });
    expect(chat.modelName).toBe('claude-test');

    expect(await chat.send('hi')).toBe('first answer');
    expect(await chat.send('again')).toBe('second answer');

    // The system prompt sent on turn 1 should carry the context body.
    const firstBody = JSON.parse(fetchFn.mock.calls[0]![1].body as string);
    expect(firstBody.system).toContain('A personal AI CLI.');

    // Turn 2 must include the prior user + assistant turns (real conversation memory).
    const secondBody = JSON.parse(fetchFn.mock.calls[1]![1].body as string);
    expect(secondBody.messages).toEqual([
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'first answer' },
      { role: 'user', content: 'again' },
    ]);
  });
});

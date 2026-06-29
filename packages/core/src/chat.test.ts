import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProviderCredentials } from '@tael/types';
import { ChatSession } from './chat.js';
import { addBug, addFeature, createProject, setActiveProject } from './projects.js';

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
  let home: string;

  beforeEach(async () => {
    home = await mkdtemp(join(tmpdir(), 'tael-home-'));
    process.env.TAEL_HOME = home;
    await createProject('Tael', { description: 'a personal AI CLI' });
    await setActiveProject('tael');
    await addFeature('tael', 'session import');
    await addBug('tael', 'duplicate line in repl');
  });

  afterEach(async () => {
    delete process.env.TAEL_HOME;
    await rm(home, { recursive: true, force: true });
    vi.unstubAllGlobals();
  });

  it('seeds the prompt with the active project and keeps multi-turn history', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mockFetchOnce('first answer'))
      .mockResolvedValueOnce(mockFetchOnce('second answer'));
    vi.stubGlobal('fetch', fetchFn);

    const chat = await ChatSession.create({ credentials });
    expect(chat.projectName).toBe('Tael');

    expect((await chat.send('hi')).content).toBe('first answer');
    expect((await chat.send('again')).content).toBe('second answer');

    const firstBody = JSON.parse(fetchFn.mock.calls[0]![1].body as string);
    expect(firstBody.system).toContain('Active project: Tael');
    expect(firstBody.system).toContain('session import');
    expect(firstBody.system).toContain('duplicate line in repl');

    const secondBody = JSON.parse(fetchFn.mock.calls[1]![1].body as string);
    expect(secondBody.messages).toEqual([
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'first answer' },
      { role: 'user', content: 'again' },
    ]);
  });
});

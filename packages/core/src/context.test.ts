import { describe, expect, it } from 'vitest';
import type { Bug, Feature, Project, SyncedSession } from '@tael/types';
import { buildProjectMessages, buildProjectPrompt } from './context.js';

const project: Project = {
  id: 'tael',
  name: 'Tael',
  description: 'A model-agnostic personal AI CLI.',
  repoPath: null,
  createdAt: '2026-06-29T00:00:00Z',
};

const features: Feature[] = [
  {
    id: 1,
    title: 'interactive chat',
    status: 'done',
    createdAt: '',
    completedAt: '2026-06-29T01:00:00Z',
  },
  { id: 2, title: 'session import', status: 'open', createdAt: '', completedAt: null },
];

const bugs: Bug[] = [
  { id: 1, title: 'duplicate line in repl', status: 'open', createdAt: '', completedAt: null },
];

const sessions: SyncedSession[] = [
  {
    id: 'abc',
    source: 'claude',
    title: 'Wired the provider layer',
    date: '2026-06-29T00:00:00Z',
    link: '/path/abc.jsonl',
    messageCount: 42,
    summary: 'Overview: built the model-agnostic provider layer.',
  },
];

describe('buildProjectPrompt', () => {
  it('includes the project, its features, bugs and recent sessions', () => {
    const prompt = buildProjectPrompt({
      profile: 'I am Rahul.',
      project,
      features,
      bugs,
      sessions,
    });
    expect(prompt).toContain('About the user');
    expect(prompt).toContain('I am Rahul.');
    expect(prompt).toContain('## Active project: Tael');
    expect(prompt).toContain('A model-agnostic personal AI CLI.');
    expect(prompt).toContain('- [x] #1 interactive chat');
    expect(prompt).toContain('- [ ] #2 session import');
    expect(prompt).toContain('- [ ] #1 duplicate line in repl');
    expect(prompt).toContain('## Recent sessions');
    expect(prompt).toContain('Wired the provider layer (2026-06-29)');
  });

  it('omits the profile section when empty and shows (none yet) for empty lists', () => {
    const prompt = buildProjectPrompt({
      profile: '',
      project,
      features: [],
      bugs: [],
      sessions: [],
    });
    expect(prompt).not.toContain('About the user');
    expect(prompt).not.toContain('## Recent sessions');
    expect(prompt).toContain('### Features\n(none yet)');
    expect(prompt).toContain('### Bugs\n(none yet)');
  });
});

describe('buildProjectMessages', () => {
  it('wraps context as a system message and the question as a user message', () => {
    const messages = buildProjectMessages(
      { profile: '', project, features, bugs, sessions: [] },
      'what next?',
    );
    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe('system');
    expect(messages[1]).toEqual({ role: 'user', content: 'what next?' });
  });
});

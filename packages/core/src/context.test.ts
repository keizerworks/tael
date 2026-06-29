import { describe, expect, it } from 'vitest';
import type { Context, Memory, Profile, Session } from '@tael/types';
import { buildAskMessages, buildSystemPrompt } from './context.js';

const profile: Profile = {
  name: 'Rahul Sain',
  currentProject: 'Tael',
  goals: ['Ship v0.2'],
};

const contexts: Context[] = [
  {
    id: 'tael-product',
    title: 'Tael — Product',
    description: 'What Tael is',
    body: 'Tael is a personal AI CLI that remembers people.',
    tags: [],
    createdAt: '2026-06-29T00:00:00Z',
    updatedAt: '2026-06-29T00:00:00Z',
  },
];

const session: Session = {
  id: '2026-06-29T10-00-00',
  timestamp: '2026-06-29T10:00:00.000Z',
  branch: 'feat/ask',
  recentCommits: [
    { hash: 'a1', message: 'Add provider layer', author: 'Rahul', date: '2026-06-29T09:00:00Z' },
  ],
  changedFiles: ['packages/core/src/ask.ts'],
  summary: 'wiring tael ask',
};

const memories: Memory[] = [
  { id: 'm1', content: 'Prefers concise answers', tags: [], createdAt: '2026-06-28T00:00:00Z' },
];

describe('buildSystemPrompt', () => {
  it('includes profile, contexts, memories and the latest session', () => {
    const prompt = buildSystemPrompt({ profile, contexts, session, memories });
    expect(prompt).toContain('Name: Rahul Sain');
    expect(prompt).toContain('Current project: Tael');
    expect(prompt).toContain('- Ship v0.2');
    expect(prompt).toContain('### Tael — Product');
    expect(prompt).toContain('Tael is a personal AI CLI that remembers people.');
    expect(prompt).toContain('- Prefers concise answers');
    expect(prompt).toContain('Branch: feat/ask');
    expect(prompt).toContain('- Add provider layer');
    expect(prompt).toContain('Summary: wiring tael ask');
  });

  it('omits empty sections gracefully', () => {
    const prompt = buildSystemPrompt({
      profile: { name: '', currentProject: '', goals: [] },
      contexts: [],
      session: null,
      memories: [],
    });
    expect(prompt).toContain('Name: Unknown');
    expect(prompt).not.toContain('## Context');
    expect(prompt).not.toContain('## Memories');
    expect(prompt).not.toContain('## Most recent session');
  });
});

describe('buildAskMessages', () => {
  it('puts context in a system message and the question in a user message', () => {
    const messages = buildAskMessages({ profile, contexts, session, memories }, 'what next?');
    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe('system');
    expect(messages[1]).toEqual({ role: 'user', content: 'what next?' });
  });
});

import { describe, expect, it } from 'vitest';
import type { Profile, Session } from '@tael/types';
import { buildContinueContext } from './continue.js';

const profile: Profile = {
  name: 'Rahul Sain',
  currentProject: 'Student Intelligence',
  goals: ['Ship voice runtime'],
};

const session: Session = {
  id: '2026-06-28T10-00-00',
  timestamp: '2026-06-28T10:00:00.000Z',
  branch: 'feat/voice',
  recentCommits: [
    {
      hash: 'abc1234',
      message: 'Added voice runtime',
      author: 'Rahul',
      date: '2026-06-28T09:00:00Z',
    },
    {
      hash: 'def5678',
      message: 'Added cognition engine',
      author: 'Rahul',
      date: '2026-06-27T09:00:00Z',
    },
  ],
  changedFiles: ['app/voice/page.tsx'],
  summary: '',
};

describe('buildContinueContext', () => {
  it('renders project, commits, branch and changed files', () => {
    const out = buildContinueContext({ profile, session });
    expect(out).toContain('Project: Student Intelligence');
    expect(out).toContain('- Added voice runtime');
    expect(out).toContain('Current branch: feat/voice');
    expect(out).toContain('- app/voice/page.tsx');
    expect(out).toContain('Most recently I worked on: Added voice runtime.');
  });

  it('falls back gracefully when there is no session', () => {
    const out = buildContinueContext({ profile, session: null });
    expect(out).toContain('Project: Student Intelligence');
    expect(out).toContain('Continue working on Student Intelligence.');
    expect(out).not.toContain('Recent commits:');
  });

  it('uses a neutral project label when none is set', () => {
    const out = buildContinueContext({
      profile: { name: '', currentProject: '', goals: [] },
      session: null,
    });
    expect(out).toContain('Project: this project');
  });
});

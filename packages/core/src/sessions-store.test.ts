import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SyncedSession } from '@tael/types';
import { createProject } from './projects.js';
import {
  getSyncedSession,
  listSyncedSessions,
  saveSyncedSession,
  sessionExists,
} from './sessions-store.js';

const session: SyncedSession = {
  id: 'sess-1',
  source: 'claude',
  title: 'Built the sync command',
  date: '2026-06-29T12:00:00Z',
  link: '/Users/x/.claude/projects/abc/sess-1.jsonl',
  messageCount: 17,
  summary: 'Overview: added tael sync.\nNext steps: add codex.',
};

describe('sessions store', () => {
  let home: string;

  beforeEach(async () => {
    home = await mkdtemp(join(tmpdir(), 'tael-home-'));
    process.env.TAEL_HOME = home;
    await createProject('Tael');
  });

  afterEach(async () => {
    delete process.env.TAEL_HOME;
    await rm(home, { recursive: true, force: true });
  });

  it('saves, detects, lists and reads back a synced session with its link', async () => {
    expect(sessionExists('tael', 'sess-1')).toBe(false);
    await saveSyncedSession('tael', session);
    expect(sessionExists('tael', 'sess-1')).toBe(true);

    const list = await listSyncedSessions('tael');
    expect(list).toHaveLength(1);
    expect(list[0]?.title).toBe('Built the sync command');
    expect(list[0]?.link).toBe(session.link);
    expect(list[0]?.messageCount).toBe(17);

    const fetched = await getSyncedSession('tael', 'sess-1');
    expect(fetched?.summary).toContain('Overview: added tael sync.');
  });
});

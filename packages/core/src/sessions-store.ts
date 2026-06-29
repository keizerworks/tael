import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SessionSourceName, SyncedSession } from '@tael/types';
import { parseFrontmatter, stringifyFrontmatter } from './frontmatter.js';
import { projectDir } from './global-store.js';

function sessionsDir(projectId: string): string {
  return join(projectDir(projectId), 'sessions');
}

function sessionPath(projectId: string, id: string): string {
  return join(sessionsDir(projectId), `${id}.md`);
}

export function sessionExists(projectId: string, id: string): boolean {
  return existsSync(sessionPath(projectId, id));
}

export async function saveSyncedSession(projectId: string, session: SyncedSession): Promise<void> {
  await mkdir(sessionsDir(projectId), { recursive: true });
  const body = stringifyFrontmatter(
    {
      source: session.source,
      title: session.title,
      date: session.date,
      link: session.link,
      messageCount: session.messageCount,
    },
    session.summary,
  );
  await writeFile(sessionPath(projectId, session.id), body, 'utf8');
}

export async function listSyncedSessions(projectId: string): Promise<SyncedSession[]> {
  let entries: string[];
  try {
    entries = await readdir(sessionsDir(projectId));
  } catch {
    return [];
  }

  const sessions: SyncedSession[] = [];
  for (const file of entries.filter((name) => name.endsWith('.md'))) {
    const { data, body } = parseFrontmatter(
      await readFile(join(sessionsDir(projectId), file), 'utf8'),
    );
    sessions.push({
      id: file.replace(/\.md$/, ''),
      source: (typeof data.source === 'string' ? data.source : 'claude') as SessionSourceName,
      title: typeof data.title === 'string' ? data.title : '',
      date: typeof data.date === 'string' ? data.date : '',
      link: typeof data.link === 'string' ? data.link : '',
      messageCount: typeof data.messageCount === 'number' ? data.messageCount : 0,
      summary: body,
    });
  }

  return sessions.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getSyncedSession(
  projectId: string,
  id: string,
): Promise<SyncedSession | null> {
  return (await listSyncedSessions(projectId)).find((session) => session.id === id) ?? null;
}

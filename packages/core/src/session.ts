import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Session } from '@tael/types';
import { DEFAULT_COMMIT_LIMIT } from './constants.js';
import { readJson, writeJson } from './fs-json.js';
import { collectGitContext } from './git.js';
import type { Workspace } from './workspace.js';

function sessionId(date: Date): string {
  return date.toISOString().slice(0, 19).replace(/:/g, '-');
}

export interface CreateSessionOptions {
  summary?: string;
  commitLimit?: number;
}

export async function createSession(
  workspace: Workspace,
  options: CreateSessionOptions = {},
): Promise<Session> {
  const now = new Date();
  const git = await collectGitContext(workspace.root, options.commitLimit ?? DEFAULT_COMMIT_LIMIT);

  const session: Session = {
    id: sessionId(now),
    timestamp: now.toISOString(),
    branch: git.branch,
    recentCommits: git.recentCommits,
    changedFiles: git.changedFiles,
    summary: options.summary ?? '',
  };

  await writeJson(join(workspace.paths.sessions, `${session.id}.json`), session);
  return session;
}

export async function listSessions(workspace: Workspace): Promise<Session[]> {
  let entries: string[];
  try {
    entries = await readdir(workspace.paths.sessions);
  } catch {
    return [];
  }

  const files = entries.filter((name) => name.endsWith('.json'));
  const sessions = await Promise.all(
    files.map((name) => readJson<Session>(join(workspace.paths.sessions, name))),
  );

  return sessions.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function getLatestSession(workspace: Workspace): Promise<Session | null> {
  const sessions = await listSessions(workspace);
  return sessions[0] ?? null;
}

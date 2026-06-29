import { readFile } from 'node:fs/promises';
import type { SyncedSession } from '@tael/types';
import { parseClaudeTranscript } from './sources/claude-source.js';

export async function readSessionTranscript(session: SyncedSession): Promise<string> {
  const raw = await readFile(session.link, 'utf8');
  switch (session.source) {
    case 'claude':
      return parseClaudeTranscript(raw).text;
    default:
      return raw;
  }
}

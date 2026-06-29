import { existsSync } from 'node:fs';
import { open, readdir, readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import type { SessionSourceName } from '@tael/types';
import {
  deriveTitle,
  type DiscoveredSession,
  type ParsedTranscript,
  type SessionSource,
} from './source.js';

interface CodexEntry {
  type?: string;
  payload?: {
    type?: string;
    id?: string;
    cwd?: string;
    timestamp?: string;
    message?: string;
  };
}

interface CodexMeta {
  id?: string;
  cwd: string;
  timestamp?: string;
}

function codexSessionsDir(): string {
  return join(homedir(), '.codex', 'sessions');
}

async function readHead(path: string, bytes = 65536): Promise<string> {
  const file = await open(path, 'r');
  try {
    const buffer = Buffer.alloc(bytes);
    const { bytesRead } = await file.read(buffer, 0, bytes, 0);
    return buffer.toString('utf8', 0, bytesRead);
  } finally {
    await file.close();
  }
}

function readMeta(head: string): CodexMeta | null {
  for (const line of head.split('\n')) {
    if (!line.trim()) continue;
    let entry: CodexEntry;
    try {
      entry = JSON.parse(line) as CodexEntry;
    } catch {
      continue;
    }
    if (entry.type === 'session_meta' && entry.payload?.cwd) {
      return {
        id: entry.payload.id,
        cwd: entry.payload.cwd,
        timestamp: entry.payload.timestamp,
      };
    }
  }
  return null;
}

export function parseCodexTranscript(raw: string): ParsedTranscript {
  const messages: Array<{ role: string; text: string }> = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    let entry: CodexEntry;
    try {
      entry = JSON.parse(line) as CodexEntry;
    } catch {
      continue;
    }
    if (entry.type !== 'event_msg' || typeof entry.payload?.message !== 'string') continue;
    if (entry.payload.type === 'user_message') {
      messages.push({ role: 'user', text: entry.payload.message });
    } else if (entry.payload.type === 'agent_message') {
      messages.push({ role: 'assistant', text: entry.payload.message });
    }
  }

  const text = messages.map((message) => `${message.role}: ${message.text}`).join('\n\n');
  return { text, title: deriveTitle(messages), messageCount: messages.length };
}

export class CodexSource implements SessionSource {
  readonly name: SessionSourceName = 'codex';

  isAvailable(): boolean {
    return existsSync(codexSessionsDir());
  }

  async discover(dir: string): Promise<DiscoveredSession[]> {
    const root = codexSessionsDir();
    let files: string[];
    try {
      files = (await readdir(root, { recursive: true })).filter((name) => name.endsWith('.jsonl'));
    } catch {
      return [];
    }

    const target = resolve(dir);
    const sessions: DiscoveredSession[] = [];
    for (const relative of files) {
      const link = join(root, relative);
      const meta = readMeta(await readHead(link));
      if (!meta || resolve(meta.cwd) !== target) continue;

      const id =
        meta.id ??
        relative
          .split('/')
          .pop()
          ?.replace(/\.jsonl$/, '') ??
        relative;
      const date = meta.timestamp ?? (await stat(link)).mtime.toISOString();
      sessions.push({
        id,
        source: this.name,
        date,
        link,
        parse: async () => parseCodexTranscript(await readFile(link, 'utf8')),
      });
    }

    return sessions.sort((a, b) => b.date.localeCompare(a.date));
  }
}

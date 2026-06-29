import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { SessionSourceName } from '@tael/types';
import type { DiscoveredSession, ParsedTranscript, SessionSource } from './source.js';

interface ClaudeBlock {
  type?: string;
  text?: string;
  name?: string;
}

interface ClaudeEntry {
  type?: string;
  message?: { role?: string; content?: string | ClaudeBlock[] };
}

function claudeProjectsDir(): string {
  return join(homedir(), '.claude', 'projects');
}

function encodeCwd(cwd: string): string {
  return cwd.replace(/[^a-zA-Z0-9]/g, '-');
}

function extractText(content: string | ClaudeBlock[] | undefined): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((block) => {
      if (block.type === 'text' && typeof block.text === 'string') return block.text;
      if (block.type === 'tool_use' && block.name) return `[tool: ${block.name}]`;
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

export function parseClaudeTranscript(raw: string): ParsedTranscript {
  const messages: Array<{ role: string; text: string }> = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    let entry: ClaudeEntry;
    try {
      entry = JSON.parse(line) as ClaudeEntry;
    } catch {
      continue;
    }
    if ((entry.type === 'user' || entry.type === 'assistant') && entry.message?.content != null) {
      const text = extractText(entry.message.content).trim();
      if (text) messages.push({ role: entry.type, text });
    }
  }

  const firstUser = messages.find((message) => message.role === 'user');
  const title = (firstUser?.text ?? 'Untitled session').replace(/\s+/g, ' ').slice(0, 80);
  const text = messages.map((message) => `${message.role}: ${message.text}`).join('\n\n');
  return { text, title, messageCount: messages.length };
}

export class ClaudeSource implements SessionSource {
  readonly name: SessionSourceName = 'claude';

  isAvailable(): boolean {
    return existsSync(claudeProjectsDir());
  }

  async discover(dir: string): Promise<DiscoveredSession[]> {
    const projectDir = join(claudeProjectsDir(), encodeCwd(dir));
    let files: string[];
    try {
      files = await readdir(projectDir);
    } catch {
      return [];
    }

    const sessions: DiscoveredSession[] = [];
    for (const file of files.filter((name) => name.endsWith('.jsonl'))) {
      const link = join(projectDir, file);
      const info = await stat(link);
      sessions.push({
        id: file.replace(/\.jsonl$/, ''),
        source: this.name,
        date: info.mtime.toISOString(),
        link,
        parse: async () => parseClaudeTranscript(await readFile(link, 'utf8')),
      });
    }

    return sessions.sort((a, b) => b.date.localeCompare(a.date));
  }
}

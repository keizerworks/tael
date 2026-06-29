import type { SessionSourceName } from '@tael/types';

export interface ParsedTranscript {
  text: string;
  title: string;
  messageCount: number;
}

export interface DiscoveredSession {
  id: string;
  source: SessionSourceName;
  date: string;
  link: string;
  parse(): Promise<ParsedTranscript>;
}

export interface SessionSource {
  readonly name: SessionSourceName;
  isAvailable(): boolean;
  // `dir` is the project's repo path; sources return only sessions for that dir.
  discover(dir: string): Promise<DiscoveredSession[]>;
}

const TITLE_SKIP = [
  /^<command-message>/i,
  /^<command-name>/i,
  /^#\s*files mentioned/i,
  /^#\s*agents\.md/i,
  /^<INSTRUCTIONS>/i,
];

/** Pick a clean title: the first user message that isn't agent/command boilerplate. */
export function deriveTitle(messages: Array<{ role: string; text: string }>): string {
  const users = messages.filter((message) => message.role === 'user');
  const meaningful = users.find((message) => {
    const text = message.text.trim();
    return text.length > 0 && !TITLE_SKIP.some((pattern) => pattern.test(text));
  });
  const chosen = meaningful ?? users[0];
  return (
    (chosen?.text ?? 'Untitled session').replace(/\s+/g, ' ').trim().slice(0, 80) ||
    'Untitled session'
  );
}

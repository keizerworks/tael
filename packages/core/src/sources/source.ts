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
  discover(cwd: string): Promise<DiscoveredSession[]>;
}

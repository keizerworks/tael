export type SessionSourceName = 'claude' | 'codex';

export interface SyncedSession {
  id: string;
  source: SessionSourceName;
  title: string;
  date: string;
  link: string;
  messageCount: number;
  summary: string;
}

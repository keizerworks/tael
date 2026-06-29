import { createProvider } from '@tael/providers';
import type { Project, ProviderCredentials, SessionSourceName, SyncedSession } from '@tael/types';
import { loadCredentials } from './credentials.js';
import { saveSyncedSession, sessionExists } from './sessions-store.js';
import { availableSources, getSource } from './sources/registry.js';

const MAX_TRANSCRIPT_CHARS = 60_000;

const SUMMARY_SYSTEM = [
  "Summarize this AI coding session for the developer's long-term memory.",
  'Use these sections (omit any that are empty): Overview, What changed, Decisions, Blockers, Next steps.',
  'Be concise and concrete. Markdown only, no preamble.',
].join('\n');

function clip(transcript: string): string {
  if (transcript.length <= MAX_TRANSCRIPT_CHARS) return transcript;
  return `…(earlier turns truncated)…\n\n${transcript.slice(-MAX_TRANSCRIPT_CHARS)}`;
}

export interface SyncOptions {
  cwd?: string;
  sourceName?: SessionSourceName;
  credentials?: ProviderCredentials;
  onSynced?: (session: SyncedSession) => void;
}

export interface SyncSummary {
  synced: SyncedSession[];
  skipped: number;
}

export async function syncSessions(
  project: Project,
  options: SyncOptions = {},
): Promise<SyncSummary> {
  const cwd = options.cwd ?? process.cwd();
  const credentials = options.credentials ?? (await loadCredentials());
  const provider = createProvider(credentials);
  const sources = options.sourceName ? [getSource(options.sourceName)] : availableSources();

  const synced: SyncedSession[] = [];
  let skipped = 0;

  for (const source of sources) {
    for (const discovered of await source.discover(cwd)) {
      if (sessionExists(project.id, discovered.id)) {
        skipped += 1;
        continue;
      }

      const { text, title, messageCount } = await discovered.parse();
      if (!text.trim()) {
        skipped += 1;
        continue;
      }

      const response = await provider.chat({
        model: credentials.model,
        maxTokens: 1024,
        messages: [
          { role: 'system', content: SUMMARY_SYSTEM },
          { role: 'user', content: clip(text) },
        ],
      });

      const session: SyncedSession = {
        id: discovered.id,
        source: discovered.source,
        title,
        date: discovered.date,
        link: discovered.link,
        messageCount,
        summary: response.content,
      };

      await saveSyncedSession(project.id, session);
      synced.push(session);
      options.onSynced?.(session);
    }
  }

  return { synced, skipped };
}

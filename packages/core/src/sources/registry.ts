import type { SessionSourceName } from '@tael/types';
import { TaelError } from '../errors.js';
import { ClaudeSource } from './claude-source.js';
import { CodexSource } from './codex-source.js';
import type { SessionSource } from './source.js';

const SOURCES: SessionSource[] = [new ClaudeSource(), new CodexSource()];

export const SESSION_SOURCES: SessionSourceName[] = SOURCES.map((source) => source.name);

export function availableSources(): SessionSource[] {
  return SOURCES.filter((source) => source.isAvailable());
}

export function getSource(name: SessionSourceName): SessionSource {
  const source = SOURCES.find((entry) => entry.name === name);
  if (!source) {
    throw new TaelError(
      `Unknown session source "${name}". Available: ${SESSION_SOURCES.join(', ')}.`,
    );
  }
  return source;
}

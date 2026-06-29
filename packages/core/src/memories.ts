import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Memory } from '@tael/types';
import { readJson } from './fs-json.js';
import type { Workspace } from './workspace.js';

export async function listMemories(workspace: Workspace): Promise<Memory[]> {
  let entries: string[];
  try {
    entries = await readdir(workspace.paths.memories);
  } catch {
    return [];
  }

  const files = entries.filter((name) => name.endsWith('.json'));
  const memories = await Promise.all(
    files.map((name) => readJson<Memory>(join(workspace.paths.memories, name))),
  );

  return memories.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

import { existsSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';
import { DIRS, FILES, WORKSPACE_DIR } from './constants.js';

export interface WorkspacePaths {
  root: string;
  dir: string;
  config: string;
  profile: string;
  sessions: string;
  memories: string;
}

export function resolveWorkspacePaths(root: string): WorkspacePaths {
  const dir = join(root, WORKSPACE_DIR);
  return {
    root,
    dir,
    config: join(dir, FILES.config),
    profile: join(dir, FILES.profile),
    sessions: join(dir, DIRS.sessions),
    memories: join(dir, DIRS.memories),
  };
}

export function findWorkspaceRoot(startDir: string): string | null {
  let current = startDir;
  const { root: fsRoot } = parse(current);

  while (true) {
    if (existsSync(join(current, WORKSPACE_DIR, FILES.config))) {
      return current;
    }
    if (current === fsRoot) {
      return null;
    }
    current = dirname(current);
  }
}

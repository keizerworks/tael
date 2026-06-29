export const WORKSPACE_VERSION = '0.1.0';

export const WORKSPACE_DIR = '.tael';

export const FILES = {
  config: 'config.json',
  profile: 'profile.json',
} as const;

export const DIRS = {
  sessions: 'sessions',
  memories: 'memories',
  contexts: 'contexts',
} as const;

export const DEFAULT_COMMIT_LIMIT = 10;

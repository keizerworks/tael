import { homedir } from 'node:os';
import { join } from 'node:path';

export function globalDir(): string {
  return process.env.TAEL_HOME ?? join(homedir(), '.tael');
}

export function credentialsPath(): string {
  return join(globalDir(), 'credentials.json');
}

export function statePath(): string {
  return join(globalDir(), 'state.json');
}

export function profilePath(): string {
  return join(globalDir(), 'profile.md');
}

export function projectsDir(): string {
  return join(globalDir(), 'projects');
}

export function projectDir(id: string): string {
  return join(projectsDir(), id);
}

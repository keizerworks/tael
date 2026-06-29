import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { globalDir, profilePath } from './global-store.js';

export async function loadProfile(): Promise<string> {
  try {
    return (await readFile(profilePath(), 'utf8')).trim();
  } catch {
    return '';
  }
}

export async function saveProfile(content: string): Promise<void> {
  await mkdir(globalDir(), { recursive: true });
  await writeFile(profilePath(), `${content.trim()}\n`, 'utf8');
}

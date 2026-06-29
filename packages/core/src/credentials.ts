import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { ProviderCredentials, ProviderName } from '@tael/types';
import { TaelError } from './errors.js';
import { credentialsPath, globalDir } from './global-store.js';

const ENV_KEYS: Record<ProviderName, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
};

export class CredentialsError extends TaelError {
  override name = 'CredentialsError';
}

export interface StoredCredentials {
  provider: ProviderName;
  model: string;
  apiKey?: string;
}

export async function saveCredentials(credentials: StoredCredentials): Promise<void> {
  await mkdir(globalDir(), { recursive: true });
  await writeFile(credentialsPath(), `${JSON.stringify(credentials, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });
}

export async function loadCredentials(): Promise<ProviderCredentials> {
  let stored: Partial<ProviderCredentials> = {};
  if (existsSync(credentialsPath())) {
    stored = JSON.parse(await readFile(credentialsPath(), 'utf8')) as Partial<ProviderCredentials>;
  }

  if (!stored.provider) {
    throw new CredentialsError('No provider configured. Run `tael login` first.');
  }
  if (!stored.model) {
    throw new CredentialsError('No model configured. Run `tael login` first.');
  }

  const apiKey = stored.apiKey ?? process.env[ENV_KEYS[stored.provider]];
  if (!apiKey) {
    throw new CredentialsError(
      `No API key for ${stored.provider}. Run \`tael login\` or set ${ENV_KEYS[stored.provider]}.`,
    );
  }

  return { provider: stored.provider, model: stored.model, apiKey };
}

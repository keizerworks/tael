import { credentialsPath, DEFAULT_MODELS, saveCredentials, SUPPORTED_PROVIDERS } from '@tael/core';
import type { ProviderName } from '@tael/types';
import { ui } from '../ui.js';

export interface LoginCommandOptions {
  provider?: string;
  model?: string;
  key?: string;
}

export async function loginCommand(options: LoginCommandOptions): Promise<void> {
  const provider = (options.provider ?? 'anthropic') as ProviderName;

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    ui.error(
      `Unsupported provider "${provider}". Choose one of: ${SUPPORTED_PROVIDERS.join(', ')}.`,
    );
    process.exitCode = 1;
    return;
  }

  const model = options.model ?? DEFAULT_MODELS[provider];

  await saveCredentials({ provider, model, apiKey: options.key });

  ui.success(`Configured ${ui.bold(provider)} with model ${ui.cyan(model)}`);
  if (options.key) {
    ui.step(`API key saved to ${ui.cyan(credentialsPath())} (chmod 600).`);
  } else {
    const envVar = provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
    ui.step(`No key stored — Tael will read ${ui.bold(envVar)} from your environment.`);
  }
  ui.step(`Next: run ${ui.bold('tael ask "..."')} to ask anything with your context.`);
}

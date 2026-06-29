import type { ProviderCredentials, ProviderName } from '@tael/types';
import { AnthropicProvider } from './anthropic.js';
import { OpenAIProvider } from './openai.js';
import { ProviderError, type Provider } from './provider.js';

export const SUPPORTED_PROVIDERS: ProviderName[] = ['anthropic', 'openai'];

export const DEFAULT_MODELS: Record<ProviderName, string> = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-4o',
};

export function createProvider(credentials: ProviderCredentials): Provider {
  switch (credentials.provider) {
    case 'anthropic':
      return new AnthropicProvider(credentials.apiKey);
    case 'openai':
      return new OpenAIProvider(credentials.apiKey);
    default:
      throw new ProviderError(
        `Unknown provider: ${String(credentials.provider)}`,
        String(credentials.provider),
      );
  }
}

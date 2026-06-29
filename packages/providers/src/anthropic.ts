import type { ChatRequest, ChatResponse } from '@tael/types';
import { DEFAULT_MAX_TOKENS, ProviderError, type Provider } from './provider.js';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';

interface AnthropicResponse {
  model: string;
  content: Array<{ type: string; text?: string }>;
}

export class AnthropicProvider implements Provider {
  readonly name = 'anthropic';

  constructor(private readonly apiKey: string) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const system = request.messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');

    const messages = request.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': API_VERSION,
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
        ...(system ? { system } : {}),
        ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
        messages,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new ProviderError(
        `Anthropic request failed (${response.status}): ${detail}`,
        this.name,
        response.status,
      );
    }

    const data = (await response.json()) as AnthropicResponse;
    const content = data.content
      .map((block) => block.text ?? '')
      .join('')
      .trim();

    return { content, model: data.model };
  }
}

import type { ChatRequest, ChatResponse } from '@tael/types';
import { DEFAULT_MAX_TOKENS, ProviderError, type Provider } from './provider.js';

const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

interface OpenAIResponse {
  model: string;
  choices: Array<{ message?: { content?: string } }>;
}

export class OpenAIProvider implements Provider {
  readonly name = 'openai';

  constructor(private readonly apiKey: string) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
        ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new ProviderError(
        `OpenAI request failed (${response.status}): ${detail}`,
        this.name,
        response.status,
      );
    }

    const data = (await response.json()) as OpenAIResponse;
    const content = (data.choices[0]?.message?.content ?? '').trim();

    return { content, model: data.model };
  }
}

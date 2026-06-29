import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ChatRequest } from '@tael/types';
import { AnthropicProvider } from './anthropic.js';
import { OpenAIProvider } from './openai.js';
import { createProvider } from './registry.js';
import { ProviderError } from './provider.js';

const request: ChatRequest = {
  model: 'test-model',
  messages: [
    { role: 'system', content: 'You know the user.' },
    { role: 'user', content: 'Hello' },
  ],
};

function mockFetch(response: unknown, ok = true, status = 200) {
  const fn = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AnthropicProvider', () => {
  it('lifts system messages out and parses content blocks', async () => {
    const fetchFn = mockFetch({
      model: 'claude-x',
      content: [
        { type: 'text', text: 'Hi ' },
        { type: 'text', text: 'there' },
      ],
    });

    const result = await new AnthropicProvider('key-123').chat(request);

    expect(result).toEqual({ content: 'Hi there', model: 'claude-x' });
    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect((init as RequestInit).headers).toMatchObject({ 'x-api-key': 'key-123' });
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.system).toBe('You know the user.');
    expect(body.messages).toEqual([{ role: 'user', content: 'Hello' }]);
  });

  it('throws ProviderError on a non-2xx response', async () => {
    mockFetch({ error: 'bad key' }, false, 401);
    await expect(new AnthropicProvider('nope').chat(request)).rejects.toBeInstanceOf(ProviderError);
  });
});

describe('OpenAIProvider', () => {
  it('passes messages through and parses the first choice', async () => {
    const fetchFn = mockFetch({
      model: 'gpt-x',
      choices: [{ message: { content: 'Hello back' } }],
    });

    const result = await new OpenAIProvider('sk-1').chat(request);

    expect(result).toEqual({ content: 'Hello back', model: 'gpt-x' });
    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect((init as RequestInit).headers).toMatchObject({ authorization: 'Bearer sk-1' });
  });
});

describe('createProvider', () => {
  it('selects the right adapter', () => {
    expect(createProvider({ provider: 'anthropic', model: 'm', apiKey: 'k' }).name).toBe(
      'anthropic',
    );
    expect(createProvider({ provider: 'openai', model: 'm', apiKey: 'k' }).name).toBe('openai');
  });
});

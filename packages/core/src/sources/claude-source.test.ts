import { describe, expect, it } from 'vitest';
import { parseClaudeTranscript } from './claude-source.js';

describe('parseClaudeTranscript', () => {
  it('extracts user/assistant text, derives a title and counts messages', () => {
    const raw = [
      JSON.stringify({ type: 'mode', payload: 'x' }),
      JSON.stringify({
        type: 'user',
        message: { role: 'user', content: 'fix the duplicate line bug' },
      }),
      JSON.stringify({
        type: 'assistant',
        message: {
          role: 'assistant',
          content: [
            { type: 'text', text: 'On it.' },
            { type: 'tool_use', name: 'Edit' },
          ],
        },
      }),
      'not json',
    ].join('\n');

    const parsed = parseClaudeTranscript(raw);
    expect(parsed.title).toBe('fix the duplicate line bug');
    expect(parsed.messageCount).toBe(2);
    expect(parsed.text).toContain('user: fix the duplicate line bug');
    expect(parsed.text).toContain('assistant: On it.');
    expect(parsed.text).toContain('[tool: Edit]');
  });

  it('handles an empty transcript', () => {
    const parsed = parseClaudeTranscript('');
    expect(parsed.messageCount).toBe(0);
    expect(parsed.title).toBe('Untitled session');
  });
});

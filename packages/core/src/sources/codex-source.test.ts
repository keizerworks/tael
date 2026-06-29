import { describe, expect, it } from 'vitest';
import { parseCodexTranscript } from './codex-source.js';

describe('parseCodexTranscript', () => {
  it('extracts user/agent event messages and ignores noise', () => {
    const raw = [
      JSON.stringify({
        type: 'session_meta',
        payload: { id: 'abc', cwd: '/x', timestamp: '2026-06-21T00:00:00Z' },
      }),
      JSON.stringify({
        type: 'response_item',
        payload: { type: 'message', role: 'developer', content: [] },
      }),
      JSON.stringify({
        type: 'event_msg',
        payload: { type: 'user_message', message: 'build the frontend' },
      }),
      JSON.stringify({
        type: 'event_msg',
        payload: { type: 'agent_message', message: 'Sure, starting now.' },
      }),
      JSON.stringify({ type: 'turn_context', payload: {} }),
    ].join('\n');

    const parsed = parseCodexTranscript(raw);
    expect(parsed.messageCount).toBe(2);
    expect(parsed.title).toBe('build the frontend');
    expect(parsed.text).toBe('user: build the frontend\n\nassistant: Sure, starting now.');
  });

  it('handles an empty transcript', () => {
    expect(parseCodexTranscript('').messageCount).toBe(0);
  });
});

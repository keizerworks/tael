import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { executeActions, parseActions } from './actions.js';
import { createProject, listFeatures } from './projects.js';

describe('parseActions', () => {
  it('extracts actions from a tael block and strips it from the reply', () => {
    const reply = [
      'Sure, marking that done.',
      '```tael',
      '[{"action":"complete_feature","id":2}]',
      '```',
    ].join('\n');
    const { actions, cleaned } = parseActions(reply);
    expect(actions).toEqual([{ action: 'complete_feature', id: 2 }]);
    expect(cleaned).toBe('Sure, marking that done.');
  });

  it('ignores malformed or absent blocks', () => {
    expect(parseActions('just chatting').actions).toEqual([]);
    expect(parseActions('```tael\nnot json\n```').actions).toEqual([]);
  });

  it('drops entries that fail validation', () => {
    const { actions } = parseActions(
      '```tael\n[{"action":"complete_feature"},{"action":"nope"}]\n```',
    );
    expect(actions).toEqual([]);
  });
});

describe('executeActions', () => {
  let home: string;

  beforeEach(async () => {
    home = await mkdtemp(join(tmpdir(), 'tael-home-'));
    process.env.TAEL_HOME = home;
    await createProject('Tael');
  });

  afterEach(async () => {
    delete process.env.TAEL_HOME;
    await rm(home, { recursive: true, force: true });
  });

  it('actually mutates the store (add + complete a feature)', async () => {
    const results = await executeActions('tael', [
      { action: 'add_feature', title: 'codex adapter' },
      { action: 'complete_feature', id: 1 },
    ]);
    expect(results.every((r) => r.ok)).toBe(true);

    const features = await listFeatures('tael');
    expect(features).toHaveLength(1);
    expect(features[0]?.status).toBe('done');
  });

  it('reports a failure for a missing id without throwing', async () => {
    const [result] = await executeActions('tael', [{ action: 'complete_bug', id: 99 }]);
    expect(result?.ok).toBe(false);
  });
});

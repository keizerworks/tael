import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  addBug,
  addFeature,
  completeFeature,
  createProject,
  getActiveProject,
  listFeatures,
  listProjects,
  ProjectExistsError,
  setActiveProject,
} from './projects.js';

describe('project store', () => {
  let home: string;

  beforeEach(async () => {
    home = await mkdtemp(join(tmpdir(), 'tael-home-'));
    process.env.TAEL_HOME = home;
  });

  afterEach(async () => {
    delete process.env.TAEL_HOME;
    await rm(home, { recursive: true, force: true });
  });

  it('creates and lists projects and tracks the active one', async () => {
    const created = await createProject('Tael', { description: 'the product' });
    expect(created.id).toBe('tael');

    await createProject('Side Quest');
    const projects = await listProjects();
    expect(projects.map((p) => p.id)).toEqual(['side-quest', 'tael']);

    expect(await getActiveProject()).toBeNull();
    await setActiveProject('tael');
    expect((await getActiveProject())?.id).toBe('tael');
  });

  it('rejects duplicate projects', async () => {
    await createProject('Tael');
    await expect(createProject('Tael')).rejects.toBeInstanceOf(ProjectExistsError);
  });

  it('adds features/bugs with incrementing ids and completes them', async () => {
    await createProject('Tael');

    const f1 = await addFeature('tael', 'interactive chat');
    const f2 = await addFeature('tael', 'session import');
    expect([f1.id, f2.id]).toEqual([1, 2]);
    expect(f1.status).toBe('open');

    const bug = await addBug('tael', 'duplicate line in repl');
    expect(bug.id).toBe(1); // bugs have their own id space

    const done = await completeFeature('tael', 1);
    expect(done.status).toBe('done');
    expect(done.completedAt).not.toBeNull();

    const features = await listFeatures('tael');
    expect(features.find((f) => f.id === 1)?.status).toBe('done');
    expect(features.find((f) => f.id === 2)?.status).toBe('open');
  });
});

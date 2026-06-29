import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initWorkspace, type Workspace } from './workspace.js';
import {
  ContextExistsError,
  createContext,
  getContext,
  listContexts,
  parseContext,
  slugify,
} from './context-store.js';

describe('slugify', () => {
  it('makes a filesystem-safe id', () => {
    expect(slugify('Tael — Product!')).toBe('tael-product');
    expect(slugify('   ')).toBe('context');
  });
});

describe('parseContext', () => {
  it('round-trips a title with a colon in it', () => {
    const raw = [
      '---',
      'title: "Plan: v0.2"',
      'description: "the next milestone"',
      'tags: ["plan"]',
      'createdAt: "2026-06-29T00:00:00Z"',
      'updatedAt: "2026-06-29T00:00:00Z"',
      '---',
      '',
      'Body text.',
      '',
    ].join('\n');
    const ctx = parseContext('plan-v0-2', raw);
    expect(ctx.title).toBe('Plan: v0.2');
    expect(ctx.description).toBe('the next milestone');
    expect(ctx.tags).toEqual(['plan']);
    expect(ctx.body).toBe('Body text.');
  });
});

describe('context store CRUD', () => {
  let workspace: Workspace;
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'tael-ctx-'));
    workspace = await initWorkspace(dir, { name: 'Test', currentProject: 'tael' });
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('creates, lists and reads a context, and persists frontmatter', async () => {
    const created = await createContext(workspace, {
      title: 'Tael Product',
      description: 'what it is',
      body: 'A personal AI CLI.',
    });
    expect(created.id).toBe('tael-product');

    const onDisk = await readFile(join(workspace.paths.contexts, 'tael-product.md'), 'utf8');
    expect(onDisk).toContain('title: "Tael Product"');
    expect(onDisk).toContain('A personal AI CLI.');

    const list = await listContexts(workspace);
    expect(list).toHaveLength(1);
    expect(list[0]?.title).toBe('Tael Product');

    const fetched = await getContext(workspace, 'tael-product');
    expect(fetched?.body).toBe('A personal AI CLI.');
  });

  it('rejects a duplicate id', async () => {
    await createContext(workspace, { title: 'Dupe' });
    await expect(createContext(workspace, { title: 'Dupe' })).rejects.toBeInstanceOf(
      ContextExistsError,
    );
  });
});

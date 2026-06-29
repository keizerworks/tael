import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Context } from '@tael/types';
import { TaelError } from './errors.js';
import type { Workspace } from './workspace.js';

export class ContextExistsError extends TaelError {
  override name = 'ContextExistsError';
  constructor(public readonly id: string) {
    super(`A context "${id}" already exists. Use a different title or edit the file directly.`);
  }
}

export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'context';
}

function serializeContext(context: Context): string {
  return [
    '---',
    `title: ${JSON.stringify(context.title)}`,
    `description: ${JSON.stringify(context.description)}`,
    `tags: ${JSON.stringify(context.tags)}`,
    `createdAt: ${JSON.stringify(context.createdAt)}`,
    `updatedAt: ${JSON.stringify(context.updatedAt)}`,
    '---',
    '',
    context.body.trim(),
    '',
  ].join('\n');
}

function parseValue(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw.trim();
  }
}

export function parseContext(id: string, raw: string): Context {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const data: Record<string, unknown> = {};
  let body = raw;

  if (match) {
    body = match[2] ?? '';
    for (const line of (match[1] ?? '').split('\n')) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      data[line.slice(0, idx).trim()] = parseValue(line.slice(idx + 1).trim());
    }
  }

  return {
    id,
    title: typeof data.title === 'string' ? data.title : id,
    description: typeof data.description === 'string' ? data.description : '',
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
    body: body.trim(),
  };
}

function contextPath(workspace: Workspace, id: string): string {
  return join(workspace.paths.contexts, `${id}.md`);
}

export interface CreateContextInput {
  title: string;
  description?: string;
  body?: string;
  tags?: string[];
}

export async function createContext(
  workspace: Workspace,
  input: CreateContextInput,
): Promise<Context> {
  const id = slugify(input.title);
  const path = contextPath(workspace, id);
  if (existsSync(path)) {
    throw new ContextExistsError(id);
  }

  const now = new Date().toISOString();
  const context: Context = {
    id,
    title: input.title.trim(),
    description: input.description?.trim() ?? '',
    body: input.body?.trim() ?? '',
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };

  await mkdir(workspace.paths.contexts, { recursive: true });
  await writeFile(path, serializeContext(context), 'utf8');
  return context;
}

export async function listContexts(workspace: Workspace): Promise<Context[]> {
  let entries: string[];
  try {
    entries = await readdir(workspace.paths.contexts);
  } catch {
    return [];
  }

  const files = entries.filter((name) => name.endsWith('.md'));
  const contexts = await Promise.all(
    files.map(async (name) =>
      parseContext(
        name.replace(/\.md$/, ''),
        await readFile(join(workspace.paths.contexts, name), 'utf8'),
      ),
    ),
  );

  return contexts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getContext(workspace: Workspace, id: string): Promise<Context | null> {
  const path = contextPath(workspace, id);
  if (!existsSync(path)) {
    return null;
  }
  return parseContext(id, await readFile(path, 'utf8'));
}

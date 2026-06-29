import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createContext, getContext, listContexts, loadWorkspace } from '@tael/core';
import { ui } from '../ui.js';

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf8').trim();
}

export interface ContextAddOptions {
  description?: string;
  body?: string;
  file?: string;
}

export async function contextAddCommand(
  titleParts: string[],
  options: ContextAddOptions,
): Promise<void> {
  const title = titleParts.join(' ').trim();
  if (!title) {
    ui.error('Give the context a title, e.g. `tael context add "Tael — Product" -d "..."`');
    process.exitCode = 1;
    return;
  }

  const workspace = loadWorkspace(process.cwd());

  let body = options.body ?? '';
  if (!body && options.file) {
    body = await readFile(options.file, 'utf8');
  }
  if (!body && !process.stdin.isTTY) {
    body = await readStdin();
  }

  const context = await createContext(workspace, {
    title,
    description: options.description,
    body,
  });

  ui.success(`Added context ${ui.bold(context.title)} ${ui.dim(`(${context.id})`)}`);
  if (!context.body) {
    const path = join(workspace.paths.contexts, `${context.id}.md`);
    ui.step(`Empty body — edit ${ui.cyan(path)} to fill it in.`);
  }
}

export async function contextListCommand(): Promise<void> {
  const workspace = loadWorkspace(process.cwd());
  const contexts = await listContexts(workspace);

  if (contexts.length === 0) {
    ui.warn('No contexts yet. Add one with `tael context add "Title" -d "what it is"`.');
    return;
  }

  for (const context of contexts) {
    console.log(`${ui.bold(context.title)} ${ui.dim(`(${context.id})`)}`);
    if (context.description) {
      console.log(`  ${ui.dim(context.description)}`);
    }
  }
}

export async function contextShowCommand(id: string): Promise<void> {
  const workspace = loadWorkspace(process.cwd());
  const context = await getContext(workspace, id);

  if (!context) {
    ui.error(`No context "${id}". Run \`tael context list\` to see what's available.`);
    process.exitCode = 1;
    return;
  }

  console.log(ui.bold(context.title));
  if (context.description) {
    console.log(ui.dim(context.description));
  }
  if (context.body) {
    console.log(`\n${context.body}`);
  }
}

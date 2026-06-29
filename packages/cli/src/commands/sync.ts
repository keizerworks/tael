import { resolve } from 'node:path';
import ora from 'ora';
import { requireActiveProject, SESSION_SOURCES, setProjectRepo, syncSessions } from '@tael/core';
import type { Project, SessionSourceName } from '@tael/types';
import { ui } from '../ui.js';
import { confirm } from '../prompt.js';

export interface SyncCommandOptions {
  yes?: boolean;
}

async function resolveSyncDir(
  project: Project,
  options: SyncCommandOptions,
): Promise<string | null> {
  const cwd = resolve(process.cwd());

  if (project.repoPath) {
    if (resolve(project.repoPath) === cwd || options.yes) {
      return project.repoPath;
    }
    ui.warn(
      `Active project is ${ui.bold(project.name)} (linked repo: ${ui.cyan(project.repoPath)}).`,
    );
    ui.step(
      `You're in ${ui.cyan(cwd)} — Tael would sync ${project.name}'s sessions from its linked repo, not here.`,
    );
    if (await confirm('Continue?')) {
      return project.repoPath;
    }
    ui.step('Aborted. Use `tael use <project>` to switch, or run sync from the project repo.');
    return null;
  }

  ui.warn(`Project ${ui.bold(project.name)} has no linked repo.`);
  if (options.yes || (await confirm(`Link ${ui.cyan(cwd)} as its repo and sync from here?`))) {
    await setProjectRepo(project.id, cwd);
    ui.step(`Linked ${ui.cyan(cwd)} to ${project.name}.`);
    return cwd;
  }
  ui.step('Aborted.');
  return null;
}

export async function syncCommand(
  source?: string,
  options: SyncCommandOptions = {},
): Promise<void> {
  if (source && !SESSION_SOURCES.includes(source as SessionSourceName)) {
    ui.error(`Unknown source "${source}". Available: ${SESSION_SOURCES.join(', ')}.`);
    process.exitCode = 1;
    return;
  }

  const project = await requireActiveProject();
  const dir = await resolveSyncDir(project, options);
  if (!dir) {
    return;
  }

  const spinner = ora({ text: 'Scanning for sessions', color: 'blue' }).start();
  try {
    const result = await syncSessions(project, {
      dir,
      sourceName: source as SessionSourceName | undefined,
      onSynced: (session) => {
        spinner.text = `Summarised: ${session.title}`;
      },
    });
    spinner.stop();

    if (result.synced.length === 0) {
      ui.success(`Up to date — no new sessions (${result.skipped} already synced).`);
      return;
    }

    ui.success(`Synced ${result.synced.length} new session(s) into ${ui.bold(project.name)}.`);
    for (const session of result.synced) {
      ui.step(`${session.title} ${ui.dim(`(${session.source})`)}`);
    }
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

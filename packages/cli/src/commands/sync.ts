import ora from 'ora';
import { requireActiveProject, SESSION_SOURCES, syncSessions } from '@tael/core';
import type { SessionSourceName } from '@tael/types';
import { ui } from '../ui.js';

export async function syncCommand(source?: string): Promise<void> {
  if (source && !SESSION_SOURCES.includes(source as SessionSourceName)) {
    ui.error(`Unknown source "${source}". Available: ${SESSION_SOURCES.join(', ')}.`);
    process.exitCode = 1;
    return;
  }

  const project = await requireActiveProject();

  const spinner = ora({ text: 'Scanning for sessions', color: 'blue' }).start();
  try {
    const result = await syncSessions(project, {
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

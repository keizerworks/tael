import {
  getSyncedSession,
  listSyncedSessions,
  readSessionTranscript,
  requireActiveProject,
} from '@tael/core';
import { ui } from '../ui.js';
import { renderMarkdown } from '../markdown.js';

export async function sessionListCommand(): Promise<void> {
  const project = await requireActiveProject();
  const sessions = await listSyncedSessions(project.id);

  if (sessions.length === 0) {
    ui.warn(`No synced sessions in ${project.name}. Run \`tael sync\` to import them.`);
    return;
  }

  console.log(ui.dim(`${project.name} · ${sessions.length} session(s)`));
  for (const session of sessions) {
    console.log(
      `  ${ui.bold(session.title)} ${ui.dim(`(${session.source} · ${session.date.slice(0, 10)} · ${session.id})`)}`,
    );
  }
}

export interface SessionShowOptions {
  full?: boolean;
}

export async function sessionShowCommand(id: string, options: SessionShowOptions): Promise<void> {
  const project = await requireActiveProject();
  const session = await getSyncedSession(project.id, id);

  if (!session) {
    ui.error(`No session "${id}". Run \`tael session list\` to see what's synced.`);
    process.exitCode = 1;
    return;
  }

  console.log(ui.bold(session.title));
  console.log(
    ui.dim(`${session.source} · ${session.date.slice(0, 10)} · ${session.messageCount} messages`),
  );
  console.log(ui.dim(`link: ${session.link}`));
  console.log();

  if (!options.full) {
    console.log(renderMarkdown(session.summary));
    return;
  }

  try {
    console.log(await readSessionTranscript(session));
  } catch {
    ui.error(`Could not read the original transcript at ${session.link}.`);
    process.exitCode = 1;
  }
}

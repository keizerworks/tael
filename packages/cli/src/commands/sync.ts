import ora from 'ora';
import { createSession, loadWorkspace } from '@tael/core';
import { ui } from '../ui.js';

export interface SyncCommandOptions {
  summary?: string;
  commits?: number;
}

export async function syncCommand(options: SyncCommandOptions): Promise<void> {
  const workspace = loadWorkspace(process.cwd());

  const spinner = ora('Capturing Git context').start();
  const session = await createSession(workspace, {
    summary: options.summary,
    commitLimit: options.commits,
  });
  spinner.succeed(`Saved session ${ui.cyan(session.id)}`);

  console.log();
  if (session.branch) {
    ui.step(`Branch: ${ui.bold(session.branch)}`);
  } else {
    ui.step('Branch: (none — detached or not a Git repo)');
  }
  ui.step(`Commits captured: ${ui.bold(String(session.recentCommits.length))}`);
  ui.step(`Changed files: ${ui.bold(String(session.changedFiles.length))}`);
  console.log();
  ui.step(`Next: run ${ui.bold('tael continue')} to get pasteable context.`);
}

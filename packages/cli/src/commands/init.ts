import { basename } from 'node:path';
import { getGitUserName, initWorkspace, isInitialized } from '@tael/core';
import { ui } from '../ui.js';

export interface InitCommandOptions {
  name?: string;
  project?: string;
  force?: boolean;
}

export async function initCommand(options: InitCommandOptions): Promise<void> {
  const cwd = process.cwd();

  if (isInitialized(cwd) && !options.force) {
    ui.warn(`A Tael workspace already exists here (${ui.cyan('.tael/')}).`);
    ui.step(`Run ${ui.bold('tael init --force')} to recreate it from scratch.`);
    return;
  }

  const name = options.name ?? (await getGitUserName(cwd)) ?? '';
  const currentProject = options.project ?? basename(cwd);

  const workspace = await initWorkspace(cwd, {
    name,
    currentProject,
    force: options.force,
  });

  ui.success(`Initialized Tael workspace at ${ui.cyan(workspace.paths.dir)}`);
  console.log();
  console.log(ui.dim('  .tael/'));
  console.log(ui.dim('  ├── config.json'));
  console.log(ui.dim('  ├── profile.json'));
  console.log(ui.dim('  ├── sessions/'));
  console.log(ui.dim('  └── memories/'));
  console.log();

  if (!name) {
    ui.step(`Set your name in ${ui.cyan('.tael/profile.json')} (no git user.name found).`);
  }
  ui.step(`Next: run ${ui.bold('tael sync')} to capture your current work.`);
}

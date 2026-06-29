import {
  getActiveProject,
  listBugs,
  listFeatures,
  listProjects,
  listSyncedSessions,
  loadConfig,
} from '@tael/core';
import { ui } from '../ui.js';

export async function statusCommand(): Promise<void> {
  const [config, projects, active] = await Promise.all([
    loadConfig(),
    listProjects(),
    getActiveProject(),
  ]);

  console.log(ui.bold('Tael'));
  console.log(`  provider   ${config.provider ?? ui.dim('(none)')}`);
  console.log(`  model      ${config.model ?? ui.dim('(none)')}`);
  console.log(
    `  summaries  ${config.summaryModel ?? `${config.model ?? '(none)'} ${ui.dim('(same as chat)')}`}`,
  );
  console.log(`  api key    ${config.hasKey ? ui.cyan('configured') : ui.dim('missing')}`);
  console.log(`  projects   ${projects.length}`);

  if (!active) {
    console.log(`  active     ${ui.dim('none — run `tael use <project>`')}`);
    return;
  }

  const [features, bugs, sessions] = await Promise.all([
    listFeatures(active.id),
    listBugs(active.id),
    listSyncedSessions(active.id),
  ]);
  const openFeatures = features.filter((f) => f.status === 'open').length;
  const openBugs = bugs.filter((b) => b.status === 'open').length;

  console.log();
  console.log(`  ${ui.cyan('●')} ${ui.bold(active.name)} ${ui.dim(`(${active.id})`)}`);
  if (active.repoPath) {
    console.log(`    repo      ${ui.dim(active.repoPath)}`);
  }
  console.log(`    features  ${openFeatures} open / ${features.length} total`);
  console.log(`    bugs      ${openBugs} open / ${bugs.length} total`);
  console.log(`    sessions  ${sessions.length} synced`);
}

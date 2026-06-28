import { buildContinueContext, getLatestSession, loadWorkspace, readProfile } from '@tael/core';
import { ui } from '../ui.js';

export async function continueCommand(): Promise<void> {
  const workspace = loadWorkspace(process.cwd());
  const [profile, session] = await Promise.all([
    readProfile(workspace),
    getLatestSession(workspace),
  ]);

  if (!session) {
    ui.warn('No sessions yet — run `tael sync` first for richer context.');
  }

  const context = buildContinueContext({ profile, session });

  console.error(ui.dim('─── copy below into Claude / Cursor ───'));
  console.log(context);
  console.error(ui.dim('───────────────────────────────────────'));
}

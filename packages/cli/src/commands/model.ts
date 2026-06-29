import { DEFAULT_SUMMARY_MODELS, loadConfig, updateCredentials } from '@tael/core';
import { ui } from '../ui.js';

export interface ModelCommandOptions {
  summary?: string;
}

export async function modelCommand(
  name: string | undefined,
  options: ModelCommandOptions,
): Promise<void> {
  const config = await loadConfig();
  if (!config.provider) {
    ui.error('No provider configured. Run `tael login` first.');
    process.exitCode = 1;
    return;
  }

  if (!name && !options.summary) {
    ui.info(`Chat model: ${ui.bold(config.model ?? '(unset)')}`);
    ui.step(
      `Summaries:  ${config.summaryModel ? ui.bold(config.summaryModel) : `${config.model ?? '(unset)'} ${ui.dim('(same as chat)')}`}`,
    );
    if (!config.summaryModel) {
      const suggested = DEFAULT_SUMMARY_MODELS[config.provider];
      ui.step(`Tip: cheaper summaries — ${ui.bold(`tael model --summary ${suggested}`)}`);
    }
    return;
  }

  const patch: { model?: string; summaryModel?: string } = {};
  if (name) patch.model = name;
  if (options.summary) patch.summaryModel = options.summary;
  await updateCredentials(patch);

  if (patch.model) ui.success(`Chat model set to ${ui.bold(patch.model)}`);
  if (patch.summaryModel) ui.success(`Summary model set to ${ui.bold(patch.summaryModel)}`);
}

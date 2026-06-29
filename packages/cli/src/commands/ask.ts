import ora from 'ora';
import { ask, loadWorkspace } from '@tael/core';
import { ui } from '../ui.js';

export interface AskCommandOptions {
  maxTokens?: number;
  temperature?: number;
}

export async function askCommand(parts: string[], options: AskCommandOptions): Promise<void> {
  const question = parts.join(' ').trim();
  if (!question) {
    ui.error('Ask a question, e.g. `tael ask "what was I working on?"`');
    process.exitCode = 1;
    return;
  }

  const workspace = loadWorkspace(process.cwd());

  const spinner = ora('Thinking').start();
  try {
    const response = await ask(workspace, question, {
      maxTokens: options.maxTokens,
      temperature: options.temperature,
    });
    spinner.stop();
    console.log(response.content);
    console.error(ui.dim(`\n— ${response.model}`));
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

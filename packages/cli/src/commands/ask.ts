import ora from 'ora';
import { ask } from '@tael/core';
import { ui } from '../ui.js';

export interface AskCommandOptions {
  maxTokens?: number;
  temperature?: number;
}

export async function askCommand(parts: string[], options: AskCommandOptions): Promise<void> {
  const question = parts.join(' ').trim();
  if (!question) {
    ui.error('Ask a question, e.g. `tael ask "what should I work on next?"`');
    process.exitCode = 1;
    return;
  }

  const spinner = ora({ text: 'Thinking', color: 'blue' }).start();
  try {
    const response = await ask(question, {
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

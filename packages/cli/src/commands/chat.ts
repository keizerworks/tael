import { createInterface } from 'node:readline';
import chalk from 'chalk';
import ora from 'ora';
import {
  ChatSession,
  listContexts,
  loadWorkspace,
  parseMentions,
  type Workspace,
} from '@tael/core';
import { ui } from '../ui.js';
import { renderMarkdown } from '../markdown.js';

const PROMPT = `${chalk.bgBlue.whiteBright(' › ')} `;

function printHelp(): void {
  console.log(ui.dim('  /help      show this help'));
  console.log(ui.dim('  /contexts  list the contexts Tael is using'));
  console.log(ui.dim('  @id        mention a context (Tab to complete)'));
  console.log(ui.dim('  /exit      quit (or Ctrl-C)'));
}

async function printContexts(workspace: Workspace): Promise<void> {
  const contexts = await listContexts(workspace);
  if (contexts.length === 0) {
    console.log(ui.dim('  (no contexts yet — add one with `tael context add`)'));
    return;
  }
  for (const context of contexts) {
    console.log(`  ${chalk.blueBright(`@${context.id}`)} ${ui.dim(`· ${context.title}`)}`);
  }
}

function makeCompleter(ids: string[]) {
  return (line: string): [string[], string] => {
    const match = line.match(/@([a-z0-9-]*)$/);
    if (!match) {
      return [[], line];
    }
    const fragment = match[1] ?? '';
    const prefix = line.slice(0, line.length - fragment.length - 1);
    const hits = ids.filter((id) => id.startsWith(fragment)).map((id) => `${prefix}@${id}`);
    return [hits, line];
  };
}

export async function chatCommand(): Promise<void> {
  const workspace = loadWorkspace(process.cwd());
  const chat = await ChatSession.create(workspace);
  const contextIds = (await listContexts(workspace)).map((context) => context.id);

  console.log(
    `\n${chalk.blueBright.bold('  Tael')} ${ui.dim(`· ${chat.modelName} · /help · @mention · /exit`)}`,
  );
  console.log(ui.dim('  ────────────────────────────────────────'));

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT,
    completer: makeCompleter(contextIds),
  });
  rl.prompt();

  rl.on('line', (input) => {
    const line = input.trim();

    if (!line) {
      rl.prompt();
      return;
    }
    if (line === '/exit' || line === '/quit') {
      rl.close();
      return;
    }
    if (line === '/help') {
      printHelp();
      rl.prompt();
      return;
    }
    if (line === '/contexts') {
      void printContexts(workspace).then(() => rl.prompt());
      return;
    }

    const mentioned = parseMentions(line).filter((id) => contextIds.includes(id));
    let message = line;
    if (mentioned.length > 0) {
      console.log(chalk.dim(`  ↳ focusing: ${mentioned.map((id) => `@${id}`).join(', ')}`));
      message = `${line}\n\n[The user specifically referenced these contexts: ${mentioned.join(
        ', ',
      )}. Prioritise them in your answer.]`;
    }

    rl.pause();
    const spinner = ora({ text: 'Thinking', color: 'blue', discardStdin: false }).start();
    chat
      .send(message)
      .then((answer) => {
        spinner.stop();
        console.log(`\n${renderMarkdown(answer)}\n`);
      })
      .catch((error: unknown) => {
        spinner.stop();
        ui.error(error instanceof Error ? error.message : String(error));
      })
      .finally(() => {
        rl.resume();
        rl.prompt();
      });
  });

  await new Promise<void>((resolve) => {
    rl.on('close', () => {
      console.log(ui.dim('\nBye.'));
      resolve();
    });
  });
}

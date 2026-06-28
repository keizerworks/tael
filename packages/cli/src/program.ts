import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { syncCommand } from './commands/sync.js';
import { continueCommand } from './commands/continue.js';

const VERSION = '0.1.0';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('tael')
    .description('Persistent context for humans and AI.')
    .version(VERSION, '-v, --version');

  program
    .command('init')
    .description('Create a .tael workspace in the current directory')
    .option('-n, --name <name>', 'your name (defaults to git user.name)')
    .option('-p, --project <project>', 'current project name (defaults to folder name)')
    .option('-f, --force', 'overwrite an existing workspace')
    .action(initCommand);

  program
    .command('sync')
    .description('Capture the current Git context as a session snapshot')
    .option('-s, --summary <summary>', 'a short note about what this session is about')
    .option('-c, --commits <number>', 'number of recent commits to capture', (value) =>
      Number.parseInt(value, 10),
    )
    .action(syncCommand);

  program
    .command('continue')
    .description('Print pasteable context to hand to your AI assistant')
    .action(continueCommand);

  return program;
}

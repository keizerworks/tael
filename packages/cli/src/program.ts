import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { syncCommand } from './commands/sync.js';
import { continueCommand } from './commands/continue.js';
import { loginCommand } from './commands/login.js';
import { askCommand } from './commands/ask.js';
import { contextAddCommand, contextListCommand, contextShowCommand } from './commands/context.js';
import { chatCommand } from './commands/chat.js';
import { projectAddCommand, projectListCommand } from './commands/project.js';
import { useCommand } from './commands/use.js';
import { feature } from './commands/feature.js';
import { bug } from './commands/bug.js';

const VERSION = '0.1.0';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('tael')
    .description('Persistent context for humans and AI.')
    .version(VERSION, '-v, --version');

  program
    .command('chat', { isDefault: true })
    .description('Open an interactive chat that already knows your context')
    .action(chatCommand);

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

  program
    .command('login')
    .description('Configure your model provider and API key')
    .option('-p, --provider <provider>', 'provider: anthropic | openai', 'anthropic')
    .option('-m, --model <model>', 'model id (defaults per provider)')
    .option('-k, --key <key>', 'API key (omit to use the provider env var)')
    .action(loginCommand);

  program
    .command('ask')
    .description('Ask anything; answered with your context via your model')
    .argument('<question...>', 'your question')
    .option('--max-tokens <number>', 'max tokens in the response', (value) =>
      Number.parseInt(value, 10),
    )
    .option('--temperature <number>', 'sampling temperature', (value) => Number.parseFloat(value))
    .action(askCommand);

  const context = program.command('context').description('Manage your context store');

  context
    .command('add')
    .description('Add a context (title + description + body)')
    .argument('<title...>', 'context title')
    .option('-d, --description <text>', 'short description')
    .option('-b, --body <text>', 'body content')
    .option('-f, --file <path>', 'read the body from a file')
    .action(contextAddCommand);

  context.command('list').alias('ls').description('List your contexts').action(contextListCommand);

  context
    .command('show')
    .description('Show a context by id')
    .argument('<id>', 'context id')
    .action(contextShowCommand);

  const project = program.command('project').description('Manage projects');
  project
    .command('add')
    .description('Create a new project')
    .argument('<name...>', 'project name')
    .option('-d, --description <text>', 'short description')
    .action(projectAddCommand);
  project
    .command('list')
    .alias('ls')
    .description('List projects (● marks the active one)')
    .action(projectListCommand);

  program
    .command('use')
    .description('Set the active project for your work')
    .argument('<project>', 'project id')
    .action(useCommand);

  const featureCmd = program.command('feature').description('Track features on the active project');
  featureCmd
    .command('add')
    .description('Add a feature')
    .argument('<title...>', 'feature title')
    .action((parts: string[]) => feature.add(parts));
  featureCmd
    .command('list', { isDefault: true })
    .description('List features')
    .action(() => feature.list());
  featureCmd
    .command('done')
    .description('Mark a feature complete')
    .argument('<id>', 'feature id')
    .action((id: string) => feature.done(id));

  const bugCmd = program.command('bug').description('Track bugs on the active project');
  bugCmd
    .command('add')
    .description('Add a bug')
    .argument('<title...>', 'bug title')
    .action((parts: string[]) => bug.add(parts));
  bugCmd
    .command('list', { isDefault: true })
    .description('List bugs')
    .action(() => bug.list());
  bugCmd
    .command('done')
    .description('Mark a bug complete')
    .argument('<id>', 'bug id')
    .action((id: string) => bug.done(id));

  return program;
}

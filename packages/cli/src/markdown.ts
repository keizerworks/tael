import chalk from 'chalk';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

marked.use(
  markedTerminal({
    firstHeading: chalk.blueBright.bold,
    heading: chalk.blue.bold,
    strong: chalk.bold,
    em: chalk.italic,
    codespan: chalk.cyan,
    code: chalk.cyan,
    blockquote: chalk.dim.italic,
    link: chalk.blueBright.underline,
    href: chalk.blueBright.underline,
    listitem: chalk.reset,
  }) as Parameters<typeof marked.use>[0],
);

export function renderMarkdown(md: string): string {
  return String(marked.parse(md)).trimEnd();
}

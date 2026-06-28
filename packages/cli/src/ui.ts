import chalk from 'chalk';

export const ui = {
  success: (msg: string) => console.log(`${chalk.green('✔')} ${msg}`),
  info: (msg: string) => console.log(`${chalk.cyan('ℹ')} ${msg}`),
  warn: (msg: string) => console.log(`${chalk.yellow('⚠')} ${msg}`),
  error: (msg: string) => console.error(`${chalk.red('✖')} ${msg}`),
  step: (msg: string) => console.log(`${chalk.dim('›')} ${msg}`),
  dim: (msg: string) => chalk.dim(msg),
  bold: (msg: string) => chalk.bold(msg),
  cyan: (msg: string) => chalk.cyan(msg),
};

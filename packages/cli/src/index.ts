import { TaelError } from '@tael/core';
import { createProgram } from './program.js';
import { ui } from './ui.js';

async function main(): Promise<void> {
  const program = createProgram();
  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  if (error instanceof TaelError) {
    ui.error(error.message);
  } else if (error instanceof Error) {
    ui.error(error.message);
  } else {
    ui.error('An unexpected error occurred.');
  }
  process.exitCode = 1;
});

import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export async function confirm(question: string, defaultYes = false): Promise<boolean> {
  if (!input.isTTY) {
    return defaultYes;
  }

  const rl = createInterface({ input, output });
  try {
    const answer = (await rl.question(`${question} ${defaultYes ? '[Y/n]' : '[y/N]'} `))
      .trim()
      .toLowerCase();
    if (!answer) return defaultYes;
    return answer === 'y' || answer === 'yes';
  } finally {
    rl.close();
  }
}

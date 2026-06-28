import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { GitCommit } from '@tael/types';
import { DEFAULT_COMMIT_LIMIT, WORKSPACE_DIR } from './constants.js';

const exec = promisify(execFile);

const UNIT = '\x1f';
const RECORD = '\x1e';

async function runGit(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await exec('git', args, { cwd, maxBuffer: 10 * 1024 * 1024 });
  return stdout.trim();
}

export async function isGitRepository(cwd: string): Promise<boolean> {
  try {
    return (await runGit(cwd, ['rev-parse', '--is-inside-work-tree'])) === 'true';
  } catch {
    return false;
  }
}

export async function getCurrentBranch(cwd: string): Promise<string | null> {
  const branch = await runGit(cwd, ['branch', '--show-current']);
  return branch === '' ? null : branch;
}

export async function getGitUserName(cwd: string): Promise<string | null> {
  try {
    const name = await runGit(cwd, ['config', 'user.name']);
    return name === '' ? null : name;
  } catch {
    return null;
  }
}

export async function getRecentCommits(
  cwd: string,
  limit: number = DEFAULT_COMMIT_LIMIT,
): Promise<GitCommit[]> {
  const format = ['%h', '%s', '%an', '%aI'].join(UNIT) + RECORD;
  const stdout = await runGit(cwd, ['log', `-n${limit}`, `--pretty=format:${format}`]);
  if (stdout === '') {
    return [];
  }

  return stdout
    .split(RECORD)
    .map((record) => record.trim())
    .filter((record) => record.length > 0)
    .map((record) => {
      const [hash = '', message = '', author = '', date = ''] = record.split(UNIT);
      return { hash, message, author, date };
    });
}

export async function getChangedFiles(cwd: string): Promise<string[]> {
  const stdout = await runGit(cwd, ['status', '--porcelain']);
  if (stdout === '') {
    return [];
  }

  return stdout
    .split('\n')
    .map((line) => {
      const entry = line.slice(3);
      const arrow = entry.indexOf(' -> ');
      return arrow === -1 ? entry : entry.slice(arrow + 4);
    })
    .filter((path) => path !== `${WORKSPACE_DIR}/` && !path.startsWith(`${WORKSPACE_DIR}/`));
}

export interface GitContext {
  branch: string | null;
  recentCommits: GitCommit[];
  changedFiles: string[];
}

export async function collectGitContext(
  cwd: string,
  commitLimit: number = DEFAULT_COMMIT_LIMIT,
): Promise<GitContext> {
  if (!(await isGitRepository(cwd))) {
    return { branch: null, recentCommits: [], changedFiles: [] };
  }

  const [branch, recentCommits, changedFiles] = await Promise.all([
    getCurrentBranch(cwd),
    getRecentCommits(cwd, commitLimit),
    getChangedFiles(cwd),
  ]);

  return { branch, recentCommits, changedFiles };
}

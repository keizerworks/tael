import { existsSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import type { Config, Profile } from '@tael/types';
import { WORKSPACE_VERSION } from './constants.js';
import { WorkspaceExistsError, WorkspaceNotFoundError } from './errors.js';
import { readJson, writeJson } from './fs-json.js';
import { findWorkspaceRoot, resolveWorkspacePaths, type WorkspacePaths } from './paths.js';

export interface InitOptions {
  name?: string;
  currentProject?: string;
  goals?: string[];
  force?: boolean;
}

export interface Workspace {
  root: string;
  paths: WorkspacePaths;
}

export function isInitialized(root: string): boolean {
  return existsSync(resolveWorkspacePaths(root).config);
}

export async function initWorkspace(root: string, options: InitOptions = {}): Promise<Workspace> {
  const paths = resolveWorkspacePaths(root);

  if (existsSync(paths.dir)) {
    if (!options.force) {
      throw new WorkspaceExistsError(paths.dir);
    }
    await rm(paths.dir, { recursive: true, force: true });
  }

  await mkdir(paths.sessions, { recursive: true });
  await mkdir(paths.memories, { recursive: true });
  await mkdir(paths.contexts, { recursive: true });

  const config: Config = {
    version: WORKSPACE_VERSION,
    createdAt: new Date().toISOString(),
  };

  const profile: Profile = {
    name: options.name ?? '',
    currentProject: options.currentProject ?? '',
    goals: options.goals ?? [],
  };

  await writeJson(paths.config, config);
  await writeJson(paths.profile, profile);

  return { root, paths };
}

export function loadWorkspace(startDir: string): Workspace {
  const root = findWorkspaceRoot(startDir);
  if (!root) {
    throw new WorkspaceNotFoundError(startDir);
  }
  return { root, paths: resolveWorkspacePaths(root) };
}

export function readConfig(workspace: Workspace): Promise<Config> {
  return readJson<Config>(workspace.paths.config);
}

export function readProfile(workspace: Workspace): Promise<Profile> {
  return readJson<Profile>(workspace.paths.profile);
}

export function writeProfile(workspace: Workspace, profile: Profile): Promise<void> {
  return writeJson(workspace.paths.profile, profile);
}

import { existsSync } from 'node:fs';
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Bug, Feature, ItemStatus, Project, TaelState, TrackedItem } from '@tael/types';
import { slugify } from './context-store.js';
import { TaelError } from './errors.js';
import { readJson, writeJson } from './fs-json.js';
import { projectDir, projectsDir, statePath } from './global-store.js';

export class ProjectExistsError extends TaelError {
  override name = 'ProjectExistsError';
  constructor(public readonly id: string) {
    super(`A project "${id}" already exists.`);
  }
}

export class ProjectNotFoundError extends TaelError {
  override name = 'ProjectNotFoundError';
  constructor(public readonly id: string) {
    super(`No project "${id}". Run \`tael project list\` to see your projects.`);
  }
}

export class NoActiveProjectError extends TaelError {
  override name = 'NoActiveProjectError';
  constructor() {
    super('No active project. Run `tael use <project>` (or `tael project add "<name>"`).');
  }
}

function projectFile(id: string): string {
  return join(projectDir(id), 'project.json');
}

export async function readState(): Promise<TaelState> {
  try {
    return await readJson<TaelState>(statePath());
  } catch {
    return { activeProject: null };
  }
}

export async function setActiveProject(id: string): Promise<void> {
  await writeJson(statePath(), { activeProject: id } satisfies TaelState);
}

export interface CreateProjectInput {
  description?: string;
  repoPath?: string;
}

export async function createProject(
  name: string,
  input: CreateProjectInput = {},
): Promise<Project> {
  const id = slugify(name);
  if (existsSync(projectFile(id))) {
    throw new ProjectExistsError(id);
  }

  const project: Project = {
    id,
    name: name.trim(),
    description: input.description?.trim() ?? '',
    repoPath: input.repoPath ?? null,
    createdAt: new Date().toISOString(),
  };

  await mkdir(projectDir(id), { recursive: true });
  await writeJson(projectFile(id), project);
  return project;
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    return await readJson<Project>(projectFile(id));
  } catch {
    return null;
  }
}

export async function setProjectRepo(id: string, repoPath: string | null): Promise<Project> {
  const project = await getProject(id);
  if (!project) {
    throw new ProjectNotFoundError(id);
  }
  const updated: Project = { ...project, repoPath };
  await writeJson(projectFile(id), updated);
  return updated;
}

export async function listProjects(): Promise<Project[]> {
  let ids: string[];
  try {
    ids = await readdir(projectsDir());
  } catch {
    return [];
  }

  const projects: Project[] = [];
  for (const id of ids) {
    const project = await getProject(id);
    if (project) {
      projects.push(project);
    }
  }
  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getActiveProject(): Promise<Project | null> {
  const { activeProject } = await readState();
  return activeProject ? getProject(activeProject) : null;
}

export async function requireActiveProject(): Promise<Project> {
  const project = await getActiveProject();
  if (!project) {
    throw new NoActiveProjectError();
  }
  return project;
}

async function readItems(projectId: string, file: string): Promise<TrackedItem[]> {
  try {
    return await readJson<TrackedItem[]>(join(projectDir(projectId), file));
  } catch {
    return [];
  }
}

function writeItems(projectId: string, file: string, items: TrackedItem[]): Promise<void> {
  return writeJson(join(projectDir(projectId), file), items);
}

function nextId(items: TrackedItem[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

async function addItem(projectId: string, file: string, title: string): Promise<TrackedItem> {
  const items = await readItems(projectId, file);
  const item: TrackedItem = {
    id: nextId(items),
    title: title.trim(),
    status: 'open',
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  items.push(item);
  await writeItems(projectId, file, items);
  return item;
}

async function setItemStatus(
  projectId: string,
  file: string,
  id: number,
  status: ItemStatus,
  label: string,
): Promise<TrackedItem> {
  const items = await readItems(projectId, file);
  const item = items.find((entry) => entry.id === id);
  if (!item) {
    throw new TaelError(`No ${label} #${id} in project "${projectId}".`);
  }
  item.status = status;
  item.completedAt = status === 'done' ? new Date().toISOString() : null;
  await writeItems(projectId, file, items);
  return item;
}

const FEATURES = 'features.json';
const BUGS = 'bugs.json';

export function listFeatures(projectId: string): Promise<Feature[]> {
  return readItems(projectId, FEATURES);
}
export function addFeature(projectId: string, title: string): Promise<Feature> {
  return addItem(projectId, FEATURES, title);
}
export function completeFeature(projectId: string, id: number): Promise<Feature> {
  return setItemStatus(projectId, FEATURES, id, 'done', 'feature');
}

export function listBugs(projectId: string): Promise<Bug[]> {
  return readItems(projectId, BUGS);
}
export function addBug(projectId: string, title: string): Promise<Bug> {
  return addItem(projectId, BUGS, title);
}
export function completeBug(projectId: string, id: number): Promise<Bug> {
  return setItemStatus(projectId, BUGS, id, 'done', 'bug');
}

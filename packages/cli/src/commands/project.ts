import { createProject, getActiveProject, listProjects, setActiveProject } from '@tael/core';
import { ui } from '../ui.js';

export interface ProjectAddOptions {
  description?: string;
}

export async function projectAddCommand(
  nameParts: string[],
  options: ProjectAddOptions,
): Promise<void> {
  const name = nameParts.join(' ').trim();
  if (!name) {
    ui.error('Give the project a name, e.g. `tael project add "Tael"`');
    process.exitCode = 1;
    return;
  }

  const project = await createProject(name, { description: options.description });
  ui.success(`Created project ${ui.bold(project.name)} ${ui.dim(`(${project.id})`)}`);

  if (!(await getActiveProject())) {
    await setActiveProject(project.id);
    ui.step('Set as your active project.');
  } else {
    ui.step(`Switch to it with ${ui.bold(`tael use ${project.id}`)}.`);
  }
}

export async function projectListCommand(): Promise<void> {
  const [projects, active] = await Promise.all([listProjects(), getActiveProject()]);

  if (projects.length === 0) {
    ui.warn('No projects yet. Add one with `tael project add "Name"`.');
    return;
  }

  for (const project of projects) {
    const marker = active?.id === project.id ? ui.cyan('●') : ' ';
    console.log(`${marker} ${ui.bold(project.name)} ${ui.dim(`(${project.id})`)}`);
    if (project.description) {
      console.log(`   ${ui.dim(project.description)}`);
    }
  }
}

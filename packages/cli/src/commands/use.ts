import { getProject, setActiveProject } from '@tael/core';
import { ui } from '../ui.js';

export async function useCommand(id: string): Promise<void> {
  const project = await getProject(id);
  if (!project) {
    ui.error(`No project "${id}". Run \`tael project list\` to see your projects.`);
    process.exitCode = 1;
    return;
  }

  await setActiveProject(project.id);
  ui.success(`Now using ${ui.bold(project.name)} ${ui.dim(`(${project.id})`)}`);
}

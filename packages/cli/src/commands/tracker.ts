import { requireActiveProject } from '@tael/core';
import type { TrackedItem } from '@tael/types';
import { ui } from '../ui.js';

export interface TrackerOps {
  label: string;
  add: (projectId: string, title: string) => Promise<TrackedItem>;
  list: (projectId: string) => Promise<TrackedItem[]>;
  complete: (projectId: string, id: number) => Promise<TrackedItem>;
}

export interface TrackerCommands {
  add: (parts: string[]) => Promise<void>;
  list: () => Promise<void>;
  done: (id: string) => Promise<void>;
}

export function makeTrackerCommands(ops: TrackerOps): TrackerCommands {
  return {
    async add(parts) {
      const title = parts.join(' ').trim();
      if (!title) {
        ui.error(`Give the ${ops.label} a title, e.g. \`tael ${ops.label} add "..."\``);
        process.exitCode = 1;
        return;
      }
      const project = await requireActiveProject();
      const item = await ops.add(project.id, title);
      ui.success(
        `Added ${ops.label} ${ui.dim(`#${item.id}`)} to ${ui.bold(project.name)}: ${title}`,
      );
    },

    async list() {
      const project = await requireActiveProject();
      const items = await ops.list(project.id);
      if (items.length === 0) {
        ui.warn(
          `No ${ops.label}s in ${project.name} yet. Add one with \`tael ${ops.label} add "..."\`.`,
        );
        return;
      }
      const open = items.filter((item) => item.status === 'open').length;
      console.log(ui.dim(`${project.name} · ${ops.label}s · ${open} open / ${items.length} total`));
      for (const item of items) {
        const box = item.status === 'done' ? ui.cyan('[x]') : '[ ]';
        const title = item.status === 'done' ? ui.dim(item.title) : item.title;
        console.log(`  ${box} ${ui.dim(`#${item.id}`)} ${title}`);
      }
    },

    async done(id) {
      const numeric = Number.parseInt(id, 10);
      if (Number.isNaN(numeric)) {
        ui.error(`"${id}" is not a valid id.`);
        process.exitCode = 1;
        return;
      }
      const project = await requireActiveProject();
      const item = await ops.complete(project.id, numeric);
      ui.success(`Completed ${ops.label} ${ui.dim(`#${item.id}`)}: ${item.title}`);
    },
  };
}

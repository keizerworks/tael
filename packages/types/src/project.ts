export type ItemStatus = 'open' | 'done';

export interface Project {
  id: string;
  name: string;
  description: string;
  repoPath: string | null;
  createdAt: string;
}

export interface TrackedItem {
  id: number;
  title: string;
  status: ItemStatus;
  createdAt: string;
  completedAt: string | null;
}

export type Feature = TrackedItem;
export type Bug = TrackedItem;

export interface TaelState {
  activeProject: string | null;
}

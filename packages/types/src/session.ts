export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface Session {
  id: string;
  timestamp: string;
  branch: string | null;
  recentCommits: GitCommit[];
  changedFiles: string[];
  summary: string;
}

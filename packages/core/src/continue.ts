import type { Profile, Session } from '@tael/types';

export interface ContinueInput {
  profile: Profile;
  session: Session | null;
}

export function buildContinueContext({ profile, session }: ContinueInput): string {
  const project = profile.currentProject.trim() || 'this project';
  const lines: string[] = [];

  lines.push(`Project: ${project}`);

  if (profile.goals.length > 0) {
    lines.push('', 'Goals:');
    for (const goal of profile.goals) {
      lines.push(`- ${goal}`);
    }
  }

  if (session) {
    if (session.recentCommits.length > 0) {
      lines.push('', 'Recent commits:');
      for (const commit of session.recentCommits) {
        lines.push(`- ${commit.message}`);
      }
    }

    if (session.branch) {
      lines.push('', `Current branch: ${session.branch}`);
    }

    if (session.changedFiles.length > 0) {
      lines.push('', 'Uncommitted changes:');
      for (const file of session.changedFiles) {
        lines.push(`- ${file}`);
      }
    }

    if (session.summary.trim()) {
      lines.push('', 'Summary:', session.summary.trim());
    }
  }

  lines.push('', 'Suggested context:');
  lines.push(
    `Continue working on ${project}.` +
      (session?.recentCommits.length
        ? ` Most recently I worked on: ${session.recentCommits[0]?.message}.`
        : ''),
  );

  return lines.join('\n');
}

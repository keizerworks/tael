import type { Bug, ChatMessage, Feature, Project, SyncedSession } from '@tael/types';

export interface ProjectContextInput {
  profile: string;
  project: Project;
  features: Feature[];
  bugs: Bug[];
  sessions: SyncedSession[];
}

const MAX_PROMPT_SESSIONS = 5;

function renderChecklist(items: Array<Feature | Bug>): string[] {
  if (items.length === 0) {
    return ['(none yet)'];
  }
  return items.map((item) => `- [${item.status === 'done' ? 'x' : ' '}] #${item.id} ${item.title}`);
}

export function buildProjectPrompt({
  profile,
  project,
  features,
  bugs,
  sessions,
}: ProjectContextInput): string {
  const lines: string[] = [
    'You are Tael, a personal assistant that already knows the user and their projects.',
    'Answer with continuity, grounded in the project context below. Be concise and direct.',
  ];

  if (profile.trim()) {
    lines.push('', '## About the user', profile.trim());
  }

  lines.push('', `## Active project: ${project.name}`);
  if (project.description) {
    lines.push(project.description);
  }

  lines.push('', '### Features', ...renderChecklist(features));
  lines.push('', '### Bugs', ...renderChecklist(bugs));

  if (sessions.length > 0) {
    lines.push('', '## Recent sessions');
    for (const session of sessions.slice(0, MAX_PROMPT_SESSIONS)) {
      lines.push('', `### ${session.title} (${session.date.slice(0, 10)})`, session.summary.trim());
    }
  }

  return lines.join('\n');
}

export function buildProjectMessages(input: ProjectContextInput, question: string): ChatMessage[] {
  return [
    { role: 'system', content: buildProjectPrompt(input) },
    { role: 'user', content: question },
  ];
}

import type { Bug, ChatMessage, Feature, Project } from '@tael/types';

export interface ProjectContextInput {
  profile: string;
  project: Project;
  features: Feature[];
  bugs: Bug[];
}

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

  return lines.join('\n');
}

export function buildProjectMessages(input: ProjectContextInput, question: string): ChatMessage[] {
  return [
    { role: 'system', content: buildProjectPrompt(input) },
    { role: 'user', content: question },
  ];
}

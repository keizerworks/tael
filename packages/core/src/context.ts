import type { ChatMessage, Context, Memory, Profile, Session } from '@tael/types';

export interface ContextInput {
  profile: Profile;
  contexts: Context[];
  session: Session | null;
  memories: Memory[];
}

export function buildSystemPrompt({ profile, contexts, session, memories }: ContextInput): string {
  const lines: string[] = [
    'You are Tael, a personal assistant that already knows the user from their stored context.',
    'Use the context below to answer with continuity, as if you have been working alongside them.',
    'Be concise and direct.',
    '',
    '## User',
    `Name: ${profile.name || 'Unknown'}`,
  ];

  if (profile.currentProject) {
    lines.push(`Current project: ${profile.currentProject}`);
  }
  if (profile.goals.length > 0) {
    lines.push('Goals:');
    for (const goal of profile.goals) {
      lines.push(`- ${goal}`);
    }
  }

  if (contexts.length > 0) {
    lines.push('', '## Context');
    for (const context of contexts) {
      lines.push('', `### ${context.title}`);
      if (context.description) {
        lines.push(context.description);
      }
      if (context.body) {
        lines.push('', context.body);
      }
    }
  }

  if (memories.length > 0) {
    lines.push('', '## Memories');
    for (const memory of memories) {
      lines.push(`- ${memory.content}`);
    }
  }

  if (session) {
    lines.push('', '## Most recent session');
    if (session.branch) {
      lines.push(`Branch: ${session.branch}`);
    }
    if (session.recentCommits.length > 0) {
      lines.push('Recent commits:');
      for (const commit of session.recentCommits) {
        lines.push(`- ${commit.message}`);
      }
    }
    if (session.changedFiles.length > 0) {
      lines.push('Uncommitted changes:');
      for (const file of session.changedFiles) {
        lines.push(`- ${file}`);
      }
    }
    if (session.summary.trim()) {
      lines.push(`Summary: ${session.summary.trim()}`);
    }
  }

  return lines.join('\n');
}

export function buildAskMessages(context: ContextInput, question: string): ChatMessage[] {
  return [
    { role: 'system', content: buildSystemPrompt(context) },
    { role: 'user', content: question },
  ];
}

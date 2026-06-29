import { ChatSession, listBugs, listFeatures, requireActiveProject } from '@tael/core';
import { runChat } from '../ui/chat-app.js';

export async function chatCommand(): Promise<void> {
  const project = await requireActiveProject();
  const [chat, features, bugs] = await Promise.all([
    ChatSession.create(),
    listFeatures(project.id),
    listBugs(project.id),
  ]);

  const mentions = [
    ...features.map((f) => ({ id: `feature-${f.id}`, title: f.title })),
    ...bugs.map((b) => ({ id: `bug-${b.id}`, title: b.title })),
  ];

  await runChat({ chat, mentions, projectName: project.name });
}

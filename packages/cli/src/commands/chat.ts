import { ChatSession, listContexts, loadWorkspace } from '@tael/core';
import { runChat } from '../ui/chat-app.js';

export async function chatCommand(): Promise<void> {
  const workspace = loadWorkspace(process.cwd());
  const [chat, contexts] = await Promise.all([
    ChatSession.create(workspace),
    listContexts(workspace),
  ]);
  await runChat({ chat, contexts });
}

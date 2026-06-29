import { addBug, addFeature, completeBug, completeFeature } from './projects.js';

export type TaelAction =
  | { action: 'add_feature'; title: string }
  | { action: 'complete_feature'; id: number }
  | { action: 'add_bug'; title: string }
  | { action: 'complete_bug'; id: number };

export interface ExecutedAction {
  ok: boolean;
  summary: string;
}

export const ACTION_INSTRUCTIONS = [
  '## Acting on the tracker',
  'When the user clearly asks you to change the project tracker, include exactly one',
  'fenced code block tagged `tael` containing a JSON array of actions, alongside your',
  'normal reply. Supported actions:',
  '- {"action":"add_feature","title":"..."}',
  '- {"action":"complete_feature","id":<number>}',
  '- {"action":"add_bug","title":"..."}',
  '- {"action":"complete_bug","id":<number>}',
  'Use the ids shown in the project context. Only emit actions the user actually',
  'requested; if no change is requested, do not include the block.',
].join('\n');

const BLOCK_RE = /```tael\s*\n([\s\S]*?)```/;

function isTaelAction(value: unknown): value is TaelAction {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  switch (candidate.action) {
    case 'add_feature':
    case 'add_bug':
      return typeof candidate.title === 'string';
    case 'complete_feature':
    case 'complete_bug':
      return typeof candidate.id === 'number';
    default:
      return false;
  }
}

export function parseActions(text: string): { actions: TaelAction[]; cleaned: string } {
  const match = text.match(BLOCK_RE);
  if (!match) {
    return { actions: [], cleaned: text.trim() };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse((match[1] ?? '').trim());
  } catch {
    return { actions: [], cleaned: text.trim() };
  }

  const list = Array.isArray(parsed) ? parsed : [parsed];
  const actions = list.filter(isTaelAction);
  const cleaned = text.replace(BLOCK_RE, '').trim();
  return { actions, cleaned };
}

export async function executeActions(
  projectId: string,
  actions: TaelAction[],
): Promise<ExecutedAction[]> {
  const results: ExecutedAction[] = [];
  for (const action of actions) {
    try {
      switch (action.action) {
        case 'add_feature': {
          const feature = await addFeature(projectId, action.title);
          results.push({ ok: true, summary: `Added feature #${feature.id}: ${feature.title}` });
          break;
        }
        case 'complete_feature': {
          const feature = await completeFeature(projectId, action.id);
          results.push({ ok: true, summary: `Completed feature #${feature.id}: ${feature.title}` });
          break;
        }
        case 'add_bug': {
          const bug = await addBug(projectId, action.title);
          results.push({ ok: true, summary: `Added bug #${bug.id}: ${bug.title}` });
          break;
        }
        case 'complete_bug': {
          const bug = await completeBug(projectId, action.id);
          results.push({ ok: true, summary: `Completed bug #${bug.id}: ${bug.title}` });
          break;
        }
      }
    } catch (error) {
      results.push({ ok: false, summary: error instanceof Error ? error.message : String(error) });
    }
  }
  return results;
}

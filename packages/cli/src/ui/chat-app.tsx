import { useState } from 'react';
import { Box, render, Static, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { parseMentions, type ChatSession } from '@tael/core';
import type { Context } from '@tael/types';
import { renderMarkdown } from '../markdown.js';

interface Message {
  role: 'user' | 'assistant' | 'error' | 'info';
  content: string;
}

interface ChatAppProps {
  chat: ChatSession;
  contexts: Context[];
}

const MENTION_RE = /@([a-z0-9-]*)$/;

const HELP = [
  '/help      show this help',
  '/contexts  list available contexts',
  '@id        mention a context (↑/↓ to choose, Tab/Enter to insert)',
  '/exit      quit (or Ctrl-C)',
].join('\n');

function MessageView({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <Box marginBottom={1}>
        <Text backgroundColor="blue" color="white">
          {' › '}
        </Text>
        <Text> {message.content}</Text>
      </Box>
    );
  }
  if (message.role === 'error') {
    return (
      <Box marginBottom={1}>
        <Text color="red">✖ {message.content}</Text>
      </Box>
    );
  }
  if (message.role === 'info') {
    return (
      <Box marginBottom={1}>
        <Text dimColor>{message.content}</Text>
      </Box>
    );
  }
  return (
    <Box marginBottom={1}>
      <Text>{renderMarkdown(message.content)}</Text>
    </Box>
  );
}

function ChatApp({ chat, contexts }: ChatAppProps) {
  const { exit } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState('');
  const [thinking, setThinking] = useState(false);
  const [selected, setSelected] = useState(0);

  const mentionMatch = value.match(MENTION_RE);
  const mentionQuery = mentionMatch ? (mentionMatch[1] ?? '') : null;
  const suggestions =
    mentionQuery !== null
      ? contexts.filter((context) => context.id.startsWith(mentionQuery)).slice(0, 6)
      : [];
  const mentionOpen = suggestions.length > 0;

  const append = (message: Message) => setMessages((prev) => [...prev, message]);

  function applyMention(id: string) {
    setValue((prev) => prev.replace(MENTION_RE, `@${id} `));
    setSelected(0);
  }

  async function submit(text: string) {
    const question = text.trim();
    if (!question) return;

    if (question === '/exit' || question === '/quit') {
      exit();
      return;
    }

    setValue('');

    if (question === '/help') {
      append({ role: 'info', content: HELP });
      return;
    }
    if (question === '/contexts') {
      const list = contexts.length
        ? contexts.map((c) => `@${c.id} · ${c.title}`).join('\n')
        : '(no contexts yet — add one with `tael context add`)';
      append({ role: 'info', content: list });
      return;
    }

    append({ role: 'user', content: question });
    setThinking(true);
    try {
      const mentioned = parseMentions(question).filter((id) =>
        contexts.some((context) => context.id === id),
      );
      const message = mentioned.length
        ? `${question}\n\n[The user referenced these contexts: ${mentioned.join(', ')}. Prioritise them.]`
        : question;
      const answer = await chat.send(message);
      append({ role: 'assistant', content: answer });
    } catch (error) {
      append({ role: 'error', content: error instanceof Error ? error.message : String(error) });
    } finally {
      setThinking(false);
    }
  }

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
      return;
    }
    if (thinking) return;

    if (mentionOpen) {
      if (key.upArrow) {
        setSelected((i) => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (key.downArrow) {
        setSelected((i) => (i + 1) % suggestions.length);
        return;
      }
      if (key.tab || key.return) {
        const choice = suggestions[selected];
        if (choice) applyMention(choice.id);
        return;
      }
      if (key.escape) {
        setValue((prev) => prev.replace(MENTION_RE, ''));
        return;
      }
    }

    if (key.return) {
      void submit(value);
      return;
    }
    if (key.backspace || key.delete) {
      setValue((prev) => prev.slice(0, -1));
      return;
    }
    if (input && !key.ctrl && !key.meta && !key.tab) {
      setValue((prev) => prev + input);
    }
  });

  return (
    <>
      <Static items={messages}>{(message, i) => <MessageView key={i} message={message} />}</Static>

      <Box flexDirection="column">
        {thinking && (
          <Box marginBottom={1}>
            <Text color="blue">
              <Spinner type="dots" />
            </Text>
            <Text dimColor> thinking…</Text>
          </Box>
        )}

        <Box borderStyle="round" borderColor="blue" paddingX={1}>
          <Text color="blueBright">{'› '}</Text>
          <Text>{value}</Text>
          <Text color="blueBright">▋</Text>
        </Box>

        {mentionOpen ? (
          <Box flexDirection="column" marginLeft={2}>
            {suggestions.map((context, i) => (
              <Text
                key={context.id}
                inverse={i === selected}
                color={i === selected ? 'blue' : undefined}
              >
                {` @${context.id} `}
                <Text dimColor>· {context.title}</Text>
              </Text>
            ))}
          </Box>
        ) : (
          <Text dimColor> /help · @mention · /exit</Text>
        )}
      </Box>
    </>
  );
}

export async function runChat(props: ChatAppProps): Promise<void> {
  const app = render(<ChatApp {...props} />);
  await app.waitUntilExit();
}

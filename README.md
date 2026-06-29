<h1 align="center">Tael</h1>

<p align="center">
  Persistent context for humans and AI. Never start an AI session from scratch again.
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/keizerworks/tael?style=flat-square&color=111111&label=stars" alt="Stars">
  <img src="https://img.shields.io/badge/license-AGPL--3.0-111111?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/node-%E2%89%A5%2020-111111?style=flat-square" alt="Node >= 20">
  <img src="https://img.shields.io/badge/TypeScript-strict-111111?style=flat-square" alt="TypeScript">
  <img src="https://img.shields.io/badge/works%20with-Claude%20%C2%B7%20Codex-111111?style=flat-square" alt="Works with Claude and Codex">
</p>

<p align="center">
  <strong>Git versions your code. Tael versions how you built it.</strong>
</p>

---

Tael is a persistent context layer for humans and AI.

Modern AI tools work in silos. Claude remembers Claude sessions, Codex remembers Codex sessions, and every new conversation starts from zero. Important decisions, architectural discussions, and project history become fragmented across chat windows.

Tael brings that context together.

It captures your AI sessions, project decisions, tracked work, and development history, turning them into a unified memory you can carry across tools, sessions, and machines.

## Why Tael?

Developers constantly repeat themselves:

- What are we building?
- Why did we choose this architecture?
- What have we already tried?
- What should we work on next?
- Where did we leave off?

The context already exists, but it is scattered across:

- AI conversations
- Git commits
- Notes and documents
- Terminal sessions
- Project management tools

Tael creates a shared memory layer across all of them.

## Before / After

You build the backend with Claude and the frontend with Codex.

A week later you return to the project and half the decisions are a mystery. The reasoning lived inside chat sessions scattered across multiple tools, or disappeared when the session ended.

With Tael:

```text
$ tael sync
Synced 3 new sessions into My App.

$ tael
Tael · My App · claude-sonnet-4

> where did I leave off, and what's next?
```

The chat answers using the summarized history of every session, recent work, tracked features, and known bugs.

Switch tools, close the laptop, come back tomorrow — your context remains intact.

## How It Works

```text
1. Work in your favorite AI tool
   Claude, Codex, Cursor, and more.

2. Sync your sessions
   $ tael sync

3. Track features and bugs
   $ tael feature add "checkout flow"

4. Continue anywhere
   $ tael

5. Ask questions or resume work
   "What did we decide about authentication?"
```

Tael reads the session logs your AI tools already maintain, summarizes new conversations, and stores them as durable project memory.

The memory is:

- Small enough to fit into model context windows.
- Durable enough to outlive any single chat session.
- Portable across tools and machines.

## Features

- Persistent project memory
- Cross-tool AI session history
- Local-first storage
- Interactive project-aware chat
- Feature and bug tracking
- Session summarization
- Semantic project context
- Human-readable storage
- Bring your own model and API key

## Install

Tael is currently under active development.

Requirements:

- Node.js 20+
- pnpm

Clone and build from source:

```bash
git clone https://github.com/keizerworks/tael
cd tael

pnpm install
pnpm build
```

You can then run the CLI locally:

```bash
node packages/cli/dist/index.js
```

Optionally create an alias:

```bash
alias tael="node $(pwd)/packages/cli/dist/index.js"
```

## Quick Start

Initialize Tael:

```bash
tael init
```

Create a project:

```bash
tael project add "Student Intelligence"
tael use student-intelligence
```

Track your work:

```bash
tael feature add "voice learning"
tael bug add "login redirect issue"
```

Import AI sessions:

```bash
tael sync
```

Open the project-aware chat:

```bash
tael
```

Ask questions:

```text
> where did I leave off?
> what architectural decisions have we made?
> what's the highest priority task?
```

## Commands

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `tael`              | Open the interactive chat        |
| `tael init`         | Initialize Tael locally          |
| `tael sync`         | Import and summarize AI sessions |
| `tael status`       | Show current project status      |
| `tael project add`  | Create a project                 |
| `tael use`          | Switch active project            |
| `tael feature`      | Manage project features          |
| `tael bug`          | Manage bugs                      |
| `tael session list` | Browse synced sessions           |
| `tael ask`          | Ask a project-aware question     |

## Storage

Tael stores everything locally in a human-readable format.

```text
~/.tael/
├── profile.md
├── state.json
├── projects/
│   └── my-project/
│       ├── project.json
│       ├── features.json
│       ├── bugs.json
│       └── sessions/
│           ├── session-1.md
│           └── session-2.md
└── config.json
```

Your memory belongs to you.

No proprietary formats. No vendor lock-in.

## License

Licensed under AGPL-3.0.

## Star History

<a href="https://star-history.com/#keizerworks/tael&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=keizerworks/tael&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=keizerworks/tael&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=keizerworks/tael&type=Date" />
  </picture>
</a>

# Tael

> Persistent context for humans and AI. Never start an AI session from scratch again.

Tael captures the context of your work — your project, your goals, and what you've
been doing in Git — and turns it into a snapshot you can hand straight to an AI
assistant like Claude or Cursor. Stop re-explaining your project at the start of
every session.

## Why

Every new AI chat starts cold. You paste the same background, re-describe the same
architecture, and re-state what you were doing yesterday. Tael remembers it for you
and hands the assistant a ready-to-paste briefing.

## Install

> Not yet published to npm. For local development, see [Development](#development).

```bash
# (coming soon)
npm install -g @tael/cli
```

## Quick start

```bash
# 1. Create a .tael/ workspace in your project
tael init

# 2. Snapshot your current Git context as a session
tael sync

# 3. Get pasteable context to hand to your AI assistant
tael continue
```

`tael continue` prints something you paste directly into Claude / Cursor:

```md
Project: Student Intelligence

Recent commits:

- Added voice runtime
- Added cognition engine

Current branch: feat/voice

Suggested context:
Continue working on Student Intelligence. Previously we implemented...
```

## How it works

`tael init` creates a local, human-readable workspace:

```text
.tael/
├── config.json      # workspace metadata (version, created date)
├── profile.json     # who you are, current project, goals
├── sessions/        # one JSON snapshot per `tael sync`
└── memories/        # durable notes (future)
```

Everything is plain JSON on disk — diffable, committable, and yours.

## Monorepo layout

```text
tael/
├── apps/
│   └── web/          # future web dashboard (v0.4)
└── packages/
    ├── cli/          # @tael/cli  — the `tael` command (thin presentation layer)
    ├── core/         # @tael/core — all workspace, git & session logic
    └── types/        # @tael/types — shared on-disk type contracts
```

## Development

Requires Node >= 20 and pnpm.

```bash
pnpm install          # install all workspace deps
pnpm build            # build every package (via turbo)
pnpm dev              # watch-build every package
pnpm typecheck        # type-check the workspace
pnpm test             # run tests

# Run the freshly built CLI without publishing:
node packages/cli/dist/index.js init
```

See [`docs/roadmap.md`](docs/roadmap.md) for what's next.

## License

[AGPL-3.0-only](LICENSE)

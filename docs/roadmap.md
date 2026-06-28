# Tael Roadmap

> **North star:** Never start an AI coding session from scratch again.
> V1 solves exactly one problem extremely well: **continue my work across AI sessions.**

## v0.1 — The first brick (CLI)

- [x] `tael init` — scaffold the `.tael/` workspace
- [x] `tael sync` — capture a snapshot of the current Git context as a session
- [x] `tael continue` — print pasteable context to hand to Claude / Cursor

## v0.2 — Ingest real session history

- [ ] GitHub integration (PRs, issues, review threads)
- [ ] Claude session import
- [ ] Cursor session import

## v0.3 — Retrieval

- [ ] Semantic search across sessions and memories
- [ ] Context retrieval ("what was I doing on X?")

## v0.4 — Web

- [ ] Web dashboard
- [ ] Hosted sync

## v1.0 — Team & knowledge graph

- [ ] Team memory
- [ ] AI form filling
- [ ] Personal knowledge graph

---

## Design principles

1. **Local-first.** Everything works against the local `.tael/` directory with no
   network dependency. Hosted sync is additive, never required.
2. **Plain JSON on disk.** The `.tael/` workspace is human-readable and diffable so
   it can be committed, inspected, and migrated without lock-in.
3. **Thin CLI, fat core.** All logic lives in `@tael/core` so the future web app and
   any other surface can reuse it. The CLI is only presentation + argument parsing.
4. **Typed contracts.** Shared shapes live in `@tael/types` and are the single source
   of truth for the on-disk format.

# Tael Roadmap

> **North star:** Never start an AI coding session from scratch again — and keep a
> version history of _how_ your projects get built with AI, across every tool.

## Shipped

- [x] Model-agnostic provider layer (`@tael/providers`) — bring your own key (Anthropic, OpenAI)
- [x] `tael login` / `tael model` / `tael status`
- [x] Projects with a linked repo, an active project (`tael use`), and feature/bug tracking
- [x] `tael ask` — one-shot, project-aware
- [x] `tael` — interactive Ink chat that knows the active project + recent sessions
- [x] **Agentic chat** — add/complete features and bugs from the conversation
- [x] `tael sync` — import + summarize AI sessions (Claude + Codex), incremental, repo cross-check
- [x] `tael session list` / `show --full` — browse summaries, open the original via its link
- [x] Configurable cheaper **summary model**

## Next

- [ ] Cursor session source (best-effort; data lives in a SQLite store)
- [ ] Refresh chat context after in-chat actions (live status within a session)
- [ ] Retrieval: semantic search across sessions ("what was I doing on X?") for scale
- [ ] `tael profile` + rolled-up stats across all projects
- [ ] More chat actions (sync, switch project, capture notes)

## Later

- [ ] Optional self-hosted backend (bring your own database) for multi-device sync
- [ ] **Tael Cloud** — managed inference + hosted sync (a `tael-cloud` provider behind the same interface)
- [ ] Web dashboard
- [ ] Team memory, personal knowledge graph

---

## Design principles

1. **Local-first.** Everything works against the local `~/.tael/` store with no network
   dependency. Hosted sync is additive, never required.
2. **Model-agnostic.** Nothing above the provider layer hard-codes a model or vendor.
3. **Plain files on disk.** Human-readable JSON + Markdown — inspectable, diffable, yours;
   all access goes through one store layer so the backend can evolve (files → DB → cloud).
4. **Thin surfaces, fat core.** All logic lives in `@tael/core` + `@tael/providers` so the
   CLI (and a future web app / cloud API) reuse the exact same code.
5. **Typed contracts.** Shared shapes live in `@tael/types`.

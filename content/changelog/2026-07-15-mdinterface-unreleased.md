---
project: mdinterface
version: Unreleased
date: 2026-07-15
tag: On main, not yet on npm
---

Everything below is merged to [main](https://github.com/kevinsundstrom/mdinterface) and will ship in the next npm release.

- **Notion comment awareness.** A background poller watches the Notion page linked to the open document and surfaces new comments to Claude proactively, instead of waiting to be asked. Hardened over several iterations: polling suspends when the canvas isn't being viewed, a failed read backs off rather than being treated as "no comments," and the poll interval adapts to activity to cut API cost.
- **Deterministic Notion sync engine.** `notion-sync.js` now computes the three-way sync verdict (`insync` / `pull` / `push` / `conflict`) and performs every git step itself — committing, moving the last-synced tag, writing pulled content. Claude does only the Notion I/O and content shaping; no hand-run git reconciliation, and conflicting edits are never clobbered.
- **Prompt-caching default.** The embedded Claude session defaults to 1-hour prompt caching, so the first edit after a long reading pause no longer re-ingests the whole session. Overridable in either direction via environment variables.
- Shift+Enter inserts a newline in the prompt bar; added a favicon; polished the no-file launch flow.

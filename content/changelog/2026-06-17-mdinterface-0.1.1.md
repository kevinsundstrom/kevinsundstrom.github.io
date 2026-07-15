---
project: mdinterface
version: 0.1.1
date: 2026-06-17
tag: Initial release
---

First public release of **mdinterface**: a rendered markdown canvas wired to a live Claude Code session, bridged only by the file on disk.

- Highlighting a passage in the canvas sets both Claude's context and its edit scope — the selection rides along with every message via hooks, so a two-word instruction edits exactly that passage and leaves the rest alone.
- A `canvas_edit` MCP tool lets Claude change the document without a prior read; a file watcher re-renders the canvas the instant the file is written.
- Git-native Notion sync: a marker on the document's first line links it to a Notion page, with pull/push/sync verdicts computed three-way against the last-synced git tag.
- Published on npm — run with `npx mdinterface doc.md`. Requires Node 18+ and the `claude` CLI. (0.1.0 was consumed by an npm unpublish; 0.1.1 is the first installable version.)

---
project: mdinterface
version: 0.2.0
date: 2026-06-22
---

`node-pty` — the native module that hosts the embedded Claude terminal — is now an **optional dependency**.

- If the native build is missing or fails to install, mdinterface still launches: the canvas, file watching, and MCP tools all work, and the terminal pane shows a fallback message instead of crashing the app.
- The `spawn-helper` binary's executable bit is self-healed at startup. The npx cache strips `+x` on some systems, which previously made the terminal fail to spawn until it was fixed by hand.

A capability change rather than a patch, hence the minor bump.

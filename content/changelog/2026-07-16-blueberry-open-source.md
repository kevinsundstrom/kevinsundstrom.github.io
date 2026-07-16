---
project: blueberry
version: Open source
date: 2026-07-16
tag: MIT
---

The app is now open source as [blueberry](https://github.com/kevinsundstrom/blueberry) — named for its icon.

- MIT licensed, with CI running the 40-test suite on every push.
- The store chain is configurable via `KROGER_CHAIN`, so availability works with any Kroger banner (Kroger, Fred Meyer, Ralphs, King Soopers, QFC, …), not just the one store it was built against.
- Login uses a timing-safe passphrase comparison with a one-second delay on failures, and the iOS Shortcut endpoint can be gated with a `SHORTCUT_TOKEN`.
- `schema.sql` was reconstructed to match the code — it had drifted behind by four tables and several columns, so a fresh install from the repo now actually works.
- The README documents the full deploy path: Vercel + Neon, Kroger API credentials from developer.kroger.com, and an optional Anthropic API key for LLM recipe parsing.

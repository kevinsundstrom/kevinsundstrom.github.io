---
project: blueberry
version: Initial build
date: 2026-06-27
tag: Closed source
---

A shared grocery list for two people, sorted by the store's aisle order, with recipe import. See the [project page](/blueberry) for the full picture.

- One shared list. Both phones see the same state, syncing every few seconds and on focus.
- Every item is its own database row with targeted updates — adding is an insert, checking off is a one-field update — so concurrent actions from two phones never collide. The UI updates optimistically and reconciles on the next poll.
- Recipe import: paste an ingredient list or a recipe URL and the ingredients are parsed and classified into sections, with a review step before anything lands on the list.
- Aisle order is configured once, then the whole list sorts to match how you walk the store. Checked items mute in place instead of reshuffling the list mid-shop.
- Sign-in is a one-time passphrase per phone with a session built to never expire while you're standing in an aisle.
- 40 tests exercise the real route handlers and middleware against an in-process Postgres — concurrent-edit merges, idempotent deletes, and session behavior are all proven directly rather than mocked.

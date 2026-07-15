---
project: grocery
version: PWA
date: 2026-07-05
---

- **Installable app.** Web app manifest, service worker, offline banner, and proper icons — add it to the home screen and it opens like a native app. The icon is a blueberry.
- **Smarter product search.** The availability search cascade right-truncates queries first so brand names survive, skips conjunctions so "X or Y" ingredients don't fall through, and normalizes curly apostrophes before hitting the Kroger API.
- Meal-plan week now runs Sunday–Saturday.
- Fixed a Safari hydration error caused by reading localStorage during render.

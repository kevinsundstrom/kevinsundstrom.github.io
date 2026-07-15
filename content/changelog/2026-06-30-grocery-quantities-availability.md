---
project: grocery
version: Quantities & availability
date: 2026-06-30
---

- **One quantity parser everywhere.** Fractions and ranges parse correctly, duplicate ingredients combine (½ cup + ½ cup → 1 cup), and genuinely ambiguous quantities are shown as-is rather than guessed at. A part-removal sheet lets you take one recipe's share back out of a combined quantity.
- **Purchase-unit picker.** Items with known purchase units get a popover translating recipe amounts into what you actually buy — canned sizes, spice jars, dates by the container. A ✨ button asks AI for a suggestion when the unit isn't known, and overrides only persist once you accept them. Individually-counted produce (apples, limes, onions) is deliberately excluded.
- **Live availability.** Items are checked against the Kroger API. Tuned to avoid crying wolf: several results are checked and the item counts as in stock if any match is available, and "low stock" only shows when nothing is definitively in stock.

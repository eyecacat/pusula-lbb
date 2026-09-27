---
name: Expo web font gate
description: Web preview behavior when Expo font loading is still pending during hydration.
---

Expo web previews can briefly render blank when the root layout returns `null` while Google fonts are loading. Keep the native splash/font gate, but allow web to render with system fallback until fonts settle.

**Why:** The web bundle and browser runtime can be healthy while the first preview capture happens before font promises resolve.

**How to apply:** In Expo root layouts, gate `null` only for native platforms; keep web rendering available during hydration.
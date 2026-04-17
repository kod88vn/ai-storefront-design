---
description: Run the planner, generator, and healer flow for a Playwright test in this repo.
name: e2e-parallel-team
agent: agent
---

Use the shared specialist agents in this order:

1. Ask @e2e-planner to read the relevant UI files and produce a JSON step map.
2. Pass that JSON to @e2e-generator to create the Playwright spec.
3. If generation or verification hits a timeout, stale selector, target closed error, or unexpected UI state, ask @e2e-healer to diagnose and patch the issue.

Repository reminders:
- Studio app runs on port 3001.
- Storefront app runs on port 3000.
- Prefer existing data-testid selectors.
- Keep the resulting test minimal and deterministic.

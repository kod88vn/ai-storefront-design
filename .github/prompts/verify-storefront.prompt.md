---
description: Verify a studio or storefront change with the available MCP servers and the lightest useful checks.
name: verify-storefront
agent: agent
tools:
  - context7/*
  - playwright/*
argument-hint: Describe the feature, page, or bug that should be verified
---

Verify the requested change in this repository.

Follow this order:
1. Understand the target flow and app surface.
2. Write or identify the smallest reliable repro test when practical.
3. Use Context7 only if framework behavior needs confirmation.
4. Use Playwright to reproduce or verify the user-visible flow when the issue is visual, timing-sensitive, or otherwise high risk.
5. Report the outcome, any remaining issue, and the smallest next step.

Repository reminders:
- Studio runs on port 3001.
- Storefront runs on port 3000.
- Prefer existing data-testid selectors.

---
name: playwright-ui-testing
description: Use this skill to reproduce, inspect, and verify UI behavior in the studio or storefront with Playwright before and after a fix.
---

# Playwright UI Testing

Use this skill when a task mentions layout bugs, broken interactions, regressions, screenshots, forms, checkout flow, or visual verification.

## Workflow

1. If the apps are not running, start them with `yarn dev` from the repo root.
2. Use Playwright against:
   - `http://localhost:3001` for the studio
   - `http://localhost:3000` for the storefront
3. Reproduce the issue exactly before changing code.
4. Inspect the rendered DOM and prefer existing `data-testid` selectors.
5. After the fix, rerun the same flow and confirm the regression is gone.

## What to verify

- Core navigation and page load behavior
- Plan approval and storefront preview flows in the studio
- Cart, checkout, and product browsing in the storefront
- Visual regressions after layout or theme updates

## Guardrails

- Use Playwright for real behavior, not assumptions.
- Keep screenshots or notes focused on the user-visible problem.
- If the bug cannot be reproduced, do not guess a fix.

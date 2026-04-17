# Copilot Agents

This folder contains shared GitHub Copilot agent definitions for the repo.

## Included agents

### E2E workflow
- e2e-planner — reads UI code and produces a JSON test plan
- e2e-generator — uses Playwright to turn the plan into a spec file
- e2e-healer — diagnoses failures using live browser context and proposes the smallest fix

### General productivity workflow
- task-planner — scopes a coding or repo task into a verified step list
- task-executor — performs the smallest practical implementation
- task-reviewer — checks correctness, scope, and regression risk
- docs-researcher — gathers confirmed facts for docs-heavy work

## Suggested flow

1. Start the local apps with Yarn from the repo root when browser or MCP checks are needed.
2. For E2E work, use planner → generator → healer.
3. For general engineering work, use planner → executor → reviewer.
4. Use the docs researcher when the task depends on verified framework or repo guidance.

## Verification best practice

- For bug fixes, prefer a small failing repro test before the implementation change when practical.
- Make the test assert the real broken behavior the user sees.
- After the fix, rerun the same test and escalate to a live browser proof only when the issue is visual, timing-sensitive, or otherwise high risk.

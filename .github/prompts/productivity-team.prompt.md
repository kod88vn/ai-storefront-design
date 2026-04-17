---
description: Run a general productivity workflow using the shared planner, executor, reviewer, and docs researcher agents.
name: productivity-team
agent: agent
---

Use the shared specialist agents in this order:

1. Ask @task-planner to break the request into the smallest verified plan.
2. Ask @task-executor to carry out the plan with minimal repo changes.
3. Ask @task-reviewer to verify scope, correctness, and regression risk.
4. If the task is documentation-heavy or depends on framework behavior, ask @docs-researcher to gather the relevant facts first.

Use this flow for:
- bug fixes
- refactors
- configuration changes
- docs updates
- release prep and cleanup

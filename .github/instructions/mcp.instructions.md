---
applyTo: "apps/studio/app/api/mcp/**/*.ts,apps/web/app/api/mcp/**/*.ts,apps/studio/lib/design-studio/**/*.ts,apps/studio/lib/mcp/**/*.ts"
---

This repository already exposes local MCP endpoints through the Next.js apps.

When changing MCP or orchestration code:
- Treat MCP tools and skills as separate layers.
- Add or update tool contracts in the MCP registry and execution path, not by hardcoding behavior into the orchestrator.
- Keep the orchestrator stateless and pass context explicitly.
- Prefer updating schemas and SKILL.md guidance together when behavior changes.
- Verify the relevant app still builds after MCP changes.

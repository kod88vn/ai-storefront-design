---
name: repo-mcp-workflow
description: Use this skill when the task benefits from the repository's MCP endpoints or from shared MCP-aware workflows for configuration, orchestration, and debugging.
---

# Repo MCP Workflow

This project already exposes MCP endpoints from the local Next.js apps.

## Available workspace servers

See `.vscode/mcp.json` for:
- `nextjs-studio` → `http://localhost:3001/api/mcp`
- `nextjs-web` → `http://localhost:3000/api/mcp`
- `context7` for version-aware docs
- `playwright` for browser testing

## How to use this skill

1. Start the apps locally if the HTTP MCP endpoints are needed.
2. Discover available tools first.
3. Use the project MCP endpoints for store config and design-studio tasks.
4. Use Context7 when tool behavior depends on upstream framework docs.
5. Use Playwright to verify user-visible outcomes.

## Important distinction

- MCP tools provide capabilities.
- Skills provide guidance on when and how to use those capabilities.
- Keep both aligned, but do not treat them as the same layer.

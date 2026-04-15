import type { AgentStep, OrchestratorEvent } from "@/lib/types";

export function progress(
  message: string,
  agentStep?: AgentStep,
): OrchestratorEvent {
  return { type: "progress", message, agentStep };
}

export function audit(
  method: string,
  params: Record<string, unknown>,
  result?: unknown,
): OrchestratorEvent {
  return { type: "audit", entry: { method, params, result } };
}

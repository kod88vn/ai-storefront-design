import type { LoadedSkill, OrchestratorContext } from "@ai-storefront/types";

export const ANALYTIC_FALLBACK_REASON =
  "AI is unavailable right now. Use the guided analytic baseline instead.";

export interface StudioAiStatus {
  available: boolean;
  reason: string;
  mode?: "ai" | "analytic-only";
  model?: string;
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  const body = await readJsonSafely(response);

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "reason" in body
        ? String(body.reason)
        : `Request failed: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return body as T;
}

export async function fetchStudioSkills(): Promise<LoadedSkill[]> {
  const payload = await requestJson<{ skills?: LoadedSkill[] }>("/api/skills");
  return payload.skills ?? [];
}

export async function fetchStudioAiStatus(): Promise<StudioAiStatus> {
  try {
    const payload = await requestJson<Partial<StudioAiStatus>>("/api/ai-status", {
      cache: "no-store",
    });

    return {
      available: payload.available !== false,
      reason:
        payload.reason ??
        (payload.available === false
          ? ANALYTIC_FALLBACK_REASON
          : "AI connection ready."),
      mode: payload.mode,
      model: payload.model,
    };
  } catch (error) {
    return {
      available: false,
      reason:
        error instanceof Error && error.message
          ? error.message
          : ANALYTIC_FALLBACK_REASON,
      mode: "analytic-only",
    };
  }
}

export async function loadStudioBootstrapData(): Promise<{
  skills: LoadedSkill[];
  aiStatus: StudioAiStatus;
}> {
  const [skills, aiStatus] = await Promise.all([
    fetchStudioSkills().catch(() => []),
    fetchStudioAiStatus(),
  ]);

  return { skills, aiStatus };
}

export async function requestOrchestratorStream(
  goal: string,
  context: OrchestratorContext,
): Promise<Response> {
  return fetch("/api/orchestrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal, context }),
  });
}

export async function saveStorefrontConfig(payload: unknown): Promise<void> {
  await requestJson("/api/store-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config: payload }),
  });
}

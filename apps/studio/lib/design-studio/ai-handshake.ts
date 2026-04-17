import { generateText } from "ai";
import { xai } from "@ai-sdk/xai";

const USE_AI_GATEWAY = Boolean(process.env.AI_GATEWAY_API_KEY);
const DEFAULT_XAI_MODEL = "grok-3-fast";
const DEFAULT_GATEWAY_MODEL = "openai/gpt-4.1-mini";
const AI_MODEL =
  process.env.AI_MODEL ??
  (USE_AI_GATEWAY ? DEFAULT_GATEWAY_MODEL : DEFAULT_XAI_MODEL);
const HANDSHAKE_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 60_000;

let cachedStatus:
  | {
      checkedAt: number;
      result: AiHandshakeResult;
    }
  | null = null;

export interface AiHandshakeResult {
  available: boolean;
  mode: "ai" | "analytic-only";
  reason: string;
  model: string;
}

function resolveModel(modelId: string) {
  return USE_AI_GATEWAY ? modelId : xai.responses(modelId);
}

function hasAiCredentials() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.XAI_API_KEY);
}

function toReason(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim().slice(0, 200);
  }

  return "Unknown AI connection error";
}

async function performHandshake(): Promise<AiHandshakeResult> {
  if (!hasAiCredentials()) {
    return {
      available: false,
      mode: "analytic-only",
      reason: "AI provider credentials are not configured.",
      model: AI_MODEL,
    };
  }

  try {
    await Promise.race([
      generateText({
        model: resolveModel(AI_MODEL),
        prompt: "Reply with OK.",
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("AI handshake timed out.")), HANDSHAKE_TIMEOUT_MS);
      }),
    ]);

    return {
      available: true,
      mode: "ai",
      reason: "AI connection ready.",
      model: AI_MODEL,
    };
  } catch (error) {
    return {
      available: false,
      mode: "analytic-only",
      reason: toReason(error),
      model: AI_MODEL,
    };
  }
}

export async function checkAiHandshake(force = false): Promise<AiHandshakeResult> {
  const now = Date.now();

  if (!force && cachedStatus && now - cachedStatus.checkedAt < CACHE_TTL_MS) {
    return cachedStatus.result;
  }

  const result = await performHandshake();
  cachedStatus = { checkedAt: now, result };
  return result;
}

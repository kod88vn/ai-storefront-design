export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: unknown;
}

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

async function mcpCall(
  method: string,
  params: Record<string, unknown>,
): Promise<unknown> {
  const res = await fetch(`${getBaseUrl()}/api/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method,
      params,
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

export async function mcpListTools(): Promise<McpToolDefinition[]> {
  const result = (await mcpCall("tools/list", {})) as {
    tools: McpToolDefinition[];
  };
  return result.tools ?? [];
}

export async function mcpToolCall(
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const result = (await mcpCall("tools/call", {
    name: toolName,
    arguments: args,
  })) as { content: Array<{ type: string; text: string }> };
  const text = result.content?.[0]?.text;
  try {
    return text ? JSON.parse(text) : result;
  } catch {
    return text ?? result;
  }
}

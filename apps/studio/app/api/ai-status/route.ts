import { checkAiHandshake } from "@/lib/design-studio/ai-handshake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = await checkAiHandshake();

  return Response.json(status, {
    status: status.available ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

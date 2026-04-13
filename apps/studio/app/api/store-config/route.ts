import { NextRequest, NextResponse } from "next/server";
import type { StorefrontConfig } from "@ai-storefront/types";
import { readStoreConfig, writeStoreConfig } from "@/lib/store-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await readStoreConfig();
    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const config = body.config as StorefrontConfig;
    if (!config || typeof config !== "object") {
      return NextResponse.json(
        { error: "Invalid config payload" },
        { status: 400 },
      );
    }
    await writeStoreConfig(config);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

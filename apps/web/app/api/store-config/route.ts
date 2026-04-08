import { NextRequest, NextResponse } from "next/server";
import type { StorefrontConfig } from "../../../../../packages/types/src";
import { readStoreConfig, writeStoreConfig } from "../../../lib/store-config";

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
    await writeStoreConfig(config);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

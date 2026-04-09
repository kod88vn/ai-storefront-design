import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { StorefrontConfig } from "@ai-storefront/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Resolve path to the web app's data file relative to the studio CWD
function configPath() {
  return path.join(process.cwd(), "..", "web", "data", "store-config.json");
}

export async function GET() {
  try {
    const raw = await fs.readFile(configPath(), "utf-8");
    const config = JSON.parse(raw) as StorefrontConfig;
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
    await fs.writeFile(configPath(), JSON.stringify(config, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

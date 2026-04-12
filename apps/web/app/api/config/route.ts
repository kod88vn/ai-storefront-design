import { NextResponse } from "next/server";
import { readStoreConfig } from "../../../lib/store-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await readStoreConfig();
  return NextResponse.json(config);
}

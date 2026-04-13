import { promises as fs } from "fs";
import path from "path";
import type { StorefrontConfig } from "@ai-storefront/types";

const dataFile = path.join(
  process.cwd(),
  "..",
  "web",
  "data",
  "store-config.json",
);
const STORE_CONFIG_KEY = process.env.STORE_CONFIG_KEY ?? "storefront:config";

function hasKvEnv() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvCommand<T = unknown>(
  command: Array<string | number>,
): Promise<T | null> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!res.ok) {
    throw new Error(`KV request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { result?: T; error?: string };
  if (json.error) throw new Error(`KV error: ${json.error}`);
  return json.result ?? null;
}

async function readLocalConfig(): Promise<StorefrontConfig> {
  const raw = await fs.readFile(dataFile, "utf8");
  return JSON.parse(raw) as StorefrontConfig;
}

async function writeLocalConfig(config: StorefrontConfig): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(config, null, 2), "utf8");
}

export async function readStoreConfig(): Promise<StorefrontConfig> {
  if (!hasKvEnv()) {
    return readLocalConfig();
  }

  const kvValue = await kvCommand<string>(["GET", STORE_CONFIG_KEY]);
  if (kvValue) {
    return JSON.parse(kvValue) as StorefrontConfig;
  }

  // Seed KV from local default if key is empty.
  const localConfig = await readLocalConfig();
  await kvCommand(["SET", STORE_CONFIG_KEY, JSON.stringify(localConfig)]);
  return localConfig;
}

export async function writeStoreConfig(
  config: StorefrontConfig,
): Promise<void> {
  if (!hasKvEnv()) {
    await writeLocalConfig(config);
    return;
  }
  await kvCommand(["SET", STORE_CONFIG_KEY, JSON.stringify(config)]);
}

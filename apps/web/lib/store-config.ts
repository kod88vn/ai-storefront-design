import { promises as fs } from "fs";
import path from "path";
import type { StorefrontConfig } from "../../../packages/types/src";

const dataFile = path.join(process.cwd(), "data", "store-config.json");

export async function readStoreConfig(): Promise<StorefrontConfig> {
  const raw = await fs.readFile(dataFile, "utf8");
  return JSON.parse(raw) as StorefrontConfig;
}

export async function writeStoreConfig(
  config: StorefrontConfig,
): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(config, null, 2), "utf8");
}

export function buildStoreMetadata(config: StorefrontConfig) {
  return {
    sectionCount: config.sections.length,
    enabledSections: config.sections.filter((s) => s.enabled).map((s) => s.id),
    heroLayout: config.hero.layout,
    productGridColumns: config.productGrid.columns,
    colors: {
      primary: config.theme.primaryColor,
      secondary: config.theme.secondaryColor,
    },
  };
}

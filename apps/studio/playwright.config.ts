import path from "node:path";
import { defineConfig } from "@playwright/test";

const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  testDir: "./e2e",
  timeout: 180_000,
  expect: {
    timeout: 30_000,
  },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3001",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "yarn workspace studio dev",
    cwd: repoRoot,
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});

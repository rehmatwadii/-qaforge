import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

export default defineConfig(config, {
  testDir: "./scripts",
  testMatch: "capture-screenshots.spec.ts",
  timeout: 300000,
  outputDir: "test-results/screenshots",
  use: { viewport: { width: 1600, height: 1000 }, actionTimeout: 15000 },
});

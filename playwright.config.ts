import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig, cucumberReporter } from "playwright-bdd";

const testDir = defineBddConfig({
  features: "features/**/*.feature",
  steps: ["steps/**/*.steps.ts", "support/fixtures.ts"],
});

export default defineConfig({
  testDir,
  timeout: 30000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    cucumberReporter("json", {
      outputFile: "reporting/cucumber-json/report.cucumber.json",
    }),
  ],
  use: {
    baseURL: "https://jsonplaceholder.typicode.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

import { request as playwrightRequest } from "@playwright/test";
import { test as bddTest } from "playwright-bdd";
import { APIClient } from "../utils/api-client";
import { createBdd } from "playwright-bdd";

type CustomFixtures = {
  apiClient: APIClient;
};

// Extend Playwright's base test with custom fixtures
// apiClient: High-level API client wrapper with authentication
export const test = bddTest.extend<CustomFixtures>({
  // Provide API client instance with authenticated request
  apiClient: async ({ baseURL }, use) => {
    const apiBaseURL =
      baseURL ||
      process.env.API_BASE_URL ||
      "https://jsonplaceholder.typicode.com";
    const authenticatedRequest = await playwrightRequest.newContext({
      extraHTTPHeaders: {
        Authorization: "Bearer THIS-IS-A-FAKE-TOKEN",
      },
    });
    const client = new APIClient(authenticatedRequest, apiBaseURL);
    await use(client); // makes the apiClient instance available to each test
    await authenticatedRequest.dispose(); // removing resources, cookies, at the end of each test
  },
});

// Export createBdd with custom test for playwright-bdd
export const { Given, When, Then, Before, After } = createBdd(test);

export { expect } from "@playwright/test";

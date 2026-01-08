import { Given, When, Then, expect } from "../support/fixtures";

let apiResponse: any;
let responseStatus: number;
let responseBody: any;

When(
  "I request a user with ID {int}",
  async ({ apiClient }, userId: number) => {
    apiResponse = await apiClient.rawGet(`/users/${userId}`);
    responseStatus = apiResponse.status();
    try {
      responseBody = await apiResponse.json();
    } catch {
      responseBody = await apiResponse.text();
    }
  }
);

When(
  "I request posts for user ID {int}",
  async ({ apiClient }, userId: number) => {
    apiResponse = await apiClient.rawGet(`/users/${userId}/posts`);
    responseStatus = apiResponse.status();
    responseBody = await apiResponse.json();
  }
);

When("I create a post with empty title and body", async ({ apiClient }) => {
  const { response, body } = await apiClient.createPost({
    userId: 1,
    title: "",
    body: "",
  });
  apiResponse = response;
  responseStatus = response.status();
  responseBody = body;
});

When("I update post with ID {int}", async ({ apiClient }, postId: number) => {
  apiResponse = await apiClient.rawPut(`/posts/${postId}`, {
    title: "Updated Title",
    body: "Updated Body",
    userId: 1,
  });
  responseStatus = apiResponse.status();
  try {
    responseBody = await apiResponse.json();
  } catch {
    responseBody = await apiResponse.text();
  }
});

When(
  "I request an invalid endpoint {string}",
  async ({ apiClient }, endpoint: string) => {
    apiResponse = await apiClient.rawGet(endpoint);
    responseStatus = apiResponse.status();
    try {
      responseBody = await apiResponse.json();
    } catch {
      responseBody = await apiResponse.text();
    }
  }
);

Then(
  "the response should return status {int}",
  async ({}, expectedStatus: number) => {
    expect(responseStatus).toBe(expectedStatus);
  }
);

Then("the response body should be empty", async () => {
  expect(responseBody).toEqual({});
});

Then("the response should return an empty array", async () => {
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBe(0);
});

Then("the created post should have empty title and body", async () => {
  expect(responseBody.title).toBe("");
  expect(responseBody.body).toBe("");
});

Then("I should receive an error message", async () => {
  expect(responseBody).toBeDefined();
});

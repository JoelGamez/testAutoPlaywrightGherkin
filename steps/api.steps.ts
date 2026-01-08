import { Given, When, Then, expect } from "../support/fixtures";
import { User, Post } from "../support/types";
import {
  getRandomUser,
  getRandomPost,
  validatePostId,
  consoleLogSimple,
} from "../utils/helpers";

// Store test context data
let allUsers: User[] = [];
let selectedUser: User;
let userPosts: Post[] = [];
let selectedPost: Post;
let updatedPostTitle: string;
let createdPostResponse: any;

Given("I get all users from the API", async ({ apiClient }) => {
  allUsers = await apiClient.getUsers();
  expect(allUsers.length).toBeGreaterThan(0);
  console.log(`✓ Retrieved ${allUsers.length} users from API`);
});

When("I select a random user", async () => {
  selectedUser = getRandomUser(allUsers);
  expect(selectedUser).toBeDefined();
  expect(selectedUser.id).toBeGreaterThan(0);
  console.log(
    `✓ Selected random user: ${selectedUser.name} (ID: ${selectedUser.id})`
  );
});

Then("I should log the user's email address", async () => {
  consoleLogSimple("User Email", selectedUser.email);
  expect(selectedUser.email).toContain("@");
});

When("I get all posts for the selected user", async ({ apiClient }) => {
  userPosts = await apiClient.getUserPosts(selectedUser.id);
  expect(userPosts.length).toBeGreaterThan(0);
  console.log(
    `✓ Retrieved ${userPosts.length} posts for user ${selectedUser.id}`
  );
});

Then("all posts should have valid Post IDs between 1 and 100", async () => {
  for (const post of userPosts) {
    const isValid = validatePostId(post.id);
    expect(isValid).toBe(true);
  }
  console.log(`✓ All ${userPosts.length} posts have valid IDs (1-100)`);
});

Then("I should log the title and ID for each post", async () => {
  console.log("\n=== User's Posts ===");
  userPosts.forEach((post) => {
    console.log(`Post ID: ${post.id} | Title: ${post.title}`);
  });
  console.log("===================\n");
});

When("I select a random post from the user's posts", async () => {
  selectedPost = getRandomPost(userPosts);
  expect(selectedPost).toBeDefined();
  console.log(`✓ Selected random post: ID ${selectedPost.id}`);
});

When(
  "I modify the post title to {string}",
  async ({ apiClient }, newTitle: string) => {
    updatedPostTitle = newTitle;
    const { response, body } = await apiClient.updatePost(selectedPost.id, {
      title: newTitle,
      body: selectedPost.body,
      userId: selectedPost.userId,
    });

    expect(response.ok()).toBe(true);
    selectedPost = body; // Update with response
    console.log(`✓ Modified post ${selectedPost.id} title`);
  }
);

Then("I should verify the post was updated", async () => {
  expect(selectedPost.title).toBe(updatedPostTitle);
  console.log(`✓ Post title verified: "${selectedPost.title}"`);
});

Then("I should log the updated post ID and title", async () => {
  console.log("\n=== Updated Post ===");
  consoleLogSimple("Post ID", selectedPost.id);
  consoleLogSimple("Title", selectedPost.title);
  console.log("===================\n");
});

When(
  "I create a new post with title {string} and body {string}",
  async ({ apiClient }, title: string, body: string) => {
    const { response, body: responseBody } = await apiClient.createPost({
      userId: selectedUser.id,
      title: title,
      body: body,
    });

    createdPostResponse = { response, body: responseBody };
    console.log(`✓ Created new post for user ${selectedUser.id}`);
  }
);

Then("the post creation should return the correct response", async () => {
  // JSONPlaceholder returns 201 for successful POST
  expect(createdPostResponse.response.status()).toBe(201);
  console.log(`✓ Received correct response status: 201`);
});

Then("I should verify the created post has valid data", async () => {
  const { body } = createdPostResponse;

  expect(body.id).toBeDefined();
  expect(body.userId).toBe(selectedUser.id);
  expect(body.title).toBeTruthy();
  expect(body.body).toBeTruthy();

  console.log("\n=== Created Post ===");
  consoleLogSimple("Post ID", body.id);
  consoleLogSimple("User ID", body.userId);
  consoleLogSimple("Title", body.title);
  consoleLogSimple("Body", body.body);
  console.log("===================\n");

  console.log("✓ All API operations completed successfully!");
});

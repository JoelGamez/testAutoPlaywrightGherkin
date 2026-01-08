import { User, Post } from "../support/types";

// Get a random user from an array of users
export function getRandomUser(users: User[]): User {
  const randomIndex = Math.floor(Math.random() * users.length);
  return users[randomIndex];
}

// Get a random post from an array of posts
export function getRandomPost(posts: Post[]): Post {
  const randomIndex = Math.floor(Math.random() * posts.length);
  return posts[randomIndex];
}

// Validate that a post ID is within the valid range (1-100)
export function validatePostId(id: number): boolean {
  return Number.isInteger(id) && id >= 1 && id <= 100;
}

// Log structured data to console with label
export function consoleLog(label: string, data: any): void {
  console.log(`\n${label}:`);
  console.log(JSON.stringify(data, null, 2));
}

// Log simple key-value pair to console
export function consoleLogSimple(label: string, value: any): void {
  console.log(`${label}: ${value}`);
}

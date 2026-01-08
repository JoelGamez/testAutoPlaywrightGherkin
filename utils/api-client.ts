import { APIRequestContext, APIResponse } from "@playwright/test";
import {
  User,
  Post,
  CreatePostResponse,
  UpdatePostResponse,
} from "../support/types";
import { APIRequestWrapper } from "../utils/api-helpers";

export class APIClient {
  private baseURL: string;
  private request: APIRequestWrapper;

  constructor(requestContext: APIRequestContext, baseURL: string) {
    this.baseURL = baseURL;
    this.request = new APIRequestWrapper(requestContext);
  }

  // Get all users
  async getUsers(): Promise<User[]> {
    const response = await this.request.get(`${this.baseURL}/users`);
    return response.json();
  }

  // Get a specific user by ID
  async getUser(userId: number): Promise<User> {
    const response = await this.request.get(`${this.baseURL}/users/${userId}`);
    return response.json();
  }

  // Get all posts for a specific user
  async getUserPosts(userId: number): Promise<Post[]> {
    const response = await this.request.get(
      `${this.baseURL}/users/${userId}/posts`
    );
    return response.json();
  }

  // Get all posts
  async getPosts(): Promise<Post[]> {
    const response = await this.request.get(`${this.baseURL}/posts`);
    return response.json();
  }

  // Update a post (PUT request)
  async updatePost(
    postId: number,
    data: Partial<Post>
  ): Promise<{ response: APIResponse; body: UpdatePostResponse }> {
    const response = await this.request.put(`${this.baseURL}/posts/${postId}`, {
      data,
    });
    const body = await response.json();
    return { response, body };
  }

  // Create a new post
  async createPost(
    data: Omit<Post, "id">
  ): Promise<{ response: APIResponse; body: CreatePostResponse }> {
    const response = await this.request.post(`${this.baseURL}/posts`, {
      data,
    });
    const body = await response.json();
    return { response, body };
  }

  // Get a specific post by ID
  async getPost(postId: number): Promise<Post> {
    const response = await this.request.get(`${this.baseURL}/posts/${postId}`);
    return response.json();
  }

  // Make raw GET request without validation (for negative testing)
  async rawGet(url: string): Promise<APIResponse> {
    return this.request.getUnvalidated(url);
  }

  // Make raw PUT request without validation (for negative testing)
  async rawPut(url: string, data?: any): Promise<APIResponse> {
    return this.request.putUnvalidated(url, { data });
  }
}

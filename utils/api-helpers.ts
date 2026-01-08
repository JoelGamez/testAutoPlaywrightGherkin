import { APIRequestContext, APIResponse } from "@playwright/test";

// Wrapper for APIRequestContext that automatically logs, validates, and retries requests
export class APIRequestWrapper {
  private maxRetries = 1;
  private retryDelay = 1000; // ms

  constructor(private request: APIRequestContext) {}

  async get(url: string): Promise<APIResponse> {
    return this.executeWithRetry(() => this.request.get(url), "GET", url);
  }

  async post(url: string, options?: { data?: any }): Promise<APIResponse> {
    return this.executeWithRetry(
      () => this.request.post(url, options),
      "POST",
      url,
      options?.data
    );
  }

  async put(url: string, options?: { data?: any }): Promise<APIResponse> {
    return this.executeWithRetry(
      () => this.request.put(url, options),
      "PUT",
      url,
      options?.data
    );
  }

  async delete(url: string): Promise<APIResponse> {
    return this.executeWithRetry(() => this.request.delete(url), "DELETE", url);
  }

  async patch(url: string, options?: { data?: any }): Promise<APIResponse> {
    return this.executeWithRetry(
      () => this.request.patch(url, options),
      "PATCH",
      url,
      options?.data
    );
  }

  // For negative testing - returns response without validation
  async getUnvalidated(url: string): Promise<APIResponse> {
    const response = await this.request.get(url);
    const status = response.status();
    return response;
  }

  // For negative testing - returns PUT response without validation
  async putUnvalidated(
    url: string,
    options?: { data?: any }
  ): Promise<APIResponse> {
    const response = await this.request.put(url, options);
    const status = response.status();
    return response;
  }

  private async executeWithRetry(
    requestFn: () => Promise<APIResponse>,
    method: string,
    endpoint: string,
    requestBody?: any
  ): Promise<APIResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await requestFn();
        const status = response.status();

        // Log request
        console.log(
          `[${method}] ${endpoint} → ${status}${
            requestBody ? ` | Body: ${JSON.stringify(requestBody)}` : ""
          }${attempt > 1 ? ` (retry ${attempt - 1})` : ""}`
        );

        // Check if we should retry (5xx errors or network issues)
        if (status >= 500 && attempt < this.maxRetries) {
          console.warn(
            `⚠️  Server error ${status}, retrying (${attempt}/${this.maxRetries})...`
          );
          await this.sleep(this.retryDelay * attempt); // Exponential backoff
          continue;
        }

        // If request failed with 4xx (client error), don't retry
        if (!response.ok()) {
          await this.logError(response, method, endpoint, status, requestBody);
          throw new Error(
            `API request failed: ${method} ${endpoint} (${status})`
          );
        }

        return response;
      } catch (error) {
        lastError = error as Error;

        // Network errors - retry
        if (attempt < this.maxRetries) {
          console.warn(
            `⚠️  Network error, retrying (${attempt}/${this.maxRetries})...`
          );
          await this.sleep(this.retryDelay * attempt);
          continue;
        }
      }
    }

    // All retries exhausted
    console.error(`❌ All ${this.maxRetries} retry attempts failed`);
    throw lastError || new Error("Request failed after retries");
  }

  private async logError(
    response: APIResponse,
    method: string,
    endpoint: string,
    status: number,
    requestBody?: any
  ): Promise<void> {
    let responseBody;
    try {
      responseBody = await response.json();
    } catch {
      try {
        responseBody = await response.text();
      } catch {
        responseBody = "Unable to parse response";
      }
    }

    const errorDetails = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ API REQUEST FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Method:   ${method}
Endpoint: ${endpoint}
Status:   ${status}
${requestBody ? `Request:  ${JSON.stringify(requestBody, null, 2)}` : ""}
Response: ${JSON.stringify(responseBody, null, 2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    console.error(errorDetails);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

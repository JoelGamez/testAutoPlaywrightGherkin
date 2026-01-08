# Playwright + Gherkin API Test Automation

This project tests the JSON Placeholder API using Playwright with BDD (Behavior-Driven Development) approach through Gherkin syntax. It's a full-featured API testing framework with both positive and negative test scenarios, automatic retry logic, detailed logging, and Cucumber-style HTML reporting.

## What We're Testing

**API:** [JSON Placeholder](https://jsonplaceholder.typicode.com)

JSON Placeholder is a free fake REST API that simulates a real backend. We're testing all the core CRUD operations:

- **GET** - Fetch users and posts
- **POST** - Create new posts
- **PUT** - Update existing posts

The test suite validates both happy paths (things working as expected) and error scenarios (handling invalid data, missing resources, etc.).

## The Framework

This isn't your typical Playwright setup. Instead of writing tests directly in TypeScript, we're using **playwright-bdd** which lets us write test scenarios in plain English using Gherkin syntax (`.feature` files).

Here's why this matters:

### Playwright + playwright-bdd (NOT Cucumber.js)

- **playwright-bdd**: Converts `.feature` files into actual Playwright test files, then runs them through Playwright's native test runner

**Why playwright-bdd?**

- You get all of Playwright's power (parallel execution, retries, trace viewer, etc.)
- No need for Cucumber.js configuration headaches
- Better TypeScript support
- Faster execution
- Still get to write in Gherkin for readability

### The Magic: BDD Generation

This is the most important part to understand. Before you can run tests, you MUST run:

```bash
npx bddgen
```

This command reads your `.feature` files and generates corresponding `.spec.js` test files in the `.features-gen/` folder. These generated files are what Playwright actually runs.

**The workflow:**

1. You write scenarios in `.feature` files (human-readable Gherkin)
2. You write step definitions in `.steps.ts` files (the actual test logic)
3. `bddgen` connects them together and generates Playwright test files
4. Playwright runs those generated tests

If you modify a `.feature` file and forget to run `bddgen`, your changes won't be reflected in the tests. That's why all our npm scripts now include `bddgen` automatically.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run playwright:install
```

### Project Structure

```
├── features/                          # Gherkin feature files
│   ├── jsonplaceholder-api.feature    # Positive test scenarios
│   └── jsonplaceholder-api-negative.feature  # Negative test scenarios
├── steps/                             # Step definitions (test logic)
│   ├── api.steps.ts                   # Positive scenario steps
│   └── api-negative.steps.ts          # Negative scenario steps
├── support/                           # Test infrastructure
│   ├── fixtures.ts                    # Custom Playwright fixtures (auth, API client)
│   └── types.ts                       # TypeScript interfaces
├── utils/                             # Reusable helpers
│   ├── api-client.ts                  # API wrapper with typed methods
│   ├── api-helpers.ts                 # Request wrapper with retry logic
│   └── helpers.ts                     # General utility functions
├── reporting/                         # Report generation
│   ├── generate-report.js             # Cucumber HTML report generator
│   ├── cucumber-json/                 # JSON report data (generated)
│   └── cucumber-html-report/          # Final HTML reports (generated)
├── .features-gen/                     # Auto-generated test files (don't edit!)
└── playwright.config.ts               # Playwright configuration
```

## Running Tests

All test commands automatically run `bddgen` first, so you don't have to worry about it.

### Basic Commands

````bash
# Run all tests
npm test

### Running with Reports

```bash
# Run all tests and generate HTML report
npm run test:report

# Run all @api tests with report
npm run test:full

# Run only positive scenarios with report
npm run test:positive

# Run only negative scenarios with report
npm run test:negative
````

### Using Tags

Tags let you filter which tests run. Our scenarios use `@api` and `@negative` tags.

```bash
# Run tests with specific tag + generate report
npm run test:report -- --grep @api
npm run test:report -- --grep @negative

# Run tests matching multiple tags (AND logic)
npm run test:report -- --grep "@api.*@negative"
```

After running tests with the report flag, open `reporting/cucumber-html-report/index.html` in your browser to see the detailed Cucumber-style report.

## Test Scenarios

### Positive Scenarios (`jsonplaceholder-api.feature`)

This feature tests the complete happy path workflow:

1. **Get all users** - Fetches user list from API
2. **Select random user** - Picks one user and logs their email
3. **Get user's posts** - Retrieves all posts for that user
4. **Validate post IDs** - Ensures all post IDs are between 1-100
5. **Log post details** - Displays title and ID for each post
6. **Update a post** - Modifies a post title via PUT request
7. **Create a post** - Creates new post and validates 201 response

Everything should work perfectly in these scenarios.

### Negative Scenarios (`jsonplaceholder-api-negative.feature`)

These test error handling and edge cases:

- **Invalid user ID (99999)** → Expects 404
- **Posts for non-existent user** → Expects 200 with empty array (valid API behavior)
- **Create post with empty fields** → Expects 201 (API accepts it)
- **Update non-existent post** → Expects 500 (server error)
- **Invalid endpoint** → Expects 404

Negative testing validates that the API fails gracefully and returns appropriate error codes.

## How Authentication Works (Fixtures)

This is where the magic happens. Open `support/fixtures.ts` and you'll see:

```typescript
export const test = bddTest.extend<CustomFixtures>({
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
    await use(client);
    await authenticatedRequest.dispose();
  },
});
```

**What's happening here:**

1. **Custom Fixture** - We extend Playwright's base test with a custom `apiClient` fixture
2. **Authentication** - Before ANY test runs, we create an authenticated request context with a fake Bearer token in the headers
3. **Injection** - Every test automatically gets an `apiClient` instance that already has auth headers attached
4. **Cleanup** - After each test, the request context is disposed (cleans up cookies, sessions, etc.)

This means you NEVER have to manually add auth headers in your step definitions. Just use `apiClient` and the token is automatically included in every request.

**Why use fixtures?**

- Centralized authentication - change the token in one place
- No repetitive setup code in every test
- Automatic cleanup after tests
- Easy to swap different auth strategies (API keys, OAuth, etc.)

The `apiClient` wraps all API calls with:

- Automatic retry logic (retries 5xx errors once, with exponential backoff)
- Request/response logging
- Error handling with detailed error messages
- Type safety with TypeScript interfaces

## Configuration

The base URL is configured in `playwright.config.ts`:

```typescript
use: {
  baseURL: "https://jsonplaceholder.typicode.com",
}
```

You can override this with an environment variable:

```bash
API_BASE_URL=https://api.staging.example.com npm test
```

This makes it easy to test against different environments without changing code.

## Error Handling & Retry Logic

The framework includes production-grade error handling:

- **Automatic retries** - 5xx server errors get retried once (with 1 second delay, exponential backoff)
- **No retry on 4xx** - Client errors (bad requests) fail immediately
- **Detailed logging** - Every request logs: method, endpoint, status, request/response bodies
- **Error details** - Failed requests show full context with formatted error messages

For negative testing, we use special `rawGet()` and `rawPut()` methods that bypass validation so we can capture and assert on error status codes.

## Reports

After running tests with `npm run test:report`, you get:

1. **Console output** - Real-time test results with detailed logs
2. **JSON report** - Machine-readable data in `reporting/cucumber-json/report.cucumber.json`
3. **HTML report** - Beautiful Cucumber-style report in `reporting/cucumber-html-report/index.html`

The HTML report shows:

- Feature descriptions
- Scenario pass/fail status
- Step-by-step breakdown
- Execution time
- Screenshots (on failure)

## Tips & Tricks

**Always run `bddgen` after modifying `.feature` files** - Our npm scripts do this automatically now, but if you run Playwright directly, remember to generate first.

**Use tags strategically** - Tag scenarios by feature, priority, or test type (@smoke, @regression, @api, @negative)

**Check the logs** - Every API call is logged with full details. If a test fails, the logs show exactly what was sent/received.

**Leverage fixtures** - Need to add more setup? Extend the fixtures file. Need database cleanup? Add it to fixtures.

**TypeScript is your friend** - The `types.ts` file defines interfaces for User, Post, etc. This gives you autocomplete and prevents typos.

## Troubleshooting

**Tests not reflecting my changes?**

- Run `npx bddgen` to regenerate test files

**Import errors or module not found?**

- Delete `node_modules` and run `npm install` again
- Make sure TypeScript paths are correct in `tsconfig.json`

**Tests failing on CI?**

- Ensure `npm run playwright:install` runs before tests
- Check that `bddgen` runs before test execution

**Authentication not working?**

- Verify the fixture is properly creating the authenticated request context
- Check that step definitions import from `support/fixtures` (not base Playwright test)

## What Makes This Setup Different

Most Playwright + Gherkin tutorials use Cucumber.js, which means:

- Separate test runner (Cucumber instead of Playwright)
- Need `cucumber.js` config file
- Slower execution
- Less integration with Playwright features

We're using **playwright-bdd** which:

- Generates native Playwright tests
- Uses Playwright's test runner
- Full access to Playwright features (trace viewer, UI mode, etc.)
- Faster parallel execution
- No Cucumber.js config needed

You get the readability of Gherkin with the power of Playwright.

---

Built with Playwright, playwright-bdd, and TypeScript. Ready for CI/CD integration.

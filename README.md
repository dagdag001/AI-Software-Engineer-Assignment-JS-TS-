# HTTP Client with OAuth2 Token Management

A TypeScript HTTP client implementation with OAuth2 token management and automatic token refresh.

## Running Tests Locally

To run the tests on your local machine:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the test suite:
   ```bash
   npm test
   ```

The tests will execute using Vitest and display the results in your terminal.

## Running Tests with Docker

1. Build the Docker image:
   ```bash
   docker build -t assignment-tests .
   ```

2. Run the tests in the container:
   ```bash
   docker run assignment-tests
   ```

The container will automatically execute the test suite and display the results.

## Documentation

See [EXPLANATION.md](EXPLANATION.md) for details about the bug fix, including:
- What the bug was and why it happened
- How the fix resolves the issue
- Test coverage and edge cases

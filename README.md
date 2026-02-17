# AI Experts Assignment (JS/TS)

This assignment evaluates your ability to:

- set up a small JavaScript/TypeScript project to run reliably (locally + in Docker),
- pin dependencies for reproducible installs,
- write focused tests to reproduce a bug,
- implement a minimal, reviewable fix.

## What you will do

### 1) Dockerfile (required)

Create a `Dockerfile` so the project can run the test suite in a non-interactive, CI-style environment.

Requirements:

- Your Docker image must run the test suite by default using npm test.
- Ensure npm test works in a clean environment (Docker) without manual steps.
- The build must install dependencies from package.json using npm install.
- The image must run tests by default (use: `CMD ["npm", "test"]`).

### 2) Pin dependencies (required)

- Pin dependency versions in package.json (no ^ / ~; use exact x.y.z).
- Do not commit lockfiles (package-lock.json, yarn.lock, pnpm-lock.yaml).

### 3) README updates (required)

Update this README to include:

- how to run the tests locally,
- how to build and run tests with Docker.

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

### Test Coverage

The test suite includes:
1. **Valid token reuse**: Verifies that valid, non-expired tokens are reused without triggering a refresh
2. **Null token refresh**: Ensures tokens are refreshed when missing
3. **Plain object token refresh**: Catches the bug where plain objects bypass refresh logic
4. **Expired token refresh**: Validates that expired OAuth2Token instances trigger refresh
5. **Concurrent refresh race condition**: Demonstrates the vulnerability where multiple simultaneous requests with invalid tokens would each independently call `refreshOAuth2()` in an async environment, lacking proper sy

To run the tests in a Docker container:

1. Build the Docker image:
   ```bash
   docker build -t assignment-tests .
   ```

2. Run the tests in the container:
   ```bash
   docker run assignment-tests
   ```

The container will automatically execute the test suite and display the results.

### 4) Find + fix a bug (required)

There is a bug somewhere in this repository.

Your tasks:

- Identify the bug through reading code and/or running tests.
- Write tests that reproduce the bug (tests should fail on the current code).
- Apply the smallest possible fix to make the tests pass.
- Keep the change minimal and reviewable (no refactors).

## Constraints

- Keep changes minimal and reviewable.
- Do not refactor unrelated code.
- Do not introduce extra tooling unless required.
- You may add tests and the smallest code change needed to fix the bug.

### 5) EXPLANATION.md (required)

Create `EXPLANATION.md` (max 250 words) containing:

- **What was the bug?**
- **Why did it happen?**
- **Why does your fix solve it?**
- **One realistic case / edge case your tests still don’t cover**

## Submission

- Submit a public GitHub repository URL containing your solution to the Google form link provided.

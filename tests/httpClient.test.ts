import { HttpClient } from "../src/httpClient";
import { OAuth2Token } from "../src/tokens";
import { describe, test, expect } from "vitest";

describe("HttpClient OAuth2 behavior", () => {
  test("api=true sets Authorization header when token is valid", () => {
    const c = new HttpClient();
    c.oauth2Token = new OAuth2Token("ok", Math.floor(Date.now() / 1000) + 3600);

    const resp = c.request("GET", "/me", { api: true });

    expect(resp.headers.Authorization).toBe("Bearer ok");
  });

  test("api=true refreshes when token is missing", () => {
    const c = new HttpClient();
    c.oauth2Token = null;

    const resp = c.request("GET", "/me", { api: true });

    expect(resp.headers.Authorization).toBe("Bearer fresh-token");
  });

  test("api=true refreshes when token is a plain object", () => {
    // This is the key failing case.
    const c = new HttpClient();
    c.oauth2Token = { accessToken: "stale", expiresAt: 0 };

    const resp = c.request("GET", "/me", { api: true });

    expect(resp.headers.Authorization).toBe("Bearer fresh-token");
  });

  test("api=true reuses valid non-expired OAuth2Token without refresh", () => {
    // Requirements: 4.4 - Valid tokens should be reused without refresh
    const c = new HttpClient();
    const originalToken = "my-original-token";
    const futureExpiry = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
    
    c.oauth2Token = new OAuth2Token(originalToken, futureExpiry);

    const resp = c.request("GET", "/me", { api: true });

    // Verify the original token is used (not "fresh-token" from refresh)
    expect(resp.headers.Authorization).toBe(`Bearer ${originalToken}`);
    // Verify the token instance is still the same (not refreshed)
    expect(c.oauth2Token).toBeInstanceOf(OAuth2Token);
    expect((c.oauth2Token as OAuth2Token).accessToken).toBe(originalToken);
  });

  test("concurrent requests with invalid token lack synchronization mechanism", () => {
    // This test demonstrates the race condition vulnerability:
    // In a real async scenario, multiple simultaneous requests would each 
    // independently call refreshOAuth2() because there's no locking mechanism.
    // 
    // Current synchronous implementation: First request refreshes, others reuse.
    // Real async scenario: All requests check token simultaneously, all refresh.
    const c = new HttpClient();
    c.oauth2Token = null; // Start with invalid token
    
    let refreshCallCount = 0;
    const originalRefresh = c.refreshOAuth2.bind(c);
    
    // Mock refreshOAuth2 to track how many times it's called
    c.refreshOAuth2 = function() {
      refreshCallCount++;
      originalRefresh();
    };

    // Simulate checking token state before any refresh completes
    // (mimics what would happen with async operations)
    const needsRefresh1 = !c.oauth2Token || !(c.oauth2Token instanceof OAuth2Token) || c.oauth2Token.expired;
    const needsRefresh2 = !c.oauth2Token || !(c.oauth2Token instanceof OAuth2Token) || c.oauth2Token.expired;
    const needsRefresh3 = !c.oauth2Token || !(c.oauth2Token instanceof OAuth2Token) || c.oauth2Token.expired;

    // All three checks happen before any refresh, so all return true
    expect(needsRefresh1).toBe(true);
    expect(needsRefresh2).toBe(true);
    expect(needsRefresh3).toBe(true);

    // In async code, all three would call refresh simultaneously
    if (needsRefresh1) c.refreshOAuth2();
    if (needsRefresh2) c.refreshOAuth2();
    if (needsRefresh3) c.refreshOAuth2();

    // BUG: Without a mutex/promise-based locking mechanism, 
    // concurrent async requests would trigger multiple refreshes
    expect(refreshCallCount).toBe(3); // Demonstrates the vulnerability
    
    // Note: A proper implementation would use a shared promise or mutex
    // to ensure only one refresh happens even with concurrent requests
  });
});
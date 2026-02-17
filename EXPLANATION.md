# Bug Explanation

## What was the bug?

The OAuth2 token refresh logic in `HttpClient.request()` failed to detect when `oauth2Token` was a plain JavaScript object (not an `OAuth2Token` instance). This caused the code to skip the token refresh and attempt to call the `asHeader()` method on a plain object, which doesn't have that method.

## Why did it happen?

The conditional logic used AND (`&&`) instead of OR (`||`) when checking token validity:

```typescript
if (!this.oauth2Token || (this.oauth2Token instanceof OAuth2Token && this.oauth2Token.expired))
```

This condition only refreshed tokens when:
- Token was falsy (null/undefined), OR
- Token was an OAuth2Token instance AND expired

Plain objects are truthy and not instances of OAuth2Token, so both conditions failed, causing the refresh to be skipped.

## Why does the fix solve it?

The fix changes the logic to OR conditions:

```typescript
if (!this.oauth2Token || !(this.oauth2Token instanceof OAuth2Token) || this.oauth2Token.expired)
```

Now the token refreshes when:
- Token is falsy, OR
- Token is NOT an OAuth2Token instance (catches plain objects), OR
- Token is an OAuth2Token instance but expired

This ensures all invalid token states trigger a refresh.

## One uncovered edge case

**Concurrent token refresh requests**: If multiple API requests are made simultaneously while the token is invalid, each request will independently call `refreshOAuth2()`, potentially causing race conditions or unnecessary refresh calls. A proper implementation would need a mutex or promise-based locking mechanism to ensure only one refresh happens at a time.

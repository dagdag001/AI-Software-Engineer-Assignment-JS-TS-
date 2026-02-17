# Bug Explanation

## What was the bug?

The OAuth2 token refresh logic in `HttpClient.request()` failed to detect when `oauth2Token` was a plain JavaScript object (not an `OAuth2Token` instance). This caused the code to skip the token refresh and attempt to call the `asHeader()` method on a plain object, which doesn't have that method.

## Why did it happen?

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

## Test Coverage

The test suite includes:
1. Valid token reuse without refresh
2. Token refresh when token is null
3. Token refresh when token is a plain object
4. Token refresh when token is expired
5. **Concurrent token refresh race condition demonstration**

## Concurrent Token Refresh Edge Case

**Test Added**: `concurrent requests with invalid token lack synchronization mechanism`

This test demonstrates a race condition vulnerability: if multiple API requests are made simultaneously while the token is invalid (in an async environment), each request would independently call `refreshOAuth2()` because there's no locking mechanism.

**Current behavior**: The synchronous implementation means the first request refreshes the token, and subsequent requests reuse it.

**Real async scenario**: Multiple requests checking the token state simultaneously would all see an invalid token and trigger separate refresh calls.

**Proper solution**: A mutex or promise-based locking mechanism to ensure only one refresh happens at a time, with other requests waiting for the shared refresh to complete.

# Google OAuth Authorization Fix

## Issue
Users were experiencing a Google OAuth authorization error during sign-up with the following error message:
- "Parameter not allowed for this message type: code_challenge_method"
- "Error 400: invalid_request"

## Root Cause
The error was caused by PKCE (Proof Key for Code Exchange) parameters being automatically added to the OAuth request when they weren't supported for the IdToken response type flow being used.

## Solution
Updated the Google OAuth implementation in `hooks/useFirebaseAuth.ts` to:

### 1. Explicitly Disable PKCE Parameters
```typescript
const request = new AuthSession.AuthRequest({
  clientId,
  scopes: ['openid', 'profile', 'email'],
  redirectUri,
  responseType: AuthSession.ResponseType.IdToken,
  extraParams: {
    include_granted_scopes: 'true'
  },
  // Explicitly disable PKCE
  codeChallenge: undefined,
  codeChallengeMethod: undefined,
});
```

### 2. Enhanced Redirect URI Configuration
```typescript
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'accesslink',
  path: 'redirect'
});
```

### 3. Improved Error Handling and Logging
- Added detailed console logging for debugging
- Enhanced error messages for better troubleshooting
- Added platform-specific client ID handling

## Configuration Verification
✅ **app.json**: Scheme configured as "accesslink"
✅ **AndroidManifest.xml**: Intent filters properly configured for redirect URIs
✅ **google-services.json**: Correct client ID and package name
✅ **Dependencies**: expo-auth-session@5.5.2 installed

## Testing
To test the fix:
1. Start the development server: `npx expo start`
2. Navigate to sign-up screen
3. Tap "Sign up with Google"
4. Verify the OAuth flow completes without the "code_challenge_method" error

## Technical Notes
- Using IdToken response type (implicit flow) instead of authorization code flow
- PKCE is not required for IdToken flows and was causing the authorization error
- The fix maintains security while ensuring compatibility with Google's OAuth 2.0 requirements

## Files Modified
- `hooks/useFirebaseAuth.ts`: Updated loginWithGoogle function

# 🔒 Security Hardening - Environment Variables & Authentication

## Issue Description
**Priority**: 🚨 CRITICAL  
**Labels**: `🚨 critical`, `🔒 security`, `🏗️ infrastructure`

Critical security vulnerabilities need to be addressed before production deployment. The application currently has exposed API keys and hardcoded credentials that pose significant security risks.

## Current Security Issues

### 1. Exposed Firebase API Keys
```typescript
// CURRENT: Exposed in firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyDQOnwLXW_PtQKtxhfxasWp2C4c7Bp2GKw", // ❌ EXPOSED
};
```

### 2. Hardcoded Credentials
- Mock authentication service contains hardcoded passwords
- Admin service lacks proper authorization checks
- No rate limiting on authentication attempts

## Required Changes

### Environment Variables Migration
- [ ] Move Firebase config to environment variables
- [ ] Create `.env.example` file with required variables
- [ ] Update `services/firebase.ts` to use `process.env.EXPO_PUBLIC_FIREBASE_API_KEY`
- [ ] Document environment setup in README

### Authentication Security
- [ ] Remove hardcoded passwords from `mockAuthService.ts`
- [ ] Implement proper password hashing
- [ ] Add rate limiting for auth attempts
- [ ] Implement session timeout functionality

### API Security
- [ ] Add request validation middleware
- [ ] Implement CORS policies
- [ ] Add API rate limiting
- [ ] Secure admin endpoints with proper authorization

## Files to Modify
- `services/firebase.ts`
- `services/mockAuthService.ts`
- `services/adminService.ts`
- Create: `.env.example`
- Update: `README.md` (environment setup documentation)

## Definition of Done
- [ ] All API keys moved to environment variables
- [ ] No hardcoded credentials in codebase
- [ ] Rate limiting implemented on authentication endpoints
- [ ] Admin endpoints properly secured
- [ ] Documentation updated with security setup instructions
- [ ] Security audit completed

## Estimated Time
**2-3 days**

## Related Issues
- Links to Error Handling issue (dependency)
- Links to Documentation update issue

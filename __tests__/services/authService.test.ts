/**
 * AuthService Test Suite
 * Comprehensive tests for authentication functionality using mockAuthService
 */

import { authService } from '../../services/mockAuthService';

describe('AuthService', () => {
  beforeEach(() => {
    // Reset auth state before each test
    authService.signOut();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.signUp(
        'newuser@example.com',
        'Password123',
        'New User'
      );

      expect(result).toBeDefined();
      expect(result.email).toBe('newuser@example.com');
      expect(result.displayName).toBe('New User');
      expect(result.role).toBe('user');
    });

    it('should handle required field validation', async () => {
      // Test empty email
      await expect(
        authService.signUp('', 'Password123', 'Test User')
      ).rejects.toThrow('Email is required');

      // Test invalid email format
      await expect(
        authService.signUp('invalid-email', 'Password123', 'Test User')
      ).rejects.toThrow('Please enter a valid email address');

      // Test weak password
      await expect(
        authService.signUp('test@example.com', '123', 'Test User')
      ).rejects.toThrow('Password must be at least 6 characters long');
    });
  });

  describe('User Authentication', () => {
    it('should authenticate valid admin credentials', async () => {
      const result = await authService.signIn('admin@accesslinklgbtq.app', 'adminpassword');
      expect(result).toBeDefined();
      expect(result.role).toBe('admin');
      expect(result.email).toBe('admin@accesslinklgbtq.app');
    });

    it('should authenticate valid user credentials', async () => {
      const result = await authService.signIn('user@example.com', 'password123');
      expect(result).toBeDefined();
      expect(result.role).toBe('user');
      expect(result.email).toBe('user@example.com');
    });

    it('should authenticate valid business owner credentials', async () => {
      const result = await authService.signIn('business@example.com', 'password123');
      expect(result).toBeDefined();
      expect(result.role).toBe('business_owner');
      expect(result.email).toBe('business@example.com');
    });

    it('should reject invalid credentials', async () => {
      await expect(authService.signIn('user@example.com', 'wrongpassword'))
        .rejects.toEqual({ code: 'auth/wrong-password', message: 'Incorrect password' });
    });

    it('should reject non-existent user', async () => {
      await expect(authService.signIn('nonexistent@example.com', 'password123'))
        .rejects.toEqual({ code: 'auth/user-not-found', message: 'User not found' });
    });
  });

  describe('Password Reset', () => {
    it('should handle password reset request', async () => {
      await expect(
        authService.resetPassword('user@example.com')
      ).resolves.not.toThrow();
    });

    it('should validate email format for password reset', async () => {
      await expect(
        authService.resetPassword('invalid-email')
      ).rejects.toThrow('Please enter a valid email address');
    });
  });

  describe('User Profile Management', () => {
    it('should update user profile successfully', async () => {
      // Sign in first
      await authService.signIn('user@example.com', 'password123');
      
      const updatedProfile = {
        displayName: 'Updated Name'
      };

      await authService.updateProfile(updatedProfile);
      const currentState = authService.getCurrentAuthState();
      
      expect(currentState.userProfile?.displayName).toBe('Updated Name');
    });

    it('should save business to user profile', async () => {
      await authService.signIn('user@example.com', 'password123');
      
      await authService.saveBusiness('business-123');
      const currentState = authService.getCurrentAuthState();
      
      expect(currentState.userProfile?.profile?.savedBusinesses).toContain('business-123');
    });

    it('should unsave business from profile', async () => {
      await authService.signIn('user@example.com', 'password123');
      
      // First save it
      await authService.saveBusiness('business-123');
      // Then unsave it
      await authService.unsaveBusiness('business-123');
      
      const currentState = authService.getCurrentAuthState();
      expect(currentState.userProfile?.profile?.savedBusinesses).not.toContain('business-123');
    });

    it('should add review to user profile', async () => {
      await authService.signIn('user@example.com', 'password123');
      
      await authService.addReview('business-123', 5, 'Great place!');
      const currentState = authService.getCurrentAuthState();
      
      expect(currentState.userProfile?.profile?.reviews).toContainEqual(
        expect.objectContaining({
          businessId: 'business-123',
          rating: 5,
          comment: 'Great place!'
        })
      );
    });

    it('should handle profile updates when no user is logged in', async () => {
      // Ensure no user is signed in
      authService.signOut();
      
      await expect(
        authService.updateProfile({ displayName: 'Test' })
      ).rejects.toThrow('No user logged in');
    });
  });

  describe('Authentication State Management', () => {
    it('should notify listeners on auth state changes', async () => {
      const mockListener = jest.fn();
      authService.onAuthStateChange(mockListener);
      
      await authService.signIn('user@example.com', 'password123');
      
      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          userProfile: expect.objectContaining({
            email: 'user@example.com',
            role: 'user'
          })
        })
      );
    });

    it('should return current auth state', async () => {
      const initialState = authService.getCurrentAuthState();
      expect(initialState.userProfile).toBeNull();
      
      await authService.signIn('user@example.com', 'password123');
      const currentState = authService.getCurrentAuthState();
      
      expect(currentState.userProfile).toBeDefined();
      expect(currentState.userProfile?.email).toBe('user@example.com');
    });

    it('should sign out user successfully', async () => {
      await authService.signIn('user@example.com', 'password123');
      const loggedInState = authService.getCurrentAuthState();
      expect(loggedInState.userProfile).toBeDefined();
      
      await authService.signOut();
      const loggedOutState = authService.getCurrentAuthState();
      expect(loggedOutState.userProfile).toBeNull();
    });
  });

  describe('Mock Data Integrity', () => {
    it('should have consistent mock user data', async () => {
      const demoUser = await authService.signIn('user@example.com', 'password123');
      
      expect(demoUser.profile?.firstName).toBe('Demo');
      expect(demoUser.profile?.lastName).toBe('User');
      expect(demoUser.profile?.savedBusinesses).toBeDefined();
      expect(Array.isArray(demoUser.profile?.savedBusinesses)).toBe(true);
    });

    it('should maintain review data for demo user', async () => {
      const demoUser = await authService.signIn('user@example.com', 'password123');
      
      expect(demoUser.profile?.reviews).toBeDefined();
      expect(Array.isArray(demoUser.profile?.reviews)).toBe(true);
      expect(demoUser.profile?.reviews?.length).toBeGreaterThan(0);
    });
  });
});

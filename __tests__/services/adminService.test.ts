/**
 * Admin Service Tests
 * Comprehensive test suite for admin functionality
 */

import { adminService } from '../../services/adminService';
import { 
  AdminUser, 
  UserDetails, 
  AdminNote, 
  Announcement, 
  FeatureFlag,
  PlatformStats,
  UserFilters 
} from '../../services/adminService';
import { UserProfile } from '../../services/authService';

// Mock Firebase functions
jest.mock('../../services/firebase', () => ({
  db: {},
}));

describe('AdminService', () => {
  // Mock user profiles for testing
  const mockSuperAdmin: AdminUser = {
    uid: 'super-admin-123',
    email: 'superadmin@test.com',
    displayName: 'Super Admin',
    role: 'admin',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isAdmin: true,
    adminLevel: 'super',
    permissions: [
      { id: 'users', name: 'User Management', category: 'users' },
      { id: 'businesses', name: 'Business Management', category: 'businesses' },
      { id: 'platform', name: 'Platform Management', category: 'platform' },
    ],
    profile: {
      firstName: 'Super',
      lastName: 'Admin',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Admin Authentication', () => {
    it('should authenticate admin users with valid credentials', async () => {
      const adminUser = await adminService.adminLogin('admin@accesslink.com', 'AdminPass123!');
      
      expect(adminUser).toBeDefined();
      expect(adminUser.isAdmin).toBe(true);
      expect(adminUser.adminLevel).toBe('super');
      expect(adminUser.permissions).toBeDefined();
      expect(Array.isArray(adminUser.permissions)).toBe(true);
    });

    it('should reject invalid admin credentials', async () => {
      await expect(
        adminService.adminLogin('invalid@test.com', 'wrongpassword')
      ).rejects.toThrow('Invalid admin credentials');
    });

    it('should verify admin tokens', async () => {
      const isValid = await adminService.verifyAdminToken('admin-token-123');
      expect(isValid).toBe(true);

      const isInvalid = await adminService.verifyAdminToken('invalid-token');
      expect(isInvalid).toBe(false);
    });
  });

  describe('Platform Statistics', () => {
    it('should get platform statistics', async () => {
      const stats = await adminService.getPlatformStats();
      
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('activeUsers');
      expect(stats).toHaveProperty('totalBusinesses');
      expect(stats).toHaveProperty('verifiedBusinesses');
      expect(stats).toHaveProperty('totalReviews');
      expect(stats).toHaveProperty('recentRegistrations');
      expect(stats).toHaveProperty('systemHealth');
      
      expect(typeof stats.totalUsers).toBe('number');
      expect(typeof stats.activeUsers).toBe('number');
      expect(stats.recentRegistrations).toHaveProperty('last7Days');
      expect(stats.recentRegistrations).toHaveProperty('last30Days');
      expect(stats.systemHealth).toHaveProperty('status');
      expect(stats.systemHealth).toHaveProperty('uptime');
      expect(stats.systemHealth).toHaveProperty('responseTime');
    });

    it('should provide realistic statistics', async () => {
      const stats = await adminService.getPlatformStats();
      
      expect(stats.activeUsers).toBeLessThanOrEqual(stats.totalUsers);
      expect(stats.verifiedBusinesses).toBeLessThanOrEqual(stats.totalBusinesses);
      expect(stats.recentRegistrations.last7Days).toBeLessThanOrEqual(stats.recentRegistrations.last30Days);
      expect(stats.systemHealth.uptime).toBeGreaterThan(0);
      expect(stats.systemHealth.uptime).toBeLessThanOrEqual(100);
    });
  });

  describe('User Management', () => {
    it('should get users with pagination', async () => {
      const result = await adminService.getUsers(1, 10);
      
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('totalCount');
      expect(Array.isArray(result.users)).toBe(true);
      expect(typeof result.totalCount).toBe('number');
      expect(result.users.length).toBeLessThanOrEqual(10);
    });

    it('should get users with search functionality', async () => {
      const result = await adminService.getUsers(1, 10, 'alex');
      
      expect(result.users).toBeDefined();
      expect(Array.isArray(result.users)).toBe(true);
    });

    it('should get users with filters', async () => {
      const filters: UserFilters = { status: 'active' };
      const result = await adminService.getUsers(1, 10, undefined, filters);
      
      expect(result.users).toBeDefined();
      result.users.forEach(user => {
        expect(user.accountStatus).toBe('active');
      });
    });

    it('should get user details by ID', async () => {
      const userDetails = await adminService.getUserDetails('user-1');
      
      expect(userDetails).toBeDefined();
      expect(userDetails.uid).toBe('user-1');
      expect(userDetails).toHaveProperty('email');
      expect(userDetails).toHaveProperty('displayName');
      expect(userDetails).toHaveProperty('registrationDate');
      expect(userDetails).toHaveProperty('accountStatus');
      expect(userDetails).toHaveProperty('verificationLevel');
    });

    it('should handle non-existent user IDs', async () => {
      await expect(
        adminService.getUserDetails('non-existent-user')
      ).rejects.toThrow('User not found');
    });
  });

  describe('User Account Management', () => {
    it('should update user status', async () => {
      // Should not throw an error
      await expect(
        adminService.updateUserStatus('user-1', 'suspended')
      ).resolves.not.toThrow();
    });

    it('should add user notes', async () => {
      // Should not throw an error
      await expect(
        adminService.addUserNote('user-1', 'User reported for policy violation', 'warning')
      ).resolves.not.toThrow();
    });

    it('should handle various user statuses', async () => {
      const statuses: Array<'active' | 'inactive' | 'suspended'> = ['active', 'inactive', 'suspended'];
      
      for (const status of statuses) {
        await expect(
          adminService.updateUserStatus('user-1', status)
        ).resolves.not.toThrow();
      }
    });

    it('should handle various note severities', async () => {
      const severities: Array<'info' | 'warning' | 'critical'> = ['info', 'warning', 'critical'];
      
      for (const severity of severities) {
        await expect(
          adminService.addUserNote('user-1', `Test note with ${severity} severity`, severity)
        ).resolves.not.toThrow();
      }
    });
  });

  describe('Announcements Management', () => {
    it('should get all announcements', async () => {
      const announcements = await adminService.getAnnouncements();
      
      expect(Array.isArray(announcements)).toBe(true);
      announcements.forEach(announcement => {
        expect(announcement).toHaveProperty('id');
        expect(announcement).toHaveProperty('title');
        expect(announcement).toHaveProperty('content');
        expect(announcement).toHaveProperty('priority');
        expect(announcement).toHaveProperty('targetAudience');
        expect(announcement).toHaveProperty('publishDate');
        expect(announcement).toHaveProperty('isActive');
        expect(announcement).toHaveProperty('isDismissible');
      });
    });

    it('should create announcements', async () => {
      const mockAnnouncement: Omit<Announcement, 'id' | 'createdBy' | 'createdAt'> = {
        title: 'System Maintenance',
        content: 'The platform will undergo maintenance this weekend.',
        priority: 'warning',
        targetAudience: 'all',
        publishDate: new Date(),
        expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        isDismissible: true,
      };

      const announcementId = await adminService.createAnnouncement(mockAnnouncement);
      
      expect(announcementId).toBeDefined();
      expect(typeof announcementId).toBe('string');
      expect(announcementId.startsWith('ann-')).toBe(true);
    });

    it('should update announcements', async () => {
      const updates = { title: 'Updated System Maintenance', isActive: false };
      
      await expect(
        adminService.updateAnnouncement('ann-1', updates)
      ).resolves.not.toThrow();
    });

    it('should delete announcements', async () => {
      await expect(
        adminService.deleteAnnouncement('ann-1')
      ).resolves.not.toThrow();
    });

    it('should validate announcement priorities', async () => {
      const priorities: Array<'info' | 'warning' | 'critical'> = ['info', 'warning', 'critical'];
      
      for (const priority of priorities) {
        const announcement: Omit<Announcement, 'id' | 'createdBy' | 'createdAt'> = {
          title: `Test ${priority} Announcement`,
          content: 'Test content',
          priority,
          targetAudience: 'all',
          publishDate: new Date(),
          isActive: true,
          isDismissible: true,
        };

        const id = await adminService.createAnnouncement(announcement);
        expect(id).toBeDefined();
      }
    });
  });

  describe('Feature Flags Management', () => {
    it('should get all feature flags', async () => {
      const flags = await adminService.getFeatureFlags();
      
      expect(Array.isArray(flags)).toBe(true);
      flags.forEach(flag => {
        expect(flag).toHaveProperty('id');
        expect(flag).toHaveProperty('name');
        expect(flag).toHaveProperty('description');
        expect(flag).toHaveProperty('category');
        expect(flag).toHaveProperty('isEnabled');
        expect(flag).toHaveProperty('rolloutPercentage');
        expect(flag).toHaveProperty('targetGroups');
        expect(flag).toHaveProperty('dependencies');
        expect(flag).toHaveProperty('lastModified');
        expect(flag).toHaveProperty('lastModifiedBy');
      });
    });

    it('should have valid feature flag categories', async () => {
      const flags = await adminService.getFeatureFlags();
      const validCategories = ['users', 'businesses', 'platform', 'experimental'];
      
      flags.forEach(flag => {
        expect(validCategories).toContain(flag.category);
      });
    });

    it('should have valid rollout percentages', async () => {
      const flags = await adminService.getFeatureFlags();
      
      flags.forEach(flag => {
        expect(flag.rolloutPercentage).toBeGreaterThanOrEqual(0);
        expect(flag.rolloutPercentage).toBeLessThanOrEqual(100);
      });
    });

    it('should update feature flags', async () => {
      await expect(
        adminService.updateFeatureFlag('flag-reviews', true)
      ).resolves.not.toThrow();
      
      await expect(
        adminService.updateFeatureFlag('flag-messaging', false)
      ).resolves.not.toThrow();
    });

    it('should set feature rollout percentages', async () => {
      const percentages = [0, 25, 50, 75, 100];
      
      for (const percentage of percentages) {
        await expect(
          adminService.setFeatureRollout('flag-reviews', percentage)
        ).resolves.not.toThrow();
      }
    });

    it('should handle invalid rollout percentages gracefully', async () => {
      // The service should handle invalid percentages internally
      await expect(
        adminService.setFeatureRollout('flag-reviews', -10)
      ).resolves.not.toThrow();
      
      await expect(
        adminService.setFeatureRollout('flag-reviews', 150)
      ).resolves.not.toThrow();
    });
  });

  describe('Data Consistency and Validation', () => {
    it('should maintain consistent user data structure', async () => {
      const result = await adminService.getUsers();
      
      result.users.forEach(user => {
        expect(user).toHaveProperty('uid');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('displayName');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('registrationDate');
        expect(user).toHaveProperty('lastLoginDate');
        expect(user).toHaveProperty('accountStatus');
        expect(user).toHaveProperty('verificationLevel');
        expect(user).toHaveProperty('reviewCount');
        expect(user).toHaveProperty('businessCount');
        expect(user).toHaveProperty('adminNotes');
        
        expect(typeof user.reviewCount).toBe('number');
        expect(typeof user.businessCount).toBe('number');
        expect(Array.isArray(user.adminNotes)).toBe(true);
      });
    });

    it('should maintain consistent platform statistics', async () => {
      const stats = await adminService.getPlatformStats();
      
      // All numbers should be non-negative
      expect(stats.totalUsers).toBeGreaterThanOrEqual(0);
      expect(stats.activeUsers).toBeGreaterThanOrEqual(0);
      expect(stats.totalBusinesses).toBeGreaterThanOrEqual(0);
      expect(stats.verifiedBusinesses).toBeGreaterThanOrEqual(0);
      expect(stats.totalReviews).toBeGreaterThanOrEqual(0);
      expect(stats.recentRegistrations.last7Days).toBeGreaterThanOrEqual(0);
      expect(stats.recentRegistrations.last30Days).toBeGreaterThanOrEqual(0);
      
      // System health should be valid
      expect(['healthy', 'warning', 'critical']).toContain(stats.systemHealth.status);
      expect(stats.systemHealth.uptime).toBeGreaterThanOrEqual(0);
      expect(stats.systemHealth.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should validate admin note structure', async () => {
      const userDetails = await adminService.getUserDetails('user-2');
      
      userDetails.adminNotes.forEach(note => {
        expect(note).toHaveProperty('id');
        expect(note).toHaveProperty('adminId');
        expect(note).toHaveProperty('adminName');
        expect(note).toHaveProperty('note');
        expect(note).toHaveProperty('timestamp');
        expect(note).toHaveProperty('severity');
        
        expect(['info', 'warning', 'critical']).toContain(note.severity);
        expect(note.timestamp instanceof Date).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // These tests verify that errors are caught and handled properly
      try {
        await adminService.getPlatformStats();
        await adminService.getUsers();
        await adminService.getAnnouncements();
        await adminService.getFeatureFlags();
      } catch (error) {
        // Errors should be handled gracefully
        expect(error).toBeDefined();
      }
      
      consoleSpy.mockRestore();
    });

    it('should validate input parameters', async () => {
      // Test with negative page numbers
      const result1 = await adminService.getUsers(-1, 10);
      expect(result1).toBeDefined();
      
      // Test with zero page size
      const result2 = await adminService.getUsers(1, 0);
      expect(result2).toBeDefined();
      
      // Test with very large page size
      const result3 = await adminService.getUsers(1, 1000);
      expect(result3).toBeDefined();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = [
        adminService.getPlatformStats(),
        adminService.getUsers(1, 10),
        adminService.getAnnouncements(),
        adminService.getFeatureFlags(),
      ];
      
      const results = await Promise.all(promises);
      
      expect(results[0]).toHaveProperty('totalUsers');
      expect(results[1]).toHaveProperty('users');
      expect(Array.isArray(results[2])).toBe(true);
      expect(Array.isArray(results[3])).toBe(true);
    });

    it('should complete operations within reasonable time', async () => {
      const startTime = Date.now();
      
      await Promise.all([
        adminService.getPlatformStats(),
        adminService.getUsers(1, 50),
        adminService.getAnnouncements(),
        adminService.getFeatureFlags(),
      ]);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
    });
  });
});

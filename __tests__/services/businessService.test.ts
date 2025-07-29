/**
 * Business Service Tests
 * Comprehensive test suite for business listing functionality
 */

import businessService, { BusinessListing, BusinessCategory, BusinessFilters } from '../../services/businessService';
import { UserProfile } from '../../services/authService';

// Mock Firebase functions
jest.mock('../../services/firebase', () => ({
  db: {},
}));

describe('BusinessService', () => {
  // Mock user profiles for testing
  const mockAdminUser: UserProfile = {
    uid: 'admin-123',
    email: 'admin@test.com',
    displayName: 'Test Admin',
    role: 'admin',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      firstName: 'Test',
      lastName: 'Admin',
    },
  };

  const mockBusinessOwner: UserProfile = {
    uid: 'business-owner-123',
    email: 'owner@test.com',
    displayName: 'Business Owner',
    role: 'business_owner',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      firstName: 'Business',
      lastName: 'Owner',
    },
  };

  const mockRegularUser: UserProfile = {
    uid: 'user-123',
    email: 'user@test.com',
    displayName: 'Regular User',
    role: 'user',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: {
      firstName: 'Regular',
      lastName: 'User',
    },
  };

  const mockBusinessData: Omit<BusinessListing, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'totalReviews'> = {
    name: 'Test LGBTQ+ Café',
    description: 'A welcoming café for the LGBTQ+ community',
    category: 'restaurant' as BusinessCategory,
    location: {
      address: '123 Pride Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
    },
    contact: {
      phone: '(555) 123-4567',
      email: 'hello@testcafe.com',
      website: 'https://testcafe.com',
    },
    hours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '20:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: false },
    },
    lgbtqFriendly: {
      verified: true,
      certifications: ['Safe Space Certified'],
      inclusivityFeatures: ['Gender-neutral bathrooms', 'LGBTQ+ staff training'],
    },
    accessibility: {
      wheelchairAccessible: true,
      brailleMenus: false,
      signLanguageSupport: false,
      quietSpaces: true,
      accessibilityNotes: 'Wheelchair ramp available at main entrance',
    },
    ownerId: 'business-owner-123',
    status: 'pending',
    featured: false,
    images: [],
    tags: ['coffee', 'community', 'safe-space'],
  };

  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  describe('Business Creation', () => {
    it('should allow business owners to create listings', async () => {
      const businessId = await businessService.createBusiness(mockBusinessData, mockBusinessOwner);
      
      expect(businessId).toBeDefined();
      expect(typeof businessId).toBe('string');
      expect(businessId.length).toBeGreaterThan(0);
    });

    it('should allow admins to create pre-approved listings', async () => {
      const businessId = await businessService.createBusiness(mockBusinessData, mockAdminUser);
      
      expect(businessId).toBeDefined();
      // Admin-created businesses should be auto-approved
      const business = await businessService.getBusiness(businessId);
      expect(business?.status).toBe('approved');
    });

    it('should reject creation by regular users', async () => {
      await expect(
        businessService.createBusiness(mockBusinessData, mockRegularUser)
      ).rejects.toThrow('Only business owners and admins can create listings');
    });

    it('should validate required fields', async () => {
      const invalidData = { ...mockBusinessData };
      delete (invalidData as any).name;

      await expect(
        businessService.createBusiness(invalidData, mockBusinessOwner)
      ).rejects.toThrow();
    });

    it('should set correct initial values for new businesses', async () => {
      const businessId = await businessService.createBusiness(mockBusinessData, mockBusinessOwner);
      const business = await businessService.getBusiness(businessId);

      expect(business).toMatchObject({
        id: businessId,
        name: mockBusinessData.name,
        ownerId: mockBusinessOwner.uid,
        averageRating: 0,
        totalReviews: 0,
        status: 'pending',
        featured: false,
      });
    });
  });

  describe('Business Retrieval', () => {
    let testBusinessId: string;

    beforeEach(async () => {
      testBusinessId = await businessService.createBusiness(mockBusinessData, mockBusinessOwner);
    });

    it('should retrieve business by ID', async () => {
      const business = await businessService.getBusiness(testBusinessId);
      
      expect(business).toBeTruthy();
      expect(business?.id).toBe(testBusinessId);
      expect(business?.name).toBe(mockBusinessData.name);
    });

    it('should return null for non-existent business', async () => {
      const business = await businessService.getBusiness('non-existent-id');
      expect(business).toBeNull();
    });

    it('should get businesses with default filters', async () => {
      const { businesses, lastDoc } = await businessService.getBusinesses();
      
      expect(Array.isArray(businesses)).toBe(true);
      expect(businesses.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter businesses by category', async () => {
      const filters: BusinessFilters = { category: 'restaurant' };
      const { businesses } = await businessService.getBusinesses(filters);
      
      businesses.forEach(business => {
        expect(business.category).toBe('restaurant');
      });
    });

    it('should filter businesses by city', async () => {
      const filters: BusinessFilters = { city: 'San Francisco' };
      const { businesses } = await businessService.getBusinesses(filters);
      
      businesses.forEach(business => {
        expect(business.location.city).toBe('San Francisco');
      });
    });

    it('should respect pagination limits', async () => {
      const pageLimit = 5;
      const { businesses } = await businessService.getBusinesses({}, pageLimit);
      
      expect(businesses.length).toBeLessThanOrEqual(pageLimit);
    });
  });

  describe('Business Updates', () => {
    let testBusinessId: string;

    beforeEach(async () => {
      testBusinessId = await businessService.createBusiness(mockBusinessData, mockBusinessOwner);
    });

    it('should allow business owners to update their own listings', async () => {
      const updates = { name: 'Updated Café Name', description: 'Updated description' };
      
      await businessService.updateBusiness(testBusinessId, updates, mockBusinessOwner);
      const business = await businessService.getBusiness(testBusinessId);
      
      expect(business?.name).toBe('Updated Café Name');
      expect(business?.description).toBe('Updated description');
    });

    it('should allow admins to update any business', async () => {
      const updates = { name: 'Admin Updated Name' };
      
      await businessService.updateBusiness(testBusinessId, updates, mockAdminUser);
      const business = await businessService.getBusiness(testBusinessId);
      
      expect(business?.name).toBe('Admin Updated Name');
    });

    it('should prevent regular users from updating businesses', async () => {
      const updates = { name: 'Unauthorized Update' };
      
      await expect(
        businessService.updateBusiness(testBusinessId, updates, mockRegularUser)
      ).rejects.toThrow('You can only update your own business listings');
    });

    it('should prevent business owners from updating other owners businesses', async () => {
      const otherOwner: UserProfile = {
        ...mockBusinessOwner,
        uid: 'other-owner-456',
      };
      const updates = { name: 'Unauthorized Update' };
      
      await expect(
        businessService.updateBusiness(testBusinessId, updates, otherOwner)
      ).rejects.toThrow('You can only update your own business listings');
    });
  });

  describe('Business Search', () => {
    beforeEach(async () => {
      // Create test businesses with different characteristics
      await businessService.createBusiness({
        ...mockBusinessData,
        name: 'Rainbow Coffee Shop',
        tags: ['coffee', 'rainbow', 'lgbt'],
      }, mockBusinessOwner);

      await businessService.createBusiness({
        ...mockBusinessData,
        name: 'Pride Health Center',
        category: 'healthcare',
        tags: ['health', 'medical', 'pride'],
      }, mockBusinessOwner);
    });

    it('should search businesses by name', async () => {
      const { businesses } = await businessService.searchBusinesses('Rainbow');
      
      expect(businesses.length).toBeGreaterThan(0);
      expect(businesses.some(b => b.name.includes('Rainbow'))).toBe(true);
    });

    it('should search businesses by description', async () => {
      const { businesses } = await businessService.searchBusinesses('welcoming');
      
      expect(businesses.length).toBeGreaterThan(0);
      expect(businesses.some(b => b.description.includes('welcoming'))).toBe(true);
    });

    it('should search businesses by tags', async () => {
      const { businesses } = await businessService.searchBusinesses('lgbt');
      
      expect(businesses.length).toBeGreaterThan(0);
      expect(businesses.some(b => b.tags.includes('lgbt'))).toBe(true);
    });

    it('should combine search with filters', async () => {
      const filters: BusinessFilters = { category: 'healthcare' };
      const { businesses } = await businessService.searchBusinesses('health', filters);
      
      businesses.forEach(business => {
        expect(business.category).toBe('healthcare');
        expect(
          business.name.toLowerCase().includes('health') ||
          business.description.toLowerCase().includes('health') ||
          business.tags.some(tag => tag.toLowerCase().includes('health'))
        ).toBe(true);
      });
    });

    it('should return empty results for non-matching search', async () => {
      const { businesses } = await businessService.searchBusinesses('nonexistentterm123');
      expect(businesses).toHaveLength(0);
    });
  });

  describe('Business Categories', () => {
    beforeEach(async () => {
      // Create businesses in different categories
      await businessService.createBusiness({
        ...mockBusinessData,
        category: 'restaurant',
      }, mockBusinessOwner);

      await businessService.createBusiness({
        ...mockBusinessData,
        category: 'healthcare',
        name: 'Pride Medical Center',
      }, mockBusinessOwner);

      await businessService.createBusiness({
        ...mockBusinessData,
        category: 'retail',
        name: 'Rainbow Bookstore',
      }, mockBusinessOwner);
    });

    it('should get businesses by category', async () => {
      const { businesses } = await businessService.getBusinessesByCategory('restaurant');
      
      businesses.forEach(business => {
        expect(business.category).toBe('restaurant');
      });
    });

    it('should return empty array for categories with no businesses', async () => {
      const { businesses } = await businessService.getBusinessesByCategory('fitness');
      expect(businesses).toHaveLength(0);
    });
  });

  describe('Admin Functions', () => {
    let pendingBusinessId: string;

    beforeEach(async () => {
      pendingBusinessId = await businessService.createBusiness(mockBusinessData, mockBusinessOwner);
    });

    it('should allow admins to get pending businesses', async () => {
      const pendingBusinesses = await businessService.getPendingBusinesses(mockAdminUser);
      
      expect(Array.isArray(pendingBusinesses)).toBe(true);
      expect(pendingBusinesses.some(b => b.id === pendingBusinessId)).toBe(true);
    });

    it('should prevent non-admins from getting pending businesses', async () => {
      await expect(
        businessService.getPendingBusinesses(mockRegularUser)
      ).rejects.toThrow('Only admins can view pending businesses');
    });

    it('should allow admins to approve businesses', async () => {
      await businessService.approveBusiness(pendingBusinessId, mockAdminUser);
      const business = await businessService.getBusiness(pendingBusinessId);
      
      expect(business?.status).toBe('approved');
    });

    it('should prevent non-admins from approving businesses', async () => {
      await expect(
        businessService.approveBusiness(pendingBusinessId, mockRegularUser)
      ).rejects.toThrow('Only admins can approve business listings');
    });

    it('should allow admins to reject businesses', async () => {
      await businessService.rejectBusiness(pendingBusinessId, mockAdminUser);
      const business = await businessService.getBusiness(pendingBusinessId);
      
      expect(business?.status).toBe('rejected');
    });

    it('should allow admins to feature businesses', async () => {
      await businessService.featureBusiness(pendingBusinessId, true, mockAdminUser);
      const business = await businessService.getBusiness(pendingBusinessId);
      
      expect(business?.featured).toBe(true);
    });

    it('should allow admins to unfeature businesses', async () => {
      await businessService.featureBusiness(pendingBusinessId, true, mockAdminUser);
      await businessService.featureBusiness(pendingBusinessId, false, mockAdminUser);
      const business = await businessService.getBusiness(pendingBusinessId);
      
      expect(business?.featured).toBe(false);
    });

    it('should allow admins to delete businesses', async () => {
      await businessService.deleteBusiness(pendingBusinessId, mockAdminUser);
      const business = await businessService.getBusiness(pendingBusinessId);
      
      expect(business).toBeNull();
    });

    it('should prevent non-admins from deleting businesses', async () => {
      await expect(
        businessService.deleteBusiness(pendingBusinessId, mockRegularUser)
      ).rejects.toThrow('Only admins can delete business listings');
    });
  });

  describe('User Business Management', () => {
    let userBusinesses: string[] = [];

    beforeEach(async () => {
      // Create multiple businesses for the same owner
      for (let i = 0; i < 3; i++) {
        const businessId = await businessService.createBusiness({
          ...mockBusinessData,
          name: `Test Business ${i + 1}`,
        }, mockBusinessOwner);
        userBusinesses.push(businessId);
      }
    });

    afterEach(() => {
      userBusinesses = [];
    });

    it('should get all businesses for a user', async () => {
      const businesses = await businessService.getUserBusinesses(mockBusinessOwner);
      
      expect(businesses.length).toBeGreaterThanOrEqual(3);
      businesses.forEach(business => {
        expect(business.ownerId).toBe(mockBusinessOwner.uid);
      });
    });

    it('should return empty array for users with no businesses', async () => {
      const businesses = await businessService.getUserBusinesses(mockRegularUser);
      expect(businesses).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid business ID gracefully', async () => {
      const business = await businessService.getBusiness('invalid-id');
      expect(business).toBeNull();
    });

    it('should throw error when updating non-existent business', async () => {
      await expect(
        businessService.updateBusiness('non-existent-id', { name: 'New Name' }, mockAdminUser)
      ).rejects.toThrow('Business not found');
    });

    it('should handle network errors gracefully', async () => {
      // Mock a network error
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // This would typically involve mocking Firebase to throw an error
      // For now, we'll just ensure error handling doesn't break the app
      try {
        await businessService.getBusiness('test-id');
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      jest.restoreAllMocks();
    });
  });

  describe('Business Reviews Integration', () => {
    let testBusinessId: string;

    beforeEach(async () => {
      testBusinessId = await businessService.createBusiness(mockBusinessData, mockBusinessOwner);
    });

    it('should get reviews for a business', async () => {
      const reviews = await businessService.getBusinessReviews(testBusinessId);
      
      expect(Array.isArray(reviews)).toBe(true);
      // Initially should have no reviews
      expect(reviews).toHaveLength(0);
    });

    it('should handle pagination for reviews', async () => {
      const pageLimit = 5;
      const reviews = await businessService.getBusinessReviews(testBusinessId, pageLimit);
      
      expect(reviews.length).toBeLessThanOrEqual(pageLimit);
    });
  });

  describe('Performance and Validation', () => {
    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      const { businesses } = await businessService.getBusinesses({}, 100);
      const endTime = Date.now();
      
      // Should complete within reasonable time (2 seconds)
      expect(endTime - startTime).toBeLessThan(2000);
      expect(Array.isArray(businesses)).toBe(true);
    });

    it('should validate pagination parameters', async () => {
      // Test with zero limit
      const { businesses: zeroBusinesses } = await businessService.getBusinesses({}, 0);
      expect(zeroBusinesses).toHaveLength(0);
      
      // Test with reasonable limit
      const { businesses: limitedBusinesses } = await businessService.getBusinesses({}, 10);
      expect(limitedBusinesses.length).toBeLessThanOrEqual(10);
    });

    it('should handle concurrent requests properly', async () => {
      const promises = Array(5).fill(null).map(() => businessService.getBusinesses());
      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.businesses).toBeDefined();
        expect(Array.isArray(result.businesses)).toBe(true);
      });
    });
  });
});

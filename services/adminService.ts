import { UserProfile } from './authService';

// Admin-specific interfaces
export interface AdminUser extends UserProfile {
  isAdmin: boolean;
  adminLevel: 'super' | 'standard';
  permissions: AdminPermission[];
}

export interface AdminPermission {
  id: string;
  name: string;
  category: 'users' | 'businesses' | 'content' | 'platform';
}

export interface UserDetails extends UserProfile {
  registrationDate: Date;
  lastLoginDate: Date;
  accountStatus: 'active' | 'inactive' | 'suspended';
  verificationLevel: 'unverified' | 'email' | 'phone' | 'full';
  reviewCount: number;
  businessCount: number;
  adminNotes: AdminNote[];
}

export interface AdminNote {
  id: string;
  adminId: string;
  adminName: string;
  note: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'info' | 'warning' | 'critical';
  targetAudience: 'all' | 'users' | 'businesses' | 'premium';
  publishDate: Date;
  expireDate?: Date;
  isActive: boolean;
  isDismissible: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'businesses' | 'platform' | 'experimental';
  isEnabled: boolean;
  rolloutPercentage: number;
  targetGroups: string[];
  dependencies: string[];
  lastModified: Date;
  lastModifiedBy: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalBusinesses: number;
  verifiedBusinesses: number;
  totalReviews: number;
  recentRegistrations: {
    last7Days: number;
    last30Days: number;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    responseTime: number;
  };
}

export interface UserFilters {
  status?: 'active' | 'inactive' | 'suspended';
  verificationLevel?: 'unverified' | 'email' | 'phone' | 'full';
  registrationDateFrom?: Date;
  registrationDateTo?: Date;
  hasBusinessAccount?: boolean;
}

class AdminService {
  private baseUrl = 'https://api.accesslink-lgbtq.com/admin';

  // Authentication
  async adminLogin(email: string, password: string): Promise<AdminUser> {
    try {
      // Mock implementation - replace with actual API call
      if (email === 'admin@accesslink.com' && password === 'AdminPass123!') {
        return {
          uid: 'admin-1',
          email: 'admin@accesslink.com',
          displayName: 'System Administrator',
          role: 'admin' as const,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: {},
          isAdmin: true,
          adminLevel: 'super' as const,
          permissions: [
            { id: '1', name: 'User Management', category: 'users' },
            { id: '2', name: 'Business Management', category: 'businesses' },
            { id: '3', name: 'Content Moderation', category: 'content' },
            { id: '4', name: 'Platform Management', category: 'platform' }
          ]
        };
      }
      throw new Error('Invalid admin credentials');
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  async verifyAdminToken(token: string): Promise<boolean> {
    try {
      // Mock implementation - replace with actual API call
      return token === 'admin-token-123';
    } catch (error) {
      console.error('Admin token verification error:', error);
      return false;
    }
  }

  // Platform Statistics
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      // Mock implementation - replace with actual API call
      return {
        totalUsers: 12450,
        activeUsers: 8230,
        totalBusinesses: 890,
        verifiedBusinesses: 634,
        totalReviews: 3420,
        recentRegistrations: {
          last7Days: 45,
          last30Days: 180
        },
        systemHealth: {
          status: 'healthy',
          uptime: 99.8,
          responseTime: 145
        }
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      throw error;
    }
  }

  // User Management
  async getUsers(page: number = 1, pageSize: number = 50, search?: string, filters?: UserFilters): Promise<{users: UserDetails[], totalCount: number}> {
    try {
      // Mock implementation - replace with actual API call
      const mockUsers: UserDetails[] = [
        {
          uid: 'user-1',
          email: 'alex@example.com',
          displayName: 'Alex Johnson',
          role: 'user',
          isEmailVerified: true,
          createdAt: new Date('2025-06-15'),
          updatedAt: new Date('2025-07-27'),
          profile: {},
          registrationDate: new Date('2025-06-15'),
          lastLoginDate: new Date('2025-07-27'),
          accountStatus: 'active',
          verificationLevel: 'email',
          reviewCount: 12,
          businessCount: 0,
          adminNotes: []
        },
        {
          uid: 'user-2',
          email: 'business@rainbowcafe.com',
          displayName: 'Rainbow Café',
          role: 'business_owner',
          isEmailVerified: true,
          createdAt: new Date('2025-05-20'),
          updatedAt: new Date('2025-07-28'),
          profile: {},
          registrationDate: new Date('2025-05-20'),
          lastLoginDate: new Date('2025-07-28'),
          accountStatus: 'active',
          verificationLevel: 'full',
          reviewCount: 3,
          businessCount: 1,
          adminNotes: [
            {
              id: 'note-1',
              adminId: 'admin-1',
              adminName: 'System Administrator',
              note: 'Verified business documentation',
              timestamp: new Date('2025-05-21'),
              severity: 'info'
            }
          ]
        }
      ];

      return {
        users: mockUsers,
        totalCount: mockUsers.length
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserDetails(userId: string): Promise<UserDetails> {
    try {
      // Mock implementation - replace with actual API call
      const users = await this.getUsers();
      const user = users.users.find(u => u.uid === userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Updating user ${userId} status to ${status}`);
      // In real implementation, make API request to update user status
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async addUserNote(userId: string, note: string, severity: 'info' | 'warning' | 'critical' = 'info'): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Adding note to user ${userId}: ${note}`);
      // In real implementation, make API request to add admin note
    } catch (error) {
      console.error('Error adding user note:', error);
      throw error;
    }
  }

  // System Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      // Mock implementation - replace with actual API call
      return [
        {
          id: 'ann-1',
          title: 'Platform Maintenance',
          content: 'Scheduled maintenance will occur on Sunday, August 3rd from 2-4 AM EST.',
          priority: 'info',
          targetAudience: 'all',
          publishDate: new Date('2025-07-28'),
          expireDate: new Date('2025-08-04'),
          isActive: true,
          isDismissible: true,
          createdBy: 'admin-1',
          createdAt: new Date('2025-07-28')
        }
      ];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  }

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdBy' | 'createdAt'>): Promise<string> {
    try {
      // Mock implementation - replace with actual API call
      const id = `ann-${Date.now()}`;
      console.log('Creating announcement:', { id, ...announcement });
      return id;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  async updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Updating announcement ${id}:`, announcement);
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  async deleteAnnouncement(id: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Deleting announcement ${id}`);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  // Feature Flags
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      // Mock implementation - replace with actual API call
      return [
        {
          id: 'flag-reviews',
          name: 'User Reviews',
          description: 'Enable user review and rating system',
          category: 'users',
          isEnabled: true,
          rolloutPercentage: 100,
          targetGroups: ['all'],
          dependencies: [],
          lastModified: new Date('2025-07-15'),
          lastModifiedBy: 'admin-1'
        },
        {
          id: 'flag-events',
          name: 'Business Events',
          description: 'Allow businesses to create and manage events',
          category: 'businesses',
          isEnabled: true,
          rolloutPercentage: 100,
          targetGroups: ['verified-businesses'],
          dependencies: [],
          lastModified: new Date('2025-07-20'),
          lastModifiedBy: 'admin-1'
        },
        {
          id: 'flag-messaging',
          name: 'Direct Messaging',
          description: 'Enable direct messaging between users and businesses',
          category: 'experimental',
          isEnabled: false,
          rolloutPercentage: 0,
          targetGroups: ['beta-users'],
          dependencies: ['flag-reviews'],
          lastModified: new Date('2025-07-25'),
          lastModifiedBy: 'admin-1'
        }
      ];
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      throw error;
    }
  }

  async updateFeatureFlag(flagId: string, enabled: boolean): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Updating feature flag ${flagId} to ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating feature flag:', error);
      throw error;
    }
  }

  async setFeatureRollout(flagId: string, percentage: number): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Setting feature flag ${flagId} rollout to ${percentage}%`);
    } catch (error) {
      console.error('Error setting feature rollout:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();

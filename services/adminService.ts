import { UserProfile } from './authService';
import { databaseService } from './webDatabaseService';

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
  role?: 'user' | 'business_owner' | 'admin';
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
      // Get all users from database
      const allUsers = await databaseService.getAllUsers();
      
      // Convert to UserDetails format and apply filters
      let filteredUsers = allUsers.map(user => this.convertToUserDetails(user));
      
      // Apply search filter
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.email.toLowerCase().includes(searchLower) ||
          user.displayName.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply status filter
      if (filters?.status) {
        filteredUsers = filteredUsers.filter(user => user.accountStatus === filters.status);
      }
      
      // Apply user type filter
      if (filters?.role) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }
      
      const totalCount = filteredUsers.length;
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
      
      return {
        users: paginatedUsers,
        totalCount
      };
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  private convertToUserDetails(user: any): UserDetails {
    // Parse admin notes if they exist
    let adminNotes: AdminNote[] = [];
    if (user.adminNotes) {
      try {
        adminNotes = JSON.parse(user.adminNotes);
      } catch (e) {
        console.warn('Failed to parse admin notes for user', user.id);
        adminNotes = [];
      }
    }

    return {
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.userType as any,
      isEmailVerified: true, // Assume verified for now
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.lastModified || user.createdAt),
      profile: {},
      registrationDate: new Date(user.createdAt),
      lastLoginDate: new Date(user.lastLoginAt),
      accountStatus: user.accountStatus || 'active',
      verificationLevel: 'email', // Default verification level
      reviewCount: 0, // TODO: Calculate from reviews
      businessCount: 0, // TODO: Calculate from businesses
      adminNotes
    };
  }

  async getUserDetails(userId: string): Promise<UserDetails> {
    try {
      // Get user from database
      const user = await databaseService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return this.convertToUserDetails(user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    try {
      console.log(`Updating user ${userId} status to ${status}`);
      
      // Get the current user data
      const user = await databaseService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update the user with new status
      const updatedUser = {
        ...user,
        accountStatus: status,
        lastModified: new Date().toISOString()
      };

      // Save the updated user back to the database
      await databaseService.updateUser(updatedUser);
      
      console.log(`✅ User ${userId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async addUserNote(userId: string, note: string, severity: 'info' | 'warning' | 'critical' = 'info'): Promise<void> {
    try {
      console.log(`Adding note to user ${userId}: ${note}`);
      
      // Get the current user data
      const user = await databaseService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Parse existing admin notes or create empty array
      let adminNotes: AdminNote[] = [];
      if (user.adminNotes) {
        try {
          adminNotes = JSON.parse(user.adminNotes);
        } catch (e) {
          console.warn('Failed to parse existing admin notes, starting fresh');
          adminNotes = [];
        }
      }

      // Create new admin note
      const newNote: AdminNote = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        adminId: 'admin', // TODO: Get actual admin ID from auth context
        adminName: 'Administrator', // TODO: Get actual admin name from auth context
        note,
        timestamp: new Date(),
        severity
      };

      // Add the new note
      adminNotes.unshift(newNote); // Add to beginning

      // Keep only the last 20 notes to prevent excessive storage
      if (adminNotes.length > 20) {
        adminNotes = adminNotes.slice(0, 20);
      }

      // Update the user with new notes
      const updatedUser = {
        ...user,
        adminNotes: JSON.stringify(adminNotes),
        lastModified: new Date().toISOString()
      };

      // Save the updated user back to the database
      await databaseService.updateUser(updatedUser);
      
      console.log(`✅ Note added to user ${userId}`);
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

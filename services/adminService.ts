import { UserProfile } from './authService';
import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  orderBy,
  limit,
  startAfter,
  Timestamp,
} from 'firebase/firestore';

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

// Raw data structure for a note from Firestore
export interface FirestoreAdminNote {
  id: string;
  adminId: string;
  adminName: string;
  note: string;
  timestamp: Timestamp | string; // Can be a Firestore Timestamp or an ISO string
  severity: 'info' | 'warning' | 'critical';
}

// Raw data structure for a user from Firestore
export interface FirestoreUser {
  id: string;
  email: string;
  displayName: string;
  role?: 'user' | 'business_owner' | 'admin';
  userType?: 'user' | 'business_owner' | 'admin'; // Legacy field
  isEmailVerified?: boolean;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  // TODO: Define a proper type for the user profile
  profile?: any; 
  registrationDate?: Timestamp | string;
  lastLoginDate?: Timestamp | string;
  accountStatus?: 'active' | 'inactive' | 'suspended';
  verificationLevel?: 'unverified' | 'email' | 'phone' | 'full';
  reviewCount?: number;
  businessCount?: number;
  adminNotes?: FirestoreAdminNote[] | string; // Can be an array or a JSON string
}

class AdminService {
  private baseUrl = 'https://api.accesslink-lgbtq.com/admin';

  // Authentication
  async adminLogin(email: string, password: string): Promise<AdminUser> {
    try {
      // Mock implementation - replace with actual API call
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
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
      const usersRef = collection(db, 'users');
      let q = query(usersRef);

      // Apply filters
      if (filters?.status) {
        q = query(q, where('accountStatus', '==', filters.status));
      }
      if (filters?.role) {
        q = query(q, where('role', '==', filters.role));
      }
      if (filters?.verificationLevel) {
        q = query(q, where('verificationLevel', '==', filters.verificationLevel));
      }

      // Apply search (Firestore doesn't support OR, so fetch and filter client-side)
      const snapshot = await getDocs(q);
      let users: UserDetails[] = [];
      snapshot.forEach(docSnap => {
        const user = this.convertToUserDetails({ ...docSnap.data(), id: docSnap.id } as FirestoreUser);
        users.push(user);
      });

      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        users = users.filter(user =>
          user.email.toLowerCase().includes(searchLower) ||
          user.displayName.toLowerCase().includes(searchLower)
        );
      }

      const totalCount = users.length;
      // Pagination (client-side for now)
      const paginatedUsers = users.slice((page - 1) * pageSize, page * pageSize);
      return { users: paginatedUsers, totalCount };
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  private convertToUserDetails(user: FirestoreUser): UserDetails {
    let adminNotes: AdminNote[] = [];
    if (user.adminNotes) {
      if (Array.isArray(user.adminNotes)) {
        adminNotes = user.adminNotes.map((note: FirestoreAdminNote) => ({
          ...note,
          timestamp: note.timestamp instanceof Timestamp ? note.timestamp.toDate() : new Date(note.timestamp)
        }));
      } else if (typeof user.adminNotes === 'string') {
        try {
          // Attempt to parse the string, assuming it's a JSON array of notes
          const parsedNotes: FirestoreAdminNote[] = JSON.parse(user.adminNotes);
          adminNotes = parsedNotes.map(note => ({
            ...note,
            timestamp: typeof note.timestamp === 'string' ? new Date(note.timestamp) : (note.timestamp as Timestamp).toDate(),
          }));
        } catch (e) {
          // If parsing fails, treat it as an empty array
          console.warn(`Could not parse adminNotes for user ${user.id}`, e);
          adminNotes = [];
        }
      }
    }
    const createdAtDate = user.createdAt instanceof Timestamp ? user.createdAt.toDate() : new Date(user.createdAt);
    const updatedAtDate = user.updatedAt ? (user.updatedAt instanceof Timestamp ? user.updatedAt.toDate() : new Date(user.updatedAt)) : createdAtDate;
    const registrationDate = user.registrationDate ? (user.registrationDate instanceof Timestamp ? user.registrationDate.toDate() : new Date(user.registrationDate)) : createdAtDate;
    const lastLoginDate = user.lastLoginDate ? (user.lastLoginDate instanceof Timestamp ? user.lastLoginDate.toDate() : new Date(user.lastLoginDate)) : createdAtDate;

    return {
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role || user.userType || 'user',
      isEmailVerified: user.isEmailVerified ?? true,
      createdAt: createdAtDate,
      updatedAt: updatedAtDate,
      profile: user.profile || {},
      registrationDate: registrationDate,
      lastLoginDate: lastLoginDate,
      accountStatus: user.accountStatus || 'active',
      verificationLevel: user.verificationLevel || 'email',
      reviewCount: user.reviewCount || 0,
      businessCount: user.businessCount || 0,
      adminNotes
    };
  }

  async getUserDetails(userId: string): Promise<UserDetails> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error('User not found');
      }
      return this.convertToUserDetails({ ...userSnap.data(), id: userSnap.id } as FirestoreUser);
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        accountStatus: status,
        updatedAt: new Date()
      });
      console.log(`✅ User ${userId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async addUserNote(userId: string, note: string, severity: 'info' | 'warning' | 'critical' = 'info', adminId: string = 'admin', adminName: string = 'Administrator'): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error('User not found');
      const userData = userSnap.data();
      let adminNotes: AdminNote[] = Array.isArray(userData.adminNotes) ? userData.adminNotes : [];
      const newNote: AdminNote = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        adminId,
        adminName,
        note,
        timestamp: new Date(),
        severity
      };
      adminNotes.unshift(newNote);
      if (adminNotes.length > 20) adminNotes = adminNotes.slice(0, 20);
      await updateDoc(userRef, {
        adminNotes,
        updatedAt: new Date()
      });
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

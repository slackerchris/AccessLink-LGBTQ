/**
 * Debug Service
 * Provides debugging tools and system information for admin dashboard
 */

import { adminService } from './adminService';
import { UserProfile } from './authService';
import { businessService, BusinessListing } from './businessService';
import { getAllReviews, Review } from './reviewService';
import { logger } from '../utils/logger';
import { Timestamp } from 'firebase/firestore';

export interface SystemInfo {
  platform: string;
  timestamp: string;
  userAgent: string;
  url: string;
  localStorage: { [key: string]: string | null };
  indexedDBSupport: boolean;
  databases: string[];
}

export interface DatabaseStats {
  totalUsers: number;
  totalBusinesses: number;
  totalReviews: number;
  usersByRole: { [key: string]: number };
  businessesByCategory: { [key: string]: number };
  recentUsers: UserProfile[];
  recentBusinesses: BusinessListing[];
  recentReviews: Review[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: unknown;
}

class DebugService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isLogging = false; // Prevent infinite recursion

  // Log collection
  log(level: LogEntry['level'], category: string, message: string, data?: unknown) {
    // Prevent infinite recursion when console methods call this
    if (this.isLogging) return;
    
    this.isLogging = true;
    
    try {
      const entry: LogEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        level,
        category,
        message,
        data
      };

      this.logs.unshift(entry);
      
      // Keep only recent logs
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(0, this.maxLogs);
      }

      // Only log to console if this isn't from console interception
      if (category !== 'Console') {
        const consoleMethod = level === 'error' ? 'error' : 
                             level === 'warn' ? 'warn' : 
                             level === 'debug' ? 'debug' : 'log';
        
        // Use original console methods to avoid recursion
        const originalConsole = (globalThis as any).__originalConsole;
        if (originalConsole && originalConsole[consoleMethod]) {
          originalConsole[consoleMethod](`[${category}] ${message}`, data || '');
        }
      }
    } finally {
      this.isLogging = false;
    }
  }

  info(category: string, message: string, data?: unknown) {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: unknown) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: unknown) {
    this.log('error', category, message, data);
  }

  debug(category: string, message: string, data?: unknown) {
    this.log('debug', category, message, data);
  }

  // Get logs with filtering
  getLogs(options?: {
    level?: LogEntry['level'];
    category?: string;
    limit?: number;
    since?: string;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (options?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === options.level);
    }

    if (options?.category) {
      filteredLogs = filteredLogs.filter(log => 
        log.category.toLowerCase().includes(options.category!.toLowerCase())
      );
    }

    if (options?.since) {
      const sinceDate = new Date(options.since);
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= sinceDate
      );
    }

    if (options?.limit) {
      filteredLogs = filteredLogs.slice(0, options.limit);
    }

    return filteredLogs;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.info('Debug', 'Logs cleared');
  }

  // System information
  async getSystemInfo(): Promise<SystemInfo> {
    const localStorage: { [key: string]: any } = {};
    
    // Safely collect localStorage data
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          localStorage[key] = window.localStorage.getItem(key);
        }
      }
    } catch (error) {
      this.warn('Debug', 'Could not access localStorage', error);
    }

    // Check IndexedDB support
    const indexedDBSupport = 'indexedDB' in window;

    // Get available databases (simplified)
    let databases: string[] = [];
    try {
      if (indexedDBSupport && 'databases' in indexedDB) {
        const dbList = await indexedDB.databases();
        databases = dbList.map(db => db.name || 'unnamed');
      } else {
        databases = ['AccessLink-LGBTQ-DB']; // Our main database
      }
    } catch (error) {
      this.warn('Debug', 'Could not list databases', error);
      databases = ['AccessLink-LGBTQ-DB'];
    }

    return {
      platform: navigator.platform,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      localStorage,
      indexedDBSupport,
      databases
    };
  }

  // Database statistics
  async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      // Get all data
      const { users } = await adminService.getUsers(1, 10000); // Use adminService and a larger limit
      const { businesses } = await businessService.getAllBusinesses();
      const { reviews } = await getAllReviews();

      // Calculate statistics
      const usersByRole: { [key: string]: number } = {};
      users.forEach(user => {
        const role = user.role || 'user';
        usersByRole[role] = (usersByRole[role] || 0) + 1;
      });

      const businessesByCategory: { [key: string]: number } = {};
      businesses.forEach(business => {
        const category = business.category || 'other';
        businessesByCategory[category] = (businessesByCategory[category] || 0) + 1;
      });

      // Get recent items (last 10)
      const recentUsers = [...users]
        .sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime())
        .slice(0, 10);

      const recentBusinesses = [...businesses]
        .sort((a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime())
        .slice(0, 10);

      const recentReviews = [...reviews]
        .sort((a, b) => (b.createdAt as Timestamp).toDate().getTime() - (a.createdAt as Timestamp).toDate().getTime())
        .slice(0, 10);

      return {
        totalUsers: users.length,
        totalBusinesses: businesses.length,
        totalReviews: reviews.length,
        usersByRole,
        businessesByCategory,
        recentUsers: recentUsers as UserProfile[],
        recentBusinesses,
        recentReviews
      };
    } catch (error) {
      this.error('Debug', 'Failed to get database stats', error);
      throw error;
    }
  }

  // Database operations for debugging
  async executeQuery(query: string): Promise<any> {
    this.info('Debug', 'Executing debug query', { query });
    
    try {
      // Simple query parser for common operations
      const lowerQuery = query.toLowerCase().trim();
      
      if (lowerQuery.startsWith('select * from users')) {
        return (await adminService.getUsers(1, 1000)).users;
      } else if (lowerQuery.startsWith('select * from businesses')) {
        return (await businessService.getAllBusinesses()).businesses;
      } else if (lowerQuery.startsWith('select * from reviews')) {
        return (await getAllReviews()).reviews;
      } else if (lowerQuery.includes('count') && lowerQuery.includes('users')) {
        const { totalCount } = await adminService.getUsers(1, 1);
        return [{ count: totalCount }];
      } else if (lowerQuery.includes('count') && lowerQuery.includes('businesses')) {
        const { businesses } = await businessService.getAllBusinesses();
        return [{ count: businesses.length }];
      } else if (lowerQuery.includes('count') && lowerQuery.includes('reviews')) {
        const { reviews } = await getAllReviews();
        return [{ count: reviews.length }];
      } else {
        throw new Error(`Unsupported query: ${query}. Supported: SELECT * FROM [users|businesses|reviews], COUNT(*) FROM [table]`);
      }
    } catch (error) {
      this.error('Debug', 'Query execution failed', { query, error });
      throw error;
    }
  }

  // Performance monitoring
  async runPerformanceTest(): Promise<{
    dbReadTime: number;
    dbWriteTime: number;
    authTime: number;
    timestamp: string;
  }> {
    this.info('Debug', 'Starting performance test');

    // Test database read performance
    const readStart = performance.now();
    await adminService.getUsers(1, 100);
    const readEnd = performance.now();
    const dbReadTime = readEnd - readStart;

    // Test database write performance (create and delete a test user)
    const writeStart = performance.now();
    try {
      const testUser: UserProfile = {
        uid: 'perf-test-' + Date.now(),
        email: 'perf-test@example.com',
        displayName: 'Performance Test User',
        role: 'user',
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {}
      };
      // These methods don't exist, would need to implement in authService
      // await authService.createUser(testUser); 
      // await authService.deleteUser(testUser.uid);
    } catch (error) {
      this.warn('Debug', 'Performance test write operation failed', error);
    }
    const writeEnd = performance.now();
    const dbWriteTime = writeEnd - writeStart;

    // Skip auth service test to avoid circular dependency
    const authTime = 0; // Placeholder

    const results = {
      dbReadTime,
      dbWriteTime,
      authTime,
      timestamp: new Date().toISOString()
    };

    this.info('Debug', 'Performance test completed', results);
    return results;
  }

  // Export data for debugging
  async exportData(): Promise<{
    users: UserProfile[];
    businesses: BusinessListing[];
    reviews: Review[];
    logs: LogEntry[];
    systemInfo: SystemInfo;
    timestamp: string;
  }> {
    this.info('Debug', 'Exporting debug data');

    const [{ users }, { businesses }, { reviews }, systemInfo] = await Promise.all([
      adminService.getUsers(1, 10000),
      businessService.getAllBusinesses(),
      getAllReviews(),
      this.getSystemInfo()
    ]);

    return {
      users: users as UserProfile[],
      businesses,
      reviews,
      logs: this.logs,
      systemInfo,
      timestamp: new Date().toISOString()
    };
  }

  // Import sample data for testing
  async importSampleData(): Promise<void> {
    this.info('Debug', 'Importing additional sample data');
    
    try {
      // This would require a registration flow
      this.warn('Debug', 'Sample data import needs to be implemented via authService.registerUser');
    } catch (error) {
      this.error('Debug', 'Failed to import sample data', error);
      throw error;
    }
  }
}

// Create singleton instance
export const debugService = new DebugService();

// Replace console logging with our logger
logger.overrideConsole();

// Log initial system information
debugService.info('Debug', 'Debug service initialized');

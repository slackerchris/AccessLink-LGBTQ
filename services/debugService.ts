/**
 * Debug Service
 * Provides debugging tools and system information for admin dashboard
 */

import { databaseService } from './webDatabaseService';
import { webAuthService } from './webAuthService';
import type { User, Business, Review } from './webDatabaseService';

export interface SystemInfo {
  platform: string;
  timestamp: string;
  userAgent: string;
  url: string;
  localStorage: { [key: string]: any };
  indexedDBSupport: boolean;
  databases: string[];
}

export interface DatabaseStats {
  totalUsers: number;
  totalBusinesses: number;
  totalReviews: number;
  usersByType: { [key: string]: number };
  businessesByCategory: { [key: string]: number };
  recentUsers: User[];
  recentBusinesses: Business[];
  recentReviews: Review[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: any;
}

class DebugService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isLogging = false; // Prevent infinite recursion

  // Log collection
  log(level: LogEntry['level'], category: string, message: string, data?: any) {
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

  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.log('error', category, message, data);
  }

  debug(category: string, message: string, data?: any) {
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
      const users = await databaseService.getAllUsers();
      const businesses = await databaseService.getAllBusinesses();
      const reviews = await databaseService.getAllReviews();

      // Calculate statistics
      const usersByType: { [key: string]: number } = {};
      users.forEach(user => {
        usersByType[user.userType] = (usersByType[user.userType] || 0) + 1;
      });

      const businessesByCategory: { [key: string]: number } = {};
      businesses.forEach(business => {
        const category = business.category || 'uncategorized';
        businessesByCategory[category] = (businessesByCategory[category] || 0) + 1;
      });

      // Get recent items (last 10)
      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10);

      const recentBusinesses = businesses
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10);

      const recentReviews = reviews
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10);

      return {
        totalUsers: users.length,
        totalBusinesses: businesses.length,
        totalReviews: reviews.length,
        usersByType,
        businessesByCategory,
        recentUsers,
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
        return await databaseService.getAllUsers();
      } else if (lowerQuery.startsWith('select * from businesses')) {
        return await databaseService.getAllBusinesses();
      } else if (lowerQuery.startsWith('select * from reviews')) {
        return await databaseService.getAllReviews();
      } else if (lowerQuery.includes('count') && lowerQuery.includes('users')) {
        const users = await databaseService.getAllUsers();
        return [{ count: users.length }];
      } else if (lowerQuery.includes('count') && lowerQuery.includes('businesses')) {
        const businesses = await databaseService.getAllBusinesses();
        return [{ count: businesses.length }];
      } else if (lowerQuery.includes('count') && lowerQuery.includes('reviews')) {
        const reviews = await databaseService.getAllReviews();
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
    await databaseService.getAllUsers();
    const readEnd = performance.now();
    const dbReadTime = readEnd - readStart;

    // Test database write performance (create and delete a test user)
    const writeStart = performance.now();
    try {
      const testUser: User = {
        id: 'perf-test-' + Date.now(),
        email: 'perf-test@example.com',
        displayName: 'Performance Test User',
        userType: 'user',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileData: '{}'
      };
      await databaseService.createUser(testUser);
      await databaseService.deleteUser(testUser.id);
    } catch (error) {
      this.warn('Debug', 'Performance test write operation failed', error);
    }
    const writeEnd = performance.now();
    const dbWriteTime = writeEnd - writeStart;

    // Test auth service performance
    const authStart = performance.now();
    try {
      await webAuthService.getCurrentUser();
    } catch (error) {
      // Expected if no user is logged in
    }
    const authEnd = performance.now();
    const authTime = authEnd - authStart;

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
    users: User[];
    businesses: Business[];
    reviews: Review[];
    logs: LogEntry[];
    systemInfo: SystemInfo;
    timestamp: string;
  }> {
    this.info('Debug', 'Exporting debug data');

    const [users, businesses, reviews, systemInfo] = await Promise.all([
      databaseService.getAllUsers(),
      databaseService.getAllBusinesses(),
      databaseService.getAllReviews(),
      this.getSystemInfo()
    ]);

    return {
      users,
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
      // Create some test users
      const testUsers: User[] = [
        {
          id: 'test-user-1-' + Date.now(),
          email: 'test-user-1@example.com',
          displayName: 'Test User 1',
          userType: 'user',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          profileData: '{}'
        },
        {
          id: 'test-business-1-' + Date.now(),
          email: 'test-business-1@example.com',
          displayName: 'Test Business Owner 1',
          userType: 'business',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          profileData: '{}'
        }
      ];

      for (const userData of testUsers) {
        await databaseService.createUser(userData);
      }

      this.info('Debug', 'Sample data imported successfully');
    } catch (error) {
      this.error('Debug', 'Failed to import sample data', error);
      throw error;
    }
  }
}

// Create singleton instance
export const debugService = new DebugService();

// Store original console methods globally to prevent recursion
(globalThis as any).__originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info
};

const originalConsole = (globalThis as any).__originalConsole;

// Hook into console methods to capture logs (but prevent recursion)
console.log = (...args) => {
  if (!debugService['isLogging']) {
    debugService.log('info', 'Console', args.join(' '));
  }
  originalConsole.log(...args);
};

console.warn = (...args) => {
  if (!debugService['isLogging']) {
    debugService.log('warn', 'Console', args.join(' '));
  }
  originalConsole.warn(...args);
};

console.error = (...args) => {
  if (!debugService['isLogging']) {
    debugService.log('error', 'Console', args.join(' '));
  }
  originalConsole.error(...args);
};

console.info = (...args) => {
  if (!debugService['isLogging']) {
    debugService.log('info', 'Console', args.join(' '));
  }
  originalConsole.info(...args);
};

// Log initial system information
debugService.info('Debug', 'Debug service initialized');

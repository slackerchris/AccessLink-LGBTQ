/**
 * Database Health Monitor
 * Provides diagnostic tools and health checks for Firebase services
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  limit,
  serverTimestamp,
  setDoc,
  deleteDoc,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';
import { businessCache, locationCache } from './cacheService';
import { ApprovedBusiness, BusinessListing } from './properBusinessService';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'critical';
  checks: {
    [key: string]: {
      status: 'ok' | 'degraded' | 'critical';
      latency?: number;
      message?: string;
      timestamp: Date;
    }
  };
  timestamp: Date;
}

export interface DatabaseStats {
  collections: { [collection: string]: number };
  cacheSize: { [cache: string]: number };
  lastUpdated: Date;
}

class DatabaseHealthMonitor {
  private healthCheckCollection = 'system_health';
  
  /**
   * Run health checks on database
   */
  public async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const checks: HealthCheckResult['checks'] = {};
    
    // Check auth connectivity
    try {
      const authStart = Date.now();
      const currentUser = auth.currentUser;
      checks.auth = {
        status: 'ok',
        latency: Date.now() - authStart,
        timestamp: new Date()
      };
    } catch (error) {
      checks.auth = {
        status: 'critical',
        message: error instanceof Error ? error.message : 'Unknown auth error',
        timestamp: new Date()
      };
    }
    
    // Check read access
    try {
      const readStart = Date.now();
      const testQuery = query(collection(db, 'businesses'), limit(1));
      const querySnapshot = await getDocs(testQuery);
      checks.readAccess = {
        status: 'ok',
        latency: Date.now() - readStart,
        timestamp: new Date()
      };
    } catch (error) {
      checks.readAccess = {
        status: 'critical',
        message: error instanceof Error ? error.message : 'Unknown read error',
        timestamp: new Date()
      };
    }
    
    // Check write access (admin only)
    if (auth.currentUser && await this.isCurrentUserAdmin()) {
      try {
        const writeStart = Date.now();
        const healthCheckDoc = doc(collection(db, this.healthCheckCollection), 'write_test');
        await setDoc(healthCheckDoc, {
          timestamp: serverTimestamp(),
          message: 'Health check write test'
        });
        await deleteDoc(healthCheckDoc);
        
        checks.writeAccess = {
          status: 'ok',
          latency: Date.now() - writeStart,
          timestamp: new Date()
        };
      } catch (error) {
        checks.writeAccess = {
          status: 'critical',
          message: error instanceof Error ? error.message : 'Unknown write error',
          timestamp: new Date()
        };
      }
    }
    
    // Check optimized collections consistency
    try {
      const consistencyStart = Date.now();
      const consistencyResult = await this.checkCollectionsConsistency();
      checks.collectionsConsistency = {
        status: consistencyResult.consistent ? 'ok' : 'degraded',
        latency: Date.now() - consistencyStart,
        message: consistencyResult.message,
        timestamp: new Date()
      };
    } catch (error) {
      checks.collectionsConsistency = {
        status: 'degraded',
        message: error instanceof Error ? error.message : 'Unknown consistency error',
        timestamp: new Date()
      };
    }
    
    // Calculate overall status
    const criticalChecks = Object.values(checks).filter(c => c.status === 'critical').length;
    const degradedChecks = Object.values(checks).filter(c => c.status === 'degraded').length;
    
    const status = criticalChecks > 0 ? 'critical' : (degradedChecks > 0 ? 'degraded' : 'ok');
    
    // Store health check result if admin
    if (auth.currentUser && await this.isCurrentUserAdmin()) {
      const healthCheckDoc = doc(collection(db, this.healthCheckCollection), 'latest');
      await setDoc(healthCheckDoc, {
        status,
        checksJson: JSON.stringify(checks),
        timestamp: serverTimestamp()
      });
    }
    
    return {
      status,
      checks,
      timestamp: new Date()
    };
  }
  
  /**
   * Check if collections are consistent
   */
  private async checkCollectionsConsistency(): Promise<{consistent: boolean, message: string}> {
    try {
      // Check for 3 approved businesses
      const approvedQuery = query(collection(db, 'approved_businesses'), limit(3));
      const approvedSnapshot = await getDocs(approvedQuery);
      
      if (approvedSnapshot.empty) {
        return { consistent: true, message: 'No approved businesses to check' };
      }
      
      let inconsistencies = 0;
      let checked = 0;
      
      // Check each business
      for (const docSnapshot of approvedSnapshot.docs) {
        const data = docSnapshot.data() as ApprovedBusiness;
        const businessId = data.businessId;
        checked++;
        
        if (!businessId) {
          inconsistencies++;
          continue;
        }
        
        // Check if business exists in master collection
        const businessRef = doc(db, 'businesses', businessId);
        const businessDoc = await getDoc(businessRef);
        if (!businessDoc.exists()) {
          inconsistencies++;
          continue;
        }
        
        // Check business status
        const businessData = businessDoc.data() as BusinessListing;
        if (businessData && businessData.status !== 'approved') {
          inconsistencies++;
        }
      }
      
      if (inconsistencies === 0) {
        return { 
          consistent: true, 
          message: `All ${checked} checked businesses are consistent` 
        };
      } else {
        return { 
          consistent: false, 
          message: `Found ${inconsistencies} inconsistencies out of ${checked} checked businesses` 
        };
      }
    } catch (error) {
      return { 
        consistent: false, 
        message: `Error checking consistency: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
  
  /**
   * Check if current user is admin
   */
  private async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return false;
      
      const userData = userDoc.data();
      return userData.role === 'admin';
    } catch {
      return false;
    }
  }
  
  /**
   * Get database statistics
   */
  public async getDatabaseStats(): Promise<DatabaseStats> {
    const stats: DatabaseStats = {
      collections: {},
      cacheSize: {
        business: businessCache.size(),
        location: locationCache.size()
      },
      lastUpdated: new Date()
    };
    
    if (!(auth.currentUser && await this.isCurrentUserAdmin())) {
      throw new Error('Only admins can access database statistics');
    }
    
    // Count documents in key collections
    const collections = [
      'businesses',
      'approved_businesses',
      'businesses_by_location',
      'featured_businesses',
      'users'
    ];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(query(collection(db, collectionName), limit(1000)));
        stats.collections[collectionName] = snapshot.size;
      } catch (error) {
        stats.collections[collectionName] = -1; // Error counting
      }
    }
    
    return stats;
  }
  
  /**
   * Clear all caches
   */
  public clearAllCaches(): void {
    businessCache.clear();
    locationCache.clear();
  }
}

// Export singleton instance
export const dbHealthMonitor = new DatabaseHealthMonitor();
export default dbHealthMonitor;

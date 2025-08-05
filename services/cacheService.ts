/**
 * In-Memory Cache Service
 * Provides caching capabilities for frequently accessed data
 */

export interface CacheOptions {
  ttl: number; // Time to live in milliseconds
  maxItems?: number; // Maximum number of items to store in cache
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private options: CacheOptions;
  
  constructor(options: Partial<CacheOptions> = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // Default 5 minutes
      maxItems: options.maxItems || 100  // Default 100 items
    };
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - item.timestamp > this.options.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T): void {
    // Check if we need to evict items
    if (this.options.maxItems && this.cache.size >= this.options.maxItems) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Check if cache has key
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Evict oldest cache items
   */
  private evictOldest(): void {
    // Find the oldest items
    const entries = Array.from(this.cache.entries());
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 10% of items
    const removeCount = Math.max(1, Math.floor(this.cache.size * 0.1));
    for (let i = 0; i < removeCount; i++) {
      if (entries[i]) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Get or set cache item with callback
   */
  async getOrSet<T>(key: string, callback: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const data = await callback();
    this.set(key, data);
    return data;
  }
}

// Create different cache instances for different data types
export const businessCache = new CacheService({ ttl: 5 * 60 * 1000 }); // 5 minutes
export const locationCache = new CacheService({ ttl: 30 * 60 * 1000 }); // 30 minutes
export const userCache = new CacheService({ ttl: 15 * 60 * 1000 }); // 15 minutes

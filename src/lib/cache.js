/**
 * Advanced API Cache Manager
 * Provides intelligent caching with TTL, LRU eviction, and cache invalidation
 */

class CacheManager {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100; // Maximum number of cached items
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes default TTL
    this.cache = new Map();
    this.accessOrder = new Map(); // For LRU tracking
    this.timers = new Map(); // For TTL cleanup
  }

  /**
   * Generate a cache key from parameters
   */
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Get item from cache
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const item = this.cache.get(key);
    
    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(key);
    
    return item.data;
  }

  /**
   * Set item in cache with TTL
   */
  set(key, data, ttl = this.defaultTTL) {
    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const expiresAt = Date.now() + ttl;
    
    // Clear existing timer if updating
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now()
    });
    
    this.timers.set(key, timer);
    this.updateAccessOrder(key);

    console.log(`Cache SET: ${key} (TTL: ${ttl}ms, Size: ${this.cache.size})`);
  }

  /**
   * Delete item from cache
   */
  delete(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
      
      console.log(`Cache DELETE: ${key}`);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    
    this.cache.clear();
    this.accessOrder.clear();
    this.timers.clear();
    
    console.log('Cache CLEARED');
  }

  /**
   * Update access order for LRU
   */
  updateAccessOrder(key) {
    this.accessOrder.delete(key);
    this.accessOrder.set(key, Date.now());
  }

  /**
   * Evict least recently used item
   */
  evictLRU() {
    if (this.accessOrder.size === 0) return;
    
    const oldestKey = this.accessOrder.keys().next().value;
    this.delete(oldestKey);
  }

  /**
   * Invalidate cache by pattern
   */
  invalidateByPattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
    console.log(`Cache INVALIDATED by pattern: ${pattern}, removed ${keysToDelete.length} items`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
      hits: this.hitCount || 0,
      misses: this.missCount || 0
    };
  }

  /**
   * Check if cache contains key and is not expired
   */
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }
    
    const item = this.cache.get(key);
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
}

// Create global cache instance
const apiCache = new CacheManager({
  maxSize: 150, // Store up to 150 API responses
  defaultTTL: 3 * 60 * 1000, // 3 minutes default cache
});

/**
 * Cache wrapper for API calls
 */
export const withCache = (cacheKey, apiCall, options = {}) => {
  const {
    ttl = apiCache.defaultTTL,
    forceRefresh = false,
    invalidatePattern = null
  } = options;

  return async (...args) => {
    // Generate cache key
    const key = typeof cacheKey === 'function' 
      ? cacheKey(...args) 
      : apiCache.generateKey(cacheKey, args[0] || {});

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = apiCache.get(key);
      if (cached) {
        console.log(`Cache HIT: ${key}`);
        apiCache.hitCount = (apiCache.hitCount || 0) + 1;
        return cached;
      }
    }

    console.log(`Cache MISS: ${key}`);
    apiCache.missCount = (apiCache.missCount || 0) + 1;

    try {
      // Invalidate related cache if pattern provided
      if (invalidatePattern) {
        apiCache.invalidateByPattern(invalidatePattern);
      }

      // Make API call
      const result = await apiCall(...args);
      
      // Cache the result
      apiCache.set(key, result, ttl);
      
      return result;
    } catch (error) {
      console.error(`API call failed for ${key}:`, error);
      throw error;
    }
  };
};

/**
 * Smart cache TTL based on data type
 */
export const getCacheTTL = (dataType, isRealTime = false) => {
  if (isRealTime) {
    return 30 * 1000; // 30 seconds for real-time data
  }

  const ttlMap = {
    leaderboard: 2 * 60 * 1000,     // 2 minutes - changes frequently
    campus: 10 * 60 * 1000,         // 10 minutes - relatively stable
    user: 5 * 60 * 1000,            // 5 minutes - moderate changes
    stats: 3 * 60 * 1000,           // 3 minutes - computed data
    progress: 1 * 60 * 1000,        // 1 minute - real-time progress
    cursus: 30 * 60 * 1000,         // 30 minutes - very stable
    default: 5 * 60 * 1000          // 5 minutes default
  };

  return ttlMap[dataType] || ttlMap.default;
};

/**
 * Cache utilities
 */
export const cacheUtils = {
  // Clear all cache
  clearAll: () => apiCache.clear(),
  
  // Get cache stats
  getStats: () => apiCache.getStats(),
  
  // Invalidate by pattern
  invalidate: (pattern) => apiCache.invalidateByPattern(pattern),
  
  // Manual cache operations
  set: (key, data, ttl) => apiCache.set(key, data, ttl),
  get: (key) => apiCache.get(key),
  delete: (key) => apiCache.delete(key),
  has: (key) => apiCache.has(key),
  
  // Preload common data
  preloadCache: async (commonRequests = []) => {
    console.log('Preloading cache with common requests...');
    
    const preloadPromises = commonRequests.map(async ({ key, apiCall, ttl }) => {
      try {
        const result = await apiCall();
        apiCache.set(key, result, ttl);
        console.log(`Preloaded: ${key}`);
      } catch (error) {
        console.warn(`Failed to preload ${key}:`, error);
      }
    });
    
    await Promise.allSettled(preloadPromises);
  }
};

export { apiCache };
export default apiCache;

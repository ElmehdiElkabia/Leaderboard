// Core caching engine for API responses
// Provides intelligent, performance-oriented caching with TTL-based expiration, LRU eviction, and cache invalidation

class CacheEngine {
  constructor(options = {}) {
    this.cache = new Map();
    this.accessTimes = new Map();
    this.expirationTimes = new Map();
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.persistKey = options.persistKey || 'app_cache';
    this.enablePersistence = options.enablePersistence !== false; // Default true
    
    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      sets: 0
    };
    
    // Load from localStorage on initialization
    if (this.enablePersistence) {
      this.loadFromStorage();
    }
    
    // Auto-cleanup expired entries every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30000);
    
    // Auto-save to localStorage every 60 seconds
    if (this.enablePersistence) {
      this.saveInterval = setInterval(() => {
        this.saveToStorage();
      }, 60000);
    }
  }

  // Generate a consistent cache key from parameters
  generateKey(namespace, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${namespace}:${sortedParams}`;
  }

  // Get data from cache
  get(key) {
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    const expirationTime = this.expirationTimes.get(key);
    if (expirationTime && Date.now() > expirationTime) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access time for LRU
    this.accessTimes.set(key, Date.now());
    this.stats.hits++;
    
    return this.cache.get(key);
  }

  // Set data in cache
  set(key, value, ttl = null) {
    const now = Date.now();
    const finalTTL = ttl || this.defaultTTL;

    // If cache is full, evict LRU item
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, value);
    this.accessTimes.set(key, now);
    this.expirationTimes.set(key, now + finalTTL);
    this.stats.sets++;

    // Trigger save to localStorage for important cache entries
    if (this.enablePersistence && key.includes('leaderboard:')) {
      this.debouncedSave();
    }

    return true;
  }

  // Load cache from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.persistKey);
      if (!stored) return;

      const data = JSON.parse(stored);
      const now = Date.now();

      // Restore non-expired entries
      for (const [key, entry] of Object.entries(data.entries || {})) {
        if (entry.expiresAt > now) {
          this.cache.set(key, entry.value);
          this.accessTimes.set(key, entry.accessTime);
          this.expirationTimes.set(key, entry.expiresAt);
        }
      }
    } catch (error) {
      // Silent fail for storage loading
    }
  }

  // Save cache to localStorage
  saveToStorage() {
    if (!this.enablePersistence) return;

    try {
      const now = Date.now();
      const entries = {};

      // Only save non-expired, important entries
      for (const [key, value] of this.cache) {
        const expiresAt = this.expirationTimes.get(key);
        const accessTime = this.accessTimes.get(key);

        // Only save if not expired and is important data
        if (expiresAt > now && (key.includes('leaderboard:') || key.includes('campus:') || key.includes('user:'))) {
          entries[key] = {
            value,
            expiresAt,
            accessTime
          };
        }
      }

      const data = {
        entries,
        savedAt: now,
        version: '1.0'
      };

      localStorage.setItem(this.persistKey, JSON.stringify(data));
    } catch (error) {
      // Silent fail for storage saving
    }
  }

  // Debounced save to avoid too frequent localStorage writes
  debouncedSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveToStorage();
    }, 2000); // Save after 2 seconds of inactivity
  }

  // Delete specific key
  delete(key) {
    const existed = this.cache.has(key);
    this.cache.delete(key);
    this.accessTimes.delete(key);
    this.expirationTimes.delete(key);
    return existed;
  }

  // Evict least recently used item
  evictLRU() {
    if (this.cache.size === 0) return;

    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, expirationTime] of this.expirationTimes) {
      if (now > expirationTime) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
  }

  // Invalidate entries by pattern
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
    return keysToDelete.length;
  }

  // Clear all cache
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.accessTimes.clear();
    this.expirationTimes.clear();
    return size;
  }

  // Get cache statistics
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      size: this.cache.size,
      maxSize: this.maxSize,
      evictions: this.stats.evictions,
      sets: this.stats.sets
    };
  }

  // Get cache contents (for debugging)
  getContents() {
    const contents = {};
    for (const [key, value] of this.cache) {
      const expiration = this.expirationTimes.get(key);
      const accessTime = this.accessTimes.get(key);
      contents[key] = {
        value,
        expiresAt: new Date(expiration).toISOString(),
        lastAccessed: new Date(accessTime).toISOString(),
        expired: Date.now() > expiration
      };
    }
    return contents;
  }

  // Destroy cache and cleanup
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    // Final save before destroying
    if (this.enablePersistence) {
      this.saveToStorage();
    }
    
    this.clear();
  }
}

// Specialized cache for leaderboard data
class LeaderboardCache extends CacheEngine {
  constructor() {
    super({
      maxSize: 200, // More entries for leaderboard data
      defaultTTL: 2 * 60 * 1000, // 2 minutes default for leaderboard
      persistKey: 'leaderboard_cache',
      enablePersistence: true // Enable persistence for leaderboard cache
    });
  }

  // Generate leaderboard-specific cache key
  getLeaderboardKey(params) {
    const {
      campus_id,
      cursus_id = 21,
      page = 1,
      per_page = 100,
      date_range = '',
      pool_month = 'all'
    } = params;

    return this.generateKey('leaderboard', {
      campus_id,
      cursus_id,
      page,
      per_page,
      date_range,
      pool_month
    });
  }

  // Cache leaderboard data
  setLeaderboardData(params, data, ttl = null) {
    const key = this.getLeaderboardKey(params);
    return this.set(key, data, ttl);
  }

  // Get cached leaderboard data
  getLeaderboardData(params) {
    const key = this.getLeaderboardKey(params);
    return this.get(key);
  }

  // Invalidate all cache for a specific campus
  invalidateCampus(campusId) {
    return this.invalidatePattern(`leaderboard:.*campus_id:${campusId}`);
  }

  // Invalidate all cache for a specific cursus
  invalidateCursus(cursusId) {
    return this.invalidatePattern(`leaderboard:.*cursus_id:${cursusId}`);
  }

  // Preload common data combinations
  async preloadCommonData(apiFunction) {
    if (!apiFunction) return;

    const commonCombinations = [
      { campus_id: 21, cursus_id: 21, page: 1 }, // Benguerir 42cursus
      { campus_id: 75, cursus_id: 21, page: 1 }, // Rabat 42cursus
      { campus_id: 55, cursus_id: 21, page: 1 }, // Tetouan 42cursus
      { campus_id: 16, cursus_id: 21, page: 1 }, // Khouribga 42cursus
    ];

    for (const params of commonCombinations) {
      if (!this.getLeaderboardData(params)) {
        try {
          const data = await apiFunction(params);
          this.setLeaderboardData(params, data);
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn('Preload failed for:', params, error);
        }
      }
    }
  }
}

// Export instances
export const cacheEngine = new CacheEngine({
  maxSize: 150,
  defaultTTL: 5 * 60 * 1000,
  persistKey: 'general_cache',
  enablePersistence: true
});
export const leaderboardCache = new LeaderboardCache();

// Export classes for custom instances
export { CacheEngine, LeaderboardCache };

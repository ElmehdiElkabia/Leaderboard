// Cached API wrapper - provides transparent caching for all API calls
import { api } from './api';
import { leaderboardCache, cacheEngine } from './cache';
import { cacheConfig } from './cache-config';

// Create specialized cache for different API endpoints
const createApiCache = (defaultTTL) => {
  return new Map(); // Simple in-memory cache for non-leaderboard APIs
};

class CachedApi {
  constructor() {
    this.userCache = createApiCache();
    this.campusCache = createApiCache();
    this.generalCache = createApiCache();
    
    // Cache statistics
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0
    };
  }

  // Helper to check if caching is enabled
  isCacheEnabled() {
    return cacheConfig.isEnabled();
  }

  // Helper to get TTL for specific data type
  getTTL(dataType) {
    return cacheConfig.getTTL(dataType);
  }

  // Generic cached fetch wrapper
  async cachedFetch(cacheKey, fetchFunction, dataType = 'leaderboard', customTTL = null) {
    this.stats.totalRequests++;

    if (!this.isCacheEnabled()) {
      // Cache disabled, fetch directly
      try {
        return await fetchFunction();
      } catch (error) {
        this.stats.errors++;
        throw error;
      }
    }

    // Try to get from cache first
    const cached = cacheEngine.get(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    // Cache miss, fetch from API
    this.stats.cacheMisses++;

    try {
      const data = await fetchFunction();
      
      // Store in cache
      const ttl = customTTL || this.getTTL(dataType);
      cacheEngine.set(cacheKey, data, ttl);
      
      return data;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  // Cached version of leaderboard data fetching
  async getLeaderboardData(params = {}) {
    const cacheKey = leaderboardCache.getLeaderboardKey(params);
    
    if (!this.isCacheEnabled()) {
      return await this.fetchLeaderboardDataDirect(params);
    }

    // Check leaderboard cache first
    const cached = leaderboardCache.getLeaderboardData(params);
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    // Cache miss, fetch from API
    this.stats.cacheMisses++;

    try {
      const data = await this.fetchLeaderboardDataDirect(params);
      
      // Store in leaderboard cache
      const ttl = this.getTTL('leaderboard');
      leaderboardCache.setLeaderboardData(params, data, ttl);
      
      return data;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  // Direct leaderboard data fetch (non-cached)
  async fetchLeaderboardDataDirect(params) {
    const {
      campus_id,
      page = 1,
      per_page = 100,
      cursus_id = 21,
      date_range,
      pool_month,
      search_login,
      filters = {}
    } = params;

    const requestPayload = {
      campus_id: parseInt(campus_id),
      page: parseInt(page),
      per_page: per_page,
      cursus_id: parseInt(cursus_id),
      date_range,
      pool_month: pool_month !== "all" ? pool_month : undefined,
      search_login: search_login || undefined,
      filters: {
        active_only: true,
        sort_by: "level",
        sort_order: "desc",
        ...filters
      }
    };

    // Remove undefined values
    Object.keys(requestPayload).forEach(key => {
      if (requestPayload[key] === undefined) {
        delete requestPayload[key];
      }
    });

    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-Purpose': 'Academic-Progress-Monitor',
        'X-Platform': 'web-dashboard',
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.status}`);
    }

    const apiResponse = await response.json();

    if (!apiResponse.success || !apiResponse.data) {
      throw new Error('Invalid response format');
    }

    return apiResponse.data;
  }

  // Cached version of cursus users
  async getCursusUsers(params = {}) {
    const cacheKey = cacheEngine.generateKey('cursus-users', params);
    
    return this.cachedFetch(
      cacheKey,
      () => api.getCursusUsers(params),
      'cursus',
      null
    );
  }

  // Cached version of campus data
  async getCampus(campusId = null) {
    const cacheKey = cacheEngine.generateKey('campus', { campusId });
    
    return this.cachedFetch(
      cacheKey,
      () => api.getCampus(campusId),
      'campus',
      null
    );
  }

  // Cached version of user data
  async getMe() {
    const cacheKey = 'user:me';
    
    return this.cachedFetch(
      cacheKey,
      () => api.getMe(),
      'user',
      null
    );
  }

  // Cached version of intra proxy
  async intraProxy(path, options = {}) {
    // For proxy calls, generate cache key based on path and params
    const cacheKey = cacheEngine.generateKey('intra-proxy', { 
      path, 
      method: options.method || 'GET',
      params: options.params || {} 
    });
    
    return this.cachedFetch(
      cacheKey,
      () => api.intraProxy(path, options),
      'stats', // Default to stats TTL for general API calls
      null
    );
  }

  // Cached versions of specific API methods
  async getProjects(params = {}) {
    const cacheKey = cacheEngine.generateKey('projects', params);
    
    return this.cachedFetch(
      cacheKey,
      () => api.getProjects(params),
      'cursus', // Projects are relatively stable
      null
    );
  }

  async getUsers(params = {}) {
    const cacheKey = cacheEngine.generateKey('users', params);
    
    return this.cachedFetch(
      cacheKey,
      () => api.getUsers(params),
      'user',
      null
    );
  }

  async getCoalitions(params = {}) {
    const cacheKey = cacheEngine.generateKey('coalitions', params);
    
    return this.cachedFetch(
      cacheKey,
      () => api.getCoalitions(params),
      'campus', // Coalitions are relatively stable
      null
    );
  }

  // Cache management methods
  
  // Invalidate cache for specific campus
  invalidateCampusCache(campusId) {
    const invalidated = leaderboardCache.invalidateCampus(campusId);
    return invalidated;
  }

  // Invalidate cache for specific cursus
  invalidateCursusCache(cursusId) {
    const invalidated = leaderboardCache.invalidateCursus(cursusId);
    return invalidated;
  }

  // Clear all caches
  clearAllCache() {
    const leaderboardCleared = leaderboardCache.clear();
    const generalCleared = cacheEngine.clear();
    
    // Reset stats
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0
    };
    
    return leaderboardCleared + generalCleared;
  }

  // Preload common data
  async preloadCommonData() {
    try {
      await leaderboardCache.preloadCommonData(this.getLeaderboardData.bind(this));
    } catch (error) {
      console.warn('Cache preload failed:', error);
    }
  }

  // Get cache statistics
  getCacheStats() {
    const leaderboardStats = leaderboardCache.getStats();
    const generalStats = cacheEngine.getStats();
    
    return {
      leaderboard: leaderboardStats,
      general: generalStats,
      api: {
        totalRequests: this.stats.totalRequests,
        cacheHits: this.stats.cacheHits,
        cacheMisses: this.stats.cacheMisses,
        errors: this.stats.errors,
        hitRate: this.stats.totalRequests > 0 
          ? (this.stats.cacheHits / this.stats.totalRequests) 
          : 0
      },
      combined: {
        totalHits: this.stats.cacheHits + leaderboardStats.hits + generalStats.hits,
        totalMisses: this.stats.cacheMisses + leaderboardStats.misses + generalStats.misses,
        totalSize: leaderboardStats.size + generalStats.size,
        overallHitRate: (() => {
          const totalHits = this.stats.cacheHits + leaderboardStats.hits + generalStats.hits;
          const totalRequests = totalHits + this.stats.cacheMisses + leaderboardStats.misses + generalStats.misses;
          return totalRequests > 0 ? totalHits / totalRequests : 0;
        })()
      }
    };
  }

  // Performance report
  getPerformanceReport() {
    const stats = this.getCacheStats();
    const config = cacheConfig.getConfig();
    
    return {
      performance: {
        overallHitRate: stats.combined.overallHitRate,
        totalCacheSize: stats.combined.totalSize,
        errorRate: this.stats.totalRequests > 0 
          ? this.stats.errors / this.stats.totalRequests 
          : 0
      },
      recommendations: cacheConfig.getRecommendations(),
      configuration: config,
      statistics: stats
    };
  }
}

// Create and export singleton instance
export const cachedApi = new CachedApi();

// Export for advanced usage
export { CachedApi };

// Convenience exports for cache management
export {
  leaderboardCache,
  cacheEngine
} from './cache';

export { cacheConfig } from './cache-config';

// Helper functions for common cache operations
export const cacheUtils = {
  // Clear cache for specific campus
  invalidateCampus: (campusId) => cachedApi.invalidateCampusCache(campusId),
  
  // Clear cache for specific cursus
  invalidateCursus: (cursusId) => cachedApi.invalidateCursusCache(cursusId),
  
  // Clear all caches
  clearAll: () => cachedApi.clearAllCache(),
  
  // Preload common data
  preload: () => cachedApi.preloadCommonData(),
  
  // Get performance stats
  getStats: () => cachedApi.getCacheStats(),
  
  // Get performance report
  getReport: () => cachedApi.getPerformanceReport(),
  
  // Switch cache presets
  setPerformanceMode: () => cacheConfig.setPreset('performance'),
  setRealtimeMode: () => cacheConfig.setPreset('realtime'),
  setBalancedMode: () => cacheConfig.setPreset('balanced'),
  
  // Enable/disable caching
  enable: () => cacheConfig.setEnabled(true),
  disable: () => cacheConfig.setEnabled(false)
};

/**
 * Cache configuration and management
 * Fine-tune caching behavior for optimal performance
 */

import { getCacheTTL } from './cache';

// Cache configuration presets
export const cachePresets = {
  // High performance - aggressive caching
  performance: {
    leaderboard: 5 * 60 * 1000,      // 5 minutes
    campus: 30 * 60 * 1000,          // 30 minutes
    user: 10 * 60 * 1000,            // 10 minutes
    stats: 5 * 60 * 1000,            // 5 minutes
    progress: 2 * 60 * 1000,         // 2 minutes
    cursus: 60 * 60 * 1000,          // 1 hour
  },
  
  // Balanced - moderate caching
  balanced: {
    leaderboard: 2 * 60 * 1000,      // 2 minutes
    campus: 15 * 60 * 1000,          // 15 minutes
    user: 5 * 60 * 1000,             // 5 minutes
    stats: 3 * 60 * 1000,            // 3 minutes
    progress: 1 * 60 * 1000,         // 1 minute
    cursus: 30 * 60 * 1000,          // 30 minutes
  },
  
  // Real-time - minimal caching
  realtime: {
    leaderboard: 30 * 1000,          // 30 seconds
    campus: 5 * 60 * 1000,           // 5 minutes
    user: 1 * 60 * 1000,             // 1 minute
    stats: 30 * 1000,                // 30 seconds
    progress: 15 * 1000,             // 15 seconds
    cursus: 10 * 60 * 1000,          // 10 minutes
  }
};

// Current cache configuration
let currentPreset = 'balanced';
let customTTLs = { ...cachePresets.balanced };

/**
 * Cache configuration API
 */
export const cacheConfig = {
  /**
   * Set cache preset
   */
  setPreset: (preset) => {
    if (cachePresets[preset]) {
      currentPreset = preset;
      customTTLs = { ...cachePresets[preset] };
      console.log(`Cache preset changed to: ${preset}`);
    }
  },

  /**
   * Get current preset
   */
  getPreset: () => currentPreset,

  /**
   * Set custom TTL for specific data type
   */
  setTTL: (dataType, ttl) => {
    customTTLs[dataType] = ttl;
    console.log(`Custom TTL set for ${dataType}: ${ttl}ms`);
  },

  /**
   * Get TTL for data type with current configuration
   */
  getTTL: (dataType, isRealTime = false) => {
    if (isRealTime) {
      return Math.min(customTTLs[dataType] || getCacheTTL(dataType), 30 * 1000);
    }
    return customTTLs[dataType] || getCacheTTL(dataType);
  },

  /**
   * Get all current TTL settings
   */
  getAllTTLs: () => ({ ...customTTLs }),

  /**
   * Reset to default preset
   */
  reset: () => {
    currentPreset = 'balanced';
    customTTLs = { ...cachePresets.balanced };
    console.log('Cache configuration reset to balanced preset');
  },

  /**
   * Get cache strategy recommendations based on usage pattern
   */
  getRecommendations: (usageStats) => {
    const recommendations = [];
    
    if (usageStats.hitRate < 0.3) {
      recommendations.push({
        type: 'warning',
        message: 'Low cache hit rate. Consider increasing TTL values.',
        action: 'setPreset',
        value: 'performance'
      });
    }
    
    if (usageStats.size > usageStats.maxSize * 0.9) {
      recommendations.push({
        type: 'warning',
        message: 'Cache near capacity. Consider clearing old entries.',
        action: 'clearCache',
        value: null
      });
    }
    
    if (usageStats.misses > usageStats.hits * 2) {
      recommendations.push({
        type: 'info',
        message: 'High miss rate detected. Data might be changing frequently.',
        action: 'setPreset',
        value: 'realtime'
      });
    }
    
    return recommendations;
  }
};

/**
 * Adaptive caching - automatically adjust TTL based on data freshness
 */
export class AdaptiveCache {
  constructor() {
    this.dataFreshness = new Map(); // Track how often data changes
    this.accessPatterns = new Map(); // Track access frequency
  }

  /**
   * Record data access and freshness
   */
  recordAccess(key, wasStale = false) {
    // Update access pattern
    const access = this.accessPatterns.get(key) || { count: 0, lastAccess: 0 };
    access.count++;
    access.lastAccess = Date.now();
    this.accessPatterns.set(key, access);

    // Update freshness tracking
    if (wasStale) {
      const freshness = this.dataFreshness.get(key) || { staleCount: 0, totalAccess: 0 };
      freshness.staleCount++;
      freshness.totalAccess++;
      this.dataFreshness.set(key, freshness);
    }
  }

  /**
   * Get adaptive TTL based on access patterns and freshness
   */
  getAdaptiveTTL(key, defaultTTL) {
    const freshness = this.dataFreshness.get(key);
    const access = this.accessPatterns.get(key);

    if (!freshness || !access) {
      return defaultTTL;
    }

    // Calculate stale rate
    const staleRate = freshness.staleCount / freshness.totalAccess;
    
    // Calculate access frequency (accesses per hour)
    const hoursActive = (Date.now() - (access.lastAccess - access.count * 60000)) / (60 * 60 * 1000);
    const accessFrequency = access.count / Math.max(hoursActive, 0.1);

    // Adjust TTL based on stale rate and access frequency
    let adaptiveTTL = defaultTTL;

    // If data goes stale frequently, reduce TTL
    if (staleRate > 0.3) {
      adaptiveTTL *= (1 - staleRate);
    }

    // If accessed frequently, might want shorter TTL for freshness
    if (accessFrequency > 10) {
      adaptiveTTL *= 0.8;
    }

    // Ensure reasonable bounds
    adaptiveTTL = Math.max(15 * 1000, Math.min(adaptiveTTL, 30 * 60 * 1000));

    return Math.round(adaptiveTTL);
  }

  /**
   * Clean up old tracking data
   */
  cleanup() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const [key, access] of this.accessPatterns.entries()) {
      if (access.lastAccess < oneHourAgo) {
        this.accessPatterns.delete(key);
        this.dataFreshness.delete(key);
      }
    }
  }
}

// Global adaptive cache instance
export const adaptiveCache = new AdaptiveCache();

// Cleanup adaptive cache data every hour
setInterval(() => {
  adaptiveCache.cleanup();
}, 60 * 60 * 1000);

export default cacheConfig;

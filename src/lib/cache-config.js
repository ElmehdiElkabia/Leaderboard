// Cache configuration and presets for different use cases
import { leaderboardCache, cacheEngine } from './cache';

// TTL configurations for different data types (in milliseconds)
const TTL_PRESETS = {
  // Real-time preset - minimal caching for frequently changing data
  realtime: {
    leaderboard: 15 * 1000,      // 15 seconds
    campus: 2 * 60 * 1000,       // 2 minutes
    user: 30 * 1000,             // 30 seconds
    stats: 15 * 1000,            // 15 seconds
    progress: 10 * 1000,         // 10 seconds
    cursus: 5 * 60 * 1000,       // 5 minutes
  },
  
  // Balanced preset - moderate caching (default)
  balanced: {
    leaderboard: 2 * 60 * 1000,  // 2 minutes
    campus: 15 * 60 * 1000,      // 15 minutes
    user: 5 * 60 * 1000,         // 5 minutes
    stats: 3 * 60 * 1000,        // 3 minutes
    progress: 1 * 60 * 1000,     // 1 minute
    cursus: 30 * 60 * 1000,      // 30 minutes
  },
  
  // Performance preset - aggressive caching for maximum performance
  performance: {
    leaderboard: 5 * 60 * 1000,  // 5 minutes
    campus: 30 * 60 * 1000,      // 30 minutes
    user: 10 * 60 * 1000,        // 10 minutes
    stats: 5 * 60 * 1000,        // 5 minutes
    progress: 3 * 60 * 1000,     // 3 minutes
    cursus: 60 * 60 * 1000,      // 1 hour
  }
};

class CacheConfig {
  constructor() {
    this.currentPreset = 'balanced';
    this.customTTLs = {};
    this.globalSettings = {
      enabled: true,
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB limit
      compressionEnabled: false,
      persistEnabled: false, // Future: localStorage persistence
    };
  }

  // Set cache preset
  setPreset(preset) {
    if (!TTL_PRESETS[preset]) {
      throw new Error(`Invalid preset: ${preset}. Available: ${Object.keys(TTL_PRESETS).join(', ')}`);
    }
    
    this.currentPreset = preset;
    
    // Update cache instances with new TTLs
    this.updateCacheSettings();
    
    return this;
  }

  // Get TTL for specific data type
  getTTL(dataType) {
    // Check custom TTL first
    if (this.customTTLs[dataType]) {
      return this.customTTLs[dataType];
    }
    
    // Fallback to preset
    const preset = TTL_PRESETS[this.currentPreset];
    return preset[dataType] || preset.leaderboard; // Default to leaderboard TTL
  }

  // Set custom TTL for specific data type
  setTTL(dataType, ttl) {
    this.customTTLs[dataType] = ttl;
    return this;
  }

  // Remove custom TTL (revert to preset)
  removeTTL(dataType) {
    delete this.customTTLs[dataType];
    return this;
  }

  // Update cache instances with current settings
  updateCacheSettings() {
    // Update default TTL for main cache
    if (cacheEngine) {
      cacheEngine.defaultTTL = this.getTTL('leaderboard');
    }
    
    // Update leaderboard cache
    if (leaderboardCache) {
      leaderboardCache.defaultTTL = this.getTTL('leaderboard');
    }
  }

  // Enable/disable caching globally
  setEnabled(enabled) {
    this.globalSettings.enabled = enabled;
    
    if (!enabled) {
      // Clear all caches when disabled
      cacheEngine?.clear();
      leaderboardCache?.clear();
    }
    
    return this;
  }

  // Check if caching is enabled
  isEnabled() {
    return this.globalSettings.enabled;
  }

  // Get current configuration
  getConfig() {
    return {
      preset: this.currentPreset,
      customTTLs: { ...this.customTTLs },
      globalSettings: { ...this.globalSettings },
      effectiveTTLs: {
        leaderboard: this.getTTL('leaderboard'),
        campus: this.getTTL('campus'),
        user: this.getTTL('user'),
        stats: this.getTTL('stats'),
        progress: this.getTTL('progress'),
        cursus: this.getTTL('cursus'),
      }
    };
  }

  // Reset to defaults
  reset() {
    this.currentPreset = 'balanced';
    this.customTTLs = {};
    this.globalSettings.enabled = true;
    this.updateCacheSettings();
    return this;
  }

  // Get performance recommendations based on usage
  getRecommendations() {
    const stats = leaderboardCache?.getStats() || {};
    const recommendations = [];

    if (stats.hitRate < 0.3) {
      recommendations.push({
        type: 'warning',
        message: 'Low cache hit rate detected. Consider using "performance" preset for better caching.',
        action: 'setPreset("performance")'
      });
    }

    if (stats.hitRate > 0.8 && this.currentPreset === 'performance') {
      recommendations.push({
        type: 'success',
        message: 'Excellent cache performance! Current settings are optimal.',
        action: null
      });
    }

    if (stats.evictions > 100) {
      recommendations.push({
        type: 'info',
        message: 'High cache eviction rate. Consider increasing cache size or reducing TTL.',
        action: 'Increase maxSize in cache configuration'
      });
    }

    return recommendations;
  }

  // Auto-tune cache settings based on usage patterns
  autoTune() {
    const stats = leaderboardCache?.getStats() || {};
    
    if (stats.hitRate < 0.2) {
      // Very low hit rate, switch to performance mode
      this.setPreset('performance');
      return 'Switched to performance preset due to low hit rate';
    } else if (stats.hitRate > 0.9 && this.currentPreset === 'performance') {
      // Very high hit rate with performance preset, can use balanced
      this.setPreset('balanced');
      return 'Switched to balanced preset - performance is already excellent';
    }
    
    return 'No changes needed - cache performance is acceptable';
  }

  // Export configuration for backup/restore
  export() {
    return JSON.stringify(this.getConfig(), null, 2);
  }

  // Import configuration from backup
  import(configJson) {
    try {
      const config = JSON.parse(configJson);
      this.currentPreset = config.preset || 'balanced';
      this.customTTLs = config.customTTLs || {};
      this.globalSettings = { ...this.globalSettings, ...config.globalSettings };
      this.updateCacheSettings();
      return true;
    } catch (error) {
      console.error('Failed to import cache configuration:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const cacheConfig = new CacheConfig();

// Export for advanced usage
export { CacheConfig, TTL_PRESETS };

// Helper functions for common operations
export const cacheHelpers = {
  // Quick preset switchers
  enablePerformanceMode: () => cacheConfig.setPreset('performance'),
  enableRealtimeMode: () => cacheConfig.setPreset('realtime'),
  enableBalancedMode: () => cacheConfig.setPreset('balanced'),
  
  // Quick cache control
  disableCache: () => cacheConfig.setEnabled(false),
  enableCache: () => cacheConfig.setEnabled(true),
  clearAllCaches: () => {
    cacheEngine?.clear();
    leaderboardCache?.clear();
  },
  
  // Performance monitoring
  getCachePerformance: () => {
    const leaderboardStats = leaderboardCache?.getStats() || {};
    const engineStats = cacheEngine?.getStats() || {};
    
    return {
      leaderboard: leaderboardStats,
      general: engineStats,
      recommendations: cacheConfig.getRecommendations(),
      config: cacheConfig.getConfig()
    };
  }
};

/**
 * Cached API layer for the Leaderboard application
 * Wraps existing API calls with intelligent caching
 */

import { auth } from './auth';
import { withCache, getCacheTTL, cacheUtils } from './cache';

/**
 * Cached API methods for leaderboard data
 */
export const cachedApi = {
  /**
   * Get leaderboard data with caching
   */
  getLeaderboardData: withCache(
    // Cache key generator
    (params) => `leaderboard:${params.campus_id}:${params.cursus_id}:${params.page}:${params.per_page}:${params.date_range || 'all'}:${params.pool_month || 'all'}`,
    // API call function
    async (params) => {
      const {
        campus_id,
        page = 1,
        per_page = 100,
        cursus_id = 21,
        date_range,
        pool_month,
        filters = {}
      } = params;

      const requestPayload = {
        campus_id: parseInt(campus_id),
        page: parseInt(page),
        per_page: parseInt(per_page),
        cursus_id: parseInt(cursus_id),
        date_range,
        pool_month: pool_month !== "all" ? pool_month : undefined,
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

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error('Invalid response format');
      }

      return result;
    },
    // Cache options
    {
      ttl: getCacheTTL('leaderboard'),
      invalidatePattern: null // Don't auto-invalidate leaderboard data
    }
  ),

  /**
   * Get campus data with caching
   */
  getCampusData: withCache(
    'campus:list',
    async () => {
      const response = await fetch('/api/campus-data', {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch campus data: ${response.status}`);
      }

      return response.json();
    },
    {
      ttl: getCacheTTL('campus'), // 10 minutes - campus data is stable
    }
  ),

  /**
   * Get user data with caching
   */
  getUserData: withCache(
    (userId) => `user:${userId}`,
    async (userId) => {
      if (!auth.isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await auth.apiRequest(
        `https://api.intra.42.fr/v2/users/${userId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      return response.json();
    },
    {
      ttl: getCacheTTL('user'), // 5 minutes
    }
  ),

  /**
   * Get cursus users with caching (alternative endpoint)
   */
  getCursusUsers: withCache(
    (params) => `cursus_users:${params.filter?.campus_id}:${params.sort}:${params.per_page}:${params.page}:${params.filter?.cursus_id}`,
    async (params) => {
      if (!auth.isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const searchParams = new URLSearchParams();
      
      // Add filters
      if (params.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          searchParams.append(`filter[${key}]`, value);
        });
      }

      // Add other params
      Object.entries(params).forEach(([key, value]) => {
        if (key !== 'filter' && value !== undefined) {
          searchParams.append(key, value);
        }
      });

      const response = await auth.apiRequest(
        `https://api.intra.42.fr/v2/cursus_users?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch cursus users: ${response.status}`);
      }

      return response.json();
    },
    {
      ttl: getCacheTTL('leaderboard'),
    }
  ),

  /**
   * Get campus users (for older API compatibility)
   */
  getCampusUsers: withCache(
    (campusId, params) => `campus_users:${campusId}:${params.filter?.pool_year}:${params.per_page}:${params.page}`,
    async (campusId, params = {}) => {
      if (!auth.isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const searchParams = new URLSearchParams();
      
      // Add filters
      if (params.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          searchParams.append(`filter[${key}]`, value);
        });
      }

      // Add other params
      Object.entries(params).forEach(([key, value]) => {
        if (key !== 'filter' && value !== undefined) {
          searchParams.append(key, value);
        }
      });

      const response = await auth.apiRequest(
        `https://api.intra.42.fr/v2/campus/${campusId}/users?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch campus users: ${response.status}`);
      }

      return response.json();
    },
    {
      ttl: getCacheTTL('leaderboard'),
    }
  ),

  /**
   * Get aggregated stats with caching
   */
  getStats: withCache(
    (campusId, cursusId, dateRange) => `stats:${campusId}:${cursusId}:${dateRange}`,
    async (campusId, cursusId = 21, dateRange = null) => {
      // This would call your stats API endpoint
      const params = {
        campus_id: campusId,
        cursus_id: cursusId,
        date_range: dateRange
      };

      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, value);
        }
      });

      const response = await fetch(`/api/stats?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      return response.json();
    },
    {
      ttl: getCacheTTL('stats'), // 3 minutes
    }
  )
};

/**
 * Cache management utilities
 */
export const leaderboardCache = {
  /**
   * Invalidate leaderboard cache for specific campus
   */
  invalidateCampus: (campusId) => {
    cacheUtils.invalidate(`leaderboard:${campusId}:`);
    cacheUtils.invalidate(`campus_users:${campusId}:`);
    cacheUtils.invalidate(`stats:${campusId}:`);
  },

  /**
   * Invalidate all leaderboard data
   */
  invalidateAll: () => {
    cacheUtils.invalidate('leaderboard:');
    cacheUtils.invalidate('campus_users:');
    cacheUtils.invalidate('cursus_users:');
    cacheUtils.invalidate('stats:');
  },

  /**
   * Refresh specific data
   */
  refreshLeaderboard: async (campusId, cursusId = 21, page = 1) => {
    const params = {
      campus_id: campusId,
      cursus_id: cursusId,
      page,
      per_page: 100
    };

    // Force refresh by clearing cache first
    const cacheKey = `leaderboard:${campusId}:${cursusId}:${page}:100:all:all`;
    cacheUtils.delete(cacheKey);

    // Fetch fresh data
    return await cachedApi.getLeaderboardData(params);
  },

  /**
   * Preload common leaderboard data
   */
  preloadCommonData: async () => {
    const commonCampuses = [21, 75, 55]; // Benguerir, Rabat, Tétouan
    const commonRequests = [];

    // Preload first page for each campus
    commonCampuses.forEach(campusId => {
      commonRequests.push({
        key: `leaderboard:${campusId}:21:1:100:all:all`,
        apiCall: () => cachedApi.getLeaderboardData({
          campus_id: campusId,
          cursus_id: 21,
          page: 1,
          per_page: 100
        }),
        ttl: getCacheTTL('leaderboard')
      });
    });

    // Preload campus data
    commonRequests.push({
      key: 'campus:list',
      apiCall: () => cachedApi.getCampusData(),
      ttl: getCacheTTL('campus')
    });

    await cacheUtils.preloadCache(commonRequests);
  },

  /**
   * Get cache statistics
   */
  getStats: () => cacheUtils.getStats(),

  /**
   * Clear all cache
   */
  clearAll: () => cacheUtils.clearAll()
};

// Export cache utilities for direct use
export { cacheUtils };

export default cachedApi;

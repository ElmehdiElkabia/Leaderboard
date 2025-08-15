// API utility for making calls through your backend to avoid CORS
// Now enhanced with intelligent caching for better performance
import { auth } from './auth';
import { cachedApi } from './cached-api';

export const api = {
  // Base URL for your API endpoints
  baseUrl: '',
  
  // Helper to get auth headers
  getAuthHeaders: () => {
    const token = auth.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },
  
  // Get cursus users (leaderboard data) - now with caching
  getCursusUsers: async (params = {}) => {
    // Use cached version if available
    try {
      return await cachedApi.getCursusUsers(params);
    } catch (error) {
      // Fallback to direct API call
      return await api.getCursusUsersDirect(params);
    }
  },

  // Direct (non-cached) version for fallback
  getCursusUsersDirect: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    // Default parameters
    const defaultParams = {
      cursus_id: '21',
      'page[size]': '100',
      'page[number]': '1',
      sort: '-level',
    };
    
    // Merge with provided parameters
    const finalParams = { ...defaultParams, ...params };
    
    // Build query string
    Object.entries(finalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    
    const response = await fetch(`/api/cursus-users?${searchParams.toString()}`, {
      headers: api.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cursus users: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Get campus data - now with caching
  getCampus: async (campusId = null) => {
    try {
      return await cachedApi.getCampus(campusId);
    } catch (error) {
      // Fallback to direct API call
      return await api.getCampusDirect(campusId);
    }
  },

  // Direct (non-cached) version for fallback
  getCampusDirect: async (campusId = null) => {
    const url = campusId 
      ? `/api/campus?campus_id=${campusId}`
      : '/api/campus';
      
    const response = await fetch(url, {
      headers: api.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch campus data: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Get user data - now with caching
  getMe: async () => {
    try {
      return await cachedApi.getMe();
    } catch (error) {
      // Fallback to direct API call
      return await api.getMeDirect();
    }
  },

  // Direct (non-cached) version for fallback
  getMeDirect: async () => {
    const response = await fetch('/api/user-me', {
      headers: api.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }
    
    return response.json();
  },
  
  // General proxy for any 42 API endpoint - now with caching
  intraProxy: async (path, options = {}) => {
    try {
      return await cachedApi.intraProxy(path, options);
    } catch (error) {
      // Fallback to direct API call
      return await api.intraProxyDirect(path, options);
    }
  },

  // Direct (non-cached) version for fallback
  intraProxyDirect: async (path, options = {}) => {
    const { method = 'GET', params = {}, body } = options;
    
    let url = `/api/intra-proxy?path=${encodeURIComponent(path)}`;
    
    // Add query parameters if any
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      const pathWithParams = `${path}?${searchParams.toString()}`;
      url = `/api/intra-proxy?path=${encodeURIComponent(pathWithParams)}`;
    }
    
    const fetchOptions = {
      method,
      headers: api.getAuthHeaders(),
    };
    
    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Specific methods for common endpoints - now with caching
  getProjects: async (params = {}) => {
    try {
      return await cachedApi.getProjects(params);
    } catch (error) {
      return api.intraProxyDirect('projects', { params });
    }
  },
  
  getUsers: async (params = {}) => {
    try {
      return await cachedApi.getUsers(params);
    } catch (error) {
      return api.intraProxyDirect('users', { params });
    }
  },
  
  getCoalitions: async (params = {}) => {
    try {
      return await cachedApi.getCoalitions(params);
    } catch (error) {
      return api.intraProxyDirect('coalitions', { params });
    }
  },

  // Cache management methods
  cache: {
    // Clear all API caches
    clear: () => cachedApi.clearAllCache(),
    
    // Invalidate campus-specific cache
    invalidateCampus: (campusId) => cachedApi.invalidateCampusCache(campusId),
    
    // Invalidate cursus-specific cache
    invalidateCursus: (cursusId) => cachedApi.invalidateCursusCache(cursusId),
    
    // Get cache statistics
    getStats: () => cachedApi.getCacheStats(),
    
    // Get performance report
    getReport: () => cachedApi.getPerformanceReport(),
    
    // Preload common data
    preload: () => cachedApi.preloadCommonData(),
  }
};

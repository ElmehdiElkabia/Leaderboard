// API utility for making calls through your backend to avoid CORS
import { auth } from './auth';

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
  
  // Get cursus users (leaderboard data)
  getCursusUsers: async (params = {}) => {
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
  
  // Get campus data
  getCampus: async (campusId = null) => {
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
  
  // Get user data
  getMe: async () => {
    const response = await fetch('/api/user-me', {
      headers: api.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }
    
    return response.json();
  },
  
  // General proxy for any 42 API endpoint
  intraProxy: async (path, options = {}) => {
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
  
  // Specific methods for common endpoints
  getProjects: async (params = {}) => {
    return api.intraProxy('projects', { params });
  },
  
  getUsers: async (params = {}) => {
    return api.intraProxy('users', { params });
  },
  
  getCoalitions: async (params = {}) => {
    return api.intraProxy('coalitions', { params });
  },
};

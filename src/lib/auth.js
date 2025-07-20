// Authentication utility functions
export const auth = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('42_access_token');
    const expiresAt = localStorage.getItem('42_token_expires_at');
    
    if (!token || !expiresAt) return false;
    
    return Date.now() < parseInt(expiresAt);
  },

  // Get access token
  getAccessToken: () => {
    if (!auth.isAuthenticated()) return null;
    return localStorage.getItem('42_access_token');
  },

  // Get user data
  getUserData: () => {
    const userData = localStorage.getItem('42_user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Clear authentication data
  logout: () => {
    localStorage.removeItem('42_access_token');
    localStorage.removeItem('42_refresh_token');
    localStorage.removeItem('42_token_expires_at');
    localStorage.removeItem('42_user_data');
  },

  // Make authenticated API request
  apiRequest: async (url, options = {}) => {
    const token = auth.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token expired, clear auth data
      auth.logout();
      throw new Error('Token expired');
    }

    return response;
  },
};

// OAuth configuration
export const oauthConfig = {
  clientId: import.meta.env.VITE_42_CLIENT_ID || 'u-s4t2ud-a126bdf95a4737cc91f85f57010905df1a2007f6aa0ae83d3dc9893be2851b9d',
  redirectUri: import.meta.env.VITE_42_REDIRECT_URI || 'http://localhost:8080/',
  authorizeUrl: import.meta.env.VITE_42_AUTHORIZE_URL || 'https://api.intra.42.fr/oauth/authorize',
  tokenUrl: import.meta.env.VITE_42_TOKEN_URL || 'https://api.intra.42.fr/oauth/token',
  apiBaseUrl: import.meta.env.VITE_42_API_BASE_URL || 'https://api.intra.42.fr/v2',
};

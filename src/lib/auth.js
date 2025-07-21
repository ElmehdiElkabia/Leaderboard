// Clean authentication utility functions for session-based auth
export const auth = {
  // Check if user is authenticated with session token
  isAuthenticated: () => {
    const sessionToken = localStorage.getItem('user_session_token');
    const expiresAt = localStorage.getItem('user_session_expires');
    
    if (!sessionToken || !expiresAt) return false;
    
    // Check session expiration
    if (new Date().toISOString() >= expiresAt) {
      auth.logout();
      return false;
    }
    
    return true;
  },

  // Get session token
  getSessionToken: () => {
    if (!auth.isAuthenticated()) return null;
    return localStorage.getItem('user_session_token');
  },

  // Get user data
  getUserData: () => {
    if (!auth.isAuthenticated()) return null;
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Clear authentication data
  logout: () => {
    localStorage.removeItem('user_session_token');
    localStorage.removeItem('user_session_expires');
    localStorage.removeItem('user_data');
    // Clear any old OAuth tokens
    localStorage.removeItem('42_access_token');
    localStorage.removeItem('42_refresh_token');
    localStorage.removeItem('42_token_expires_at');
    localStorage.removeItem('42_user_data');
  },

  // Make authenticated API request with session token
  apiRequest: async (url, options = {}) => {
    const sessionToken = auth.getSessionToken();
    if (!sessionToken) throw new Error('Not authenticated');

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Session ${sessionToken}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (response.status === 401) {
      // Session expired, clear auth data
      auth.logout();
      throw new Error('Session expired');
    }

    return response;
  },
};

// OAuth configuration (only client ID and redirect URI - no secrets)
export const oauthConfig = {
  clientId: "u-s4t2ud-a126bdf95a4737cc91f85f57010905df1a2007f6aa0ae83d3dc9893be2851b9d",
  redirectUri: 'https://www.13namima.me/',
  authorizeUrl: 'https://api.intra.42.fr/oauth/authorize',
  // Note: No client secret or API URLs exposed to frontend
};

// Authentication utility functions
import { security } from './security.js';

export const auth = {
  // Check if user is authenticated with enhanced security
  isAuthenticated: () => {
    const token = security.secureStorage.get('42_access_token');
    const expiresAt = security.secureStorage.get('42_token_expires_at');
    const sessionStart = security.secureStorage.get('42_session_start');
    
    if (!token || !expiresAt) return false;
    
    // Check token validity
    if (!security.isValidToken(token)) {
      security.logSecurityEvent('invalid_token_format');
      auth.logout();
      return false;
    }
    
    // Check token expiration
    if (Date.now() >= parseInt(expiresAt)) {
      security.logSecurityEvent('token_expired');
      auth.logout();
      return false;
    }
    
    // Check session timeout
    if (sessionStart && Date.now() - parseInt(sessionStart) > security.SESSION_TIMEOUT) {
      security.logSecurityEvent('session_timeout');
      auth.logout();
      return false;
    }
    
    return true;
  },

  // Get access token with validation
  getAccessToken: () => {
    if (!auth.isAuthenticated()) return null;
    return security.secureStorage.get('42_access_token');
  },

  // Get user data with validation
  getUserData: () => {
    if (!auth.isAuthenticated()) return null;
    return security.secureStorage.get('42_user_data');
  },

  // Secure login data storage
  setAuthData: (tokenData, userData) => {
    try {
      // Validate input data
      if (!tokenData?.access_token || !userData?.id) {
        throw new Error('Invalid authentication data');
      }
      
      // Calculate expiration time
      const expiresIn = tokenData.expires_in || 7200; // Default 2 hours
      const expiresAt = Date.now() + (expiresIn * 1000);
      const sessionStart = Date.now();
      
      // Store data securely
      security.secureStorage.set('42_access_token', tokenData.access_token);
      security.secureStorage.set('42_refresh_token', tokenData.refresh_token);
      security.secureStorage.set('42_token_expires_at', expiresAt.toString());
      security.secureStorage.set('42_user_data', userData);
      security.secureStorage.set('42_session_start', sessionStart.toString());
      
      // Clear login attempts on successful auth
      const clientId = navigator.userAgent + window.location.hostname;
      security.rateLimiter.clearAttempts(clientId);
      
      security.logSecurityEvent('successful_login', { 
        userId: userData.id,
        userLogin: userData.login 
      });
      
      return true;
    } catch (error) {
      security.logSecurityEvent('auth_data_error', { error: error.message });
      return false;
    }
  },

  // Enhanced logout with security cleanup
  logout: () => {
    security.logSecurityEvent('user_logout');
    
    // Clear all authentication data
    security.secureStorage.remove('42_access_token');
    security.secureStorage.remove('42_refresh_token');
    security.secureStorage.remove('42_token_expires_at');
    security.secureStorage.remove('42_user_data');
    security.secureStorage.remove('42_session_start');
    security.secureStorage.remove('oauth_state');
    
    // Clear any cached data
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    }
  },

  // Make authenticated API request through backend to avoid CORS with security
  apiRequest: async (originalUrl, options = {}) => {
    const token = auth.getAccessToken();
    if (!token) {
      security.logSecurityEvent('api_request_unauthorized');
      throw new Error('Not authenticated');
    }

    // Rate limiting check
    const requestId = navigator.userAgent + originalUrl;
    if (security.rateLimiter.isBlocked(requestId)) {
      security.logSecurityEvent('api_request_rate_limited', { url: originalUrl });
      throw new Error('Too many requests. Please slow down.');
    }
    
    // Record API request attempt
    security.rateLimiter.recordAttempt(requestId);

    // Extract the path from the original 42 API URL
    let apiPath = originalUrl;
    if (originalUrl.includes('api.intra.42.fr/v2/')) {
      apiPath = originalUrl.split('api.intra.42.fr/v2/')[1];
    }

    // Sanitize API path
    apiPath = security.sanitizeInput(apiPath);

    // Use the backend proxy instead of direct calls
    const proxyUrl = `/api/intra-proxy?path=${encodeURIComponent(apiPath)}`;

    try {
      const response = await fetch(proxyUrl, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // CSRF protection
        },
      });

      if (response.status === 401) {
        // Token expired, clear auth data
        security.logSecurityEvent('token_expired_on_request');
        auth.logout();
        throw new Error('Token expired');
      }

      if (response.status === 429) {
        security.logSecurityEvent('api_rate_limited_by_server');
        throw new Error('Rate limited by server. Please try again later.');
      }

      if (!response.ok) {
        security.logSecurityEvent('api_request_failed', { 
          status: response.status,
          url: originalUrl 
        });
        throw new Error(`API request failed: ${response.status}`);
      }

      return response;
    } catch (error) {
      security.logSecurityEvent('api_request_error', { 
        error: error.message,
        url: originalUrl 
      });
      throw error;
    }
  },

  // Validate OAuth state parameter (CSRF protection)
  validateOAuthState: (receivedState) => {
    const storedState = security.secureStorage.get('oauth_state');
    
    if (!storedState || !receivedState) {
      security.logSecurityEvent('oauth_missing_state');
      return false;
    }
    
    if (storedState !== receivedState) {
      security.logSecurityEvent('oauth_state_mismatch');
      return false;
    }
    
    // Remove state after validation
    security.secureStorage.remove('oauth_state');
    return true;
  },

  // Generate OAuth URL with security measures
  getOAuthUrl: () => {
    // Check rate limiting
    const clientId = navigator.userAgent + window.location.hostname;
    if (security.rateLimiter.isBlocked(clientId)) {
      security.logSecurityEvent('oauth_rate_limited', { clientId });
      throw new Error('Too many login attempts. Please try again later.');
    }
    
    // Validate redirect URI
    const redirectUri = oauthConfig.redirectUri;
    if (!security.validateRedirectUri(redirectUri)) {
      security.logSecurityEvent('invalid_redirect_uri', { uri: redirectUri });
      throw new Error('Invalid redirect URI configuration');
    }
    
    // Generate state parameter for CSRF protection
    const state = security.generateSecureToken();
    security.secureStorage.set('oauth_state', state, 600000); // 10 minutes
    
    const params = new URLSearchParams({
      client_id: oauthConfig.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'public',
      state: state
    });
    
    // Record login attempt
    security.rateLimiter.recordAttempt(clientId);
    
    return `${oauthConfig.authorizeUrl}?${params.toString()}`;
  },
};

// OAuth configuration with enhanced security
export const oauthConfig = {
  clientId: import.meta.env.VITE_42_CLIENT_ID,
  redirectUri: import.meta.env.VITE_42_REDIRECT_URI,
  authorizeUrl: import.meta.env.VITE_42_AUTHORIZE_URL,
  tokenUrl: import.meta.env.VITE_42_TOKEN_URL,
  apiBaseUrl: import.meta.env.VITE_42_API_BASE_URL,
};

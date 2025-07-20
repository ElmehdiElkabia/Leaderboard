// Clean auth library - no OAuth secrets in frontend
export const authConfig = {
  // Only public configuration needed for OAuth initiation
  authorizeUrl: 'https://api.intra.42.fr/oauth/authorize',
  // Client ID can be public (it's meant to be)
  clientId: import.meta.env.VITE_42_CLIENT_ID,
  redirectUri: import.meta.env.VITE_42_REDIRECT_URI || `${window.location.origin}/oauth/callback`,
  scope: 'public',
  responseType: 'code'
};

// Generate OAuth authorization URL (safe - no secrets)
export function getOAuthUrl() {
  const state = generateRandomState();
  localStorage.setItem('oauth_state', state);
  
  const params = new URLSearchParams({
    client_id: authConfig.clientId,
    redirect_uri: authConfig.redirectUri,
    response_type: authConfig.responseType,
    scope: authConfig.scope,
    state: state
  });
  
  return `${authConfig.authorizeUrl}?${params.toString()}`;
}

// Generate random state for CSRF protection
function generateRandomState() {
  return Math.random().toString(36).substring(2) + 
         Math.random().toString(36).substring(2);
}

// Validate OAuth state (CSRF protection)
export function validateOAuthState(state) {
  const storedState = localStorage.getItem('oauth_state');
  localStorage.removeItem('oauth_state');
  return state && storedState && state === storedState;
}

// Check if user is authenticated (session-based, no OAuth tokens)
export function isAuthenticated() {
  try {
    const session = localStorage.getItem('user_session');
    if (!session) return false;
    
    const sessionData = JSON.parse(session);
    const expiresAt = new Date(sessionData.expiresAt);
    const now = new Date();
    
    if (now > expiresAt) {
      logout();
      return false;
    }
    
    return true;
  } catch (error) {
    logout();
    return false;
  }
}

// Get user data from session (no OAuth tokens)
export function getUserData() {
  try {
    const session = localStorage.getItem('user_session');
    if (!session) return null;
    
    const sessionData = JSON.parse(session);
    return sessionData.user || null;
  } catch (error) {
    return null;
  }
}

// Get session token for backend API calls
export function getSessionToken() {
  try {
    const session = localStorage.getItem('user_session');
    if (!session) return null;
    
    const sessionData = JSON.parse(session);
    return sessionData.sessionToken || null;
  } catch (error) {
    return null;
  }
}

// Logout (clear session data)
export function logout() {
  localStorage.removeItem('user_session');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('oauth_state');
  
  // Clear any other auth-related data
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('42_') || key.includes('auth') || key.includes('token')) {
      localStorage.removeItem(key);
    }
  });
}

// Initiate OAuth login (redirects to 42)
export function loginWith42() {
  const oauthUrl = getOAuthUrl();
  window.location.href = oauthUrl;
}

// Check session validity and refresh if needed
export function checkSession() {
  if (!isAuthenticated()) {
    logout();
    return false;
  }
  return true;
}

// Make authenticated API calls to our backend
export async function makeAuthenticatedRequest(endpoint, options = {}) {
  const sessionToken = getSessionToken();
  if (!sessionToken) {
    throw new Error('No valid session');
  }
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': sessionToken,
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    }
  };
  
  const response = await fetch(endpoint, {
    ...options,
    ...defaultOptions,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    // Session expired
    logout();
    throw new Error('Session expired');
  }
  
  return response;
}

export const auth = {
  isAuthenticated,
  getUserData,
  logout,
  loginWith42,
  checkSession,
  makeAuthenticatedRequest,
  validateOAuthState
};

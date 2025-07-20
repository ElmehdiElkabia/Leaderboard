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
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { code, redirect_uri } = req.body;

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.VITE_42_CLIENT_ID,
    client_secret: process.env.VITE_42_CLIENT_SECRET,
    code,
    redirect_uri,
  });

  const tokenRes = await fetch("https://api.intra.42.fr/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await tokenRes.json();
  res.status(tokenRes.status).json(data);
}
// OAuth configuration
export const oauthConfig = {
  clientId: import.meta.env.VITE_42_CLIENT_ID,
  redirectUri: 'https://www.13namima.me/',
  authorizeUrl: 'https://api.intra.42.fr/oauth/authorize',
  tokenUrl: 'https://api.intra.42.fr/oauth/token',
  apiBaseUrl: 'https://api.intra.42.fr/v2',
};

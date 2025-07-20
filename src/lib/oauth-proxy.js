// OAuth proxy utility using PHP backend
export const oauthProxy = {
  // Base URL for your deployed site
  baseUrl: 'https://www.13namima.me',
  
  // Exchange authorization code for access token
  exchangeToken: async (code, clientId, clientSecret, redirectUri) => {
    const response = await fetch(`${oauthProxy.baseUrl}/oauth-proxy.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'token',
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Get user information
  getUser: async (accessToken) => {
    const response = await fetch(`${oauthProxy.baseUrl}/oauth-proxy.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'user',
        access_token: accessToken,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`User data fetch failed: ${response.status}`);
    }
    
    return response.json();
  },
};

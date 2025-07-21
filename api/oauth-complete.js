// Complete OAuth flow handled server-side - /api/oauth-complete.js
module.exports = async function handler(req, res) {
  // Set CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://www.13namima.me',
    'https://13namima.me',
    'http://localhost:5173',
    'http://localhost:8080'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        error: 'Missing authorization code'
      });
    }

    // Server-side OAuth configuration - completely hidden from frontend
    const clientId = process.env.VITE_42_CLIENT_ID;
    const clientSecret = process.env.VITE_42_CLIENT_SECRET;
    const redirectUri = process.env.VITE_42_REDIRECT_URI;

    console.log('Environment check:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRedirectUri: !!redirectUri,
      clientIdLength: clientId ? clientId.length : 0,
      redirectUri: redirectUri || 'not set'
    });

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('OAuth configuration missing:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRedirectUri: !!redirectUri
      });
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'OAuth environment variables not properly configured'
      });
    }

    // Step 1: Exchange code for token (completely server-side)
    const tokenFormData = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri
    });
    
    const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'LeaderboardApp/1.0',
      },
      body: tokenFormData
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.warn('Token exchange failed:', tokenData);
      return res.status(tokenResponse.status).json({
        error: 'Authentication failed',
        details: tokenData.error_description
      });
    }
    
    if (!tokenData.access_token) {
      return res.status(500).json({ 
        error: 'Invalid token response'
      });
    }

    // Step 2: Fetch user info (completely server-side)
    const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'LeaderboardApp/1.0',
      },
    });

    if (!userResponse.ok) {
      console.warn('User data fetch failed:', userResponse.status);
      return res.status(userResponse.status).json({
        error: 'Failed to fetch user data'
      });
    }

    const userData = await userResponse.json();

    if (!userData.id || !userData.login) {
      return res.status(500).json({ 
        error: 'Invalid user data'
      });
    }

    // Step 3: Return minimal, safe data to frontend
    // NO sensitive OAuth data is sent to frontend
    const safeUserData = {
      id: userData.id,
      login: userData.login,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      image: userData.image?.versions?.medium || userData.image?.link,
      campus: userData.campus?.[0] || null,
      level: userData.cursus_users?.[0]?.level || 0,
      // Generate a secure session token (not the OAuth token)
      sessionToken: generateSecureSessionToken(userData.id),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    console.log('Successful OAuth flow completion:', {
      userId: userData.id,
      login: userData.login,
      timestamp: new Date().toISOString()
    });
    
    return res.json({
      success: true,
      user: safeUserData
    });
    
  } catch (error) {
    console.error('OAuth complete error:', error);
    return res.status(500).json({ 
      error: 'Internal server error'
    });
  }
}

// Generate a secure session token (not exposing OAuth tokens)
function generateSecureSessionToken(userId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const data = `${userId}-${timestamp}-${random}`;
  
  // Simple hash (in production, use proper JWT or similar)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `session_${Math.abs(hash).toString(36)}_${random}`;
}

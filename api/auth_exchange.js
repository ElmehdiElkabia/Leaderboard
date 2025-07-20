// Obfuscated OAuth endpoint - /api/auth_exchange.js
import { apiSecurity } from './security-middleware.js';

export default async function handler(req, res) {
  // Validate request with security middleware
  const validation = apiSecurity.validateRequest(req, {
    requireAuth: false,
    rateLimit: 'oauth',
    validateBody: true
  });
  
  if (!validation.valid) {
    return validation.response;
  }
  
  // Set secure CORS headers for specific origins
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-Request-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Handle secure payload if present
    let requestData;
    if (req.headers['x-request-type'] === 'secure' && req.body.meta) {
      // Extract secure payload
      const { data } = extractSecurePayload(req.body);
      requestData = data;
    } else {
      // Fallback for direct requests
      requestData = req.body;
    }
    
    // Sanitize input data
    const sanitizedBody = apiSecurity.sanitizeInput(requestData);
    const { code, state } = sanitizedBody;
    
    // Validate required fields
    if (!code) {
      return res.status(400).json({ 
        error: 'invalid_request',
        error_description: 'Missing authorization code'
      });
    }
    
    // Validate code format (basic validation)
    if (code.length < 10 || code.length > 500) {
      return res.status(400).json({ 
        error: 'invalid_grant',
        error_description: 'Invalid authorization code format'
      });
    }

    // Get OAuth configuration from environment (secure server-side ONLY)
    const clientId = process.env.VITE_42_CLIENT_ID;
    const clientSecret = process.env.VITE_42_CLIENT_SECRET;
    const redirectUri = process.env.VITE_42_REDIRECT_URI;

    // Log what we're working with (without sensitive data)
    console.log('OAuth configuration check:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRedirectUri: !!redirectUri,
      receivedCode: !!code,
      timestamp: new Date().toISOString()
    });

    // Validate server configuration
    if (!clientId || !clientSecret || !redirectUri) {
      console.error('OAuth configuration missing:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRedirectUri: !!redirectUri
      });
      return res.status(500).json({ 
        error: 'server_error',
        error_description: 'OAuth configuration not properly set on server'
      });
    }

    // Double-check that we're not using any client data from the request
    // All OAuth credentials must come from server environment variables
    const formData = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,        // From server environment
      client_secret: clientSecret,  // From server environment
      code: code,                    // From client (safe to expose)
      redirect_uri: redirectUri      // From server environment
    });
    
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'LeaderboardApp/1.0',
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Log the error for security monitoring
      console.warn('OAuth token exchange failed:', {
        status: response.status,
        error: data.error,
        timestamp: new Date().toISOString()
      });
      
      return res.status(response.status).json(data);
    }
    
    // Validate response data
    if (!data.access_token) {
      return res.status(500).json({ 
        error: 'invalid_response',
        error_description: 'Invalid token response from OAuth server'
      });
    }
    
    // Log successful token exchange (without sensitive data)
    console.log('Successful OAuth token exchange:', {
      timestamp: new Date().toISOString(),
      clientId: clientId,
      tokenType: data.token_type,
      hasAccessToken: !!data.access_token
    });
    
    return res.json(data);
  } catch (error) {
    console.error('OAuth token exchange error:', error);
    return res.status(500).json({ 
      error: 'server_error',
      error_description: 'Internal server error during token exchange'
    });
  }
}

// Helper function to extract secure payload
function extractSecurePayload(payload) {
  try {
    if (!payload.meta || !payload.data) {
      throw new Error('Invalid payload structure');
    }
    
    const { t: timestamp, n: nonce, v: version } = payload.meta;
    
    // Check timestamp (reject requests older than 5 minutes)
    if (Date.now() - timestamp > 300000) {
      throw new Error('Request expired');
    }
    
    // Validate version
    if (version !== '2.0') {
      throw new Error('Unsupported request version');
    }
    
    return {
      data: payload.data,
      timestamp,
      nonce
    };
  } catch (error) {
    throw new Error(`Payload validation failed: ${error.message}`);
  }
}

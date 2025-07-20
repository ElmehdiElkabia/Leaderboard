// Vercel serverless function for OAuth token exchange with security
// File: /api/oauth-token.js

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Sanitize input data
    const sanitizedBody = apiSecurity.sanitizeInput(req.body);
    const { grant_type, client_id, client_secret, code, redirect_uri } = sanitizedBody;
    
    // Validate required fields
    if (!grant_type || !client_id || !client_secret || !code || !redirect_uri) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        error_description: 'All OAuth parameters are required'
      });
    }
    
    // Validate grant type
    if (grant_type !== 'authorization_code') {
      return res.status(400).json({ 
        error: 'invalid_grant',
        error_description: 'Only authorization_code grant type is supported'
      });
    }
    
    // Validate code format (basic validation)
    if (code.length < 10 || code.length > 500) {
      return res.status(400).json({ 
        error: 'invalid_grant',
        error_description: 'Invalid authorization code format'
      });
    }
    
    const formData = new URLSearchParams({
      grant_type,
      client_id,
      client_secret,
      code,
      redirect_uri
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
      clientId: client_id,
      tokenType: data.token_type
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

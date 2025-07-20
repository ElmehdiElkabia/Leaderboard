// General obfuscated API bridge - /api/api_bridge.js
import { apiSecurity } from './security-middleware.js';

export default async function handler(req, res) {
  // Validate request with security middleware
  const validation = apiSecurity.validateRequest(req, {
    requireAuth: true,
    rateLimit: 'api',
    validateBody: false
  });
  
  if (!validation.valid) {
    return validation.response;
  }
  
  // Set secure CORS headers
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
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');
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
  
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    
    const token = authHeader.substring(7);
    
    // Get API path from query parameter
    const apiPath = req.query.path;
    if (!apiPath) {
      return res.status(400).json({ error: 'Missing API path parameter' });
    }
    
    // Validate and sanitize the API path
    const sanitizedPath = apiSecurity.sanitizeInput(apiPath);
    
    // Construct the full 42 API URL
    const apiUrl = `https://api.intra.42.fr/v2/${sanitizedPath}`;
    
    // Prepare request options
    const requestOptions = {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'LeaderboardApp/1.0',
        'Accept': 'application/json'
      }
    };
    
    // Add body for POST requests
    if (req.method === 'POST' && req.body) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(req.body);
    }
    
    // Make request to 42 API
    const response = await fetch(apiUrl, requestOptions);
    
    if (!response.ok) {
      console.warn('42 API bridge request failed:', {
        status: response.status,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      
      if (response.status === 401) {
        return res.status(401).json({ error: 'Unauthorized - token may be expired' });
      }
      
      return res.status(response.status).json({ 
        error: 'API request failed',
        status: response.status 
      });
    }
    
    const data = await response.json();
    
    // Log successful request (without sensitive data)
    console.log('Successful API bridge request:', {
      timestamp: new Date().toISOString(),
      method: req.method,
      hasData: !!data
    });
    
    return res.json(data);
  } catch (error) {
    console.error('API bridge request error:', error);
    return res.status(500).json({ 
      error: 'server_error',
      error_description: 'Internal server error during API bridge request'
    });
  }
}

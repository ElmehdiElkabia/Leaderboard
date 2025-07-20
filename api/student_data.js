// Obfuscated student data endpoint - /api/student_data.js
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization, X-Request-Type');
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
    
    // Handle secure payload if present
    let queryParams = {};
    if (req.method === 'POST' && req.headers['x-request-type'] === 'secure' && req.body.meta) {
      // Extract secure payload
      const { data } = extractSecurePayload(req.body);
      queryParams = deobfuscateParams(data.params || {});
    } else {
      // Fallback for direct requests - use query parameters
      queryParams = req.query;
    }
    
    // Build the 42 API URL with parameters
    const baseUrl = 'https://api.intra.42.fr/v2/cursus_users';
    const urlParams = new URLSearchParams();
    
    // Default parameters
    const defaultParams = {
      'cursus_id': '21',
      'page[size]': '100',
      'page[number]': '1',
      'sort': '-level',
      'range[begin_at]': '2024-01-01,2025-01-01'
    };
    
    // Merge with provided parameters
    const finalParams = { ...defaultParams, ...queryParams };
    
    // Add parameters to URL
    Object.entries(finalParams).forEach(([key, value]) => {
      if (value) {
        urlParams.append(key, value);
      }
    });
    
    const apiUrl = `${baseUrl}?${urlParams.toString()}`;
    
    // Make request to 42 API
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'LeaderboardApp/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn('42 API request failed:', {
        status: response.status,
        url: baseUrl, // Don't log full URL with parameters
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
    console.log('Successful student data request:', {
      timestamp: new Date().toISOString(),
      recordCount: data.length,
      hasData: !!data
    });
    
    return res.json(data);
  } catch (error) {
    console.error('Student data request error:', error);
    return res.status(500).json({ 
      error: 'server_error',
      error_description: 'Internal server error during data fetch'
    });
  }
}

// Helper functions
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

function deobfuscateParams(obfuscatedParams) {
  const reverseMap = {
    'c': 'cursus_id',
    's': 'page[size]',
    'n': 'page[number]',
    'o': 'sort',
    'r': 'range[begin_at]',
    'f': 'filter[campus_id]'
  };
  
  const original = {};
  Object.entries(obfuscatedParams).forEach(([key, value]) => {
    const originalKey = reverseMap[key] || key;
    original[originalKey] = value;
  });
  
  return original;
}

// API Security middleware and utilities
export const apiSecurity = {
  // Rate limiting storage
  requestCounts: new Map(),
  
  // Request rate limits (requests per minute)
  RATE_LIMITS: {
    oauth: 10,      // OAuth token requests
    api: 60,        // General API requests
    user: 30,       // User data requests
  },
  
  // Rate limiting middleware
  rateLimit: (type = 'api') => {
    return (req) => {
      const key = apiSecurity.getClientKey(req);
      const limit = apiSecurity.RATE_LIMITS[type] || apiSecurity.RATE_LIMITS.api;
      
      return apiSecurity.checkRateLimit(key, limit);
    };
  },
  
  // Get client identifier for rate limiting
  getClientKey: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.headers['x-real-ip'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return `${ip}-${userAgent.slice(0, 50)}`;
  },
  
  // Check rate limit for a key
  checkRateLimit: (key, limit) => {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    if (!apiSecurity.requestCounts.has(key)) {
      apiSecurity.requestCounts.set(key, []);
    }
    
    const requests = apiSecurity.requestCounts.get(key);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= limit) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    apiSecurity.requestCounts.set(key, validRequests);
    
    return true;
  },
  
  // Validate request headers for security
  validateHeaders: (req) => {
    // Check for required security headers
    const requiredHeaders = ['x-requested-with'];
    
    for (const header of requiredHeaders) {
      if (!req.headers[header]) {
        return {
          valid: false,
          error: `Missing required header: ${header}`
        };
      }
    }
    
    // Validate Content-Type for POST requests
    if (req.method === 'POST') {
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return {
          valid: false,
          error: 'Invalid Content-Type. Expected application/json'
        };
      }
    }
    
    return { valid: true };
  },
  
  // Sanitize and validate input data
  sanitizeInput: (data) => {
    if (typeof data === 'string') {
      return data
        .replace(/[<>]/g, '') // Remove potential HTML
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim()
        .slice(0, 1000); // Limit length
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          sanitized[key] = apiSecurity.sanitizeInput(value);
        } else if (typeof value === 'number' && !isNaN(value)) {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    
    return data;
  },
  
  // Validate token format
  validateToken: (token) => {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Check for basic token format (Bearer tokens are typically base64)
    if (token.length < 10 || token.length > 2000) {
      return false;
    }
    
    // Check for dangerous characters
    if (/[<>'"]/g.test(token)) {
      return false;
    }
    
    return true;
  },
  
  // Create secure response with headers
  createSecureResponse: (data, status = 200, headers = {}) => {
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...headers
    };
    
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...securityHeaders
      }
    });
  },
  
  // Create error response
  createErrorResponse: (message, status = 400, logData = {}) => {
    // Log security events
    console.warn('API Security Event:', {
      timestamp: new Date().toISOString(),
      message,
      status,
      ...logData
    });
    
    return apiSecurity.createSecureResponse(
      { error: message },
      status
    );
  },
  
  // Validate request origin
  validateOrigin: (req) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://www.13namima.me',
      'https://13namima.me',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:3000'
    ];
    
    if (!origin) {
      // Allow requests without origin (same-origin or direct requests)
      return true;
    }
    
    return allowedOrigins.includes(origin);
  },
  
  // Comprehensive request validation
  validateRequest: (req, options = {}) => {
    const { 
      requireAuth = false, 
      rateLimit = 'api',
      validateBody = false 
    } = options;
    
    // Validate origin
    if (!apiSecurity.validateOrigin(req)) {
      return {
        valid: false,
        response: apiSecurity.createErrorResponse('Invalid origin', 403)
      };
    }
    
    // Rate limiting
    if (!apiSecurity.rateLimit(rateLimit)(req)) {
      return {
        valid: false,
        response: apiSecurity.createErrorResponse('Rate limit exceeded', 429)
      };
    }
    
    // Validate headers
    const headerValidation = apiSecurity.validateHeaders(req);
    if (!headerValidation.valid) {
      return {
        valid: false,
        response: apiSecurity.createErrorResponse(headerValidation.error, 400)
      };
    }
    
    // Validate authentication if required
    if (requireAuth) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          valid: false,
          response: apiSecurity.createErrorResponse('Missing or invalid authorization header', 401)
        };
      }
      
      const token = authHeader.substring(7);
      if (!apiSecurity.validateToken(token)) {
        return {
          valid: false,
          response: apiSecurity.createErrorResponse('Invalid token format', 401)
        };
      }
    }
    
    return { valid: true };
  }
};

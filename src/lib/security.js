// Enhanced security utilities
export const security = {
  // Session timeout in milliseconds (1 hour default)
  SESSION_TIMEOUT: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000,
  
  // Max login attempts
  MAX_LOGIN_ATTEMPTS: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 5,
  
  // Allowed domains for redirect validation
  ALLOWED_DOMAINS: [
    import.meta.env.VITE_APP_DOMAIN || 'localhost',
    'www.13namima.me',
    '13namima.me'
  ],
  
  // Validate redirect URI
  validateRedirectUri: (uri) => {
    try {
      const url = new URL(uri);
      return security.ALLOWED_DOMAINS.some(domain => 
        url.hostname === domain || url.hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  },
  
  // Generate secure random string
  generateSecureToken: () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
  
  // Rate limiting for login attempts
  rateLimiter: {
    attempts: new Map(),
    
    isBlocked: (identifier) => {
      const attempts = security.rateLimiter.attempts.get(identifier);
      if (!attempts) return false;
      
      const now = Date.now();
      const validAttempts = attempts.filter(time => now - time < 900000); // 15 minutes
      
      security.rateLimiter.attempts.set(identifier, validAttempts);
      return validAttempts.length >= security.MAX_LOGIN_ATTEMPTS;
    },
    
    recordAttempt: (identifier) => {
      const attempts = security.rateLimiter.attempts.get(identifier) || [];
      attempts.push(Date.now());
      security.rateLimiter.attempts.set(identifier, attempts);
    },
    
    clearAttempts: (identifier) => {
      security.rateLimiter.attempts.delete(identifier);
    }
  },
  
  // Sanitize user input
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },
  
  // Validate token format
  isValidToken: (token) => {
    if (!token || typeof token !== 'string') return false;
    return /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(token);
  },
  
  // Check if session is expired
  isSessionExpired: (timestamp) => {
    if (!timestamp) return true;
    return Date.now() > parseInt(timestamp);
  },
  
  // Secure local storage operations
  secureStorage: {
    set: (key, value, expirationTime = security.SESSION_TIMEOUT) => {
      const item = {
        value,
        expiry: Date.now() + expirationTime,
        checksum: security.generateChecksum(JSON.stringify(value))
      };
      localStorage.setItem(key, JSON.stringify(item));
    },
    
    get: (key) => {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (!item) return null;
        
        // Check expiration
        if (Date.now() > item.expiry) {
          localStorage.removeItem(key);
          return null;
        }
        
        // Verify integrity
        const expectedChecksum = security.generateChecksum(JSON.stringify(item.value));
        if (item.checksum !== expectedChecksum) {
          localStorage.removeItem(key);
          return null;
        }
        
        return item.value;
      } catch {
        localStorage.removeItem(key);
        return null;
      }
    },
    
    remove: (key) => {
      localStorage.removeItem(key);
    },
    
    clear: () => {
      localStorage.clear();
    }
  },
  
  // Generate simple checksum for data integrity
  generateChecksum: async (data) => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
  
  // Log security events
  logSecurityEvent: (event, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // In production, send to monitoring service
    console.warn('Security Event:', logEntry);
  }
};

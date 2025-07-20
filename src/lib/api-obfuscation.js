// API request encryption and obfuscation utilities
export const apiSecurity = {
  // Simple obfuscation key (in production, use environment variable)
  obfuscationKey: 'lb2025_secure_api',
  
  // Encode API paths to make them less obvious
  encodePath: (path) => {
    try {
      const encoded = btoa(path).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      return `req_${encoded}`;
    } catch {
      return path;
    }
  },
  
  // Decode API paths
  decodePath: (encodedPath) => {
    try {
      if (!encodedPath.startsWith('req_')) return encodedPath;
      const base64 = encodedPath.substring(4).replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      return atob(padded);
    } catch {
      return encodedPath;
    }
  },
  
  // Create secure request payload
  createSecurePayload: (data, endpoint) => {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2);
    
    return {
      data: data,
      meta: {
        t: timestamp,
        n: nonce,
        e: apiSecurity.encodePath(endpoint),
        v: '2.0'
      }
    };
  },
  
  // Validate and extract secure payload
  extractSecurePayload: (payload) => {
    try {
      if (!payload.meta || !payload.data) {
        throw new Error('Invalid payload structure');
      }
      
      const { t: timestamp, n: nonce, e: encodedEndpoint, v: version } = payload.meta;
      
      // Check timestamp (reject requests older than 5 minutes)
      if (Date.now() - timestamp > 300000) {
        throw new Error('Request expired');
      }
      
      // Validate version
      if (version !== '2.0') {
        throw new Error('Unsupported request version');
      }
      
      const endpoint = apiSecurity.decodePath(encodedEndpoint);
      
      return {
        data: payload.data,
        endpoint,
        timestamp,
        nonce
      };
    } catch (error) {
      throw new Error(`Payload validation failed: ${error.message}`);
    }
  },
  
  // Obfuscated endpoint mapping
  endpointMap: {
    'oauth-token': 'auth_exchange',
    'cursus-users': 'student_data', 
    'user-me': 'profile_info',
    'campus': 'location_data',
    'intra-proxy': 'api_bridge'
  },
  
  // Get obfuscated endpoint name
  getObfuscatedEndpoint: (originalEndpoint) => {
    return apiSecurity.endpointMap[originalEndpoint] || originalEndpoint;
  },
  
  // Get original endpoint from obfuscated name
  getOriginalEndpoint: (obfuscatedEndpoint) => {
    const entries = Object.entries(apiSecurity.endpointMap);
    const found = entries.find(([original, obfuscated]) => obfuscated === obfuscatedEndpoint);
    return found ? found[0] : obfuscatedEndpoint;
  },
  
  // Create secure API request
  secureRequest: async (endpoint, options = {}) => {
    try {
      // Obfuscate the endpoint
      const obfuscatedEndpoint = apiSecurity.getObfuscatedEndpoint(endpoint);
      
      // Create secure payload
      const payload = apiSecurity.createSecurePayload(options.body ? JSON.parse(options.body) : {}, endpoint);
      
      // Make request to obfuscated endpoint
      const response = await fetch(`/api/${obfuscatedEndpoint}`, {
        ...options,
        method: options.method || 'POST',
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          'X-Request-Type': 'secure',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload)
      });
      
      return response;
    } catch (error) {
      console.error('Secure request failed:', error);
      throw error;
    }
  },
  
  // URL parameter obfuscation
  obfuscateParams: (params) => {
    const obfuscated = {};
    const paramMap = {
      'cursus_id': 'c',
      'page[size]': 's',
      'page[number]': 'n',
      'sort': 'o',
      'range[begin_at]': 'r',
      'filter[campus_id]': 'f'
    };
    
    Object.entries(params).forEach(([key, value]) => {
      const obfuscatedKey = paramMap[key] || key.substring(0, 2);
      obfuscated[obfuscatedKey] = value;
    });
    
    return obfuscated;
  },
  
  // URL parameter de-obfuscation
  deobfuscateParams: (obfuscatedParams) => {
    const original = {};
    const reverseMap = {
      'c': 'cursus_id',
      's': 'page[size]',
      'n': 'page[number]',
      'o': 'sort',
      'r': 'range[begin_at]',
      'f': 'filter[campus_id]'
    };
    
    Object.entries(obfuscatedParams).forEach(([key, value]) => {
      const originalKey = reverseMap[key] || key;
      original[originalKey] = value;
    });
    
    return original;
  }
};

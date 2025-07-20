// Environment configuration validation and security (Frontend-safe)
export const envConfig = {
  // Required environment variables (FRONTEND ONLY)
  required: [
    'VITE_42_CLIENT_ID',
    'VITE_42_REDIRECT_URI'
  ],
  
  // Optional environment variables with defaults
  optional: {
    'VITE_APP_DOMAIN': 'localhost',
    'VITE_SESSION_TIMEOUT': '3600000', // 1 hour
    'VITE_MAX_LOGIN_ATTEMPTS': '5',
    'VITE_42_AUTHORIZE_URL': 'https://api.intra.42.fr/oauth/authorize',
    'VITE_42_TOKEN_URL': 'https://api.intra.42.fr/oauth/token',
    'VITE_42_API_BASE_URL': 'https://api.intra.42.fr/v2'
  },
  
  // Validate all environment variables (FRONTEND SAFE)
  validate: () => {
    const errors = [];
    const warnings = [];
    
    // Check required variables
    for (const varName of envConfig.required) {
      const value = import.meta.env[varName];
      
      if (!value) {
        errors.push(`Missing required environment variable: ${varName}`);
        continue;
      }
      
      // Validate specific variables
      switch (varName) {
        case 'VITE_42_CLIENT_ID':
          if (!envConfig.validateClientId(value)) {
            errors.push(`Invalid ${varName} format`);
          }
          break;
          
        case 'VITE_42_REDIRECT_URI':
          if (!envConfig.validateRedirectUri(value)) {
            errors.push(`Invalid ${varName} format`);
          }
          break;
      }
    }
    
    // Check optional variables and set defaults
    for (const [varName, defaultValue] of Object.entries(envConfig.optional)) {
      const value = import.meta.env[varName];
      
      if (!value) {
        warnings.push(`Using default value for ${varName}: ${defaultValue}`);
      } else {
        // Validate specific optional variables
        switch (varName) {
          case 'VITE_SESSION_TIMEOUT':
            const timeout = parseInt(value);
            if (isNaN(timeout) || timeout < 300000 || timeout > 86400000) {
              warnings.push(`Invalid session timeout: ${value}. Should be between 5 minutes and 24 hours.`);
            }
            break;
            
          case 'VITE_MAX_LOGIN_ATTEMPTS':
            const attempts = parseInt(value);
            if (isNaN(attempts) || attempts < 1 || attempts > 20) {
              warnings.push(`Invalid max login attempts: ${value}. Should be between 1 and 20.`);
            }
            break;
        }
      }
    }
    
    return { errors, warnings };
  },
  
  // Validate 42 Client ID format
  validateClientId: (clientId) => {
    if (!clientId || typeof clientId !== 'string') return false;
    
    // Basic format validation (42 client IDs have specific patterns)
    const pattern = /^[a-z0-9]{64}$/;
    return pattern.test(clientId);
  },
  
  // Validate redirect URI
  validateRedirectUri: (uri) => {
    try {
      const url = new URL(uri);
      
      // Must be HTTPS in production or HTTP for localhost
      if (url.protocol !== 'https:' && !uri.includes('localhost')) {
        return false;
      }
      
      // Should not contain fragments or unusual characters
      if (url.hash || /[<>'"]/g.test(uri)) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  },
  
  // Get configuration with validation (FRONTEND SAFE - NO CLIENT SECRET)
  getConfig: () => {
    const validation = envConfig.validate();
    
    if (validation.errors.length > 0) {
      throw new Error(`Environment configuration errors:\n${validation.errors.join('\n')}`);
    }
    
    if (validation.warnings.length > 0) {
      console.warn('Environment configuration warnings:\n', validation.warnings.join('\n'));
    }

    // Return sanitized configuration (CLIENT SECRET EXCLUDED)
    return {
      oauth: {
        clientId: import.meta.env.VITE_42_CLIENT_ID,
        // CLIENT SECRET IS HANDLED SERVER-SIDE ONLY
        redirectUri: import.meta.env.VITE_42_REDIRECT_URI,
        authorizeUrl: import.meta.env.VITE_42_AUTHORIZE_URL || envConfig.optional['VITE_42_AUTHORIZE_URL'],
        tokenUrl: import.meta.env.VITE_42_TOKEN_URL || envConfig.optional['VITE_42_TOKEN_URL'],
        apiBaseUrl: import.meta.env.VITE_42_API_BASE_URL || envConfig.optional['VITE_42_API_BASE_URL']
      },
      security: {
        appDomain: import.meta.env.VITE_APP_DOMAIN || envConfig.optional['VITE_APP_DOMAIN'],
        sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || envConfig.optional['VITE_SESSION_TIMEOUT']),
        maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || envConfig.optional['VITE_MAX_LOGIN_ATTEMPTS'])
      },
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD
    };
  },
  
  // Security check for production
  productionSecurityCheck: () => {
    if (!import.meta.env.PROD) return { passed: true };
    
    const issues = [];
    
    // Check if client secret is exposed in browser (should never happen in production)
    if (window.location.protocol === 'https:' && import.meta.env.VITE_42_CLIENT_SECRET) {
      issues.push('Client secret exposed in browser environment');
    }
    
    // Check redirect URI uses HTTPS
    const redirectUri = import.meta.env.VITE_42_REDIRECT_URI;
    if (redirectUri && !redirectUri.startsWith('https://')) {
      issues.push('Redirect URI must use HTTPS in production');
    }
    
    // Check domain configuration
    const appDomain = import.meta.env.VITE_APP_DOMAIN;
    if (!appDomain || appDomain === 'localhost') {
      issues.push('App domain must be configured for production');
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  },
  
  // Initialize and validate environment
  init: () => {
    try {
      const config = envConfig.getConfig();
      
      // Run production security check
      const securityCheck = envConfig.productionSecurityCheck();
      if (!securityCheck.passed) {
        console.error('Production security issues:', securityCheck.issues);
        if (import.meta.env.PROD) {
          throw new Error('Production security validation failed');
        }
      }
      
      console.log('Environment configuration initialized successfully');
      return config;
    } catch (error) {
      console.error('Failed to initialize environment configuration:', error);
      throw error;
    }
  }
};

// Auto-initialize when module loads
let appConfig;
try {
  appConfig = envConfig.init();
} catch (error) {
  console.error('Critical: Environment configuration failed:', error.message);
  // In development, show error overlay
  if (import.meta.env.DEV) {
    document.body.innerHTML = `
      <div style="
        position: fixed; 
        top: 0; 
        left: 0; 
        right: 0; 
        bottom: 0; 
        background: #fff; 
        color: #d32f2f; 
        font-family: monospace; 
        padding: 20px; 
        z-index: 9999;
        overflow: auto;
      ">
        <h1>Environment Configuration Error</h1>
        <p><strong>Error:</strong> ${error.message}</p>
        <p>Please check your .env file and ensure all required variables are set.</p>
        <hr>
        <h3>Required Variables:</h3>
        <ul>
          ${envConfig.required.map(var => `<li>${var}</li>`).join('')}
        </ul>
        <h3>Optional Variables:</h3>
        <ul>
          ${Object.keys(envConfig.optional).map(var => `<li>${var}</li>`).join('')}
        </ul>
      </div>
    `;
  }
}

export { appConfig };

// CORS proxy utility for OAuth token exchange
export const corsProxy = {
  // List of CORS proxy services to try
  proxies: [
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://api.allorigins.win/raw?url=',
    'https://thingproxy.freeboard.io/fetch/',
  ],
  
  // Try multiple CORS proxies until one works
  fetch: async (url, options = {}) => {
    const errors = [];
    
    for (const proxyUrl of corsProxy.proxies) {
      try {
        const proxiedUrl = proxyUrl + encodeURIComponent(url);
        console.log(`Trying CORS proxy: ${proxyUrl}`);
        
        const response = await fetch(proxiedUrl, {
          ...options,
          headers: {
            ...options.headers,
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        
        if (response.ok) {
          console.log(`CORS proxy successful: ${proxyUrl}`);
          return response;
        }
        
        errors.push(`${proxyUrl}: ${response.status} ${response.statusText}`);
      } catch (error) {
        errors.push(`${proxyUrl}: ${error.message}`);
        console.log(`CORS proxy failed: ${proxyUrl}`, error);
      }
    }
    
    throw new Error(`All CORS proxies failed: ${errors.join(', ')}`);
  }
};

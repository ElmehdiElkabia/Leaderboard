// Enhanced CORS proxy utility with better error handling
export const corsProxy = {
  // Updated list of CORS proxy services
  proxies: [
    // AllOrigins - usually most reliable for GET requests
    {
      url: 'https://api.allorigins.win/get?url=',
      type: 'allorigins',
      supportsPost: false
    },
    // Cors-anywhere (might be rate limited)
    {
      url: 'https://cors-anywhere.herokuapp.com/',
      type: 'direct',
      supportsPost: true
    },
    // CodeTabs proxy
    {
      url: 'https://api.codetabs.com/v1/proxy?quest=',
      type: 'direct',
      supportsPost: true
    },
    // ThingProxy
    {
      url: 'https://thingproxy.freeboard.io/fetch/',
      type: 'direct',
      supportsPost: true
    }
  ],
  
  // Try multiple CORS proxies until one works
  fetch: async (url, options = {}) => {
    const errors = [];
    const isPostRequest = options.method?.toLowerCase() === 'post';
    
    // Filter proxies based on whether they support POST
    const availableProxies = corsProxy.proxies.filter(proxy => 
      !isPostRequest || proxy.supportsPost
    );
    
    for (const proxy of availableProxies) {
      try {
        let proxiedUrl;
        let fetchOptions = { ...options };
        
        if (proxy.type === 'allorigins' && !isPostRequest) {
          // Special handling for AllOrigins (GET only)
          proxiedUrl = proxy.url + encodeURIComponent(url);
          const response = await fetch(proxiedUrl);
          
          if (response.ok) {
            const data = await response.json();
            // Return a response-like object
            return {
              ok: true,
              status: 200,
              json: async () => JSON.parse(data.contents),
              text: async () => data.contents
            };
          }
        } else {
          // Direct proxy approach
          proxiedUrl = proxy.url + encodeURIComponent(url);
          fetchOptions.headers = {
            ...fetchOptions.headers,
            'X-Requested-With': 'XMLHttpRequest',
          };
          
          const response = await fetch(proxiedUrl, fetchOptions);
          
          if (response.ok) {
            return response;
          }
        }
        
        errors.push(`${proxy.url}: Failed`);
      } catch (error) {
        errors.push(`${proxy.url}: ${error.message}`);
      }
    }
    
    throw new Error(`All CORS proxies failed: ${errors.join(', ')}`);
  }
};
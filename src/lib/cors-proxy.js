// CORS proxy utility for OAuth token exchange
export const corsProxy = {
  // Use a public CORS proxy service
  proxyUrl: 'https://api.allorigins.win/raw?url=',
  
  // Make a proxied request
  fetch: async (url, options = {}) => {
    const proxiedUrl = corsProxy.proxyUrl + encodeURIComponent(url);
    return fetch(proxiedUrl, options);
  }
};

// Alternative CORS proxy services (if the above doesn't work):
// - https://cors-anywhere.herokuapp.com/
// - https://api.codetabs.com/v1/proxy?quest=
// - https://thingproxy.freeboard.io/fetch/

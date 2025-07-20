// Vercel serverless function for general 42 API proxy
// File: /api/intra-proxy.js

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization) {
      return res.status(401).json({ error: 'Authorization header required' });
    }
    
    // Get the API path from query parameters
    const { path } = req.query;
    
    if (!path) {
      return res.status(400).json({ error: 'API path is required' });
    }
    
    // Construct the full API URL
    const apiUrl = `https://api.intra.42.fr/v2/${path}`;
    
    // Forward the request to the 42 API
    const fetchOptions = {
      method: req.method,
      headers: {
        'Authorization': authorization,
      }
    };
    
    // Add body for POST requests
    if (req.method === 'POST' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
      fetchOptions.headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(apiUrl, fetchOptions);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Intra API proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

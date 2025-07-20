// Vercel serverless function for campus data
// File: /api/campus.js

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization) {
      return res.status(401).json({ error: 'Authorization header required' });
    }
    
    // Get campus ID from query parameters or path
    const { campus_id } = req.query;
    
    let apiUrl = 'https://api.intra.42.fr/v2/campus';
    if (campus_id) {
      apiUrl += `/${campus_id}`;
    }
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': authorization,
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    return res.json(data);
  } catch (error) {
    console.error('Campus API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

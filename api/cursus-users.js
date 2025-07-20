// Vercel serverless function for cursus users (leaderboard data)
// File: /api/cursus-users.js

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
    
    // Get query parameters
    const { 
      cursus_id = '21', 
      'range[begin_at]': rangeBeginAt,
      'page[size]': pageSize = '100',
      'page[number]': pageNumber = '1',
      sort = '-level',
      'filter[campus_id]': campusId 
    } = req.query;
    
    // Build the API URL with query parameters
    const params = new URLSearchParams();
    params.append('cursus_id', cursus_id);
    if (rangeBeginAt) params.append('range[begin_at]', rangeBeginAt);
    params.append('page[size]', pageSize);
    params.append('page[number]', pageNumber);
    params.append('sort', sort);
    if (campusId) params.append('filter[campus_id]', campusId);
    
    const apiUrl = `https://api.intra.42.fr/v2/cursus_users?${params.toString()}`;
    
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
    console.error('Cursus users API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

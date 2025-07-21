// Backend campus data endpoint - /api/campus-data.js
module.exports = async function handler(req, res) {
  // Set CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://www.13namima.me',
    'https://13namima.me',
    'http://localhost:5173',
    'http://localhost:8080'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Server-side OAuth configuration
    const clientId = process.env.VITE_42_CLIENT_ID;
    const clientSecret = process.env.VITE_42_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('OAuth configuration missing for campus data');
      return res.status(500).json({ 
        error: 'Server configuration error'
      });
    }

    // Get client credentials token for API access
    const tokenFormData = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    });
    
    const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'LeaderboardApp/1.0',
      },
      body: tokenFormData
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Failed to get API access token for campus data');
      return res.status(500).json({ 
        error: 'Failed to authenticate with API'
      });
    }

    // Fetch campus data from 42 API
    const campusResponse = await fetch('https://api.intra.42.fr/v2/campus', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'LeaderboardApp/1.0',
      },
    });

    if (!campusResponse.ok) {
      console.error('Campus data fetch failed:', campusResponse.status);
      return res.status(campusResponse.status).json({
        error: 'Failed to fetch campus data'
      });
    }

    const campusData = await campusResponse.json();

    // Return safe, processed campus data
    const safeCampusData = campusData.map(campus => ({
      id: campus.id,
      name: campus.name,
      city: campus.city,
      country: campus.country,
      time_zone: campus.time_zone,
      // Remove any sensitive data
    }));

    console.log('Campus data fetched:', {
      count: safeCampusData.length,
      timestamp: new Date().toISOString()
    });
    
    return res.json({
      success: true,
      data: safeCampusData
    });
    
  } catch (error) {
    console.error('Campus data API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error'
    });
  }
}

// Backend-only leaderboard data - /api/leaderboard-data.js
export default async function handler(req, res) {
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get parameters from query
    const { 
      campus_id, 
      page = '1', 
      per_page = '100',
      cursus_id = '21', // Default to 42 cursus
      date_range, // Optional date range filter (e.g., "2024-01-01,2025-01-01")
      pool_month // Optional pool month filter
    } = req.query;
    
    if (!campus_id) {
      return res.status(400).json({ 
        error: 'Campus ID is required'
      });
    }

    // Server-side OAuth configuration
    const clientId = process.env.VITE_42_CLIENT_ID;
    const clientSecret = process.env.VITE_42_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('OAuth configuration missing for API access');
      return res.status(500).json({ 
        error: 'Server configuration error'
      });
    }

    // Step 1: Get client credentials token for API access
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
      console.error('Failed to get API access token:', tokenData);
      return res.status(500).json({ 
        error: 'Failed to authenticate with API'
      });
    }

    // Step 2: Fetch leaderboard data from 42 API
    const apiUrl = new URL('https://api.intra.42.fr/v2/cursus_users');
    apiUrl.searchParams.set('filter[campus_id]', campus_id);
    apiUrl.searchParams.set('filter[cursus_id]', cursus_id);
    apiUrl.searchParams.set('sort', '-level');
    apiUrl.searchParams.set('page[number]', page);
    apiUrl.searchParams.set('page[size]', per_page);
    
    // Add date range filter if provided
    if (date_range) {
      apiUrl.searchParams.set('range[begin_at]', date_range);
    }
    
    // Add pool month filter if provided (for Piscine students)
    if (pool_month && pool_month !== 'all') {
      // For pool month filtering, we need to add additional filters
      // This will be handled by the date_range parameter primarily
    }
    
    const leaderboardResponse = await fetch(apiUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'LeaderboardApp/1.0',
      },
    });

    if (!leaderboardResponse.ok) {
      console.error('Leaderboard fetch failed:', leaderboardResponse.status);
      return res.status(leaderboardResponse.status).json({
        error: 'Failed to fetch leaderboard data'
      });
    }

    const leaderboardData = await leaderboardResponse.json();

    // Step 3: Return safe, processed data
    // const safeData = leaderboardData.map((user, index) => ({
    //   id: user.id,
    //   rank: ((parseInt(page) - 1) * parseInt(per_page)) + index + 1,
    //   login: user.user?.login || 'unknown',
    //   level: user.level || 0,
    //   grade: user.grade || null,
    //   campus: user.user?.campus?.[0]?.name || 'Unknown Campus',
    //   image: user.user?.image?.versions?.small || user.user?.image?.link,
    //   // Remove any sensitive data
    // }));

    const safeData = Array.isArray(leaderboardData) ? leaderboardData : [leaderboardData];

    console.log('Leaderboard data fetched:', {
      campus_id,
      page,
      count: safeData.length,
      timestamp: new Date().toISOString()
    });
    
    return res.json({
      success: true,
      data: safeData,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(per_page),
        total_count: safeData.length
      }
    });
    
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error'
    });
  }
}

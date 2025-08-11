// Test endpoint to fetch male users - /api/test-male-users.js
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
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
  
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // For testing, we'll use the OAuth credentials
    const clientId = process.env.VITE_42_CLIENT_ID;
    const clientSecret = process.env.VITE_42_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'OAuth environment variables not properly configured'
      });
    }

    // Get access token using client credentials flow for API testing
    const tokenFormData = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    });
    
    console.log('Requesting token with client credentials...');
    
    const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'LeaderboardApp/1.0',
      },
      body: tokenFormData
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Token request failed:', tokenData);
      return res.status(tokenResponse.status).json({
        error: 'Token request failed',
        details: tokenData.error_description || tokenData.error
      });
    }
    
    if (!tokenData.access_token) {
      return res.status(500).json({ 
        error: 'Invalid token response',
        details: 'No access token received'
      });
    }

    console.log('Token received, testing available filters...');

    // First, let's test with a valid filter - fetch users by kind (student)
    const usersResponse = await fetch('https://api.intra.42.fr/v2/users?filter[kind]=student&page[size]=10', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'LeaderboardApp/1.0',
      },
    });

    if (!usersResponse.ok) {
      console.error('Users fetch failed:', usersResponse.status);
      const errorText = await usersResponse.text();
      console.error('Error response:', errorText);
      return res.status(usersResponse.status).json({
        error: 'Failed to fetch users',
        details: `HTTP ${usersResponse.status}`,
        response: errorText
      });
    }

    const usersData = await usersResponse.json();
    
    // Now let's see what user data fields are actually available
    console.log('Sample user fields:', usersData.length > 0 ? Object.keys(usersData[0]) : 'No users found');
    
    console.log(`Fetched ${usersData.length} users`);

    // Check if any users have gender information in their data
    const usersWithGenderInfo = usersData.filter(user => user.gender || user.sex);
    
    // Return the data with analysis of available fields
    return res.json({
      success: true,
      message: 'Successfully fetched users (gender filter not available in API)',
      note: 'Available filters are: id, login, email, created_at, updated_at, pool_year, pool_month, kind, status, primary_campus_id, first_name, last_name, alumni?, staff?',
      count: usersData.length,
      users_with_gender_info: usersWithGenderInfo.length,
      filter_used: 'filter[kind]=student',
      users: usersData.map(user => ({
        id: user.id,
        login: user.login,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        displayname: user.displayname,
        image: user.image,
        campus: user.campus,
        cursus_users: user.cursus_users,
        kind: user.kind,
        staff: user['staff?'],
        alumni: user['alumni?'],
        // Check for any gender-related fields
        gender: user.gender || null,
        sex: user.sex || null,
        // Add any other fields that might be interesting
        pool_year: user.pool_year,
        pool_month: user.pool_month,
        created_at: user.created_at,
        updated_at: user.updated_at
      })),
      // For debugging - show available fields from first user
      available_fields: usersData.length > 0 ? Object.keys(usersData[0]) : [],
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in
    });
    
  } catch (error) {
    console.error('Test male users error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}

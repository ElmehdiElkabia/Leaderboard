// Test endpoint to check environment variables
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
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Check environment variables (don't expose the actual values)
    const envCheck = {
      hasClientId: !!process.env.VITE_42_CLIENT_ID,
      hasClientSecret: !!process.env.VITE_42_CLIENT_SECRET,
      hasRedirectUri: !!process.env.VITE_42_REDIRECT_URI,
      clientIdLength: process.env.VITE_42_CLIENT_ID ? process.env.VITE_42_CLIENT_ID.length : 0,
      redirectUri: process.env.VITE_42_REDIRECT_URI || 'not set',
      timestamp: new Date().toISOString()
    };
    
    console.log('Environment check:', envCheck);
    
    return res.json({
      success: true,
      message: 'API is working',
      environment: envCheck
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({ 
      error: 'Test endpoint error',
      details: error.message
    });
  }
}

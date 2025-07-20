export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://www.13namima.me');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, redirect_uri } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Your 42 app credentials - make sure to set these in Vercel environment variables
    const CLIENT_ID = process.env.VITE_42_CLIENT_ID || 'u-s4t2ud-a126bdf95a4737cc91f85f57010905df1a2007f6aa0ae83d3dc9893be2851b9d';
    const CLIENT_SECRET = process.env.VITE_42_CLIENT_SECRET; // You MUST set this in Vercel env vars

    if (!CLIENT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Exchange authorization code for access token
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      redirect_uri: redirect_uri,
    });

    const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return res.status(tokenResponse.status).json({ 
        error: 'Token exchange failed',
        details: errorData 
      });
    }

    const tokenData = await tokenResponse.json();
    res.json(tokenData);

  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

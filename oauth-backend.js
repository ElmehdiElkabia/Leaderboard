// Simple Node.js/Express backend for OAuth proxy
// You can deploy this as a serverless function or simple backend

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// Enable CORS for your domain
app.use(cors({
  origin: ['https://www.13namima.me', 'http://localhost:8080'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// OAuth token exchange endpoint
app.post('/api/oauth/token', async (req, res) => {
  try {
    const { grant_type, client_id, client_secret, code, redirect_uri } = req.body;
    
    const response = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type,
        client_id,
        client_secret,
        code,
        redirect_uri
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User info endpoint
app.get('/api/user/me', async (req, res) => {
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization) {
      return res.status(401).json({ error: 'Authorization header required' });
    }
    
    const response = await fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        'Authorization': authorization,
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`OAuth proxy server running on port ${port}`);
});

module.exports = app;

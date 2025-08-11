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
    
    // AI Gender Detection
    console.log('Starting AI gender analysis...');
    const usersWithAIGender = await Promise.all(
      usersData.map(async (user) => {
        const aiGenderResult = await analyzeGenderWithAI(user);
        return {
          ...user,
          ai_gender_prediction: aiGenderResult
        };
      })
    );
    
    // Filter for predicted male users
    const predictedMaleUsers = usersWithAIGender.filter(
      user => user.ai_gender_prediction?.predicted_gender === 'male'
    );
    
    console.log(`AI predicted ${predictedMaleUsers.length} male users out of ${usersData.length} total users`);
    
    // Return the data with analysis of available fields
    return res.json({
      success: true,
      message: 'Successfully fetched users with AI gender analysis',
      note: 'Available filters are: id, login, email, created_at, updated_at, pool_year, pool_month, kind, status, primary_campus_id, first_name, last_name, alumni?, staff?',
      count: usersData.length,
      users_with_gender_info: usersWithGenderInfo.length,
      ai_predicted_male_users: predictedMaleUsers.length,
      filter_used: 'filter[kind]=student + AI gender detection',
      users: usersWithAIGender.map(user => ({
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
        // Original gender fields (likely null)
        gender: user.gender || null,
        sex: user.sex || null,
        // AI gender prediction
        ai_gender_prediction: user.ai_gender_prediction,
        // Add any other fields that might be interesting
        pool_year: user.pool_year,
        pool_month: user.pool_month,
        created_at: user.created_at,
        updated_at: user.updated_at
      })),
      predicted_male_users: predictedMaleUsers.map(user => ({
        id: user.id,
        login: user.login,
        first_name: user.first_name,
        last_name: user.last_name,
        displayname: user.displayname,
        ai_prediction: user.ai_gender_prediction
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

// AI Gender Detection Function
async function analyzeGenderWithAI(user) {
  try {
    // Prepare data for AI analysis
    const analysisData = {
      first_name: user.first_name,
      last_name: user.last_name,
      login: user.login,
      displayname: user.displayname,
      email: user.email,
      campus: user.campus?.[0]?.name || null,
      country: user.campus?.[0]?.country || null,
      cursus_info: user.cursus_users?.[0] || null
    };

    // Create a comprehensive prompt for AI analysis
    const prompt = `Analyze the following user profile data and predict the likely gender (male/female) based on the available information. Consider names, cultural context, and any other relevant indicators.

User Data:
- First Name: ${analysisData.first_name || 'N/A'}
- Last Name: ${analysisData.last_name || 'N/A'}
- Login: ${analysisData.login || 'N/A'}
- Display Name: ${analysisData.displayname || 'N/A'}
- Email: ${analysisData.email || 'N/A'}
- Campus: ${analysisData.campus || 'N/A'}
- Country: ${analysisData.country || 'N/A'}

Please respond with a JSON object in this exact format:
{
  "predicted_gender": "male" or "female",
  "confidence": number between 0-100,
  "reasoning": "brief explanation of the prediction",
  "primary_indicators": ["list", "of", "key", "factors"]
}

Focus primarily on the first name for gender prediction, but consider cultural context from location data if available.`;

    // Use OpenAI API (you can also use other AI services like Anthropic, Groq, etc.)
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // or 'gpt-4' for better accuracy
        messages: [
          {
            role: 'system',
            content: 'You are a gender prediction AI that analyzes user profile data to predict gender. You should be respectful and acknowledge that gender prediction from names is not always accurate, but provide your best analysis based on common patterns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3 // Lower temperature for more consistent predictions
      })
    });

    if (!aiResponse.ok) {
      console.error('AI API failed:', aiResponse.status);
      return {
        predicted_gender: 'unknown',
        confidence: 0,
        reasoning: 'AI API request failed',
        primary_indicators: [],
        error: `AI API error: ${aiResponse.status}`
      };
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      return {
        predicted_gender: 'unknown',
        confidence: 0,
        reasoning: 'No AI response received',
        primary_indicators: [],
        error: 'Empty AI response'
      };
    }

    // Parse the AI response
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        return {
          predicted_gender: parsedResult.predicted_gender,
          confidence: parsedResult.confidence,
          reasoning: parsedResult.reasoning,
          primary_indicators: parsedResult.primary_indicators || [],
          raw_ai_response: aiContent
        };
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return {
        predicted_gender: 'unknown',
        confidence: 0,
        reasoning: 'Failed to parse AI response',
        primary_indicators: [],
        error: 'JSON parse error',
        raw_ai_response: aiContent
      };
    }

  } catch (error) {
    console.error('AI gender analysis error:', error);
    return {
      predicted_gender: 'unknown',
      confidence: 0,
      reasoning: 'AI analysis failed',
      primary_indicators: [],
      error: error.message
    };
  }
}

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
    const usersResponse = await fetch('https://api.intra.42.fr/v2/users?filter[kind]=student&page[size]=100', {
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
    
    // AI Gender Detection with rate limiting
    console.log('Starting AI gender analysis with rate limiting...');
    const usersWithAIGender = [];
    
    // Process users in smaller batches to avoid rate limits
    const batchSize = 5; // Process 5 users at a time
    const delay = 1000; // 1 second delay between batches
    
    for (let i = 0; i < Math.min(usersData.length, 20); i += batchSize) { // Limit to first 20 users for testing
      const batch = usersData.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}, users ${i + 1}-${Math.min(i + batchSize, usersData.length)}`);
      
      const batchResults = await Promise.all(
        batch.map(async (user) => {
          const aiGenderResult = await analyzeGenderWithAI(user);
          return {
            ...user,
            ai_gender_prediction: aiGenderResult
          };
        })
      );
      
      usersWithAIGender.push(...batchResults);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < Math.min(usersData.length, 20)) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // For remaining users (if any), use local gender detection
    const remainingUsers = usersData.slice(usersWithAIGender.length).map(user => ({
      ...user,
      ai_gender_prediction: analyzeGenderLocally(user)
    }));
    
    const allUsersWithGender = [...usersWithAIGender, ...remainingUsers];
    
    // Filter for predicted male users
    const predictedMaleUsers = allUsersWithGender.filter(
      user => user.ai_gender_prediction?.predicted_gender === 'male'
    );
    
    console.log(`AI predicted ${predictedMaleUsers.length} male users out of ${allUsersWithGender.length} analyzed users`);
    
    // Return the data with analysis of available fields
    return res.json({
      success: true,
      message: 'Successfully fetched users with AI gender analysis (rate-limited)',
      note: 'Available filters are: id, login, email, created_at, updated_at, pool_year, pool_month, kind, status, primary_campus_id, first_name, last_name, alumni?, staff?',
      count: usersData.length,
      analyzed_count: allUsersWithGender.length,
      users_with_gender_info: usersWithGenderInfo.length,
      ai_predicted_male_users: predictedMaleUsers.length,
      filter_used: 'filter[kind]=student + AI gender detection (batch processed)',
      users: allUsersWithGender.map(user => ({
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

// AI Gender Detection Function with improved error handling
async function analyzeGenderWithAI(user) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log('No OpenAI API key found, using local analysis');
      return analyzeGenderLocally(user);
    }

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

    // Use OpenAI API with retry logic
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
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
        temperature: 0.3
      })
    });

    if (!aiResponse.ok) {
      console.warn(`AI API failed for user ${user.login}: ${aiResponse.status}`);
      // Fallback to local analysis
      return analyzeGenderLocally(user);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      return analyzeGenderLocally(user);
    }

    // Parse the AI response
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        return {
          predicted_gender: parsedResult.predicted_gender,
          confidence: parsedResult.confidence,
          reasoning: parsedResult.reasoning,
          primary_indicators: parsedResult.primary_indicators || [],
          method: 'openai_api',
          raw_ai_response: aiContent
        };
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.warn(`Failed to parse AI response for ${user.login}:`, parseError);
      return analyzeGenderLocally(user);
    }

  } catch (error) {
    console.warn(`AI gender analysis error for ${user.login}:`, error.message);
    return analyzeGenderLocally(user);
  }
}

// Local Gender Detection Function (fallback)
function analyzeGenderLocally(user) {
  const firstName = user.first_name?.toLowerCase() || '';
  const lastName = user.last_name?.toLowerCase() || '';
  const login = user.login?.toLowerCase() || '';
  
  // Common male names patterns
  const maleNames = [
    'mohamed', 'mohammed', 'ahmad', 'ahmed', 'ali', 'hassan', 'hussein', 'omar', 'youssef', 'abdullah',
    'alexander', 'alex', 'david', 'daniel', 'dan', 'michael', 'mike', 'john', 'james', 'robert', 'william',
    'pierre', 'jean', 'paul', 'nicolas', 'antoine', 'julien', 'thomas', 'maxime', 'kevin', 'florian',
    'antonio', 'jose', 'luis', 'carlos', 'miguel', 'francisco', 'fernando', 'rafael', 'sergio', 'pablo',
    'marco', 'matteo', 'giovanni', 'francesco', 'alessandro', 'lorenzo', 'andrea', 'stefano', 'davide',
    'yang', 'wei', 'li', 'wang', 'zhang', 'chen', 'liu', 'huang', 'zhao', 'wu',
    'dmitry', 'vladimir', 'sergey', 'alexey', 'andrey', 'ivan', 'pavel', 'maksim', 'nikita', 'anton'
  ];
  
  // Common female names patterns
  const femaleNames = [
    'fatima', 'aisha', 'khadija', 'zeinab', 'maryam', 'sara', 'nour', 'aya', 'layla', 'yasmin',
    'maria', 'ana', 'laura', 'paula', 'elena', 'cristina', 'sandra', 'monica', 'patricia', 'raquel',
    'marie', 'sophie', 'camille', 'emma', 'lea', 'manon', 'chloe', 'sarah', 'claire', 'julie',
    'anna', 'elena', 'giulia', 'francesca', 'chiara', 'valentina', 'federica', 'alice', 'sara', 'martina',
    'emily', 'emma', 'olivia', 'sophia', 'isabella', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn',
    'ling', 'mei', 'xin', 'yan', 'min', 'jing', 'hui', 'ping', 'lei', 'fang',
    'anastasia', 'ekaterina', 'maria', 'anna', 'elena', 'tatyana', 'olga', 'irina', 'natasha', 'svetlana'
  ];
  
  let confidence = 0;
  let predictedGender = 'unknown';
  let reasoning = 'Unable to determine gender from available data';
  let indicators = [];
  
  // Check first name
  if (firstName) {
    const maleMatch = maleNames.some(name => firstName.includes(name) || name.includes(firstName));
    const femaleMatch = femaleNames.some(name => firstName.includes(name) || name.includes(firstName));
    
    if (maleMatch && !femaleMatch) {
      predictedGender = 'male';
      confidence = 75;
      reasoning = `First name "${user.first_name}" matches common male name patterns`;
      indicators.push('first_name_pattern');
    } else if (femaleMatch && !maleMatch) {
      predictedGender = 'female';
      confidence = 75;
      reasoning = `First name "${user.first_name}" matches common female name patterns`;
      indicators.push('first_name_pattern');
    }
  }
  
  // Check for gendered endings in names
  if (confidence === 0) {
    if (firstName.endsWith('a') || firstName.endsWith('ia') || firstName.endsWith('ina')) {
      predictedGender = 'female';
      confidence = 60;
      reasoning = 'First name has common female ending (-a, -ia, -ina)';
      indicators.push('name_ending');
    } else if (firstName.endsWith('o') || firstName.endsWith('us') || firstName.endsWith('er')) {
      predictedGender = 'male';
      confidence = 60;
      reasoning = 'First name has common male ending (-o, -us, -er)';
      indicators.push('name_ending');
    }
  }
  
  // Check login patterns
  if (confidence < 50 && login) {
    if (login.includes('girl') || login.includes('lady') || login.includes('princess')) {
      predictedGender = 'female';
      confidence = Math.max(confidence, 40);
      reasoning = 'Login contains female-associated terms';
      indicators.push('login_pattern');
    } else if (login.includes('boy') || login.includes('guy') || login.includes('king') || login.includes('prince')) {
      predictedGender = 'male';
      confidence = Math.max(confidence, 40);
      reasoning = 'Login contains male-associated terms';
      indicators.push('login_pattern');
    }
  }
  
  return {
    predicted_gender: predictedGender,
    confidence: confidence,
    reasoning: reasoning,
    primary_indicators: indicators,
    method: 'local_pattern_matching'
  };
}

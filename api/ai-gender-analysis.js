// AI Gender Analysis for Leaderboard - /api/ai-gender-analysis.js
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
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { users } = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input: users array required'
      });
    }

    console.log(`Starting AI gender analysis for ${users.length} users...`);
    
    // Process users in batches to avoid overwhelming the system
    const batchSize = 10;
    const delay = 500; // 0.5 second delay between batches
    const analyzedUsers = [];
    
    // Limit analysis to prevent timeout and high costs
    const maxUsers = Math.min(users.length, 50);
    
    for (let i = 0; i < maxUsers; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}, users ${i + 1}-${Math.min(i + batchSize, maxUsers)}`);
      
      const batchResults = await Promise.all(
        batch.map(async (user) => {
          const genderPrediction = await analyzeGenderWithAI(user);
          return {
            id: user.id,
            login: user.login,
            gender_prediction: genderPrediction
          };
        })
      );
      
      analyzedUsers.push(...batchResults);
      
      // Add delay between batches
      if (i + batchSize < maxUsers) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // For remaining users, use local analysis only
    for (let i = maxUsers; i < users.length; i++) {
      const user = users[i];
      analyzedUsers.push({
        id: user.id,
        login: user.login,
        gender_prediction: analyzeGenderLocally(user)
      });
    }
    
    // Calculate statistics
    const stats = {
      total: analyzedUsers.length,
      male: analyzedUsers.filter(u => u.gender_prediction.predicted_gender === 'male').length,
      female: analyzedUsers.filter(u => u.gender_prediction.predicted_gender === 'female').length,
      unknown: analyzedUsers.filter(u => u.gender_prediction.predicted_gender === 'unknown').length,
      ai_analyzed: maxUsers,
      local_analyzed: users.length - maxUsers
    };
    
    console.log(`Gender analysis complete:`, stats);
    
    return res.json({
      success: true,
      analyzed_users: analyzedUsers,
      stats: stats,
      message: `Analyzed ${analyzedUsers.length} users (${stats.ai_analyzed} with AI, ${stats.local_analyzed} local)`
    });
    
  } catch (error) {
    console.error('AI gender analysis error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}

// AI Gender Detection Function (same as before but optimized)
async function analyzeGenderWithAI(user) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return analyzeGenderLocally(user);
    }

    // Quick pre-check with local analysis to avoid unnecessary API calls
    const localResult = analyzeGenderLocally(user);
    if (localResult.confidence >= 70) {
      // If local analysis is confident, use it to save API calls
      return {
        ...localResult,
        method: 'local_high_confidence'
      };
    }

    // Create a shorter, more efficient prompt
    const prompt = `Name: ${user.first_name || 'Unknown'} ${user.last_name || ''}
Login: ${user.login || ''}
Email: ${user.email || ''}

Predict gender (male/female) and confidence (0-100). Respond only with JSON:
{"predicted_gender":"male|female","confidence":number,"reasoning":"brief"}`;

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
            content: 'You predict gender from names. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.1
      })
    });

    if (!aiResponse.ok) {
      return analyzeGenderLocally(user);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      return analyzeGenderLocally(user);
    }

    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        return {
          predicted_gender: parsedResult.predicted_gender,
          confidence: parsedResult.confidence,
          reasoning: parsedResult.reasoning,
          method: 'openai_api'
        };
      }
    } catch (parseError) {
      return analyzeGenderLocally(user);
    }

  } catch (error) {
    return analyzeGenderLocally(user);
  }
}

// Local Gender Detection Function (same as before)
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
  
  // Check first name
  if (firstName) {
    const maleMatch = maleNames.some(name => firstName.includes(name) || name.includes(firstName));
    const femaleMatch = femaleNames.some(name => firstName.includes(name) || name.includes(firstName));
    
    if (maleMatch && !femaleMatch) {
      predictedGender = 'male';
      confidence = 75;
      reasoning = `First name matches common male pattern`;
    } else if (femaleMatch && !maleMatch) {
      predictedGender = 'female';
      confidence = 75;
      reasoning = `First name matches common female pattern`;
    }
  }
  
  // Check for gendered endings in names
  if (confidence === 0) {
    if (firstName.endsWith('a') || firstName.endsWith('ia') || firstName.endsWith('ina')) {
      predictedGender = 'female';
      confidence = 60;
      reasoning = 'First name has common female ending';
    } else if (firstName.endsWith('o') || firstName.endsWith('us') || firstName.endsWith('er')) {
      predictedGender = 'male';
      confidence = 60;
      reasoning = 'First name has common male ending';
    }
  }
  
  return {
    predicted_gender: predictedGender,
    confidence: confidence,
    reasoning: reasoning,
    method: 'local_pattern_matching'
  };
}

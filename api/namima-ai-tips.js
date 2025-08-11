// Namima AI Tips API - /api/namima-ai-tips.js
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
    const { username, level } = req.body;
    
    if (!username || level === undefined) {
      return res.status(400).json({ 
        error: 'Missing required parameters: username and level'
      });
    }

    console.log(`Generating Namima AI tip for ${username} at level ${level}`);
    
    // Generate tip using AI or fallback to local tips
    let tip;
    
    if (process.env.OPENAI_API_KEY) {
      tip = await generateAITip(username, level);
    } else {
      tip = generateLocalTip(username, level);
    }
    
    return res.json({
      success: true,
      tip: tip,
      username: username,
      level: level,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Namima AI tip error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Generate AI tip using OpenAI
async function generateAITip(username, level) {
  try {
    const prompt = `You are "Namima AI" for the 13namima leaderboard.

Your job is to create one short, sharp tip or witty remark for a competitive coding leaderboard.

Rules:
- Length: 5 to 15 words.
- Style: playful, clever, or subtly competitive.
- Inspired by short truths, cultural sayings, or game wisdom.
- Can mix coding, competition, and motivation themes.
- No long explanations or lists — only the tip.

Example outputs:
- "Even masters can trip over a simple bug."
- "Code fast, but debug faster."
- "A careless commit can cost the crown."
- "Every bug hides behind a lazy thought."

Now generate a tip for: 
${username} at level ${level}`;

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
            content: 'You are Namima AI, a witty coding mentor. Generate only short, clever tips. No explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 50,
        temperature: 0.9
      })
    });

    if (!aiResponse.ok) {
      console.warn('AI API failed, using local tip');
      return generateLocalTip(username, level);
    }

    const aiData = await aiResponse.json();
    const aiTip = aiData.choices?.[0]?.message?.content?.trim();

    if (!aiTip) {
      return generateLocalTip(username, level);
    }

    // Clean up the tip (remove quotes, ensure proper length)
    let cleanTip = aiTip.replace(/^["']|["']$/g, '').trim();
    
    // If too long, use local tip
    const wordCount = cleanTip.split(' ').length;
    if (wordCount > 15) {
      return generateLocalTip(username, level);
    }

    return cleanTip;

  } catch (error) {
    console.warn('AI tip generation failed:', error);
    return generateLocalTip(username, level);
  }
}

// Generate local tip based on level ranges
function generateLocalTip(username, level) {
  const tips = {
    // Beginner tips (0-5)
    beginner: [
      "Every expert was once a beginner.",
      "Small steps lead to big leaps.",
      "Code breaks, patience builds.",
      "Focus on progress, not perfection.",
      "Your first bug won't be your last.",
      "Learning never stops, even at level 42.",
      "Start simple, dream complex."
    ],
    
    // Intermediate tips (6-15)
    intermediate: [
      "Consistency beats intensity every time.",
      "Clean code speaks louder than clever tricks.",
      "Debug with patience, code with passion.",
      "Your biggest competitor is yesterday's you.",
      "Refactor today, thank yourself tomorrow.",
      "Good enough is the enemy of great.",
      "Master the basics before chasing magic."
    ],
    
    // Advanced tips (16-25)
    advanced: [
      "Optimization without measurement is just guessing.",
      "The best code is code you don't write.",
      "Complexity is your enemy, simplicity your friend.",
      "Experience teaches what books cannot.",
      "Every algorithm has its moment to shine.",
      "Code reviews reveal more than code itself.",
      "Senior developers still Google basic syntax."
    ],
    
    // Expert tips (26+)
    expert: [
      "Architecture matters more than algorithms now.",
      "Leading others requires more than coding skills.",
      "Legacy code is tomorrow's technical debt.",
      "Scale teaches lessons textbooks never could.",
      "Mentoring juniors sharpens your own skills.",
      "Design decisions echo through system lifetimes.",
      "The best solutions are often the simplest."
    ],
    
    // Motivational for any level
    motivational: [
      "Even masters can trip over simple bugs.",
      "Code fast, but debug faster.",
      "Every bug hides behind lazy thinking.",
      "Great developers are made, not born.",
      "Your code quality reflects your thinking quality.",
      "Practice makes progress, not perfection.",
      "Today's struggle is tomorrow's strength."
    ]
  };

  let tipCategory;
  
  if (level <= 5) {
    tipCategory = Math.random() < 0.7 ? 'beginner' : 'motivational';
  } else if (level <= 15) {
    tipCategory = Math.random() < 0.7 ? 'intermediate' : 'motivational';
  } else if (level <= 25) {
    tipCategory = Math.random() < 0.7 ? 'advanced' : 'motivational';
  } else {
    tipCategory = Math.random() < 0.7 ? 'expert' : 'motivational';
  }

  const selectedTips = tips[tipCategory];
  const randomTip = selectedTips[Math.floor(Math.random() * selectedTips.length)];
  
  return randomTip;
}

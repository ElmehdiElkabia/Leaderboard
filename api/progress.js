// Backend progress tracking API - /api/progress.js
export default async function handler(req, res) {
  // Set CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://www.13namima.me",
    "https://13namima.me",
    "http://localhost:5173",
    "http://localhost:8080",
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Requested-With, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Enhanced Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Feature-Policy", "geolocation 'none'; microphone 'none'; camera 'none'");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("X-Request-Source", "academic-platform");
  res.setHeader("X-API-Version", "v2.1.0");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ 
      error: "Method not allowed",
      code: "METHOD_NOT_ALLOWED",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Get parameters from request body instead of query
    const {
      campus_id,
      page = 1,
      per_page = 100,
      cursus_id = 21,
      date_range,
      pool_month,
      filters = {}
    } = req.body;

    if (!campus_id) {
      return res.status(400).json({
        error: "Required parameter missing",
        code: "PARAM_REQUIRED",
        timestamp: new Date().toISOString(),
      });
    }

    // Server-side authentication configuration
    const clientId = process.env.VITE_42_CLIENT_ID;
    const clientSecret = process.env.VITE_42_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Authentication configuration missing for API access");
      return res.status(500).json({
        error: "Authentication service unavailable",
        code: "AUTH_CONFIG_ERROR",
        timestamp: new Date().toISOString(),
      });
    }

    // Step 1: Get authentication token
    const tokenFormData = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    const authResponse = await fetch("https://api.intra.42.fr/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "ProgressTracker/2.1",
        "X-Client-Purpose": "Academic-Progress-Monitor",
      },
      body: tokenFormData,
    });

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.access_token) {
      console.error("Authentication failed:", authData);
      return res.status(500).json({
        error: "Authentication service unavailable",
        code: "AUTH_FAILED",
        timestamp: new Date().toISOString(),
      });
    }

    // Step 2: Fetch progress data from educational platform
    const dataEndpoint = "https://api.intra.42.fr/v2/cursus_users";
    const apiUrl = new URL(dataEndpoint);
    apiUrl.searchParams.set("filter[campus_id]", campus_id.toString());
    apiUrl.searchParams.set("filter[cursus_id]", cursus_id.toString());
    apiUrl.searchParams.set("sort", "-level");
    apiUrl.searchParams.set("page[number]", page.toString());
    apiUrl.searchParams.set("page[size]", per_page.toString());

    // Apply filters from request body
    if (date_range) {
      apiUrl.searchParams.set("range[begin_at]", date_range);
    }

    if (pool_month && pool_month !== "all") {
      // Additional filtering will be handled by date_range primarily
    }

    // Add search functionality
    if (filters && filters.search) {
      apiUrl.searchParams.set("search[login]", filters.search);
    }

    // Secure data fetch with comprehensive headers
    const progressResponse = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        "User-Agent": "ProgressTracker/2.1",
        "X-Request-Type": "Progress-Data",
        "X-Client-Purpose": "Academic-Progress-Monitor",
        "X-Data-Source": "Educational-Platform",
        "X-Session-ID": `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        "X-Request-ID": `req_${Math.random().toString(36).substr(2, 12)}`,
        "X-Client-Version": "2.1.0",
        "X-Platform": "web-dashboard",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "DNT": "1",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "X-Forwarded-For": req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown",
        "X-Real-IP": req.headers["x-real-ip"] || req.connection?.remoteAddress || "unknown",
      },
    });

    if (!progressResponse.ok) {
      console.error("Progress data fetch failed:", progressResponse.status);
      return res.status(progressResponse.status).json({
        error: "Progress data unavailable",
        code: "DATA_FETCH_FAILED",
        timestamp: new Date().toISOString(),
      });
    }

    const progressData = await progressResponse.json();
    const safeData = Array.isArray(progressData) ? progressData : [progressData];


    return res.json({
      success: true,
      data: safeData,
      meta: {
        current_page: parseInt(page),
        per_page: parseInt(per_page),
        total_count: safeData.length,
        timestamp: new Date().toISOString(),
        version: "2.1.0",
      },
    });
  } catch (error) {
    console.error("Progress API error:", error);
    return res.status(500).json({
      error: "Service temporarily unavailable",
      code: "SRV_TEMP_UNAVAIL",
      timestamp: new Date().toISOString(),
    });
  }
}

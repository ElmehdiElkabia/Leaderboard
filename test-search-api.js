// Simple test to verify the search API functionality
// This tests the GET /v2/users?filter[login]=john_doe endpoint

const testApiEndpoint = async () => {
  try {
    // Test the API endpoint with a sample search query
    const response = await fetch('/api/leaderboard-data?campus_id=21&search_login=john_doe&cursus_id=21&page=1&per_page=10');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Search API test successful');
      console.log('📊 Results found:', data.length);
      
      if (data.length > 0) {
        console.log('👤 Sample user:', {
          login: data[0].user.login,
          level: data[0].level,
          campus: data[0].user.campus
        });
      }
    } else {
      console.log('❌ API test failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('🔥 API test error:', error.message);
  }
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testApiEndpoint;
} else {
  // Browser environment
  window.testSearchApi = testApiEndpoint;
}

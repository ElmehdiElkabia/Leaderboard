// Clean API library - only backend calls, no 42 API exposure
import { auth } from './auth-clean.js';

// Fetch leaderboard data from our backend (no direct 42 API calls)
export async function fetchLeaderboardData(campusId, page = 1, perPage = 100) {
  try {
    const params = new URLSearchParams({
      campus_id: campusId,
      page: page.toString(),
      per_page: perPage.toString()
    });
    
    const response = await fetch(`/api/leaderboard-data?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    throw error;
  }
}

// Fetch campus data from our backend
export async function fetchCampusData() {
  try {
    const response = await fetch('/api/campus-data', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch campus data: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Campus fetch error:', error);
    throw error;
  }
}

// Get current user data (from session, not API)
export function getCurrentUser() {
  return auth.getUserData();
}

// Check authentication status
export function isUserAuthenticated() {
  return auth.isAuthenticated();
}

// Make any authenticated request to our backend
export async function makeSecureRequest(endpoint, options = {}) {
  try {
    return await auth.makeAuthenticatedRequest(endpoint, options);
  } catch (error) {
    console.error('Secure request error:', error);
    throw error;
  }
}

// Default exports for backward compatibility
export const api = {
  fetchLeaderboardData,
  fetchCampusData,
  getCurrentUser,
  isUserAuthenticated,
  makeSecureRequest
};

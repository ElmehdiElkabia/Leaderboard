# Search Functionality Implementation

## Overview
Added a search bar to the leaderboard filters that allows users to search for students by their login name. This feature implements the API endpoint `GET /v2/users?filter[login]=john_doe` as requested.

## Changes Made

### 1. Frontend Components

#### Created Debounce Hook (`src/hooks/use-debounce.js`)
- Added custom hook to debounce search input
- Prevents excessive API calls while user is typing
- 500ms delay for optimal user experience

#### Updated Leaderboard Filters (`src/components/leaderboard-filters.jsx`)
- Added Search icon import from lucide-react
- Added Input component import
- Added new search bar with search icon
- Positioned above existing filters for better UX
- Added placeholder text: "Search by login (e.g., john_doe)..."

#### Updated Main Leaderboard Component (`src/components/leaderboard.jsx`)
- Added useDebounce hook import
- Added searchQuery state management
- Added debounced search functionality
- Added auto-search effect that triggers API calls when search query changes
- Updated filter save/load to include search query
- Passed search props to LeaderboardFilters component

#### Updated Real Leaderboard Component (`src/components/real-leaderboard.jsx`)
- Added searchQuery state
- Added search_login parameter to API requests
- Added handleSearchQueryChange function
- Updated useEffect dependencies to include searchQuery
- Passed search props to Leaderboard component

### 2. Backend API Updates

#### Updated Progress API (`api/progress.js`)
- Added search_login parameter extraction from request body
- Added filter[login] parameter to 42 API calls
- Properly sanitized search input (trim whitespace)

#### Updated Leaderboard Data API (`api/leaderboard-data.js`)
- Added search_login parameter extraction from query
- Added filter[login] parameter to 42 API calls
- Properly sanitized search input (trim whitespace)

#### Updated Cached API (`src/lib/cached-api.js`)
- Added search_login parameter support
- Updated fetchLeaderboardDataDirect to handle search parameter

## Features

### 1. Real-time Search
- Users can type in the search box to find specific students
- Debounced to prevent excessive API calls
- Automatically triggers new data fetch when search query changes

### 2. Search by Login
- Implements the exact API endpoint requested: `filter[login]=john_doe`
- Case-sensitive search as per 42 API specification
- Searches for exact or partial login matches

### 3. User Experience Improvements
- Search input has a search icon for better visual indication
- Placeholder text guides users on expected input format
- Search state is preserved in browser cookies
- Integrates seamlessly with existing filters

### 4. Performance Optimizations
- Debounced search input (500ms delay)
- Cached results to avoid redundant API calls
- Efficient state management

## Usage

1. **Navigate to the leaderboard page**
2. **Use the search bar** at the top of the filters section
3. **Type a student's login** (e.g., "john_doe", "alice_smith")
4. **Results update automatically** after 500ms delay
5. **Clear the search** to see all students again

## API Endpoint Testing

The implementation can be tested using the provided test file:
```javascript
// Load the test file in browser console
window.testSearchApi();
```

## Technical Details

### Search API Flow
1. User types in search box
2. useDebounce delays the search by 500ms
3. Frontend sends request with search_login parameter
4. Backend adds filter[login] to 42 API call
5. Results are returned and displayed
6. Results are cached for performance

### Supported Search Patterns
- Exact login match: "john_doe"
- Partial login match: "john" (matches "john_doe", "johnny", etc.)
- Case-sensitive search as per 42 API requirements

### Error Handling
- Empty search results show appropriate message
- Invalid searches gracefully fall back to showing all users
- API errors are handled and displayed to user

## Future Enhancements

1. **Search by Name**: Extend to search by full name in addition to login
2. **Advanced Search**: Add filters for level range, correction points, etc.
3. **Search History**: Remember recent searches
4. **Autocomplete**: Show suggestions while typing
5. **Search Highlighting**: Highlight matching text in results

## Files Modified

### Frontend
- `src/hooks/use-debounce.js` (new)
- `src/components/leaderboard-filters.jsx`
- `src/components/leaderboard.jsx`
- `src/components/real-leaderboard.jsx`
- `src/lib/cached-api.js`

### Backend
- `api/progress.js`
- `api/leaderboard-data.js`

### Testing
- `test-search-api.js` (new)

The search functionality is now fully integrated and ready for use!

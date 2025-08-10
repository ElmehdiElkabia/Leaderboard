import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Users, GraduationCap, Plus } from "lucide-react";
import { Leaderboard } from "@/components/leaderboard";
import { mockStudents } from "@/lib/mock-data";
import { useDebounce } from "@/hooks/use-debounce";

const MOROCCAN_CAMPUSES = [
  { id: 21, name: "Benguerir", slug: "benguerir" },
  { id: 75, name: "Rabat", slug: "rabat" },
  { id: 55, name: "Tétouan", slug: "tetouan" },
  { id: 16, name: "Khouribga", slug: "khouribga" },
];



const USERS_PER_PAGE = 100;

// Cookie helpers
const setCookie = (name, value, days = 30) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

const getCookie = (name) => {
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length)
    }
  }
  return null
}

export function RealLeaderboard() {
  // Load saved campus from cookies or default to Benguerir
  const savedCampusId = getCookie('selectedCampusId')
  const defaultCampus = savedCampusId 
    ? MOROCCAN_CAMPUSES.find(c => c.id.toString() === savedCampusId) || MOROCCAN_CAMPUSES[0]
    : MOROCCAN_CAMPUSES[0] // Benguerir by default

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(defaultCampus);
  const [nextPage, setNextPage] = useState(2); // Start from page 2 for next load
  const [hasMore, setHasMore] = useState(true);
  const [yearFilter, setYearFilter] = useState("2024-01-01,2025-01-01"); // Default to 2024
  const [studentType, setStudentType] = useState("21"); // Default to 42cursus
  const [poolMonth, setPoolMonth] = useState("all"); // Default to all months
  const [searchQuery, setSearchQuery] = useState(""); // Search functionality
  const [isSearching, setIsSearching] = useState(false); // Loading state for search
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageLevel: 0,
    activeStudents: 0
  });
  const leaderboardRef = useRef(null);

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return; // Still debouncing
    
    // Only trigger search if we have a search query or if search was cleared
    // This prevents initial load conflicts
    if (searchQuery.trim() !== "" || (searchQuery === "" && debouncedSearchQuery === "")) {
      setIsSearching(true);
      fetchLeaderboardData(selectedCampus.id, 1, false, null, debouncedSearchQuery.trim() || null)
        .finally(() => setIsSearching(false));
    }
  }, [debouncedSearchQuery]);

  const fetchLeaderboardData = async (campusId, page = 1, append = false, dateRange = null, searchTerm = null) => {
    if (page === 1) {
      setLoading(true);
      setStudents([]);
      setNextPage(2);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    
    try {
      // Use the provided date range or the current yearFilter
      const selectedDateRange = dateRange || yearFilter;
      
      // Determine date range based on student type
      let dateRangeToUse;
      if (studentType === "9") {
        // For Piscine, use month-based ranges if pool month is selected
        if (poolMonth !== "all") {
          // Extract year from selectedDateRange (e.g., "2024-01-01,2025-01-01" -> 2024)
          const yearFromRange = selectedDateRange.split('-')[0];
          const monthNum = parseInt(poolMonth);
          const startDate = `${yearFromRange}-${monthNum.toString().padStart(2, '0')}-01`;
          const endDate = `${yearFromRange}-${(monthNum + 1).toString().padStart(2, '0')}-01`;
          dateRangeToUse = `${startDate},${endDate}`;
        } else {
          // Use year range for Piscine when no specific month
          dateRangeToUse = selectedDateRange;
        }
      } else {
        // For 42cursus, always use year range
        dateRangeToUse = selectedDateRange;
      }

      // Use our secure progress API with POST method
      const requestPayload = {
        campus_id: parseInt(campusId),
        page: parseInt(page),
        per_page: USERS_PER_PAGE,
        cursus_id: parseInt(studentType),
        date_range: dateRangeToUse,
        pool_month: poolMonth !== "all" ? poolMonth : undefined,
        filters: {
          active_only: true,
          sort_by: "level",
          sort_order: "desc",
          search: searchTerm || undefined
        }
      };

      // Remove undefined values
      Object.keys(requestPayload).forEach(key => {
        if (requestPayload[key] === undefined) {
          delete requestPayload[key];
        }
      });
      
      const apiUrl = `/api/progress`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Client-Purpose': 'Academic-Progress-Monitor',
          'X-Platform': 'web-dashboard',
        },
        body: JSON.stringify(requestPayload)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid response format');
      }
      
      const leaderboardData = apiResponse.data;

      
      
      // Check if there are more pages
      setHasMore(leaderboardData.length === USERS_PER_PAGE);
      
      // Extract and flatten the user data from the API response
      const filteredUsers = leaderboardData.map((item) => ({
        id: item.user.id,
        fullname: item.user.usual_full_name || item.user.displayname,
        email: item.user.email,
        login: item.user.login,
        kind: item.user.kind,
        image: item.user.image?.versions?.medium,
        staff: item.user["staff?"] || false,
        correction_point: item.user.correction_point,
        pool_month: item.user.pool_month,
        pool_year: item.user.pool_year,
        location: item.user.location,
        wallet: item.user.wallet,
        level: item.level,
        grade: item.grade,
        skills: item.skills || [],
        blackholed_at: item.blackholed_at,
        begin_at: item.begin_at,
        end_at: item.end_at,
        cursus_id: item.cursus_id,
        active: item.user["active?"],
      }));

      
      // Transform the backend data to match our frontend format
      const transformedStudents = filteredUsers.map((userData, index) => {
        return {
          id: userData.id,
          rank: userData.rank || (((page - 1) * USERS_PER_PAGE) + index + 1),
          name: userData.login,
          login: userData.login,
          level: userData.level?.toFixed ? userData.level.toFixed(2) : (userData.level || "0.00"),
          grade: userData.grade || "Student",
          correctionPoints: userData.correction_point || 0,
          wallet: userData.wallet || 0,
          location: userData.location || "Not specified",
          avatar: userData.image,
          campus: userData.campus || selectedCampus.name,
          poolMonth: userData.pool_month || null,
          poolYear: userData.pool_year || null,
          isActive: userData.active !== false,
          skills: userData.skills || [],
          blackholedAt: userData.blackholed_at || null,
          cursusId: parseInt(studentType),
          beginAt: userData.begin_at || null,
          endAt: userData.end_at || null,
        };
      });

      // Update students list
      if (append) {
        setStudents(prevStudents => [...prevStudents, ...transformedStudents]);
      } else {
        setStudents(transformedStudents);
      }

      // Update stats with current data
      setStats(prevStats => {
        const allCurrentStudents = append ? [...students, ...transformedStudents] : transformedStudents;
        const totalStudents = allCurrentStudents.length;
        const averageLevel = totalStudents > 0 
          ? allCurrentStudents.reduce((sum, student) => sum + parseFloat(student.level), 0) / totalStudents
          : 0;
        const activeStudents = allCurrentStudents.filter(student => student.isActive).length;

        return {
          totalStudents,
          averageLevel: averageLevel.toFixed(2),
          activeStudents
        };
      });

    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreStudents = () => {
    fetchLeaderboardData(selectedCampus.id, nextPage, true);
    setNextPage(nextPage + 1);
  };

  useEffect(() => {
    if (auth.isAuthenticated() && selectedCampus) {
      fetchLeaderboardData(selectedCampus.id);
    }
  }, [selectedCampus, yearFilter, studentType, poolMonth]); // Added all filter dependencies

  const handleCampusChange = (campusId) => {
    const campus = MOROCCAN_CAMPUSES.find(c => c.id === parseInt(campusId));
    setSelectedCampus(campus);
    setNextPage(2);
    setHasMore(true);
    setCookie('selectedCampusId', campusId); // Save to cookies
  };

  const handleYearFilterChange = (dateRange) => {
    setYearFilter(dateRange);
    setNextPage(2);
    setHasMore(true);
  };

  const handleStudentTypeChange = (type) => {
    setStudentType(type);
    setNextPage(2);
    setHasMore(true);
  };

  const handlePoolMonthChange = (month) => {
    setPoolMonth(month);
    setNextPage(2);
    setHasMore(true);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    // The debounced effect will handle the API call
  };

  if (loading) {
    // Show mock data with loading skeleton while fetching real data
    const loadingStudents = mockStudents.slice(0, 10).map((student, index) => ({
      id: student.id,
      rank: index + 1,
      name: student.login,
      login: student.login,
      level: student.level.toFixed(2),
      grade: "Loading...",
      correctionPoints: student.correctionPoints,
      wallet: student.wallet,
      location: "Loading...",
      avatar: student.avatar,
      campus: selectedCampus.name,
      poolMonth: null,
      poolYear: null,
      isActive: true,
      skills: [],
      blackholedAt: null,
      cursusId: 21,
      beginAt: null,
      endAt: null,
    }));

    return (
      <div className="space-y-6">
        {/* Show mock leaderboard with loading overlay */}
        <div className="relative">
          <div className="opacity-50 pointer-events-none">
            <Leaderboard 
              students={loadingStudents} 
              selectedCampus={selectedCampus}
              onCampusChange={() => {}}
              yearFilter={yearFilter}
              onYearFilterChange={() => {}}
              studentType={studentType}
              onStudentTypeChange={() => {}}
              poolMonth={poolMonth}
              onPoolMonthChange={() => {}}
              searchQuery={searchQuery}
              onSearchChange={() => {}}
              isSearching={isSearching}
            />
          </div>
          <div className="fixed inset-0 bg-background/20 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="border-border bg-card/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <div>
                    <p className="font-medium">Loading real leaderboard data...</p>
                    <p className="text-sm text-muted-foreground">This may take a few moments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Data</CardTitle>
          <CardDescription>
            Failed to load leaderboard data: {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button 
            onClick={() => fetchLeaderboardData(selectedCampus.id, 1, false)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* Leaderboard */}
      <div ref={leaderboardRef}>
        <Leaderboard 
          students={students} 
          selectedCampus={selectedCampus}
          onCampusChange={handleCampusChange}
          yearFilter={yearFilter}
          onYearFilterChange={handleYearFilterChange}
          studentType={studentType}
          onStudentTypeChange={handleStudentTypeChange}
          poolMonth={poolMonth}
          onPoolMonthChange={handlePoolMonthChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isSearching={isSearching}
        />
      </div>

      {/* No Data State - when API returns empty but no error */}
      {!loading && !error && students.length === 0 && (
        <div className="flex justify-center">
          <Card className="w-full max-w-lg border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No student data is available for <span className="font-medium">{selectedCampus?.name}</span> with the current filter settings.
                </p>
              </div>
              
              <div className="space-y-3 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>Try selecting a different campus</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>Adjust the year filter</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>Change student type (42cursus/Piscine)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && students.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={loadMoreStudents}
            disabled={loadingMore}
            className="flex items-center gap-2"
          >
            {loadingMore ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {loadingMore ? "Loading..." : "Load More Students"}
          </Button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Users, GraduationCap, Plus } from "lucide-react";
import { Leaderboard } from "@/components/leaderboard";
import { cachedApi, cacheUtils } from "@/lib/cached-api";

const MOROCCAN_CAMPUSES = [
  { id: 21, name: "Benguerir", slug: "benguerir" },
  { id: 75, name: "Rabat", slug: "rabat" },
  { id: 55, name: "Tétouan", slug: "tetouan" },
];

const USERS_PER_PAGE = 25;

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
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageLevel: 0,
    activeStudents: 0
  });
  const leaderboardRef = useRef(null);

  const fetchLeaderboardData = async (campusId, page = 1, append = false) => {
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
      // Use the cached API for leaderboard data
      const requestParams = {
        campus_id: parseInt(campusId),
        page: parseInt(page),
        per_page: USERS_PER_PAGE,
        cursus_id: 21, // 42cursus
        filters: {
          active_only: true,
          sort_by: "level",
          sort_order: "desc"
        }
      };
      
      // Use cached API for leaderboard data
      const cursusUsers = await cachedApi.getLeaderboardData(requestParams);
      
      // Check if there are more pages
      setHasMore(cursusUsers.length === USERS_PER_PAGE);
      
      // Transform the backend data to match our frontend format
      const transformedStudents = cursusUsers.map((userData, index) => ({
        id: userData.user?.id || userData.id,
        rank: userData.rank || (((page - 1) * USERS_PER_PAGE) + index + 1),
        name: userData.login, // Backend provides safe data
        login: userData.login,
        level: userData.level?.toFixed ? userData.level.toFixed(2) : (userData.level || "0.00"),
        grade: userData.grade || "Student",
        correctionPoints: 0, // Not provided by backend for privacy
        wallet: 0, // Not provided by backend for privacy
        location: "Hidden", // Backend doesn't expose location for privacy
        avatar: userData.image,
        campus: userData.campus || selectedCampus.name,
        poolMonth: null, // Not provided by backend for privacy
        poolYear: null, // Not provided by backend for privacy
        isActive: true, // Default to active
        skills: [], // Not provided by backend for privacy
        blackholedAt: null, // Not provided by backend for privacy
        cursusId: 21,
        beginAt: null, // Not provided by backend for privacy
        endAt: null, // Not provided by backend for privacy
      }));

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
  }, [selectedCampus]);

  // Preload common data on component mount
  useEffect(() => {
    if (auth.isAuthenticated()) {
      // Preload common campus combinations in the background
      cacheUtils.preload().catch(error => {
        console.warn('Cache preload failed:', error);
      });
    }
  }, []);

  const handleCampusChange = (campusId) => {
    const campus = MOROCCAN_CAMPUSES.find(c => c.id === parseInt(campusId));
    setSelectedCampus(campus);
    setNextPage(2);
    setHasMore(true);
    setCookie('selectedCampusId', campusId); // Save to cookies
    
    // Let cache handle the data loading - no need to invalidate
    // Cache will serve existing data instantly or fetch if needed
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Leaderboard Data...
            </CardTitle>
            <CardDescription>
              Fetching data from campus: {selectedCampus.name}
            </CardDescription>
          </CardHeader>
        </Card>
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageLevel}</p>
                <p className="text-xs text-muted-foreground">Average Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeStudents}</p>
                <p className="text-xs text-muted-foreground">Active Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campus Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Moroccan Campuses Leaderboard
          </CardTitle>
          <CardDescription>
            Select a campus to view the rankings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {MOROCCAN_CAMPUSES.map((campus) => (
              <Button
                key={campus.id}
                variant={selectedCampus.id === campus.id ? "default" : "outline"}
                onClick={() => handleCampusChange(campus.id.toString())}
                className="flex items-center gap-2"
              >
                <Badge variant="secondary" className="text-xs">
                  {campus.id}
                </Badge>
                {campus.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <div ref={leaderboardRef}>
        <Leaderboard 
          students={students} 
          selectedCampus={selectedCampus}
          onCampusChange={handleCampusChange}
        />
      </div>

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

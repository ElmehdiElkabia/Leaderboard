import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Users, GraduationCap, Plus } from "lucide-react";
import { Leaderboard } from "@/components/leaderboard";

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
      // Fetch cursus users for the selected campus with pagination
      const response = await auth.apiRequest(
        `https://api.intra.42.fr/v2/cursus_users?filter[campus_id]=${campusId}&sort=-level&per_page=${USERS_PER_PAGE}&page=${page}&filter[cursus_id]=21`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const cursusUsers = await response.json();
      
      // Check if there are more pages
      setHasMore(cursusUsers.length === USERS_PER_PAGE);
      
      // Transform the data to match our leaderboard format
      const transformedStudents = cursusUsers.map((cursusUser, index) => ({
        id: cursusUser.user.id,
        rank: ((page - 1) * USERS_PER_PAGE) + index + 1,
        name: cursusUser.user.displayname || `${cursusUser.user.first_name} ${cursusUser.user.last_name}`,
        login: cursusUser.user.login,
        level: cursusUser.level?.toFixed(2) || "0.00",
        grade: cursusUser.grade || "Novice",
        correctionPoints: cursusUser.user.correction_point || 0,
        wallet: cursusUser.user.wallet || 0,
        location: cursusUser.user.location || "Unavailable",
        avatar: cursusUser.user.image?.versions?.medium || cursusUser.user.image?.link,
        campus: selectedCampus.name,
        poolMonth: cursusUser.user.pool_month,
        poolYear: cursusUser.user.pool_year,
        isActive: cursusUser.user.active,
        skills: cursusUser.skills || [],
        blackholedAt: cursusUser.blackholed_at,
        cursusId: cursusUser.cursus_id,
        beginAt: cursusUser.begin_at,
        endAt: cursusUser.end_at,
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

  const handleCampusChange = (campusId) => {
    const campus = MOROCCAN_CAMPUSES.find(c => c.id === parseInt(campusId));
    setSelectedCampus(campus);
    setNextPage(2);
    setHasMore(true);
    setCookie('selectedCampusId', campusId); // Save to cookies
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stats Cards */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Average Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageLevel}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeStudents}
              <span className="text-sm text-muted-foreground ml-1">
                ({stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Campus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{selectedCampus.name}</div>
            <div className="text-sm text-muted-foreground">📍 Current Campus</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Campus Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-sm">
          📍 {selectedCampus.name} Campus
        </Badge>
        <Badge variant="secondary" className="text-sm">
          {stats.totalStudents} Students
        </Badge>
        {stats.totalStudents > 0 && (
          <Badge variant="default" className="text-sm">
            Top Level: {students[0]?.level || "N/A"}
          </Badge>
        )}
      </div>

      {/* Leaderboard */}
      <div ref={leaderboardRef}>
        <Leaderboard 
          students={students} 
          selectedCampus={selectedCampus}
          onCampusChange={handleCampusChange}
        />
      </div>
      
      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <Button 
            onClick={loadMoreStudents}
            disabled={loadingMore}
            className="px-6 py-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Load More Students ({USERS_PER_PAGE} more)
              </>
            )}
          </Button>
        </div>
      )}
      
      {!hasMore && students.length > 0 && (
        <div className="text-center mt-6">
          <Badge variant="outline" className="text-sm">
            🎉 You've reached the end! All students loaded.
          </Badge>
        </div>
      )}
    </div>
  );
}

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
  const loadMoreButtonRef = useRef(null);

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
      
      // Scroll to show new students after loading more
      if (append && loadMoreButtonRef.current) {
        setTimeout(() => {
          loadMoreButtonRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 100);
      }
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
        <div className="flex justify-center" ref={loadMoreButtonRef}>
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

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { TopThree } from "./top-three";
import LeaderboardFilters from "./filters-simple";
import { LeaderboardTable } from "./leaderboard-table";
import { TableHelpOverlay } from "./table-help-overlay";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Users, Filter } from "lucide-react";

// Cookie helpers
const setCookie = (name, value, days = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${JSON.stringify(
    value
  )};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(c.substring(nameEQ.length, c.length));
      } catch {
        return null;
      }
    }
  }
  return null;
};

export function Leaderboard({ 
  students, 
  selectedCampus, 
  onCampusChange, 
  yearFilter: parentYearFilter, 
  onYearFilterChange: onParentYearFilterChange,
  studentType: parentStudentType,
  onStudentTypeChange: onParentStudentTypeChange,
  poolMonth: parentPoolMonth,
  onPoolMonthChange: onParentPoolMonthChange,
  onSearch // New prop for independent search
}) {
  // Get user data to determine default student type
  const userData = auth.getUserData();
  
  // Determine default student type based on user's cursus
  const getDefaultStudentType = () => {
    if (userData?.cursus_users) {
      // Check if user has Piscine (cursus_id: 9)
      const hasPiscine = userData.cursus_users.some(cursus => cursus.cursus_id === 9);
      if (hasPiscine) return "9"; // Piscine
      
      // Check if user has 42cursus (cursus_id: 21)  
      const hasCursus = userData.cursus_users.some(cursus => cursus.cursus_id === 21);
      if (hasCursus) return "21"; // 42cursus
    }
    return "21"; // Default to 42cursus
  };

  // Load saved filters from cookies or use defaults
  const savedFilters = getCookie("leaderboardFilters") || {
    level: "all",
    campus: "all",
    year: parentYearFilter || "2024-01-01,2025-01-01", // Use parent year filter
    sort: "level",
    studentType: parentStudentType || getDefaultStudentType(),
    poolMonth: parentPoolMonth || "all",
  };

  const [levelFilter, setLevelFilter] = useState(savedFilters.level);
  const [campusFilter, setCampusFilter] = useState(savedFilters.campus);
  const [yearFilter, setYearFilter] = useState(parentYearFilter || savedFilters.year);
  const [sortBy, setSortBy] = useState(savedFilters.sort);
  const [studentType, setStudentType] = useState(parentStudentType || savedFilters.studentType);
  const [poolMonth, setPoolMonth] = useState(parentPoolMonth || savedFilters.poolMonth);
  const [appliedFilters, setAppliedFilters] = useState(savedFilters);
  const [tempCampusFilter, setTempCampusFilter] = useState(null);

  // Independent search state
  const [searchResults, setSearchResults] = useState(students);
  const [isSearching, setIsSearching] = useState(false);

  // Handle independent search
  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults(students);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const filtered = students.filter(student => 
      student.login.toLowerCase().includes(query.toLowerCase()) ||
      student.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  // Update search results when students data changes
  useEffect(() => {
    setSearchResults(students);
  }, [students]);

  // Filter students based on applied filters
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Apply campus filter
    if (appliedFilters.campus !== "all") {
      filtered = filtered.filter(
        (student) => student.campus === appliedFilters.campus
      );
    }

    // Apply year filter - Skip since API already filters by year
    // The real-leaderboard.jsx handles year filtering via API date ranges

    // Apply sorting
    filtered.sort((a, b) => {
      switch (appliedFilters.sort) {
        case "level":
          return b.level - a.level || b.correctionPoints - a.correctionPoints;
        case "correctionPoints":
          return b.correctionPoints - a.correctionPoints || b.level - a.level;
        case "wallet":
          return b.wallet - a.wallet;
        case "login":
          return a.login.localeCompare(b.login);
        default:
          return b.level - a.level || b.correctionPoints - a.correctionPoints;
      }
    });

    return filtered;
  }, [students, appliedFilters]);

  // Use search results when searching, otherwise use normal filtered students
  const displayStudents = isSearching ? searchResults : filteredStudents;

  const handleApplyFilters = () => {
    const newFilters = {
      level: levelFilter,
      campus: campusFilter,
      year: yearFilter,
      sort: sortBy,
      studentType: studentType,
      poolMonth: poolMonth,
    };
    setAppliedFilters(newFilters);
    setCookie("leaderboardFilters", newFilters);

    // Apply year change to trigger new API call
    if (onParentYearFilterChange && yearFilter !== parentYearFilter) {
      onParentYearFilterChange(yearFilter);
    }

    // Apply student type change to trigger new API call
    if (onParentStudentTypeChange && studentType !== parentStudentType) {
      onParentStudentTypeChange(studentType);
    }

    // Apply pool month change to trigger new API call
    if (onParentPoolMonthChange && poolMonth !== parentPoolMonth) {
      onParentPoolMonthChange(poolMonth);
    }

    // Apply campus change if there's a temporary selection
    if (
      tempCampusFilter &&
      tempCampusFilter !== selectedCampus?.id.toString()
    ) {
      onCampusChange(tempCampusFilter);
      setTempCampusFilter(null);
    }
  };

  // Apply filters on component mount
  useEffect(() => {
    if (
      savedFilters.level !== "all" ||
      savedFilters.year !== "all" ||
      savedFilters.sort !== "level"
    ) {
      setAppliedFilters(savedFilters);
    }
  }, []);

  // Sync yearFilter with parent
  useEffect(() => {
    if (parentYearFilter && parentYearFilter !== yearFilter) {
      setYearFilter(parentYearFilter);
    }
  }, [parentYearFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Three Section */}
      <TopThree students={students} />

      {/* Main Leaderboard Section */}
      <div className="container mx-auto px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Section Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Complete Rankings</h2>
            <p className="text-muted-foreground">
              Full leaderboard for all 1337 Moroccan campuses
            </p>
          </div>

          {/* Filters */}
          <LeaderboardFilters
            levelFilter={levelFilter}
            onLevelFilterChange={setLevelFilter}
            campusFilter={campusFilter}
            onCampusFilterChange={setCampusFilter}
            yearFilter={yearFilter}
            onYearFilterChange={setYearFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            studentType={studentType}
            onStudentTypeChange={setStudentType}
            poolMonth={poolMonth}
            onPoolMonthChange={setPoolMonth}
            onSearch={handleSearch}
            totalStudents={students.length}
            filteredStudents={displayStudents.length}
            selectedCampus={selectedCampus}
            onApplyFilters={handleApplyFilters}
            tempCampusFilter={tempCampusFilter}
            onTempCampusFilterChange={setTempCampusFilter}
          />

          {/* Table */}
          {displayStudents.length > 0 ? (
            <LeaderboardTable 
              students={displayStudents} 
              startIndex={0} 
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center"
            >
              <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      No students match your current filter criteria for {selectedCampus?.name || 'this campus'}.
                    </p>
                  </div>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Filter className="h-4 w-4" />
                      <span>Try adjusting your filters</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" />
                      <span>Select a different campus or year</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Check student type settings</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Help Overlay */}
      <TableHelpOverlay />
    </div>
  );
}

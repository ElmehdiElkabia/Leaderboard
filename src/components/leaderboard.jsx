import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { TopThree } from "./top-three"
import { LeaderboardFilters } from "./leaderboard-filters"
import { LeaderboardTable } from "./leaderboard-table"
import { Pagination } from "./pagination"

const STUDENTS_PER_PAGE = 25

export function Leaderboard({ students }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [campusFilter, setCampusFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [sortBy, setSortBy] = useState("level")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter students based on all filters
  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student =>
      student.login.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Apply campus filter
    if (campusFilter !== "all") {
      filtered = filtered.filter(student => student.campus === campusFilter)
    }

    // Apply level filter
    switch (levelFilter) {
      case "21+":
        filtered = filtered.filter(student => student.level >= 21)
        break
      case "15+":
        filtered = filtered.filter(student => student.level >= 15)
        break
      case "10+":
        filtered = filtered.filter(student => student.level >= 10)
        break
      case "5+":
        filtered = filtered.filter(student => student.level >= 5)
        break
      case "0-5":
        filtered = filtered.filter(student => student.level < 5)
        break
      default:
        // "all" - no additional filtering
        break
    }

    // Apply year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter(student => student.entryYear.toString() === yearFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "level":
          return b.level - a.level || b.correctionPoints - a.correctionPoints
        case "correctionPoints":
          return b.correctionPoints - a.correctionPoints || b.level - a.level
        case "wallet":
          return b.wallet - a.wallet
        case "login":
          return a.login.localeCompare(b.login)
        default:
          return b.level - a.level || b.correctionPoints - a.correctionPoints
      }
    })

    return filtered
  }, [students, searchTerm, levelFilter, campusFilter, yearFilter, sortBy])

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE)
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + STUDENTS_PER_PAGE)

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, levelFilter, campusFilter, yearFilter, sortBy])

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
            <p className="text-muted-foreground">Full leaderboard for all 1337 Moroccan campuses</p>
          </div>

          {/* Filters */}
          <LeaderboardFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            levelFilter={levelFilter}
            onLevelFilterChange={setLevelFilter}
            campusFilter={campusFilter}
            onCampusFilterChange={setCampusFilter}
            yearFilter={yearFilter}
            onYearFilterChange={setYearFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalStudents={students.length}
            filteredStudents={filteredStudents.length}
          />

          {/* Table */}
          {paginatedStudents.length > 0 ? (
            <>
              <LeaderboardTable 
                students={paginatedStudents} 
                startIndex={startIndex}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center pt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              <p className="text-lg">No students found matching your criteria.</p>
              <p className="text-sm mt-2">Try adjusting your search or filter settings.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

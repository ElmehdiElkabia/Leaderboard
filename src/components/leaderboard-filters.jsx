import { Filter, ArrowUpDown, Search, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

const MOROCCAN_CAMPUSES = [
  { id: 21, name: "Benguerir" },
  { id: 75, name: "Rabat" },
  { id: 55, name: "Tétouan" },
  { id: 16, name: "Khouribga" },

];

const POOL_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

const STUDENT_TYPES = [
  { id: 21, name: "42cursus" },
  { id: 9, name: "Piscine" },
];

const POOL_MONTHS = [
  { id: 5, name: "May", value: "5" },
  { id: 6, name: "June", value: "6" },
  { id: 7, name: "July", value: "7" },
  { id: 8, name: "August", value: "8" },
  { id: 9, name: "September", value: "9" },
];

const BEGIN_AT = [
  {id: 2019, name: "2019", value: "2019-01-01,2020-01-01"},
  {id: 2020, name: "2020", value: "2020-01-01,2021-01-01"},
  {id: 2021, name: "2021", value: "2021-01-01,2022-01-01"},
  {id: 2022, name: "2022", value: "2022-01-01,2023-01-01"},
  {id: 2023, name: "2023", value: "2023-01-01,2024-01-01"},
  {id: 2024, name: "2024", value: "2024-01-01,2025-01-01"},
  {id: 2025, name: "2025", value: "2025-01-01,2026-01-01"},
]

export function LeaderboardFilters({
  levelFilter,
  onLevelFilterChange,
  campusFilter,
  onCampusFilterChange,
  yearFilter,
  onYearFilterChange,
  sortBy,
  onSortChange,
  totalStudents,
  filteredStudents,
  selectedCampus,
  onApplyFilters,
  tempCampusFilter,
  onTempCampusFilterChange,
  studentType,
  onStudentTypeChange,
  poolMonth,
  onPoolMonthChange,
  searchQuery,
  onSearchChange,
  searchInputRef,
  isSearching
}) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            )}
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search students by name, login, or email... (Ctrl+K)"
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10 h-11 border-border bg-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Student Type Selector */}
              <Select value={studentType} onValueChange={onStudentTypeChange}>
                <SelectTrigger className="w-full sm:w-[140px] border-border bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {STUDENT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Pool Month Selector - Show only for Piscine */}
              {studentType === "9" && (
                <Select value={poolMonth} onValueChange={onPoolMonthChange}>
                  <SelectTrigger className="w-full sm:w-[140px] border-border bg-background">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover">
                    <SelectItem value="all">All Months</SelectItem>
                    {POOL_MONTHS.map((month) => (
                      <SelectItem key={month.id} value={month.value}>
                        {month.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Campus Selector */}
              <Select value={tempCampusFilter || selectedCampus?.id.toString()} onValueChange={onTempCampusFilterChange}>
                <SelectTrigger className="w-full sm:w-[160px] border-border bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Campus" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {MOROCCAN_CAMPUSES.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id.toString()}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

      

              <Select value={yearFilter} onValueChange={onYearFilterChange}>
                <SelectTrigger className="w-full sm:w-[120px] border-border bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="all">All Years</SelectItem>
                  {BEGIN_AT.map((item) => (
                    <SelectItem key={item.id} value={item.value}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-full sm:w-[160px] border-border bg-background">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="level">Level</SelectItem>
                  <SelectItem value="correctionPoints">Correction Points</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <Button 
                onClick={onApplyFilters}
                className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
            <span>
              Showing {filteredStudents} of {totalStudents} students
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
            {searchQuery && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                🔍 Search active
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

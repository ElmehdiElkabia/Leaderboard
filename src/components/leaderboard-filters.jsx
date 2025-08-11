import { Filter, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
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

const GENDER_FILTERS = [
  { id: "all", name: "All Genders", value: "all" },
  { id: "male", name: "Male", value: "male" },
  { id: "female", name: "Female", value: "female" },
];

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
  genderFilter,
  onGenderFilterChange,
  aiGenderStats
}) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
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

      

              {/* Gender Selector */}
              <Select value={genderFilter} onValueChange={onGenderFilterChange}>
                <SelectTrigger className="w-full sm:w-[140px] border-border bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {GENDER_FILTERS.map((gender) => (
                    <SelectItem key={gender.id} value={gender.value}>
                      {gender.name}
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

          <div className="text-sm text-muted-foreground">
            Showing {filteredStudents} of {totalStudents} students
            {aiGenderStats && (
              <span className="ml-4 text-xs bg-blue-50 px-2 py-1 rounded">
                AI Gender: {aiGenderStats.male}M / {aiGenderStats.female}F / {aiGenderStats.unknown}? 
                ({aiGenderStats.total} analyzed)
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

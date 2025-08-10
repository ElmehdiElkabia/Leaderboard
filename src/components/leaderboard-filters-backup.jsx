import { Filter, ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { MOROCCAN_CAMPUSES } from "@/lib/utils"

const MOROCCAN_CAMPUSES_LOCAL = [
  { id: 1, name: "Khouribga", city: "khouribga" },
  { id: 2, name: "Casablanca", city: "casablanca" },
  { id: 3, name: "Rabat", city: "rabat" },
  { id: 4, name: "Tanger", city: "tanger" },
  { id: 5, name: "Oujda", city: "oujda" },
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

const GENDER_OPTIONS = [
  { id: "all", name: "All Genders" },
  { id: "male", name: "Male" },
  { id: "female", name: "Female" },
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
  genderFilter,
  onGenderFilterChange,
}) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Campus Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Campus</label>
            <Select
              value={campusFilter || "all"}
              onValueChange={onCampusFilterChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campuses</SelectItem>
                {MOROCCAN_CAMPUSES_LOCAL.map((campus) => (
                  <SelectItem key={campus.id} value={campus.city}>
                    {campus.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Level</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-32">
                  <Filter className="mr-2 h-4 w-4" />
                  Level {levelFilter || "All"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onLevelFilterChange(null)}>
                  All Levels
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {[...Array(21)].map((_, i) => (
                  <DropdownMenuItem
                    key={i}
                    onClick={() => onLevelFilterChange(i)}
                  >
                    Level {i}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Student Type Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Type</label>
            <Select
              value={studentType?.toString() || "all"}
              onValueChange={(value) => onStudentTypeChange(value === "all" ? null : parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {STUDENT_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pool Month Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Pool Month</label>
            <Select
              value={poolMonth?.toString() || "all"}
              onValueChange={(value) => onPoolMonthChange(value === "all" ? null : parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {POOL_MONTHS.map((month) => (
                  <SelectItem key={month.id} value={month.id.toString()}>
                    {month.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Gender</label>
            <Select
              value={genderFilter || "all"}
              onValueChange={onGenderFilterChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Sort By</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-32">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  {sortBy === "level" ? "Level" : 
                   sortBy === "correction_point" ? "Points" : 
                   sortBy === "wallet" ? "Wallet" : "Level"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onSortChange("level")}>
                  By Level
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange("correction_point")}>
                  By Correction Points
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange("wallet")}>
                  By Wallet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Results Counter */}
          <div className="ml-auto">
            <Badge variant="secondary">
              {filteredStudents?.length || 0} of {totalStudents || 0} students
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

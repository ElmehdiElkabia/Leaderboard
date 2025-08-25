import React, { useState, useCallback } from "react"
import { Filter, ArrowUpDown, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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
  levelFilter = "all",
  onLevelFilterChange = () => {},
  campusFilter = "all",
  onCampusFilterChange = () => {},
  yearFilter = "2024-01-01,2025-01-01",
  onYearFilterChange = () => {},
  sortBy = "level",
  onSortChange = () => {},
  totalStudents = 0,
  filteredStudents = 0,
  selectedCampus = null,
  onApplyFilters = () => {},
  tempCampusFilter = null,
  onTempCampusFilterChange = () => {},
  studentType = "21",
  onStudentTypeChange = () => {},
  poolMonth = "all",
  onPoolMonthChange = () => {},
  onSearch = () => {} // New prop for independent search
}) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const handleSearchClick = React.useCallback(() => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Clear search when opening
      setSearchValue("");
      onSearch("");
    } else {
      // Clear search when closing
      setSearchValue("");
      onSearch("");
    }
  }, [isSearchOpen, onSearch]);

  const handleSearchChange = React.useCallback((value) => {
    setSearchValue(value);
    onSearch(value); // Call search immediately as user types
  }, [onSearch]);
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Independent Search Bar */}
          {isSearchOpen && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search by login name (e.g., john_doe)..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSearchClick}
                className="flex-shrink-0 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
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
                <Select value={poolMonth || "all"} onValueChange={onPoolMonthChange}>
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
              <Select value={tempCampusFilter || selectedCampus?.id?.toString() || ""} onValueChange={onTempCampusFilterChange}>
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
            
            <div className="flex items-center gap-2">
              {/* Search Icon Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleSearchClick}
                className={`px-3 py-2 ${isSearchOpen ? 'bg-primary text-primary-foreground' : 'border-border bg-background'}`}
              >
                <Search className="h-4 w-4" />
              </Button>
              
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

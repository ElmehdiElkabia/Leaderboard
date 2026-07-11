import React, { useState } from "react"
import { Filter, ArrowUpDown, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LeaderboardFilters(props) {
  const {
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
    onSearch = () => {}
  } = props;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const campuses = [
    { id: 21, name: "Benguerir" },
    { id: 75, name: "Rabat" },
    { id: 55, name: "Tétouan" },
    { id: 16, name: "Khouribga" },
  ];

  const studentTypes = [
    { id: 21, name: "42cursus" },
    { id: 9, name: "Piscine" },
  ];

  const poolMonths = [
    { id: 5, name: "May", value: "5" },
    { id: 6, name: "June", value: "6" },
    { id: 7, name: "July", value: "7" },
    { id: 8, name: "August", value: "8" },
    { id: 9, name: "September", value: "9" },
  ];

  const beginAt = [
    {id: 2019, name: "2019", value: "2019-01-01,2020-01-01"},
    {id: 2020, name: "2020", value: "2020-01-01,2021-01-01"},
    {id: 2021, name: "2021", value: "2021-01-01,2022-01-01"},
    {id: 2022, name: "2022", value: "2022-01-01,2023-01-01"},
    {id: 2023, name: "2023", value: "2023-01-01,2024-01-01"},
    {id: 2024, name: "2024", value: "2024-01-01,2025-01-01"},
    {id: 2025, name: "2025", value: "2025-01-01,2026-01-01"},
    {id: 2026, name: "2026", value: "2026-01-01,2027-01-01"},
  ];

  const handleSearchToggle = () => {
    const newState = !isSearchOpen;
    setIsSearchOpen(newState);
    if (!newState) {
      setSearchValue("");
      onSearch("");
    }
  };

  const handleSearchInput = (value) => {
    setSearchValue(value);
    onSearch(value);
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          {isSearchOpen && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search by login name..."
                value={searchValue}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSearchToggle}
                className="flex-shrink-0 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Student Type */}
              <Select value={studentType} onValueChange={onStudentTypeChange}>
                <SelectTrigger className="w-full sm:w-[140px] border-border bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {studentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Pool Month - Only for Piscine */}
              {studentType === "9" && (
                <Select value={poolMonth || "all"} onValueChange={onPoolMonthChange}>
                  <SelectTrigger className="w-full sm:w-[140px] border-border bg-background">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover">
                    <SelectItem value="all">All Months</SelectItem>
                    {poolMonths.map((month) => (
                      <SelectItem key={month.id} value={month.value}>
                        {month.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Campus */}
              <Select value={tempCampusFilter || selectedCampus?.id?.toString() || ""} onValueChange={onTempCampusFilterChange}>
                <SelectTrigger className="w-full sm:w-[160px] border-border bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Campus" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id.toString()}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year */}
              <Select value={yearFilter} onValueChange={onYearFilterChange}>
                <SelectTrigger className="w-full sm:w-[120px] border-border bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="all">All Years</SelectItem>
                  {beginAt.map((item) => (
                    <SelectItem key={item.id} value={item.value}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
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
              {/* Search Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleSearchToggle}
                className={`px-3 py-2 ${isSearchOpen ? 'bg-primary text-primary-foreground' : 'border-border bg-background'}`}
              >
                <Search className="h-4 w-4" />
              </Button>
              
              {/* Apply Filters */}
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
  );
}

import { Search, Filter, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { campuses, entryYears } from "@/lib/mock-data"

export function LeaderboardFilters({
  searchTerm,
  onSearchChange,
  levelFilter,
  onLevelFilterChange,
  campusFilter,
  onCampusFilterChange,
  yearFilter,
  onYearFilterChange,
  sortBy,
  onSortChange,
  totalStudents,
  filteredStudents
}) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by login..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 border-border bg-background"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:flex-none">
              <Select value={campusFilter} onValueChange={onCampusFilterChange}>
                <SelectTrigger className="w-full sm:w-[160px] border-border bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Campus" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="all">All Campuses</SelectItem>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.name}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={onLevelFilterChange}>
                <SelectTrigger className="w-full sm:w-[140px] border-border bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="21+">Level 21+</SelectItem>
                  <SelectItem value="15+">Level 15+</SelectItem>
                  <SelectItem value="10+">Level 10+</SelectItem>
                  <SelectItem value="5+">Level 5+</SelectItem>
                  <SelectItem value="0-5">Level 0-5</SelectItem>
                </SelectContent>
              </Select>

              <Select value={yearFilter} onValueChange={onYearFilterChange}>
                <SelectTrigger className="w-full sm:w-[120px] border-border bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="all">All Years</SelectItem>
                  {entryYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
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
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredStudents} of {totalStudents} students across all campuses
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

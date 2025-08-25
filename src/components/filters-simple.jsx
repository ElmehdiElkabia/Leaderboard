import { useState } from "react"
import { Filter, ArrowUpDown, Search, X } from "lucide-react"

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
    <div className="border border-border bg-card/50 backdrop-blur-sm rounded-lg">
      <div className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          {isSearchOpen && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by login name..."
                value={searchValue}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="flex h-10 w-full rounded-md border-0 bg-transparent px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                autoFocus
              />
              <button
                onClick={handleSearchToggle}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground flex-shrink-0 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Student Type */}
              <select 
                value={studentType} 
                onChange={(e) => onStudentTypeChange(e.target.value)}
                className="flex h-10 w-full sm:w-[140px] items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {studentTypes.map((type) => (
                  <option key={type.id} value={type.id.toString()}>
                    {type.name}
                  </option>
                ))}
              </select>

              {/* Pool Month - Only for Piscine */}
              {studentType === "9" && (
                <select 
                  value={poolMonth || "all"} 
                  onChange={(e) => onPoolMonthChange(e.target.value)}
                  className="flex h-10 w-full sm:w-[140px] items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Months</option>
                  {poolMonths.map((month) => (
                    <option key={month.id} value={month.value}>
                      {month.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Campus */}
              <select 
                value={tempCampusFilter || selectedCampus?.id?.toString() || ""} 
                onChange={(e) => onTempCampusFilterChange(e.target.value)}
                className="flex h-10 w-full sm:w-[160px] items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id.toString()}>
                    {campus.name}
                  </option>
                ))}
              </select>

              {/* Year */}
              <select 
                value={yearFilter} 
                onChange={(e) => onYearFilterChange(e.target.value)}
                className="flex h-10 w-full sm:w-[120px] items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Years</option>
                {beginAt.map((item) => (
                  <option key={item.id} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select 
                value={sortBy} 
                onChange={(e) => onSortChange(e.target.value)}
                className="flex h-10 w-full sm:w-[160px] items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="level">Level</option>
                <option value="correctionPoints">Correction Points</option>
                <option value="wallet">Wallet</option>
                <option value="login">Login</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={handleSearchToggle}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border hover:bg-accent hover:text-accent-foreground px-3 py-2 ${isSearchOpen ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
              >
                <Search className="h-4 w-4" />
              </button>
              
              {/* Apply Filters */}
              <button 
                onClick={onApplyFilters}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredStudents} of {totalStudents} students
          </div>
        </div>
      </div>
    </div>
  );
}

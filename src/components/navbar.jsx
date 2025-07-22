import { Trophy, Code, LogOut, User, MapPin, Wallet, Star, GraduationCap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();
  const userData = auth.getUserData();
  const isAuthenticated = auth.isAuthenticated();

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-sm opacity-50" />
            <div className="relative bg-gradient-primary p-2 rounded-lg">
              <Code className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              1337 Leaderboard
            </h1>
            <p className="text-xs text-muted-foreground">
              {userData?.campus?.name || 'Campus 21'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>Live Rankings</span>
          </div>
          <ThemeToggle />

          {isAuthenticated && userData && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={userData.image?.versions?.small || userData.image?.link}
                      alt={userData.displayname || userData.login}
                    />
                    <AvatarFallback>
                      {userData.first_name?.[0] || userData.login?.[0]}
                      {userData.last_name?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center justify-start gap-3 p-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={userData.image?.versions?.medium || userData.image?.link}
                        alt={userData.displayname || userData.login}
                      />
                      <AvatarFallback className="text-lg">
                        {userData.first_name?.[0] || userData.login?.[0]}
                        {userData.last_name?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="font-semibold text-base">
                        {userData.usual_full_name || userData.displayname || userData.login}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{userData.login}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {userData.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                {/* User Stats */}
                <div className="p-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <span className="font-medium">Level {userData.level?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{userData.correction_point || 0} CP</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet className="h-4 w-4 text-green-500" />
                      <span>₳{userData.wallet || 0}</span>
                    </div>
                    {userData.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="truncate">{userData.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {userData.campus && (
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-orange-500" />
                      <span>{userData.campus.name}</span>
                    </div>
                  )}
                  
                  {userData.grade && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Grade:</span>
                      <Badge variant="secondary">{userData.grade}</Badge>
                    </div>
                  )}
                  
                  {userData.pool_month && userData.pool_year && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pool:</span>
                      <Badge variant="outline">
                        {new Date(0, userData.pool_month - 1).toLocaleString('default', { month: 'short' })} {userData.pool_year}
                      </Badge>
                    </div>
                  )}
                  
                  {userData.kind && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Badge variant={userData.staff ? "destructive" : "default"}>
                        {userData.kind}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}

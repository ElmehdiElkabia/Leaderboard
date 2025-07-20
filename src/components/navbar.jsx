import { Trophy, Code, LogOut, User } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { auth } from "@/lib/auth-clean";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
            <p className="text-xs text-muted-foreground">Campus 21</p>
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
                      src={userData.image?.versions?.small}
                      alt={userData.displayname}
                    />
                    <AvatarFallback>
                      {userData.first_name?.[0]}
                      {userData.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userData.displayname}</p>
                    <p className="text-xs text-muted-foreground">
                      {userData.email}
                    </p>
                  </div>
                </div>
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

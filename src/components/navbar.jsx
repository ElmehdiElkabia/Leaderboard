import {
  Trophy,
  Code,
  LogOut,
  User,
  MapPin,
  Wallet,
  Star,
  GraduationCap,
  Home,
  Users,
  MessageCircle,
  BookOpen,
  Bell
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { ClickableAvatarNotification, AvatarHelpTooltip } from "./avatar-notification";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

  const handleSocialFeatureClick = (feature, description) => {
    navigate(`/coming-soon?feature=${feature}&description=${encodeURIComponent(description)}`);
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
              {userData?.campus?.name || "Campus 21"}
            </p>
          </div>

          {/* Social Media Navigation */}
          <div className="hidden lg:flex items-center ml-8 space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleSocialFeatureClick('feed', 'Discover posts, achievements, and updates from 42 students worldwide')}
                    className="relative flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Home className="h-4 w-4 mr-1.5" />
                    Feed
                    <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Social feed coming soon! Share your coding journey.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleSocialFeatureClick('groups', 'Join study groups, project teams, and peer learning communities')}
                    className="relative flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Users className="h-4 w-4 mr-1.5" />
                    Groups
                    <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Study groups and project teams are on the way!</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleSocialFeatureClick('messages', 'Direct messaging system for collaboration and peer support')}
                    className="relative flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 mr-1.5" />
                    Messages
                    <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Peer-to-peer messaging system in development!</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleSocialFeatureClick('resources', 'Shared learning resources, tutorials, and study materials')}
                    className="relative flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <BookOpen className="h-4 w-4 mr-1.5" />
                    Resources
                    <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Community-driven learning resources coming soon!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Social Menu */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Social Features</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Social Features (Coming Soon)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleSocialFeatureClick('feed', 'Discover posts, achievements, and updates from 42 students worldwide')}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Feed</span>
                  <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSocialFeatureClick('groups', 'Join study groups, project teams, and peer learning communities')}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Groups</span>
                  <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSocialFeatureClick('messages', 'Direct messaging system for collaboration and peer support')}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Messages</span>
                  <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSocialFeatureClick('resources', 'Shared learning resources, tutorials, and study materials')}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Resources</span>
                  <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>Live Rankings</span>
          </div>
          <AvatarHelpTooltip />
          <ThemeToggle />
          <ClickableAvatarNotification />

          {isAuthenticated && userData && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        userData.image?.versions?.small || userData.image?.link
                      }
                      alt={userData.displayname || userData.login}
                    />
                    <AvatarFallback>
                      {userData.first_name?.[0] || userData.login?.[0]}
                      {userData.last_name?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-80 max-h-96 overflow-y-auto"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center justify-start gap-3 p-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={
                          userData.image?.versions?.small ||
                          userData.image?.link
                        }
                        alt={userData.displayname || userData.login}
                      />
                      <AvatarFallback className="text-lg">
                        {userData.first_name?.[0] || userData.login?.[0]}
                        {userData.last_name?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="font-semibold text-base">
                        {userData.usual_full_name ||
                          userData.displayname ||
                          userData.login}
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
                      <span className="font-medium">
                        Level{" "}
                        {userData.level?.toFixed
                          ? userData.level.toFixed(2)
                          : userData.level || "0.00"}
                      </span>
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
                      <span>{userData.campus.name || "Unknown Campus"}</span>
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

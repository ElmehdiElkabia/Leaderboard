import { Trophy, Code } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
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
        </div>
      </div>
    </nav>
  );
}
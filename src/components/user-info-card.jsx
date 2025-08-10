import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { auth } from "@/lib/auth";
import { Trophy, Star, Calendar, MapPin } from "lucide-react";

export function UserInfoCard() {
  const userData = auth.getUserData();
  
  if (!userData) return null;

  // Get current cursus (active one)
  const currentCursus = userData.cursus_users?.find(cursus => cursus.end_at === null) || userData.cursus_users?.[0];
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-28 w-28 border-4 border-primary/20 ring-4 ring-primary/10 shadow-2xl hover:scale-105 transition-transform duration-300">
            <AvatarImage 
              src={userData.image?.versions?.medium} 
              alt={userData.displayname}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
              {userData.first_name?.[0]}{userData.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{userData.displayname}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <span>{userData.login}</span>
              <span>•</span>
              <span>{userData.email}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Level */}
        {currentCursus && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{currentCursus.cursus?.name || 'Current Level'}</span>
              <Badge variant="secondary">{currentCursus.level?.toFixed(2)}</Badge>
            </div>
            <Progress value={(currentCursus.level % 1) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Level {Math.floor(currentCursus.level)} → {Math.floor(currentCursus.level) + 1}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Wallet</span>
            </div>
            <div className="text-lg font-bold">{userData.wallet || 0}</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>Correction Points</span>
            </div>
            <div className="text-lg font-bold">{userData.correction_point || 0}</div>
          </div>
        </div>

        {/* Pool Info */}
        {userData.pool_month && userData.pool_year && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Pool: {userData.pool_month} {userData.pool_year}</span>
          </div>
        )}

        {/* Location */}
        {userData.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{userData.location}</span>
          </div>
        )}

        {/* Skills */}
        {currentCursus?.skills && currentCursus.skills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Top Skills</h4>
            <div className="space-y-1">
              {currentCursus.skills.slice(0, 3).map((skill, index) => (
                <div key={skill.id} className="flex justify-between items-center text-sm">
                  <span>{skill.name}</span>
                  <Badge variant="outline">{skill.level.toFixed(1)}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

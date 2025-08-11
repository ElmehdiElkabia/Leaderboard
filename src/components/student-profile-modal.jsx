import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  GraduationCap,
  Target,
  Clock,
  Award,
  Zap
} from "lucide-react";

export function StudentProfileModal({ student, trigger, isOpen, onOpenChange }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/30">
              <AvatarImage 
                src={student.avatar} 
                alt={student.login}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-bold">
                {student.login.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{student.name || student.login}</h2>
              <p className="text-muted-foreground">@{student.login}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hero Section with Large Avatar */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6 text-center">
              <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-primary/30 ring-4 ring-primary/10 shadow-2xl">
                <AvatarImage 
                  src={student.avatar} 
                  alt={student.login}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary/30 to-primary/50 text-primary">
                  {student.login.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="text-2xl font-bold mb-2">{student.login}</h3>
              
              <div className="flex justify-center gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Rank #{student.rank}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {student.campus}
                </Badge>
              </div>

              <Button
                onClick={() => window.open(`https://profile.intra.42.fr/users/${student.login}`, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View 42 Profile
              </Button>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">{student.level}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-500">{student.grade}</div>
                <div className="text-xs text-muted-foreground">Grade</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-yellow-500">{student.correctionPoints}</div>
                <div className="text-xs text-muted-foreground">Correction Points</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-500">{student.wallet}</div>
                <div className="text-xs text-muted-foreground">Wallet</div>
              </CardContent>
            </Card>
          </div>

          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Level Progress
              </CardTitle>
              <CardDescription>
                Current progression towards next level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Level {Math.floor(parseFloat(student.level))} → {Math.floor(parseFloat(student.level)) + 1}
                  </span>
                  <Badge variant="secondary">{student.level}</Badge>
                </div>
                <Progress 
                  value={(parseFloat(student.level) % 1) * 100} 
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground">
                  {((parseFloat(student.level) % 1) * 100).toFixed(1)}% progress to next level
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skills (if available) */}
          {student.skills && student.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Skills
                </CardTitle>
                <CardDescription>
                  Student's technical skills and levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {student.skills.slice(0, 8).map((skill, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {skill.level?.toFixed(2) || '0.00'}
                        </Badge>
                      </div>
                      <Progress 
                        value={Math.min((skill.level || 0) * 5, 100)} 
                        className="h-2"
                      />
                    </div>
                  ))}
                  {student.skills.length > 8 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... and {student.skills.length - 8} more skills
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campus:</span>
                  <span className="font-medium">{student.campus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{student.location || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={student.isActive ? "default" : "secondary"}>
                    {student.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {student.poolMonth && student.poolYear && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pool:</span>
                    <span className="font-medium">
                      {student.poolMonth}/{student.poolYear}
                    </span>
                  </div>
                )}
                {student.blackholedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Blackhole:</span>
                    <span className="font-medium text-red-500">
                      {new Date(student.blackholedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tip Section */}
        <div className="mt-6 p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="h-4 w-4" />
            <span>Click "View 42 Profile" to see more detailed information on the official 42 platform</span>
          </div>
        </div>
        
      </DialogContent>
    </Dialog>
  );
}

export default StudentProfileModal;

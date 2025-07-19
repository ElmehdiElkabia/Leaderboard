import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Remove TypeScript types

export function LeaderboardTable({ students, startIndex = 0 }) {
  const getRankBadgeVariant = (rank) => {
    if (rank === 1) return "default"
    if (rank === 2) return "secondary"
    if (rank === 3) return "secondary"
    return "outline"
  }

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return "bg-gold/20 text-gold border-gold/30"
    if (rank === 2) return "bg-silver/20 text-silver border-silver/30"
    if (rank === 3) return "bg-bronze/20 text-bronze border-bronze/30"
    return ""
  }

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Campus</TableHead>
                <TableHead className="text-center">Level</TableHead>
                <TableHead className="text-center">Correction Points</TableHead>
                <TableHead className="text-center">Wallet</TableHead>
                <TableHead className="text-center">Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => {
                const rank = startIndex + index + 1
                return (
                  <TableRow
                    key={student.id}
                    className="border-border hover:bg-muted/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="text-center">
                      <Badge 
                        variant={getRankBadgeVariant(rank)}
                        className={getRankBadgeClass(rank)}
                      >
                        #{rank}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={student.avatar} alt={student.login} />
                          <AvatarFallback className="bg-muted">
                            {student.login.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <button
                            onClick={() => window.open(`https://profile.intra.42.fr/users/${student.login}`, '_blank')}
                            className="font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer text-left"
                          >
                            {student.login}
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-muted/50 text-foreground">
                        {student.campus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        {student.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{student.correctionPoints}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-accent">{student.wallet}₳</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-muted-foreground">
                        {student.poolYear || 'N/A'}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

import { motion } from "framer-motion"
import { Crown, Award, Medal, MousePointer } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function TopThree({ students }) {
  const topThree = students.slice(0, 3)
  const [first, second, third] = topThree

  if (topThree.length < 3) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-2">Top Performers</h2>
        <p className="text-muted-foreground mb-3">The elite of Campus 21</p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/70">
          <MousePointer className="h-4 w-4" />
          <span>Click on any avatar to view detailed profiles</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {/* Second Place */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:order-1 order-2"
        >
          <Card className="relative border-border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-silver opacity-10" />
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-silver/20 text-silver border-silver/30">
                #2
              </Badge>
            </div>
            <CardContent className="p-6 text-center relative">
              <Award className="h-8 w-8 text-silver mx-auto mb-4" />
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-silver/40 ring-4 ring-silver/20 shadow-xl hover:scale-105 transition-transform duration-300">
                <AvatarImage 
                  src={second.avatar} 
                  alt={second.login}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-silver/20 to-silver/40 text-silver font-bold text-xl">
                  {second.login.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg mb-2">{second.login}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-semibold">{second.level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CP</span>
                  <span className="font-semibold">{second.correctionPoints}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wallet</span>
                  <span className="font-semibold">{second.wallet}₳</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* First Place */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:order-2 order-1"
        >
          <Card className="relative border-border bg-card hover:shadow-xl transition-all duration-300 overflow-hidden transform md:scale-105">
            <div className="absolute inset-0 bg-gradient-gold opacity-15" />
            <div className="absolute top-4 right-4">
              <Badge className="bg-gold/20 text-gold border-gold/30 animate-glow-pulse">
                #1
              </Badge>
            </div>
            <CardContent className="p-6 text-center relative">
              <Crown className="h-10 w-10 text-gold mx-auto mb-4 animate-float" />
              <Avatar className="h-28 w-28 mx-auto mb-4 border-4 border-gold/50 ring-4 ring-gold/30 shadow-2xl hover:scale-110 transition-transform duration-500 relative">
                <AvatarImage 
                  src={first.avatar} 
                  alt={first.login}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-gold/30 to-gold/50 text-gold font-bold text-2xl">
                  {first.login.slice(0, 2).toUpperCase()}
                </AvatarFallback>
                <div className="absolute inset-0 rounded-full bg-gold/10 animate-pulse" />
              </Avatar>
              <h3 className="font-bold text-xl mb-2 text-gold">{first.login}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-bold text-gold">{first.level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CP</span>
                  <span className="font-bold text-gold">{first.correctionPoints}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wallet</span>
                  <span className="font-bold text-gold">{first.wallet}₳</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Third Place */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:order-3 order-3"
        >
          <Card className="relative border-border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-bronze opacity-10" />
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-bronze/20 text-bronze border-bronze/30">
                #3
              </Badge>
            </div>
            <CardContent className="p-6 text-center relative">
              <Medal className="h-8 w-8 text-bronze mx-auto mb-4" />
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-bronze/40 ring-4 ring-bronze/20 shadow-xl hover:scale-105 transition-transform duration-300">
                <AvatarImage 
                  src={third.avatar} 
                  alt={third.login}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-bronze/20 to-bronze/40 text-bronze font-bold text-xl">
                  {third.login.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg mb-2">{third.login}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-semibold">{third.level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CP</span>
                  <span className="font-semibold">{third.correctionPoints}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wallet</span>
                  <span className="font-semibold">{third.wallet}₳</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

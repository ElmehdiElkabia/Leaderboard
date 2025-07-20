import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Trophy, Users, TrendingUp } from "lucide-react";
import { auth } from "@/lib/auth-clean";
import { useState } from "react";

export function LoginPage() {
  const [loginError, setLoginError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setLoginError(null);
      
      // Use clean auth - no frontend secrets
      auth.loginWith42();
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Trophy,
      title: "Campus Rankings",
      description: "View leaderboards across all Moroccan 1337 campuses",
    },
    {
      icon: Users,
      title: "Student Profiles",
      description: "Explore detailed profiles and achievements",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor level progression and correction points",
    },
  ];

  const campuses = ["Benguerir", "Rabat", "Tétouan", "Khouribga"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Column - Branding & Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">13</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  1337 Leaderboard
                </h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Track your progress and compete with peers across all Moroccan campuses
              </p>
            </div>

            {/* Campus badges */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Available Campuses</p>
              <div className="flex flex-wrap gap-2">
                {campuses.map((campus, index) => (
                  <motion.div
                    key={campus}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                      {campus}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="w-full max-w-md mx-auto border-border bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
                  <ExternalLink className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Welcome Back</CardTitle>
                  <CardDescription className="text-base">
                    Sign in with your 42 intra account to access the leaderboard
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{loginError}</p>
                  </div>
                )}
                
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Sign in with 42 Intra
                    </>
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    By signing in, you agree to access the leaderboard data
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Only students from 1337 campuses can access this platform
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
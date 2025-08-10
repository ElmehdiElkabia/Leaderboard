import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, MousePointer, Eye, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ClickableAvatarNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already seen this notification
    const dismissed = localStorage.getItem('avatar-notification-dismissed');
    if (!dismissed) {
      // Show notification after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setHasBeenDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasBeenDismissed(true);
    localStorage.setItem('avatar-notification-dismissed', 'true');
  };

  const handleShowAgain = () => {
    setIsVisible(true);
    setHasBeenDismissed(false);
    localStorage.removeItem('avatar-notification-dismissed');
  };

  if (hasBeenDismissed && !isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShowAgain}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        title="Show avatar interaction help"
      >
        <Info className="h-4 w-4" />
        <span className="hidden sm:inline">Tips</span>
      </Button>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed top-20 right-4 z-50 max-w-sm"
        >
          <Card className="border-primary/20 bg-background/95 backdrop-blur-sm shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">💡 Pro Tip!</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Click on any student avatar to view their detailed profile!
                </p>
                
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                  <div className="relative">
                    <div className="h-8 w-8 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                      JS
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 border-2 border-primary/50 rounded-full"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <MousePointer className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Click me!</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span>See stats, skills, progress & more</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  className="w-full h-7 text-xs"
                >
                  Got it, thanks!
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AvatarHelpTooltip() {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
        <MousePointer className="h-3 w-3" />
        Click avatars for profiles
      </Badge>
    </div>
  );
}

export default ClickableAvatarNotification;

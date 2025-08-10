import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, MousePointer, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TableHelpOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleHelp = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      {/* Floating Help Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring" }}
      >
        <Button
          onClick={toggleHelp}
          className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          size="sm"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Help Overlay */}
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsVisible(false)}
            />

            {/* Help Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
            >
              <Card className="border-primary/20 bg-background shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-lg font-semibold">How to Interact</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsVisible(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Avatar Click Demo */}
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="relative">
                          <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center text-sm font-bold text-primary border-2 border-primary/30">
                            AB
                          </div>
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 border-2 border-primary/50 rounded-full"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Click Student Avatar</div>
                          <div className="text-xs text-muted-foreground">View detailed profile</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <MousePointer className="h-3 w-3 mr-1" />
                        Clickable
                      </Badge>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">What you'll see:</h3>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Complete student statistics</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span>Level progress and skills</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          <span>Campus and pool information</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          <span>Direct link to 42 profile</span>
                        </div>
                      </div>
                    </div>

                    {/* Pro Tip */}
                    <div className="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Pro Tip</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Look for the hover effects and cursor pointer when you move over student avatars!
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsVisible(false)}
                    className="w-full mt-4"
                  >
                    Got it!
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default TableHelpOverlay;

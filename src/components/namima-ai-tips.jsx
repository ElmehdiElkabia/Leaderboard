import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";

export function NamimaAITips() {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userData = auth.getUserData();

  // Get user's current level
  const getUserLevel = () => {
    if (userData?.cursus_users) {
      const currentCursus = userData.cursus_users.find(cu => cu.cursus_id === 21) || userData.cursus_users[0];
      return currentCursus?.level || 0;
    }
    return 0;
  };

  const fetchNewTip = async () => {
    if (!userData?.login) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://www.13namima.me/api/namima-ai-tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: userData.login,
          level: getUserLevel()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTip(data.tip);
      } else {
        setError('Failed to fetch tip');
      }
    } catch (err) {
      setError('Connection error');
      console.error('Tip fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch tip on component mount
  useEffect(() => {
    if (userData?.login) {
      fetchNewTip();
    }
  }, [userData]);

  if (!userData?.login) {
    return null; // Don't show if user not logged in
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-purple-700">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                Namima AI
              </h3>
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span className="text-xs text-purple-600 dark:text-purple-400">
                Level {getUserLevel()} Wisdom
              </span>
            </div>
            
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Generating wisdom...
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  {error}
                </motion.div>
              ) : tip ? (
                <motion.blockquote
                  key={tip}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 italic"
                >
                  "{tip}"
                </motion.blockquote>
              ) : null}
            </AnimatePresence>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchNewTip}
            disabled={loading}
            className="flex-shrink-0 h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-800"
            title="Get new tip"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

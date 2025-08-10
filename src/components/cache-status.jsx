import { useState, useEffect } from "react";
import { leaderboardCache } from "@/lib/cached-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, BarChart3 } from "lucide-react";

export function CacheStatus({ className = "" }) {
  const [stats, setStats] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const refreshStats = () => {
    const cacheStats = leaderboardCache.getStats();
    setStats(cacheStats);
  };

  useEffect(() => {
    refreshStats();
    
    // Refresh stats every 10 seconds
    const interval = setInterval(refreshStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    leaderboardCache.clearAll();
    refreshStats();
  };

  const formatHitRate = (rate) => {
    if (isNaN(rate)) return "0%";
    return `${(rate * 100).toFixed(1)}%`;
  };

  if (!isVisible) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-background/90 backdrop-blur-sm"
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className="w-80 bg-background/95 backdrop-blur-sm border-border shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Cache Performance
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {formatHitRate(stats.hitRate)}
                  </div>
                  <div className="text-xs text-muted-foreground">Hit Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {stats.size}/{stats.maxSize}
                  </div>
                  <div className="text-xs text-muted-foreground">Cache Size</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-sm font-medium text-green-600">
                    {stats.hits}
                  </div>
                  <div className="text-xs text-muted-foreground">Hits</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-orange-600">
                    {stats.misses}
                  </div>
                  <div className="text-xs text-muted-foreground">Misses</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge 
                  variant={stats.hitRate > 0.7 ? "default" : stats.hitRate > 0.4 ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {stats.hitRate > 0.7 ? "Excellent" : stats.hitRate > 0.4 ? "Good" : "Poor"}
                </Badge>
                {stats.size > stats.maxSize * 0.9 && (
                  <Badge variant="outline" className="text-xs">
                    Near Limit
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={refreshStats}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button
                  onClick={handleClearCache}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>

              {stats.keys.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground mb-1">
                    Cached Keys ({stats.keys.length})
                  </summary>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {stats.keys.slice(0, 10).map((key, index) => (
                      <div
                        key={index}
                        className="truncate text-xs text-muted-foreground font-mono p-1 bg-muted/50 rounded"
                      >
                        {key}
                      </div>
                    ))}
                    {stats.keys.length > 10 && (
                      <div className="text-xs text-muted-foreground text-center">
                        ... and {stats.keys.length - 10} more
                      </div>
                    )}
                  </div>
                </details>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CacheStatus;

// Cache Status Monitor Component - displays real-time cache performance metrics
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Database, 
  Trash2, 
  Settings,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Zap
} from "lucide-react";
import { cachedApi, cacheUtils, cacheConfig } from "@/lib/cached-api";

export default function CacheStatus({ 
  floating = true, 
  expanded = false, 
  showControls = true 
}) {
  const [stats, setStats] = useState(null);
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isVisible, setIsVisible] = useState(true);
  const [config, setConfig] = useState(null);
  const intervalRef = useRef(null);

  // Update stats every 2 seconds
  useEffect(() => {
    const updateStats = () => {
      try {
        const currentStats = cachedApi.getCacheStats();
        const currentConfig = cacheConfig.getConfig();
        setStats(currentStats);
        setConfig(currentConfig);
      } catch (error) {
        console.warn('Failed to update cache stats:', error);
      }
    };

    // Initial update
    updateStats();

    // Set up interval
    intervalRef.current = setInterval(updateStats, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle preset changes
  const handlePresetChange = (preset) => {
    cacheConfig.setPreset(preset);
    const newConfig = cacheConfig.getConfig();
    setConfig(newConfig);
  };

  // Handle cache clearing
  const handleClearCache = () => {
    cacheUtils.clearAll();
    // Stats will update on next interval
  };

  // Format numbers for display
  const formatNumber = (num) => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    return (num / 1000000).toFixed(1) + 'M';
  };

  // Format percentage
  const formatPercentage = (ratio) => {
    return (ratio * 100).toFixed(1) + '%';
  };

  // Get hit rate color
  const getHitRateColor = (hitRate) => {
    if (hitRate >= 0.8) return 'text-green-600';
    if (hitRate >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get hit rate badge variant
  const getHitRateBadge = (hitRate) => {
    if (hitRate >= 0.8) return 'default';
    if (hitRate >= 0.5) return 'secondary';
    return 'destructive';
  };

  if (!stats || !isVisible) {
    return null;
  }

  const { combined, leaderboard, general, api } = stats;
  const hitRate = combined.overallHitRate;

  // Compact view (collapsed)
  if (!isExpanded) {
    return (
      <div className={`
        ${floating ? 'fixed bottom-4 right-4 z-50' : ''}
        transition-all duration-200 hover:scale-105
      `}>
        <Card className="border-border bg-card/90 backdrop-blur-sm shadow-lg w-64">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Cache</span>
                <Badge variant={getHitRateBadge(hitRate)} className="text-xs">
                  {formatPercentage(hitRate)}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="h-6 w-6 p-0"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatNumber(combined.totalSize)} entries</span>
              <span className={`font-medium ${getHitRateColor(hitRate)}`}>
                {hitRate >= 0.8 ? (
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="inline h-3 w-3 mr-1" />
                )}
                {hitRate >= 0.7 ? 'Excellent' : hitRate >= 0.4 ? 'Good' : 'Poor'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expanded view
  return (
    <div className={`
      ${floating ? 'fixed bottom-4 right-4 z-50' : ''}
      transition-all duration-200
    `}>
      <Card className="border-border bg-card/95 backdrop-blur-sm shadow-xl w-80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Cache Performance
            </CardTitle>
            <div className="flex items-center gap-1">
              {showControls && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Overall Performance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Hit Rate</span>
              <Badge variant={getHitRateBadge(hitRate)} className="text-xs">
                {formatPercentage(hitRate)}
              </Badge>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  hitRate >= 0.8 ? 'bg-green-500' : 
                  hitRate >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${hitRate * 100}%` }}
              />
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <BarChart3 className="h-3 w-3" />
                Entries
              </div>
              <div className="font-medium">{formatNumber(combined.totalSize)}</div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Hits
              </div>
              <div className="font-medium text-green-600">
                {formatNumber(combined.totalHits)}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingDown className="h-3 w-3" />
                Misses
              </div>
              <div className="font-medium text-red-600">
                {formatNumber(combined.totalMisses)}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Database className="h-3 w-3" />
                Persisted
              </div>
              <div className="font-medium text-blue-600">
                {localStorage.getItem('leaderboard_cache') ? '✓' : '✗'}
              </div>
            </div>
          </div>

          {/* Cache Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Cache Breakdown</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Leaderboard</span>
                <span>{leaderboard.size} entries ({formatPercentage(leaderboard.hitRate)})</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>General API</span>
                <span>{general.size} entries ({formatPercentage(general.hitRate)})</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          {showControls && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground">Quick Actions</div>
              
              {/* Preset Buttons */}
              <div className="flex gap-1">
                {['realtime', 'balanced', 'performance'].map((preset) => (
                  <Button
                    key={preset}
                    variant={config?.preset === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetChange(preset)}
                    className="flex-1 text-xs h-7"
                  >
                    {preset === 'realtime' && <Zap className="h-3 w-3 mr-1" />}
                    {preset === 'balanced' && <Activity className="h-3 w-3 mr-1" />}
                    {preset === 'performance' && <TrendingUp className="h-3 w-3 mr-1" />}
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </Button>
                ))}
              </div>
              
              {/* Clear Cache */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                className="w-full text-xs h-7"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear Cache
              </Button>
            </div>
          )}

          {/* Performance Indicator */}
          <div className="text-center">
            <div className={`text-xs font-medium ${getHitRateColor(hitRate)}`}>
              {hitRate >= 0.8 ? '🚀 Excellent Performance' : 
               hitRate >= 0.5 ? '⚡ Good Performance' : 
               '🐌 Needs Optimization'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

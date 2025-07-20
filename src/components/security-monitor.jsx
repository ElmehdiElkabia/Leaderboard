// Security monitoring and alerts component
import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Check, X, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { security } from '@/lib/security';
import { auth } from '@/lib/auth';

export function SecurityMonitor() {
  const [securityStatus, setSecurityStatus] = useState({
    authenticated: false,
    sessionValid: false,
    lastCheck: null,
    threats: [],
    score: 0
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkSecurity = () => {
      const threats = [];
      let score = 100;

      // Check authentication
      const isAuth = auth.isAuthenticated();
      
      // Check session validity
      const sessionStart = security.secureStorage.get('42_session_start');
      const sessionValid = sessionStart && 
        (Date.now() - parseInt(sessionStart)) < security.SESSION_TIMEOUT;
      
      if (!isAuth) {
        threats.push({ type: 'error', message: 'Not authenticated' });
        score -= 50;
      }
      
      if (!sessionValid && isAuth) {
        threats.push({ type: 'warning', message: 'Session may be expired' });
        score -= 20;
      }

      // Check for security storage integrity
      try {
        const testKey = 'security_test';
        security.secureStorage.set(testKey, 'test', 1000);
        const retrieved = security.secureStorage.get(testKey);
        if (retrieved !== 'test') {
          threats.push({ type: 'error', message: 'Storage integrity compromised' });
          score -= 30;
        }
        security.secureStorage.remove(testKey);
      } catch (error) {
        threats.push({ type: 'error', message: 'Storage system error' });
        score -= 25;
      }

      // Check environment security
      if (import.meta.env.DEV) {
        threats.push({ type: 'info', message: 'Development mode active' });
        score -= 5;
      }

      // Check for HTTPS in production
      if (import.meta.env.PROD && location.protocol !== 'https:') {
        threats.push({ type: 'error', message: 'Insecure connection (HTTP)' });
        score -= 40;
      }

      // Check for mixed content
      if (location.protocol === 'https:' && 
          document.querySelectorAll('img[src^="http:"], script[src^="http:"]').length > 0) {
        threats.push({ type: 'warning', message: 'Mixed content detected' });
        score -= 15;
      }

      setSecurityStatus({
        authenticated: isAuth,
        sessionValid,
        lastCheck: new Date(),
        threats,
        score: Math.max(0, score)
      });
    };

    checkSecurity();
    const interval = setInterval(checkSecurity, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getThreatIcon = (type) => {
    switch (type) {
      case 'error': return <X className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Eye className="w-4 h-4 text-blue-500" />;
      default: return <Check className="w-4 h-4 text-green-500" />;
    }
  };

  if (!showDetails) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(true)}
          className="bg-background/80 backdrop-blur-sm border-border"
        >
          <Shield className="w-4 h-4 mr-2" />
          Security
          <Badge 
            variant={getScoreBadgeVariant(securityStatus.score)}
            className="ml-2"
          >
            {securityStatus.score}%
          </Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Status
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(false)}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Real-time security monitoring
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Security Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Security Score</span>
            <Badge variant={getScoreBadgeVariant(securityStatus.score)}>
              <span className={getScoreColor(securityStatus.score)}>
                {securityStatus.score}%
              </span>
            </Badge>
          </div>

          {/* Authentication Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Authentication</span>
            <div className="flex items-center gap-1">
              {securityStatus.authenticated ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">
                {securityStatus.authenticated ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Session Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Session</span>
            <div className="flex items-center gap-1">
              {securityStatus.sessionValid ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">
                {securityStatus.sessionValid ? 'Valid' : 'Expired'}
              </span>
            </div>
          </div>

          {/* Threats */}
          {securityStatus.threats.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Security Alerts</span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {securityStatus.threats.map((threat, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
                    {getThreatIcon(threat.type)}
                    <span>{threat.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Check */}
          <div className="text-xs text-muted-foreground">
            Last check: {securityStatus.lastCheck?.toLocaleTimeString()}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Refresh
            </Button>
            {!securityStatus.authenticated && (
              <Button
                variant="default"
                size="sm"
                onClick={() => window.location.href = '/login'}
                className="flex-1"
              >
                Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

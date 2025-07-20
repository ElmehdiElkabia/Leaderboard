import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/auth";
import { security } from "@/lib/security";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, AlertTriangle } from "lucide-react";

export function ProtectedRoute({ children, requireRecentAuth = false }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [securityCheck, setSecurityCheck] = useState({ passed: false, message: '' });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Basic authentication check
        const authenticated = auth.isAuthenticated();
        
        if (!authenticated) {
          security.logSecurityEvent('protected_route_access_denied', {
            route: window.location.pathname,
            reason: 'not_authenticated'
          });
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/login', { replace: true });
          return;
        }

        // Enhanced security checks
        const userData = auth.getUserData();
        if (!userData || !userData.id) {
          security.logSecurityEvent('protected_route_invalid_user_data');
          auth.logout();
          navigate('/login', { replace: true });
          return;
        }

        // Check for session timeout
        const sessionStart = security.secureStorage.get('42_session_start');
        if (sessionStart) {
          const sessionAge = Date.now() - parseInt(sessionStart);
          if (sessionAge > security.SESSION_TIMEOUT) {
            security.logSecurityEvent('session_expired_on_route_check');
            auth.logout();
            navigate('/login', { replace: true });
            return;
          }
          
          // Warn if session is close to expiring
          if (sessionAge > security.SESSION_TIMEOUT - 300000) { // 5 minutes before expiry
            setSecurityCheck({
              passed: true,
              message: 'Your session will expire soon. Please save your work.'
            });
          }
        }

        // Check for suspicious activity (multiple rapid route changes)
        const routeKey = 'route_access_times';
        const now = Date.now();
        const recentAccesses = security.secureStorage.get(routeKey) || [];
        
        // Clean old accesses (older than 1 minute)
        const validAccesses = recentAccesses.filter(time => now - time < 60000);
        
        // Check for rapid route access (more than 20 in 1 minute)
        if (validAccesses.length > 20) {
          security.logSecurityEvent('suspicious_route_activity', {
            accessCount: validAccesses.length,
            userId: userData.id
          });
          setSecurityCheck({
            passed: true,
            message: 'Unusual activity detected. Please verify your account security.'
          });
        }
        
        // Record current access
        validAccesses.push(now);
        security.secureStorage.set(routeKey, validAccesses, 60000); // 1 minute TTL

        // Additional check for recent authentication if required
        if (requireRecentAuth) {
          const lastAuth = security.secureStorage.get('last_auth_time');
          if (!lastAuth || now - parseInt(lastAuth) > 1800000) { // 30 minutes
            security.logSecurityEvent('recent_auth_required');
            navigate('/login', { 
              replace: true,
              state: { message: 'Please re-authenticate for security' }
            });
            return;
          }
        }

        // All checks passed
        setIsAuthenticated(true);
        setSecurityCheck({ passed: true, message: '' });
        
      } catch (error) {
        console.error('Auth check error:', error);
        security.logSecurityEvent('auth_check_error', { error: error.message });
        auth.logout();
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up periodic auth check every 5 minutes
    const authCheckInterval = setInterval(checkAuth, 300000);
    
    return () => clearInterval(authCheckInterval);
  }, [navigate, requireRecentAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying Access
            </CardTitle>
            <CardDescription>
              Performing security checks...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              Secured by 1337 Leaderboard
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <>
      {securityCheck.message && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{securityCheck.message}</p>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}

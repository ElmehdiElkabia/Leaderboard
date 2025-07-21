import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if user is authenticated with session token
        const authenticated = auth.isAuthenticated();
        
        if (!authenticated) {
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/', { replace: true }); // Redirect to AuthHandler
          return;
        }

        // User is authenticated
        setIsAuthenticated(true);
        setIsLoading(false);
        
      } catch (error) {
        console.error('Auth check error:', error);
        auth.logout();
        navigate('/', { replace: true });
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

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
              Please wait while we verify your authentication...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full animate-pulse"
                style={{ width: "70%" }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return children;
}

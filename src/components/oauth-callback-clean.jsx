import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function OAuthCallbackClean() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        // Check for OAuth errors
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        // Validate required parameters
        if (!code) {
          throw new Error("Missing authorization code");
        }

        // Send code to backend - backend handles everything
        const response = await fetch('/api/oauth-complete', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({
            code: code
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Authentication failed: ${response.status}`
          );
        }

        const authData = await response.json();

        // Validate response
        if (!authData.success || !authData.user) {
          throw new Error('Invalid authentication response');
        }

        // Store only safe session data (no OAuth tokens)
        localStorage.setItem('user_session', JSON.stringify({
          user: authData.user,
          sessionToken: authData.user.sessionToken,
          expiresAt: authData.user.expiresAt,
          authenticatedAt: new Date().toISOString()
        }));

        // Store simple auth flag
        localStorage.setItem('isAuthenticated', 'true');

        setStatus("success");

        // Redirect to home page
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);

      } catch (error) {
        console.error("OAuth error:", error);
        setError(error.message);
        setStatus("error");
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  if (status === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Authenticating
            </CardTitle>
            <CardDescription>
              Securely processing your authentication...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Backend processing...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">Authentication Successful!</CardTitle>
            <CardDescription>
              Welcome to the leaderboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Authentication Failed</CardTitle>
            <CardDescription>
              There was an issue with your authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium"
            >
              Return to Homepage
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

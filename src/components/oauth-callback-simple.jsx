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
import { auth } from "@/lib/auth";

export function OAuthCallbackSimple() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState(null);

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        // Check for OAuth errors
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        // Validate required parameters
        if (!code) {
          throw new Error("Missing authorization code");
        }

        // Use the simplified OAuth endpoint
        const response = await fetch('/api/oauth-token-simple', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({
            code: code,
            state: state
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error_description ||
              `Authentication failed: ${response.status}`
          );
        }

        const tokenData = await response.json();

        // Validate token data
        if (!tokenData.access_token) {
          throw new Error('Invalid token response');
        }

        // Fetch user info from 42 API directly
        const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user info: ${userResponse.status}`);
        }

        const userData = await userResponse.json();

        // Validate user data
        if (!userData.id || !userData.login) {
          throw new Error('Invalid user data received');
        }

        // Store authentication data
        const success = auth.setAuthData(tokenData, userData);
        if (!success) {
          throw new Error('Failed to store authentication data');
        }

        setStatus("success");

        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
      } catch (error) {
        console.error("OAuth error:", error);
        setError(error.message);
        setStatus("error");
      }
    };

    exchangeCodeForToken();
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
              Please wait while we complete your authentication...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Exchanging authorization code...
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
              Redirecting you to the dashboard...
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
              We encountered an error during authentication.
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

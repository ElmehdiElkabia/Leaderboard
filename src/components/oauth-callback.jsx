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
import { auth, oauthConfig } from "@/lib/auth";
import { security } from "@/lib/security";
import { apiSecurity } from "@/lib/api-obfuscation";

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState(null);

  useEffect(() => {
    const exchangeCodeForToken = async () => {
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

        // Exchange the authorization code for user data (server-side only)
        const response = await fetch("https://www.13namima.me/api/oauth-complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            code: code
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.details || errorData.error ||
              `Authentication failed: ${response.status}`
          );
        }

        const authData = await response.json();

        // Validate response data
        if (!authData.success || !authData.user) {
          throw new Error('Invalid authentication response');
        }

        const userData = authData.user;

        // Store secure session data (no OAuth tokens exposed)
        localStorage.setItem("user_session_token", userData.sessionToken);
        localStorage.setItem("user_session_expires", userData.expiresAt);
        localStorage.setItem("user_data", JSON.stringify({
          id: userData.id,
          login: userData.login,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          image: userData.image,
          campus: userData.campus,
          level: userData.level
        }));

        setStatus("success");

        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
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
                <div
                  className="bg-primary h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Exchanging authorization code for access token...
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
            <CardTitle className="text-green-600">
              Authentication Successful!
            </CardTitle>
            <CardDescription>
              Redirecting you to the dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">
              Authentication Failed
            </CardTitle>
            <CardDescription>
              There was an error during authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

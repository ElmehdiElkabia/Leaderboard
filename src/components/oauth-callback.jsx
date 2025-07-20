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
import { oauthConfig } from "@/lib/auth";

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState(null);

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      const code = searchParams.get("code");

      if (!code) {
        setError("No authorization code found");
        setStatus("error");
        return;
      }

      try {
        // Exchange the authorization code for an access token
       const response = await fetch("/api/auth", {
  method: "POST",
  headers: {
     "Content-Type": "application/x-www-form-urlencoded",
  },
  body: JSON.stringify({
    code: code,
    redirect_uri: oauthConfig.redirectUri,
  }),
});

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error_description ||
              `HTTP error! status: ${response.status}`
          );
        }

        const tokenData = await response.json();

        // Store the access token
        localStorage.setItem("42_access_token", tokenData.access_token);
        localStorage.setItem("42_refresh_token", tokenData.refresh_token);
        localStorage.setItem(
          "42_token_expires_at",
          Date.now() + tokenData.expires_in * 1000
        );

        // Fetch user info with the access token
        const userResponse = await fetch(`${oauthConfig.apiBaseUrl}/me`, {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user info");
        }

        const userData = await userResponse.json();

        // Store user data
        localStorage.setItem("42_user_data", JSON.stringify(userData));

        setStatus("success");

        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate("/dashboard");
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

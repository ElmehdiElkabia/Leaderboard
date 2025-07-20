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
import { corsProxy } from "@/lib/cors-proxy";
import { oauthProxy } from "@/lib/oauth-proxy";

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
        // Check if client secret is available
        const clientSecret = import.meta.env.VITE_42_CLIENT_SECRET;
        if (!clientSecret) {
          throw new Error("Client secret not configured. Please check your .env file.");
        }

        // Prepare the token exchange data
        const requestData = {
          grant_type: 'authorization_code',
          client_id: oauthConfig.clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: oauthConfig.redirectUri,
        };

        // Convert to URL-encoded format (instead of FormData for better proxy compatibility)
        const formBody = Object.keys(requestData)
          .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(requestData[key]))
          .join('&');

        // Try multiple approaches to handle CORS issues
        let tokenData;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts && !tokenData) {
          attempts++;
          
          try {
            if (attempts === 1) {
              // Attempt 1: Direct request
              console.log("Attempt 1: Direct request to 42 API...");
              const response = await fetch(oauthConfig.tokenUrl, {
                method: "POST",
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody,
              });
              
              if (response.ok) {
                tokenData = await response.json();
              } else {
                throw new Error(`HTTP ${response.status}`);
              }
              
            } else if (attempts === 2) {
              // Attempt 2: CORS proxy
              console.log("Attempt 2: Using CORS proxy...");
              const response = await corsProxy.fetch(oauthConfig.tokenUrl, {
                method: "POST",
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody,
              });
              
              if (response.ok) {
                tokenData = await response.json();
              } else {
                throw new Error(`Proxy HTTP ${response.status}`);
              }
              
            } else if (attempts === 3) {
              // Attempt 3: PHP proxy
              console.log("Attempt 3: Using PHP proxy...");
              tokenData = await oauthProxy.exchangeToken(
                code,
                oauthConfig.clientId,
                clientSecret,
                oauthConfig.redirectUri
              );
            }
            
          } catch (error) {
            console.log(`Attempt ${attempts} failed:`, error.message);
            if (attempts === maxAttempts) {
              throw new Error(`All token exchange attempts failed. Last error: ${error.message}`);
            }
          }
        }

        // Store the access token
        localStorage.setItem("42_access_token", tokenData.access_token);
        if (tokenData.refresh_token) {
          localStorage.setItem("42_refresh_token", tokenData.refresh_token);
        }
        localStorage.setItem(
          "42_token_expires_at",
          Date.now() + tokenData.expires_in * 1000
        );

        // Fetch user info with multiple fallback methods
        let userData;
        let userAttempts = 0;
        const maxUserAttempts = 3;
        
        while (userAttempts < maxUserAttempts && !userData) {
          userAttempts++;
          
          try {
            if (userAttempts === 1) {
              // Attempt 1: Direct request
              console.log("Fetching user data: Direct request...");
              const userResponse = await fetch(`${oauthConfig.apiBaseUrl}/me`, {
                headers: {
                  Authorization: `Bearer ${tokenData.access_token}`,
                },
              });
              
              if (userResponse.ok) {
                userData = await userResponse.json();
              } else {
                throw new Error(`HTTP ${userResponse.status}`);
              }
              
            } else if (userAttempts === 2) {
              // Attempt 2: CORS proxy
              console.log("Fetching user data: CORS proxy...");
              const userResponse = await corsProxy.fetch(`${oauthConfig.apiBaseUrl}/me`, {
                headers: {
                  Authorization: `Bearer ${tokenData.access_token}`,
                },
              });
              
              if (userResponse.ok) {
                userData = await userResponse.json();
              } else {
                throw new Error(`Proxy HTTP ${userResponse.status}`);
              }
              
            } else if (userAttempts === 3) {
              // Attempt 3: PHP proxy
              console.log("Fetching user data: PHP proxy...");
              userData = await oauthProxy.getUser(tokenData.access_token);
            }
            
          } catch (userError) {
            console.log(`User data attempt ${userAttempts} failed:`, userError.message);
            if (userAttempts === maxUserAttempts) {
              throw new Error(`All user data attempts failed. Last error: ${userError.message}`);
            }
          }
        }

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

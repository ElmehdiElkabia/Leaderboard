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
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        // Check for OAuth errors
        if (error) {
          security.logSecurityEvent('oauth_error', { error });
          throw new Error(`OAuth error: ${error}`);
        }

        // Validate required parameters
        if (!code) {
          security.logSecurityEvent('oauth_missing_code');
          throw new Error("Missing authorization code");
        }

        // Validate state parameter (CSRF protection)
        if (!auth.validateOAuthState(state)) {
          throw new Error('Invalid state parameter. Possible CSRF attack.');
        }

        // Rate limiting check
        const clientId = navigator.userAgent + window.location.hostname;
        if (security.rateLimiter.isBlocked(clientId)) {
          security.logSecurityEvent('oauth_callback_rate_limited');
          throw new Error('Too many authentication attempts. Please try again later.');
        }

        security.rateLimiter.recordAttempt(clientId);

        // Exchange code for token through secure obfuscated backend
        const response = await apiSecurity.secureRequest('oauth-token', {
          method: "POST",
          body: JSON.stringify({
            code: security.sanitizeInput(code),
            state: security.sanitizeInput(state)
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          security.logSecurityEvent('token_exchange_failed', { 
            status: response.status,
            error: errorData.error_description 
          });
          throw new Error(
            errorData.error_description ||
              `Authentication failed: ${response.status}`
          );
        }

        const tokenData = await response.json();

        // Validate token data
        if (!tokenData.access_token) {
          security.logSecurityEvent('invalid_token_response');
          throw new Error('Invalid token response');
        }

        // Fetch user info using obfuscated backend API with security headers
        const userResponse = await fetch('/api/profile_info', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        if (!userResponse.ok) {
          security.logSecurityEvent('user_data_fetch_failed', { 
            status: userResponse.status 
          });
          throw new Error(`Failed to fetch user info: ${userResponse.status}`);
        }

        const userData = await userResponse.json();

        // Validate user data
        if (!userData.id || !userData.login) {
          security.logSecurityEvent('invalid_user_data');
          throw new Error('Invalid user data received');
        }

        // Store authentication data securely
        const success = auth.setAuthData(tokenData, userData);
        if (!success) {
          throw new Error('Failed to store authentication data');
        }

        // Clear rate limiting on successful auth
        security.rateLimiter.clearAttempts(clientId);

        setStatus("success");

        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1000);
      } catch (error) {
        console.error("OAuth error:", error);
        security.logSecurityEvent('oauth_callback_error', { 
          error: error.message 
        });
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

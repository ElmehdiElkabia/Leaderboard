import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginPage } from "@/components/login-page";
import { OAuthCallback } from "@/components/oauth-callback";
import { auth } from "@/lib/auth";

export default function AuthHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  useEffect(() => {
    // Check if user is already authenticated using session token
    if (auth.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  // If there's an OAuth code in the URL, handle the callback
  if (code) {
    return <OAuthCallback />;
  }

  // Otherwise, show the login page
  return <LoginPage />;
}

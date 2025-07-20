import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginPage } from "@/components/login-page";
import { OAuthCallbackClean } from "@/components/oauth-callback-clean";
import { auth } from "@/lib/auth-clean";

export default function AuthHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  useEffect(() => {
    // Check if user is already authenticated using clean auth
    if (auth.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  // If there's an OAuth code in the URL, handle the callback
  if (code) {
    return <OAuthCallbackClean />;
  }

  // Otherwise, show the login page
  return <LoginPage />;
}

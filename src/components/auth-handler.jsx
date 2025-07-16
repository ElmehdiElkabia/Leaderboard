import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginPage } from "@/components/login-page";
import { OAuthCallback } from "@/components/oauth-callback";

export default function AuthHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('42_access_token');
    const expiresAt = localStorage.getItem('42_token_expires_at');
    
    if (token && expiresAt && Date.now() < parseInt(expiresAt)) {
      // User is authenticated and token is still valid
      navigate('/dashboard');
    }
  }, [navigate]);

  // If there's an OAuth code in the URL, handle the callback
  if (code) {
    return <OAuthCallback />;
  }

  // Otherwise, show the login page
  return <LoginPage />;
}

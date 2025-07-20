import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SecurityMonitor } from "@/components/security-monitor";
import Index from "./pages/Index.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound";
import { OAuthCallback } from "./components/oauth-callback.jsx";
import AuthHandler from "./components/auth-handler.jsx";
import { ProtectedRoute } from "./components/protected-route.jsx";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [configError, setConfigError] = useState(null);

  useEffect(() => {
    // Basic environment validation (frontend-safe)
    try {
      const requiredVars = ['VITE_42_CLIENT_ID', 'VITE_42_REDIRECT_URI'];
      const missing = requiredVars.filter(varName => !import.meta.env[varName]);
      
      if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
      }

      // Security check: Warn if client secret is in frontend
      if (import.meta.env.VITE_42_CLIENT_SECRET) {
        console.warn('🚨 SECURITY WARNING: Client secret detected in frontend environment! This should be server-side only.');
      }
      
    } catch (error) {
      setConfigError(error.message);
    }
  }, []);

  // Show configuration error in development
  if (configError && import.meta.env.DEV) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Configuration Error</h1>
          <p className="text-red-600 mb-4">{configError}</p>
          <p className="text-gray-600 mb-4">
            Please check your environment variables and ensure all required values are properly configured.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="leaderboard-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/" element={<AuthHandler />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Security Monitor - only show in development or for authenticated users */}
            {(import.meta.env.DEV || window.localStorage.getItem('42_access_token')) && (
              <SecurityMonitor />
            )}
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

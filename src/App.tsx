import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import Landing from "./pages/Landing";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const ProtectedRoute = ({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) => {
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        setOnboarded(data?.onboarding_completed ?? false);
      });
  }, [session.user.id]);

  if (onboarded === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading…</p></div>}>
            <Routes>
              <Route path="/" element={session ? <Navigate to="/app" replace /> : <Landing />} />
              <Route
                path="/app"
                element={
                  session ? (
                    <ProtectedRoute session={session}>
                      <Index />
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route
                path="/profile"
                element={
                  session ? (
                    <ProtectedRoute session={session}>
                      <Profile />
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route path="/onboarding" element={session ? <Onboarding /> : <Navigate to="/auth" replace />} />
              <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/app" replace />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

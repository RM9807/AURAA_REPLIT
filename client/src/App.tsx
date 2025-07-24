import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import OnboardingRouter from "@/components/OnboardingRouter";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import PersonalStyle from "@/pages/personal-style";
import PersonalStyleDiagnosis from "@/pages/personal-style-diagnosis";
import DigitalWardrobe from "@/pages/digital-wardrobe";
import OutfitBuilder from "@/pages/outfit-builder";
import LoadingSpinner from "@/components/ui/loading-spinner";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-50">
        <LoadingSpinner />
      </div>
    );
  }

  // If user is not authenticated, show landing page only
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/landing" component={Landing} />
        <Route component={Landing} /> {/* Redirect all other routes to landing for unauthenticated users */}
      </Switch>
    );
  }

  // If user is authenticated, use OnboardingRouter to manage new/existing user flow
  return (
    <OnboardingRouter>
      <Switch>
        <Route path="/" component={Dashboard} /> {/* Default authenticated route - will be redirected by OnboardingRouter based on user status */}
        <Route path="/home" component={Dashboard} /> {/* Redirect /home to dashboard */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/personal-style" component={PersonalStyle} />
        <Route path="/personal-style-diagnosis" component={PersonalStyleDiagnosis} />
        <Route path="/digital-wardrobe" component={DigitalWardrobe} />
        <Route path="/outfit-builder" component={OutfitBuilder} />
        <Route path="/landing" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    </OnboardingRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

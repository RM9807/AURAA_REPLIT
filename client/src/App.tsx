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
import OutfitGenerator from "@/pages/outfit-generator";
import LoadingSpinner from "@/components/ui/loading-spinner";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Always start with full routing and let OnboardingRouter handle authentication logic
  return (
    <OnboardingRouter>
      <Switch>
        <Route path="/" component={Landing} /> {/* Always start from landing page */}
        <Route path="/landing" component={Landing} />
        <Route path="/home" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/personal-style" component={PersonalStyle} />
        <Route path="/personal-style-diagnosis" component={PersonalStyleDiagnosis} />
        <Route path="/digital-wardrobe" component={DigitalWardrobe} />
        <Route path="/outfit-builder" component={OutfitBuilder} />
        <Route path="/outfit-generator" component={OutfitGenerator} />
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

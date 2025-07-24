import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface OnboardingRouterProps {
  children: React.ReactNode;
}

export default function OnboardingRouter({ children }: OnboardingRouterProps) {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  
  const userId = (user as any)?.id || 1; // Demo user ID fallback
  
  // Only query user data if authenticated
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/users', userId, 'profile'],
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch to get latest data
  });

  // Check if user has any wardrobe items
  const { data: wardrobe, isLoading: wardrobeLoading } = useQuery({
    queryKey: ['/api/users', userId, 'wardrobe'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Check if user has any outfits
  const { data: outfits, isLoading: outfitsLoading } = useQuery({
    queryKey: ['/api/users', userId, 'outfits'],
    enabled: isAuthenticated,
    retry: false,
  });

  const isLoading = authLoading;

  useEffect(() => {
    // Don't redirect if we're still loading
    if (isLoading) return;
    
    // If user is not authenticated, only allow landing page
    if (!isAuthenticated) {
      if (location !== '/' && location !== '/landing') {
        setLocation('/');
        return;
      }
      return; // Let unauthenticated users stay on landing page
    }
    
    // If user is authenticated but on landing page, redirect based on profile status
    if (isAuthenticated && (location === '/' || location === '/landing')) {
      const isNewUser = !profile || !(profile as any)?.bodyType || !(profile as any)?.dailyActivity;
      
      if (isNewUser) {
        setLocation('/personal-style-diagnosis');
      } else {
        setLocation('/dashboard');
      }
      return;
    }
    
    // If user is accessing personal style diagnosis directly, let them through
    if (location === '/personal-style-diagnosis') return;
    
    // For authenticated users, check if they're new and redirect accordingly
    if (isAuthenticated) {
      const isNewUser = !profile || !(profile as any)?.bodyType || !(profile as any)?.dailyActivity;
      
      // NEW USER JOURNEY: Direct new users to personal style diagnosis first
      if (isNewUser) {
        if (location === '/dashboard' || location === '/digital-wardrobe' || location === '/outfit-builder' || location === '/home') {
          setLocation('/personal-style-diagnosis');
          return;
        }
      }
      
      // EXISTING USER JOURNEY: Let existing users access any authenticated route
      // No additional redirects needed for existing users
    }
    
  }, [isLoading, isAuthenticated, profile, location, setLocation]);

  // Show loading spinner while checking user status
  if (isLoading && (location === '/dashboard' || location === '/digital-wardrobe' || location === '/outfit-builder')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-50">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}
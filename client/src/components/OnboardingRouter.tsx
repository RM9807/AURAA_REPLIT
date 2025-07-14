import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface OnboardingRouterProps {
  children: React.ReactNode;
}

export default function OnboardingRouter({ children }: OnboardingRouterProps) {
  const [location, setLocation] = useLocation();
  const userId = 1; // In a real app, this would come from auth context

  // Check if user has completed personal style diagnosis
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/users', userId, 'profile'],
    retry: false,
  });

  // Check if user has any wardrobe items
  const { data: wardrobe, isLoading: wardrobeLoading } = useQuery({
    queryKey: ['/api/users', userId, 'wardrobe'],
    retry: false,
  });

  // Check if user has any outfits
  const { data: outfits, isLoading: outfitsLoading } = useQuery({
    queryKey: ['/api/users', userId, 'outfits'],
    retry: false,
  });

  const isLoading = profileLoading || wardrobeLoading || outfitsLoading;

  useEffect(() => {
    // Don't redirect if we're still loading or if we're already on the right page
    if (isLoading) return;
    
    // If user is accessing personal style diagnosis directly, let them through
    if (location === '/personal-style-diagnosis') return;
    
    // If user is on landing page, let them through
    if (location === '/' || location === '/landing') return;
    
    // Check if user is new (no profile completed)
    const isNewUser = !profile || !profile.bodyType || !profile.dailyActivity;
    
    // If user tries to access dashboard or other features but hasn't completed diagnosis
    if (isNewUser && (location === '/dashboard' || location === '/digital-wardrobe' || location === '/outfit-builder')) {
      // Redirect new users to personal style diagnosis
      setLocation('/personal-style-diagnosis');
      return;
    }
    
    // If user has completed diagnosis but tries to access root, send them to dashboard
    if (!isNewUser && location === '/') {
      setLocation('/dashboard');
      return;
    }
    
  }, [isLoading, profile, location, setLocation]);

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
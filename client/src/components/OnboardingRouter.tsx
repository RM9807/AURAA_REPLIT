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
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch to get latest data
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
    // Don't redirect if we're still loading
    if (isLoading) return;
    
    // If user is on landing page, let them through
    if (location === '/landing') return;
    
    // If user is accessing personal style diagnosis directly, let them through
    if (location === '/personal-style-diagnosis') return;
    
    // Check if user is new (no profile completed)
    const isNewUser = !profile || !profile.bodyType || !profile.dailyActivity;
    
    // NEW USER JOURNEY: Direct new users to personal style diagnosis first
    if (isNewUser) {
      // Redirect ALL authenticated new users to complete diagnosis first
      if (location === '/' || location === '/dashboard' || location === '/digital-wardrobe' || location === '/outfit-builder' || location === '/home') {
        setLocation('/personal-style-diagnosis');
        return;
      }
    }
    
    // EXISTING USER JOURNEY: Direct existing users to dashboard 
    if (!isNewUser) {
      // If existing user tries to access root or home, send them to dashboard
      if (location === '/' || location === '/home') {
        setLocation('/dashboard');
        return;
      }
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
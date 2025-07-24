import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchInterval: 10000, // Check auth status every 10 seconds
    staleTime: 5000, // Consider data fresh for 5 seconds
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchOnMount: true, // Always refetch on component mount
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}
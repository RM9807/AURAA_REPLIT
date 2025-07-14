import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: 1,
    retryDelay: 500,
    refetchInterval: false,
    staleTime: 30000,
  });

  console.log('Auth state:', { user, isLoading, error, isAuthenticated: !!user });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
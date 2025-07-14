import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: 3,
    retryDelay: 1000,
    refetchInterval: 5000,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchInterval: false,
    staleTime: 30000,
  });

  return {
    user,
    isLoading: false, // Disable loading state completely
    isAuthenticated: !!user,
  };
}
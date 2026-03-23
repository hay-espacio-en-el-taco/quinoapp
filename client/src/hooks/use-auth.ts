import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";

interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber: string | null;
  authProvider: string | null;
  specialistId: string | null;
  targetCalories: number | null;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: Infinity,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      window.location.href = "/login";
    },
  });

  const updatePhoneMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await apiRequest("POST", "/api/auth/phone", { phoneNumber });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    needsPhone: !!user && !user.phoneNumber,
    logout: logoutMutation.mutate,
    updatePhone: updatePhoneMutation.mutateAsync,
    isUpdatingPhone: updatePhoneMutation.isPending,
  };
}

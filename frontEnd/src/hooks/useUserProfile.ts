import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";

export interface UserProfileData {
  id?: string;
  full_name?: string;
  oab?: string;
  oab_uf?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  office?: string;
  user_type?: string;
  status?: string;
  created_at?: string;
  last_access?: string;
  username?: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await apiClient.get<UserProfileData>(`/users/${user.id}`);
      return response;
    },
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (data: Partial<UserProfileData>) => {
      if (!user?.id) throw new Error("Usuário não identificado");
      return apiClient.put(`/users/${user.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
    },
  });

  return { profileData, isLoading, error, updateProfile };
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "processo" | "peticao" | "agenda" | "sistema" | "financeiro";
  is_urgent: boolean;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => {
      console.log("🔔 Buscando notificações do usuário:", user?.id);
      return apiClient.get<Notification[]>("/notifications");
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    staleTime: 1000 * 60,
    enabled: !!user?.id,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => apiClient.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  return {
    notifications: Array.isArray(data) ? data : [], // Garante que sempre seja um array
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

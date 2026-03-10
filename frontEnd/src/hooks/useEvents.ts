import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Event {
  id: string;
  case_id: string | null;
  client_id: string | null;
  title: string;
  event_type: string;
  event_date: string;
  event_time: string;
  location: string | null;
  description: string | null;
  reminder: boolean;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
  } | null;
  cases?: {
    case_number: string;
  } | null;
}

export type EventInput = Omit<Event, "id" | "created_at" | "updated_at" | "clients" | "cases">;

export function useEvents() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["events", user?.id],
    queryFn: async () => {
      const response = await apiClient.get<Event[]>("/appointments");
      console.log("📅 Buscando eventos do usuário:", user?.id);
      return response || [];
    },
    enabled: !!user?.id,
  });

  const createEvent = useMutation({
    mutationFn: async (input: EventInput) => {
      const response = await apiClient.post<Event>("/appointments", input);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", user?.id] });
      toast({ title: "Compromisso criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar compromisso", description: error.message, variant: "destructive" });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Event> & { id: string }) => {
      const response = await apiClient.put<Event>(`/appointments/${id}`, input);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", user?.id] });
      toast({ title: "Compromisso atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar compromisso", description: error.message, variant: "destructive" });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", user?.id] });
      toast({ title: "Compromisso excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir compromisso", description: error.message, variant: "destructive" });
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

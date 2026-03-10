import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Case {
  id: string;
  client_id: string;
  case_number: string;
  case_type: string;
  court: string | null;
  judge: string | null;
  subject: string | null;
  status: string;
  value: number | null;
  notes: string | null;
  trial_date: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
  };
}

export type CaseInput = Omit<Case, "id" | "created_at" | "updated_at" | "clients">;

export function useCases() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: cases = [], isLoading, error } = useQuery({
    queryKey: ["cases", user?.id],
    queryFn: async () => {
      console.log(`📋 Buscando processos do usuário: ${user?.id}`);
      const response = await apiClient.get<Case[]>("/processes");
      console.log(`✅ ${response?.length || 0} processos carregados`);
      return response || [];
    },
    enabled: !!user?.id, // Só busca se houver usuário logado
  });

  const createCase = useMutation({
    mutationFn: async (input: CaseInput) => {
      const response = await apiClient.post<Case>("/processes", input);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases", user?.id] });
      toast({ title: "Processo criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar processo", description: error.message, variant: "destructive" });
    },
  });

  const updateCase = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Case> & { id: string }) => {
      const response = await apiClient.put<Case>(`/processes/${id}`, input);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases", user?.id] });
      toast({ title: "Processo atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar processo", description: error.message, variant: "destructive" });
    },
  });

  const deleteCase = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/processes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases", user?.id] });
      toast({ title: "Processo excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir processo", description: error.message, variant: "destructive" });
    },
  });

  return {
    cases,
    isLoading,
    error,
    createCase,
    updateCase,
    deleteCase,
  };
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Lawyer {
  id: string;
  name: string;
  email: string;
  oabNumber: string;
  specialty: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LawyerInput = Omit<Lawyer, "id" | "createdAt" | "updatedAt">;

export function useLawyers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: lawyers = [], isLoading, error } = useQuery({
    queryKey: ["lawyers", user?.id],
    queryFn: async () => {
      const response = await apiClient.get<Lawyer[]>("/lawyers");
      console.log("👨‍⚖️ Buscando advogados do usuário:", user?.id);
      return response || [];
    },
    enabled: !!user?.id,
  });

  const createLawyer = useMutation({
    mutationFn: async (input: LawyerInput) => {
      const response = await apiClient.post<Lawyer>("/lawyers", input);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lawyers", user?.id] });
      toast({ title: "Advogado criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar advogado", description: error.message, variant: "destructive" });
    },
  });

  const updateLawyer = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Lawyer> & { id: string }) => {
      const response = await apiClient.put<Lawyer>(`/lawyers/${id}`, input);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lawyers", user?.id] });
      toast({ title: "Advogado atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar advogado", description: error.message, variant: "destructive" });
    },
  });

  const deleteLawyer = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/lawyers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lawyers", user?.id] });
      toast({ title: "Advogado excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir advogado", description: error.message, variant: "destructive" });
    },
  });

  return {
    lawyers,
    isLoading,
    error,
    createLawyer,
    updateLawyer,
    deleteLawyer,
  };
}

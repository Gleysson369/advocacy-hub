import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf_cnpj: string | null;
  document_id?: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ClientInput = Omit<Client, "id" | "created_at" | "updated_at">;

export function useClients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ["clients", user?.id],
    queryFn: async () => {
      console.log(`👥 Buscando clientes do usuário: ${user?.id}`);
      const response = await apiClient.get<Client[]>("/clients");
      console.log(`✅ ${response?.length || 0} clientes carregados`);
      return response || [];
    },
    enabled: !!user?.id, // Só busca se houver usuário logado
  });

  const createClient = useMutation({
    mutationFn: async (input: ClientInput) => {
      const response = await apiClient.post<Client>("/clients", input);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", user?.id] });
      toast({ title: "Cliente criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar cliente", description: error.message, variant: "destructive" });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Client> & { id: string }) => {
      const response = await apiClient.put<Client>(`/clients/${id}`, input);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", user?.id] });
      toast({ title: "Cliente atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar cliente", description: error.message, variant: "destructive" });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", user?.id] });
      toast({ title: "Cliente excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir cliente", description: error.message, variant: "destructive" });
    },
  });

  return {
    clients,
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
  };
}

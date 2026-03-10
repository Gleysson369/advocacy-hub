import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, User, CalendarDays, Paperclip, Download } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useClients, ClientInput } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { downloadProtectedFile } from "@/lib/file-download";
import { BACKEND_BASE_URL } from "@/lib/api-client";

export default function Clients() {
  const { clients, isLoading, createClient, updateClient, deleteClient } = useClients();
  const { toast } = useToast();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClientInput & { document_id?: string | null }>({
    name: "",
    email: null,
    phone: null,
    cpf_cnpj: null,
    address: null,
    city: null,
    state: null,
    zip_code: null,
    notes: null,
    document_id: null,
  });

  // Função para formatar a data automática vinda do banco
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredClients = clients?.filter(
    (client) =>
      client.name?.toLowerCase().includes(search.toLowerCase()) ||
      client.email?.toLowerCase().includes(search.toLowerCase()) ||
      client.cpf_cnpj?.includes(search) ||
      client.notes?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Aplicar busca global vinda do Header
  useEffect(() => {
    const state = location.state as { globalSearch?: string } | null;
    if (state?.globalSearch) {
      setSearch(state.globalSearch);
    }
  }, [location.state]);

  const handleOpenDialog = (client?: any) => {
    if (client) {
      setEditingClient(client.id);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        cpf_cnpj: client.cpf_cnpj,
        address: client.address,
        city: client.city,
        state: client.state,
        zip_code: client.zip_code,
        notes: client.notes,
        document_id: client.document_id || null,
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: "",
        email: null,
        phone: null,
        cpf_cnpj: null,
        address: null,
        city: null,
        state: null,
        zip_code: null,
        notes: null,
        document_id: null,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await updateClient.mutateAsync({ id: editingClient, ...formData });
      } else {
        await createClient.mutateAsync(formData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      await deleteClient.mutateAsync(id);
    }
  };

  const handleDownloadDocument = async () => {
    if (!formData.document_id) return;

    try {
      await downloadProtectedFile(formData.document_id);
      toast({ title: "Download iniciado." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel baixar o arquivo.";
      toast({ title: "Erro ao baixar arquivo", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de contatos</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shadow-sm bg-[#1e293b] text-[#fbbf24] hover:bg-slate-800">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou CPF/CNPJ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white shadow-sm focus-visible:ring-slate-400"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground italic">Carregando lista de clientes...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-16 text-center">
            <User className="w-12 h-12 mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Nenhum cliente por aqui</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {search ? "Nenhum resultado para sua busca." : "Adicione seu primeiro cliente para começar."}
            </p>
            {!search && (
              <Button onClick={() => handleOpenDialog()} variant="outline">
                Adicionar Agora
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-slate-700">Nome</TableHead>
                <TableHead className="font-bold text-slate-700">Contato</TableHead>
                <TableHead className="font-bold text-slate-700">Documento</TableHead>
                <TableHead className="font-bold text-slate-700">Cadastro</TableHead>
                <TableHead className="font-bold text-slate-700">Localização</TableHead>
                <TableHead className="font-bold text-slate-700">Observações Gerais</TableHead>
                <TableHead className="w-[100px] text-right font-bold text-slate-700 px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-semibold text-slate-900">{client.name}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span className="text-slate-600">{client.email || "Sem e-mail"}</span>
                      <span className="text-slate-400 text-xs">{client.phone || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono">{client.cpf_cnpj || "-"}</span>
                      {client.document_id && (
                        <button
                          type="button"
                          onClick={() => downloadProtectedFile(client.document_id as string)}
                          className="w-fit text-[11px] text-blue-600 hover:text-blue-700 underline underline-offset-2"
                        >
                          Baixar anexo
                        </button>
                      )}
                    </div>
                  </TableCell>
                  
                  {/* DATA DE CADASTRO AUTOMÁTICA */}
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(client.created_at)}
                    </div>
                  </TableCell>

                  <TableCell className="text-slate-600 text-sm">
                    {client.city ? `${client.city}/${client.state || ""}` : "-"}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm max-w-[320px]">
                    <p className="truncate" title={client.notes || "-"}>
                      {client.notes || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="px-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(client)} className="h-8 w-8 text-slate-400 hover:text-primary">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription>
              Complete as informações cadastrais do cliente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name" className="font-bold text-slate-700">Nome Completo / Razão Social *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-700">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value || null })}
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-bold text-slate-700">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value || null })}
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj" className="font-bold text-slate-700">CPF ou CNPJ</Label>
                <Input
                  id="cpf_cnpj"
                  value={formData.cpf_cnpj || ""}
                  onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value || null })}
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code" className="font-bold text-slate-700">CEP</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code || ""}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value || null })}
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address" className="font-bold text-slate-700">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value || null })}
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="font-bold text-slate-700">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value || null })}
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="font-bold text-slate-700">Estado (UF)</Label>
                <Input
                  id="state"
                  value={formData.state || ""}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value || null })}
                  maxLength={2}
                  className="bg-slate-50 border-slate-200 focus:bg-white uppercase text-center"
                  placeholder="SP"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="document" className="font-bold text-slate-700 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" /> Documento Anexo
                </Label>
                <Input
                  id="document"
                  type="file"
                  className="bg-slate-50 border-slate-200 focus:bg-white cursor-pointer"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      
                      try {
                        // Criar FormData com o arquivo
                        const uploadFormData = new FormData();
                        uploadFormData.append('file', file);
                        const token = localStorage.getItem('auth_token');
                        
                        // Enviar para o backend
                        const response = await fetch(`${BACKEND_BASE_URL}/api/processes/upload`, {
                          method: 'POST',
                          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                          body: uploadFormData,
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok && result.success) {
                          // Salvar o caminho do arquivo no formulário
                          setFormData((prev) => ({ 
                            ...prev, 
                            document_id: result.file.path 
                          }));
                        } else {
                          console.error('❌ Erro ao fazer upload:', result.message);
                          toast({ title: "Erro ao enviar arquivo", description: result.message || "Falha no upload.", variant: "destructive" });
                        }
                      } catch (error) {
                        console.error('❌ Erro na requisição de upload:', error);
                        toast({ title: "Erro ao enviar arquivo", description: "Nao foi possivel conectar ao backend.", variant: "destructive" });
                      }
                    }
                  }}
                />
                <p className="text-[10px] text-slate-500">Selecione um arquivo para fazer upload automático.</p>
                {formData.document_id && (
                  <Button type="button" variant="outline" className="w-fit" onClick={handleDownloadDocument}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar arquivo atual
                  </Button>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes" className="font-bold text-slate-700">Observações Gerais</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="px-8 shadow-md bg-[#1e293b] text-[#fbbf24] hover:bg-slate-800"
                disabled={createClient.isPending || updateClient.isPending}
              >
                {editingClient ? "Salvar Alterações" : "Cadastrar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

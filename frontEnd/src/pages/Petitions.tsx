import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, FileText, Printer } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePetitions } from "@/hooks/usePetitions";
import { useClients } from "@/hooks/useClients";

// Helper function to translate PetitionType for display
const translatePetitionType = (type: string) => {
  switch (type) {
    case "INITIAL_PETITION":
      return "Petição Inicial";
    case "PETITION":
      return "Petição";
    case "RECOURSE":
      return "Recurso";
    case "EVIDENCE":
      return "Evidência";
    case "OTHER":
      return "Outros";
    default:
      return type;
  }
};

// Helper function to translate PetitionStatus for display
const translatePetitionStatus = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "Rascunho";
    case "PENDING":
      return "Pendente";
    case "SUBMITTED":
      return "Submetida";
    case "APPROVED":
      return "Aprovada";
    case "REJECTED":
      return "Rejeitada";
    default:
      return status;
  }
};


export default function Petitions() {
  const {
    petitions,
    isLoading,
    createPetition,
    updatePetition,
    deletePetition,
    downloadPetitionPdf,
    previewPetitionText,
    getPetitionDetails,
  } = usePetitions();
  const { clients } = useClients();
  const navigate = useNavigate();
  const location = useLocation();  
  
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    process_number: "",
    client_id: "",
    type: "INITIAL_PETITION",
    status: "DRAFT",
    enderecamento: "",
    reu: "",
    fatos: "",
    fundamentos: "",
    pedidos: "",
    valor_causa: null as number | null,
    local: "",
  });

  const filteredPetitions = petitions?.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.process_number?.includes(search) ||
      p.client_name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  useEffect(() => {
    const openPetitionId = (location.state as { openPetitionId?: string } | null)?.openPetitionId;
    if (!openPetitionId || !petitions?.length) return;

    const petitionItem = petitions.find((p) => p.id === openPetitionId);
    if (petitionItem) {
      handleOpenDialog(petitionItem);
      // Limpa o state para não reabrir o modal ao navegar
      navigate("/petitions", { replace: true, state: {} });
    }
  }, [location.state, petitions, navigate]);

  const handleOpenDialog = async (petition?: any) => {
    if (petition) {
      setEditingId(petition.id);
      const client = clients?.find(c => c.name === petition.client_name);
      setFormData({
        title: petition.title,
        process_number: petition.process_number || petition.processNumber || "",
        client_id: client?.id || "",
        type: petition.type,
        status: petition.status,
        // New fields with fallbacks
        enderecamento: petition.enderecamento || petition.addressee || "",
        reu: petition.reu || petition.defendant || "",
        fatos: petition.fatos || petition.facts || petition.content_summary || "",
        fundamentos: petition.fundamentos || petition.legal_grounds || "",
        pedidos: petition.pedidos || petition.requests || "",
        valor_causa: petition.valor_causa || petition.claim_value || null,
        local: petition.local || petition.closing_place || "",
      });
      
      setIsDialogOpen(true);

      // Busca os detalhes completos para garantir que campos longos (pedidos, fundamentos) sejam carregados
      try {
        const fullData = await getPetitionDetails(petition.id);
        const core = fullData.petition;
        setFormData((prev) => ({
          ...prev,
          process_number: core.process_number || prev.process_number,
          enderecamento: core.addressee || prev.enderecamento,
          fatos: core.facts || prev.fatos,
          fundamentos: core.legal_grounds || prev.fundamentos,
          pedidos: core.requests || prev.pedidos,
          valor_causa: core.claim_value ?? prev.valor_causa,
          local: core.closing_place || prev.local,
        }));
      } catch (error) {
        console.error("Erro ao carregar detalhes completos da petição:", error);
      }
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        process_number: "",
        client_id: "",
        type: "INITIAL_PETITION",
        status: "DRAFT",
        enderecamento: "",
        reu: "",
        fatos: "",
        fundamentos: "",
        pedidos: "",
        valor_causa: null,
        local: "",
      });
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const client = clients?.find(c => c.id === formData.client_id);
      const submissionData = {
        ...formData,
        process_number: formData.process_number, // Garante envio snake_case
        processNumber: formData.process_number, // Garante envio camelCase
        client_name: client?.name || "", // For compatibility
        content_summary: formData.fatos, // Map to old field
        // Garante envio de campos detalhados em ambos os formatos
        fatos: formData.fatos,
        facts: formData.fatos,
        fundamentos: formData.fundamentos,
        legal_grounds: formData.fundamentos,
        pedidos: formData.pedidos,
        requests: formData.pedidos,
        valor_causa: formData.valor_causa,
        claim_value: formData.valor_causa,
      };
      if (editingId) {
        await updatePetition.mutateAsync({ id: editingId, ...submissionData });
      } else {
        await createPetition.mutateAsync(submissionData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar petição:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja excluir este rascunho de petição?")) {
      await deletePetition.mutateAsync(id);
    }
  };

  const handlePrint = async (petition: any) => {
    try {
      const text = await previewPetitionText(petition.id);
      const printWindow = window.open("", "", "height=800,width=800");
      if (!printWindow) return;

      const escapedTitle = (petition.title || "Petição").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const escapedBody = text
        .replace("@@PETITION_TITLE@@", "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");

      printWindow.document.write(`
        <html>
          <head>
            <title>${escapedTitle}</title>
            <style>
              @page { margin: 2cm; }
              body {
                font-family: "Times New Roman", serif;
                font-size: 12pt;
                line-height: 1.5;
                white-space: normal;
              }
              h1 {
                text-align: center;
                font-size: 14pt;
                text-transform: uppercase;
                margin-bottom: 1rem;
              }
              .content {
                margin-top: 1rem;
              }
            </style>
          </head>
          <body>
            <h1>${escapedTitle}</h1>
            <div class="content">
              ${escapedBody}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error("Erro ao imprimir petição:", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Petições</h1>
          <p className="text-muted-foreground">Gerencie suas petições processuais e rascunhos</p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()} 
          className="shadow-sm bg-[#1e293b] text-[#fbbf24] hover:bg-[#334155]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Petição
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, processo ou cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground italic">Carregando petições...</div>
        ) : filteredPetitions.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Nenhuma petição encontrada</h3>
            <p className="text-muted-foreground text-sm mb-6">Comece redigindo sua primeira petição jurídica.</p>
            {!search && <Button onClick={() => handleOpenDialog()} variant="outline">Criar Petição</Button>}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-slate-700">Título / Peça</TableHead>
                <TableHead className="font-bold text-slate-700">Processo / Cliente</TableHead>
                <TableHead className="font-bold text-slate-700">Tipo</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
                <TableHead className="w-[100px] text-right font-bold text-slate-700 px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPetitions.map((petition) => (
                <TableRow key={petition.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-semibold text-slate-900">{petition.title}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span className="text-slate-600 font-mono text-xs">{petition.process_number || (petition as any).processNumber || "N/A"}</span>
                      <span className="text-slate-400 text-xs">{petition.client_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {translatePetitionType(petition.type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      translatePetitionStatus(petition.status) === "Aprovada" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {translatePetitionStatus(petition.status)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => downloadPetitionPdf(petition.id)} className="h-8 w-8 text-slate-400 hover:text-red-500" title="Gerar PDF">
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handlePrint(petition)} className="h-8 w-8 text-slate-400 hover:text-blue-500" title="Imprimir">
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(petition)} className="h-8 w-8 text-slate-400 hover:text-primary">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(petition.id)} className="h-8 w-8 text-slate-400 hover:text-red-500">
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingId ? "Editar Petição" : "Nova Petição"}</DialogTitle>
            <DialogDescription>Preencha os dados básicos para gerar ou organizar sua peça jurídica.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-4">
              
              {/* Título e Processo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-bold text-slate-700">Título da Petição *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="process" className="font-bold text-slate-700">Número do Processo</Label>
                  <Input id="process" value={formData.process_number || ""} onChange={(e) => setFormData({ ...formData, process_number: e.target.value })} />
                </div>
              </div>

              {/* Endereçamento */}
              <div className="space-y-2">
                <Label htmlFor="enderecamento" className="font-bold text-slate-700">Endereçamento</Label>
                <Input id="enderecamento" placeholder="Ex: EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA..." value={formData.enderecamento} onChange={(e) => setFormData({ ...formData, enderecamento: e.target.value })} />
              </div>

              {/* Partes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Autor (Cliente) *</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })} required>
                    <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reu" className="font-bold text-slate-700">Réu *</Label>
                  <Input id="reu" placeholder="Nome completo do réu" value={formData.reu} onChange={(e) => setFormData({ ...formData, reu: e.target.value })} required />
                </div>
              </div>

              {/* Fatos */}
              <div className="space-y-2">
                <Label htmlFor="fatos" className="font-bold text-slate-700">Fatos</Label>
                <Textarea id="fatos" placeholder="Narração clara e cronológica do conflito..." value={formData.fatos} onChange={(e) => setFormData({ ...formData, fatos: e.target.value })} rows={5} />
              </div>

              {/* Fundamentos */}
              <div className="space-y-2">
                <Label htmlFor="fundamentos" className="font-bold text-slate-700">Fundamentos Jurídicos</Label>
                <Textarea id="fundamentos" placeholder="Explicação das leis, doutrinas e jurisprudências..." value={formData.fundamentos} onChange={(e) => setFormData({ ...formData, fundamentos: e.target.value })} rows={5} />
              </div>

              {/* Pedidos */}
              <div className="space-y-2">
                <Label htmlFor="pedidos" className="font-bold text-slate-700">Pedidos e Requerimentos</Label>
                <Textarea id="pedidos" placeholder="O que se espera do juiz (ex: indenização, citação do réu...)" value={formData.pedidos} onChange={(e) => setFormData({ ...formData, pedidos: e.target.value })} rows={5} />
              </div>

              {/* Valor da Causa e Local */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor_causa" className="font-bold text-slate-700">Valor da Causa (R$)</Label>
                  <Input id="valor_causa" type="number" placeholder="1000.00" value={formData.valor_causa ?? ""} onChange={(e) => setFormData({ ...formData, valor_causa: e.target.value ? parseFloat(e.target.value) : null })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="local" className="font-bold text-slate-700">Local do Fechamento</Label>
                  <Input id="local" placeholder="Ex: São Paulo" value={formData.local} onChange={(e) => setFormData({ ...formData, local: e.target.value })} />
                </div>
              </div>

              {/* Tipo e Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Tipo de Peça</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INITIAL_PETITION">Petição Inicial</SelectItem>
                      <SelectItem value="PETITION">Petição</SelectItem>
                      <SelectItem value="RECOURSE">Recurso</SelectItem>
                      <SelectItem value="EVIDENCE">Evidência</SelectItem>
                      <SelectItem value="OTHER">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Rascunho</SelectItem>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="SUBMITTED">Submetida</SelectItem>
                      <SelectItem value="APPROVED">Aprovada</SelectItem>
                      <SelectItem value="REJECTED">Rejeitada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="px-8 shadow-md bg-[#1e293b] text-[#fbbf24] hover:bg-slate-800">
                {editingId ? "Salvar Alterações" : "Criar Petição"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
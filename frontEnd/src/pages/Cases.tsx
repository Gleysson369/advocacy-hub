import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Briefcase, CalendarDays, Gavel, ChevronDown, Paperclip, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCases, CaseInput, Case } from "@/hooks/useCases";
import { useClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { downloadProtectedFile } from "@/lib/file-download";
import { BACKEND_BASE_URL } from "@/lib/api-client";

const statusConfig = {
  em_andamento: { label: "Em Andamento", className: "bg-blue-100 text-blue-700 border-blue-200" },
  aguardando: { label: "Aguardando", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  concluido: { label: "Concluído", className: "bg-green-100 text-green-700 border-green-200" },
  urgente: { label: "Urgente", className: "bg-red-100 text-red-700 border-red-200" },
};

const caseTypes = ["Trabalhista", "Cível", "Criminal", "Família", "Empresarial", "Tributário", "Previdenciário", "Consumidor", "Outros"];

export default function Cases() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cases, isLoading, createCase, updateCase, deleteCase } = useCases();
  const { clients } = useClients();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<string | null>(null);
  const [createAppointment, setCreateAppointment] = useState(false);
  
  const [formData, setFormData] = useState<CaseInput & { document_id?: string | null }>({
    client_id: "",
    case_number: "",
    case_type: "",
    court: null,
    judge: null,
    subject: null,
    status: "em_andamento",
    value: null,
    notes: null,
    document_id: null,
    trial_date: null,
  });

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    if (date instanceof Date) {
      return date.toLocaleDateString('pt-BR');
    }
    // Se for string, tenta converter
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString('pt-BR');
  }

  const formatCurrency = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") return "-";
    let numValue: number;
    if (typeof value === 'string') {
      // Remove caracteres não numéricos exceto vírgula e ponto
      const clean = value.replace(/[^\d,\.]/g, '').replace(',', '.');
      numValue = parseFloat(clean);
    } else {
      numValue = value;
    }
    if (isNaN(numValue)) return "-";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
  }

  const filteredCases = cases?.filter(
    (c) =>
      c.case_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.clients?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.case_type?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Abrir modal de edição quando vier do dashboard (RecentCases) com openCaseId no state
  useEffect(() => {
    const openCaseId = (location.state as { openCaseId?: string } | null)?.openCaseId;
    if (!openCaseId || !cases?.length) return;
    const caseItem = cases.find((c) => c.id === openCaseId);
    if (caseItem) {
      setEditingCase(caseItem.id);
      setFormData({
        client_id: caseItem.client_id,
        case_number: caseItem.case_number,
        case_type: caseItem.case_type,
        court: caseItem.court,
        judge: caseItem.judge,
        subject: caseItem.subject,
        status: caseItem.status,
        value: caseItem.value,
        notes: caseItem.notes,
        document_id: (caseItem as any).document_id || null,
        trial_date: (caseItem as any).trial_date || null,
      });
      setIsDialogOpen(true);
      navigate("/processos", { replace: true, state: {} });
    }
  }, [location.state, cases, navigate]);

  // Aplicar busca global vinda do Header
  useEffect(() => {
    const state = location.state as { globalSearch?: string } | null;
    if (state?.globalSearch) {
      setSearch(state.globalSearch);
    }
  }, [location.state]);

  const handleOpenDialog = (caseItem?: Case) => {
    if (caseItem) {
      setEditingCase(caseItem.id);
      setFormData({
        client_id: caseItem.client_id,
        case_number: caseItem.case_number,
        case_type: caseItem.case_type,
        court: caseItem.court,
        judge: caseItem.judge,
        subject: caseItem.subject,
        status: caseItem.status,
        value: caseItem.value,
        notes: caseItem.notes,
        document_id: (caseItem as any).document_id || null,
        trial_date: (caseItem as any).trial_date || null,
      });
    } else {
      setEditingCase(null);
      setFormData({
        client_id: "", case_number: "", case_type: "", court: null,
        judge: null, subject: null, status: "em_andamento", value: null, notes: null, document_id: null, trial_date: null,
      });
      setCreateAppointment(false);
    }
    setIsDialogOpen(true);
  };

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    await updateCase.mutateAsync({ id, status: newStatus });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let savedCaseId: string | null = null;
    if (editingCase) {
      const updated = await updateCase.mutateAsync({ id: editingCase, ...formData });
      savedCaseId = updated?.id ?? editingCase;
      setIsDialogOpen(false);
    } else {
      const created = await createCase.mutateAsync(formData);
      savedCaseId = created?.id ?? null;
      setIsDialogOpen(false);
    }
    if (createAppointment && formData.trial_date && savedCaseId) {
      navigate("/agenda", {
        state: {
          newAppointmentFromCase: {
            title: `Julgamento - ${formData.case_number}`,
            date: formData.trial_date,
            description: formData.notes || `Julgamento do processo ${formData.case_number}`,
            caseId: savedCaseId,
            clientId: formData.client_id || null,
          },
        },
      });
      setCreateAppointment(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este processo?")) {
      await deleteCase.mutateAsync(id);
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
          <h1 className="text-3xl font-serif font-bold text-slate-900">Processos</h1>
          <p className="text-muted-foreground">Gestão de contencioso e prazos</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#1e293b] text-[#fbbf24] hover:bg-slate-800 shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo Processo
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar processo ou cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-slate-700">Processo/Cliente</TableHead>
              <TableHead className="font-bold text-slate-700">Vara / Tribunal</TableHead>
              <TableHead className="font-bold text-slate-700">Data Julgamento</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700">Valor da Causa</TableHead>
              <TableHead className="font-bold text-slate-700">Área</TableHead>
              <TableHead className="w-[100px] text-right font-bold text-slate-700 px-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.map((caseItem) => (
              <TableRow key={caseItem.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-primary font-bold">{caseItem.case_number}</span>
                    <span className="font-semibold text-slate-800">{caseItem.clients?.name || "Não vinculado"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 text-sm">{caseItem.court || "-"}</TableCell>
                <TableCell className="text-slate-600 text-sm">
                  {formatDate((caseItem as any).trial_date)}
                </TableCell>
                <TableCell>
                  {/* ALTERAÇÃO DE STATUS RÁPIDA */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter transition-all hover:opacity-80",
                        statusConfig[caseItem.status as keyof typeof statusConfig]?.className
                      )}>
                        {statusConfig[caseItem.status as keyof typeof statusConfig]?.label || caseItem.status}
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <DropdownMenuItem 
                          key={key} 
                          onClick={() => handleQuickStatusChange(caseItem.id, key)}
                          className="text-xs font-bold uppercase cursor-pointer"
                        >
                          {config.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell className="text-slate-600 text-sm font-medium">
                  {formatCurrency(
                    caseItem.value ??
                    (caseItem as any).valor_causa ??
                    (caseItem as any).valor ??
                    (caseItem as any).amount ??
                    ""
                  )}
                </TableCell>
                <TableCell className="text-slate-600 text-sm font-medium">{caseItem.case_type}</TableCell>
                <TableCell className="px-6">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(caseItem)} className="h-8 w-8 text-slate-400 hover:text-primary">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(caseItem.id)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingCase ? "Editar Processo" : "Novo Processo"}</DialogTitle>
            <DialogDescription>
              Preencha os dados do processo e vincule ao cliente responsavel.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-2">
                <Label className="font-bold text-slate-700">Cliente Responsável *</Label>
                <Select value={formData.client_id} onValueChange={(v) => setFormData({ ...formData, client_id: v })} required>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>{clients?.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Nº do Processo (CNJ) *</Label>
                <Input value={formData.case_number} onChange={(e) => setFormData({ ...formData, case_number: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Área do Direito *</Label>
                <Select value={formData.case_type} onValueChange={(v) => setFormData({ ...formData, case_type: v })} required>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{caseTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Status Atual</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="aguardando">Aguardando</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Vara / Tribunal</Label>
                <Input value={formData.court || ""} onChange={(e) => setFormData({ ...formData, court: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Data de Julgamento</Label>
                <Input
                  type="date"
                  value={formData.trial_date ? String(formData.trial_date).split('T')[0] : ""}
                  onChange={(e) => setFormData({ ...formData, trial_date: e.target.value || null })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Valor da Causa (R$)</Label>
                <Input
                  type="number"
                  value={formData.value ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData({ ...formData, value: v === "" ? null : parseFloat(v) });
                  }}
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
                <Label className="font-bold text-slate-700">Notas Internas</Label>
                <Textarea value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
              </div>
            </div>

            {(formData.trial_date || !editingCase) && (
              <div className="md:col-span-2 flex items-start space-x-3 pt-5 border-t mt-4">
                <Checkbox
                  id="createAppointment"
                  checked={createAppointment}
                  onCheckedChange={(checked) => setCreateAppointment(!!checked)}
                  disabled={!formData.trial_date}
                />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="createAppointment" className="font-bold text-slate-700 cursor-pointer">
                    Criar evento na Agenda ao salvar
                  </Label>
                  <p className="text-xs text-slate-500">
                    {formData.trial_date
                      ? "Ao marcar, você será redirecionado para a Agenda para criar um compromisso com a data de julgamento."
                      : "Informe a data de julgamento para habilitar esta opção."}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#1e293b] text-[#fbbf24] hover:bg-slate-800" disabled={createCase.isPending || updateCase.isPending}>
                {editingCase ? "Salvar Alterações" : "Cadastrar Processo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEvents, EventInput, Event } from "@/hooks/useEvents";
import { useClients } from "@/hooks/useClients";
import { useCases } from "@/hooks/useCases";
import { cn } from "@/lib/utils";

const eventTypeConfig = {
  audiencia: { label: "Audiência", color: "bg-accent" },
  reuniao: { label: "Reunião", color: "bg-primary" },
  prazo: { label: "Prazo", color: "bg-destructive" },
  outros: { label: "Outros", color: "bg-muted-foreground" },
};

function normalizeEventType(value: string | undefined | null): keyof typeof eventTypeConfig {
  const v = (value || "").toLowerCase().trim();
  if (v in eventTypeConfig) return v as keyof typeof eventTypeConfig;
  return "reuniao";
}

export default function Agenda() {
  const navigate = useNavigate();
  const location = useLocation();
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useEvents();
  const { clients } = useClients();
  const { cases } = useCases();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<EventInput>({
    case_id: null,
    client_id: null,
    title: "",
    event_type: "reuniao",
    event_date: "",
    event_time: "",
    location: null,
    description: null,
    reminder: true,
  });

  useEffect(() => {
    const state = location.state as { newAppointmentFromCase?: any } | null;
    if (state?.newAppointmentFromCase) {
      const { title, date, description, caseId, clientId } = state.newAppointmentFromCase;
      
      setFormData({
        case_id: caseId || null,
        client_id: clientId || null,
        title: title || "",
        event_type: "audiencia",
        event_date: date ? String(date).split('T')[0] : "",
        event_time: "09:00",
        location: null,
        description: description || null,
        reminder: true,
      });
      setEditingEvent(null);
      setIsDialogOpen(true);
      
      // Limpa o state para não reabrir o modal ao navegar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const filteredEvents = events?.filter(
    (event) =>
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.clients?.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event.id);
      setFormData({
        case_id: event.case_id,
        client_id: event.client_id,
        title: event.title,
        event_type: normalizeEventType(event.event_type),
        event_date: event.event_date,
        event_time: event.event_time,
        location: event.location,
        description: event.description,
        reminder: event.reminder,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        case_id: null,
        client_id: null,
        title: "",
        event_type: "reuniao",
        event_date: "",
        event_time: "",
        location: null,
        description: null,
        reminder: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (editingEvent) {
          await updateEvent.mutateAsync({ id: editingEvent, ...formData });
        } else {
          await createEvent.mutateAsync(formData);
        }
        setIsDialogOpen(false);
    } catch (error) {
        console.error("Erro ao salvar evento:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este compromisso?")) {
      await deleteEvent.mutateAsync(id);
    }
  };

  const formatEventDate = (date: string) => {
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return date;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Agenda</h1>
          <p className="text-muted-foreground">Gerencie seus compromissos e prazos</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shadow-md bg-[#1e293b] text-[#fbbf24] hover:bg-slate-800">
          <Plus className="w-4 h-4 mr-2" />
          Novo Compromisso
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar compromissos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-xl p-8 text-center text-muted-foreground shadow-sm border border-slate-100">
            Carregando compromissos...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-slate-800 mb-2">Nenhum compromisso encontrado</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {search ? "Tente uma busca diferente" : "Sua agenda está limpa por enquanto."}
            </p>
            {!search && (
              <Button onClick={() => handleOpenDialog()} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Compromisso
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-5 hover:bg-slate-50 transition-colors flex items-start gap-4"
              >
                <div
                  className={cn(
                    "w-1.5 self-stretch rounded-full",
                    eventTypeConfig[normalizeEventType(event.event_type)].color
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800">{event.title}</h3>
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                      {eventTypeConfig[normalizeEventType(event.event_type)].label}
                    </Badge>
                  </div>
                  {event.clients && (
                    <p className="text-sm text-slate-600 mb-2 font-medium">
                      Cliente: <span className="text-primary">{event.clients.name}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatEventDate(event.event_date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {event.event_time}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(event)} className="hover:text-primary">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog (Modal) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingEvent ? "Editar Compromisso" : "Novo Compromisso"}</DialogTitle>
            <DialogDescription>
              Organize seus prazos e reuniões vinculando-os a processos e clientes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="title" className="font-bold">Título do Compromisso *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Audiência de Instrução"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_type" className="font-bold">Tipo</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audiencia">Audiência</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="prazo">Prazo Urgente</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_id" className="font-bold">Cliente</Label>
                <Select
                  value={formData.client_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value === "none" ? null : value })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_date" className="font-bold">Data *</Label>
                <Input
                  id="event_date"
                  type="date"
                  className="bg-white"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_time" className="font-bold">Horário *</Label>
                <Input
                  id="event_time"
                  type="time"
                  className="bg-white"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="location" className="font-bold">Local / Link da Reunião</Label>
                <Input
                  id="location"
                  placeholder="Fórum Central, Google Meet, etc."
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value || null })}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="px-8" disabled={createEvent.isPending || updateEvent.isPending}>
                {editingEvent ? "Atualizar Compromisso" : "Agendar Compromisso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
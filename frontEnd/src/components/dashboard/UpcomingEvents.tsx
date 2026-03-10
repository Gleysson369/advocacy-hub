import { Calendar, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEvents, Event as EventData } from "@/hooks/useEvents";

interface DisplayEvent {
  id: string;
  title: string;
  type: "audiencia" | "reuniao" | "prazo" | "outros";
  date: string;
  time: string;
  location?: string;
}

// Formata a data para exibição (Hoje, Amanhã ou DD/MM)
const formatDisplayDate = (eventDate: string): string => {
  const d = new Date(eventDate + "T00:00:00");
  const today = new Date();

  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear();

  if (isToday) return "Hoje";
  if (isTomorrow) return "Amanhã";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

// Mapeia event_type do backend para o tipo do componente
const mapEventType = (
  eventType: string
): "audiencia" | "reuniao" | "prazo" | "outros" => {
  const t = (eventType || "").toLowerCase();
  if (t === "audiencia" || t === "audiência") return "audiencia";
  if (t === "reuniao" || t === "reunião") return "reuniao";
  if (t === "prazo") return "prazo";
  return "outros";
};

// Converte evento da API para o formato de exibição
const toDisplayEvent = (e: EventData): DisplayEvent => ({
  id: e.id,
  title: e.title,
  type: mapEventType(e.event_type),
  date: formatDisplayDate(e.event_date),
  time: e.event_time || "",
  location: e.location ?? undefined,
});

const typeConfig: Record<DisplayEvent["type"], { color: string }> = {
  audiencia: { color: "bg-accent" },
  reuniao: { color: "bg-primary" },
  prazo: { color: "bg-destructive" },
  outros: { color: "bg-muted-foreground" },
};

export function UpcomingEvents() {
  const navigate = useNavigate();
  const { events, isLoading, error } = useEvents();

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming: DisplayEvent[] = events
    .filter((e) => e.event_date >= todayStr)
    .sort((a, b) => {
      const d = a.event_date.localeCompare(b.event_date);
      if (d !== 0) return d;
      return (a.event_time || "").localeCompare(b.event_time || "");
    })
    .slice(0, 5)
    .map(toDisplayEvent);

  return (
    <div className="bg-card rounded-xl shadow-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-semibold">Próximos Compromissos</h2>
            <p className="text-sm text-muted-foreground">Sua agenda da semana</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Carregando compromissos...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <p className="text-sm text-destructive">Erro ao carregar compromissos</p>
        </div>
      ) : upcoming.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Nenhum compromisso próximo</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {upcoming.map((event, index) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate("/agenda")}
            >
              <div
                className={`w-1 h-full min-h-[60px] rounded-full shrink-0 ${typeConfig[event.type].color}`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{event.title}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {event.date}, {event.time}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 pt-0">
        <button
          onClick={() => navigate("/agenda")}
          className="w-full py-2 text-sm font-medium text-accent hover:bg-accent/5 rounded-lg transition-colors"
        >
          Ver agenda completa
        </button>
      </div>
    </div>
  );
}
